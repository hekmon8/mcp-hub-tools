#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Retrieve API key from environment variables provided by MCP config
const API_KEY = process.env.MCP_HUB_API_KEY;
if (!API_KEY) {
  throw new Error('MCP_HUB_API_KEY environment variable is required');
}

// Define the expected structure of the arguments for the search tool
interface SearchArgs {
  keywords: string;
}

// Type guard to validate the arguments passed to the search tool
const isValidSearchArgs = (args: any): args is SearchArgs =>
  typeof args === 'object' && args !== null && typeof args.keywords === 'string';

class McpHubSearchServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        // Use the name provided during setup or a default
        name: 'mcp-hub-search-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          // This server only provides tools
          resources: {},
          tools: {},
        },
      }
    );

    // Configure axios instance for MCP Hub API
    this.axiosInstance = axios.create({
      baseURL: 'https://www.aimcp.info', // Assuming this is the base URL for the MCP Hub API
      headers: {
        Authorization: `Bearer ${API_KEY}`, // Use Bearer token authentication
      },
    });

    this.setupToolHandlers();

    // Graceful shutdown and error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // Handler to list available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_mcp_hub',
          description: 'Search for MCPs on the MCP Hub',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'string',
                description: 'Keywords to search for MCPs',
              },
            },
            required: ['keywords'],
          },
        },
      ],
    }));

    // Handler to execute the search tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'search_mcp_hub') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidSearchArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid search arguments. Requires "keywords" (string).'
        );
      }

      const keywords = request.params.arguments.keywords;

      try {
        // Call the MCP Hub search API endpoint
        const response = await this.axiosInstance.get('/api/open/v1/search', {
          params: { keywords },
        });

        // Return the search results
        return {
          content: [
            {
              type: 'text',
              // Stringify the data part of the response
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        let errorMessage = 'MCP Hub API error';
        if (axios.isAxiosError(error)) {
          // Provide more specific error details if available
          errorMessage += `: ${error.response?.status} ${
            error.response?.data?.error ?? error.message
          }`;
        } else if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }

        // Return an error response
        return {
          content: [
            {
              type: 'text',
              text: errorMessage,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Log to stderr so it doesn't interfere with stdio transport
    console.error('MCP Hub Search Server running on stdio');
  }
}

// Instantiate and run the server
const server = new McpHubSearchServer();
server.run().catch(console.error);
