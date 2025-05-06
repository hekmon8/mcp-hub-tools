# mcphub_tools MCP Server

Mcp tools powered by aimcp, find mcps whatever you want. This server allows searching the MCP Hub for available MCPs.

<a href="https://glama.ai/mcp/servers/@hekmon8/mcp-hub-tools">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@hekmon8/mcp-hub-tools/badge" alt="Hub Tools MCP server" />
</a>

## Open Protocol

This server implements the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/specification). It acts as an MCP server that can be connected to by MCP clients (like compatible AI assistants or development tools).

## Introduction

`mcphub_tools` is an MCP server designed to interact with the [MCP Hub](https://www.aimcp.info). Its primary function is to provide a tool that allows users to search for MCPs (Model Context Protocols/Servers) registered on the hub based on keywords.

## Tools

This server provides the following tool:

### `search_mcp_hub`

*   **Description:** Searches for MCPs on the MCP Hub.
*   **Input Schema:**
    ```json
    {
      "type": "object",
      "properties": {
        "keywords": {
          "type": "string",
          "description": "Keywords to search for MCPs"
        }
      },
      "required": ["keywords"]
    }
    ```
*   **Output:** Returns a JSON string containing the search results from the MCP Hub API.

### `get_mcp_info`

*   **Description:** Gets detailed information about a specific MCP.
*   **Input Schema:**
    ```json
    {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "MCP identifier (UUID)"
        }
      },
      "required": ["id"]
    }
    ```
*   **Output:** Returns a JSON string containing the detailed information about the specified MCP.

## Implementation Options

MCP Hub supports two different ways to implement MCP servers:

### 1. Standard stdio-based MCP Server

This is the traditional implementation where the MCP server communicates with clients through standard input/output (stdio). This approach is ideal for standalone command-line tools that can be integrated with MCP clients like Claude Desktop.

The easiest way to use the stdio-based implementation is through our published package:

```bash
# Using npx (recommended for most users)
npx @aimcp/tools

# Using uvx (faster startup)
uvx @aimcp/tools
```

### 2. HTTP-based MCP Server

MCP Hub also provides an HTTP-based implementation that allows AI assistants and other tools to connect to the MCP server over HTTP. This is implemented in the MCP Hub's API at `/api/open/v1/streamable`.

The HTTP endpoint is available at:
```
https://mcp.aimcp.info/api/open/v1/streamable
```

## Usage

### Prerequisites

*   Node.js and npm (or pnpm/yarn) installed for the stdio-based implementation.
*   An API key from MCP Hub ([https://www.aimcp.info](https://www.aimcp.info)).

#### How to get an API key

*   Go to [https://www.aimcp.info](https://www.aimcp.info).
*   Sign up or log in.
*   Navigate to your profile or account settings.
*   Look for an option to generate or retrieve your API key.
*   Or you can access [here](https://www.aimcp.info/en/api-keys) to generate an API key.
NOTE: The API key has rate limits for 20 requests per hour.

### Authentication

The MCP API requires authentication with a valid API key. This key must be provided via:

1. For stdio-based implementation: The environment variable `MCP_HUB_API_KEY`.
2. For HTTP-based implementation: The `Authorization` header as a Bearer token.

```
Authorization: Bearer YOUR_API_KEY
```

### Integration with AI Assistants and MCP Clients

#### Claude Desktop Configuration

To use MCP Hub with Claude Desktop:

1. Locate your Claude Desktop configuration file:
   - Windows: `%APPDATA%\claude\config.json`
   - macOS: `~/Library/Application Support/claude/config.json` or `~/.config/claude/config.json`
   - Linux: `~/.config/claude/config.json`

2. Add the following configuration:

```json
{
  "mcpServers": {
    "mcp-hub": {
      "command": "npx",
      "args": ["@aimcp/tools"],
      "environment": {
        "MCP_HUB_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

3. Restart Claude Desktop to apply the changes.
4. In your conversation, you can access MCP Hub tools by typing "@mcp-hub".

#### Cline and Other CLI Tools

For command-line based tools like Cline:

1. Create a configuration file named `servers.json` in your project directory:

```json
{
  "servers": [
    {
      "name": "mcp-hub-tools",
      "command": ["npx", "@aimcp/tools"],
      "environment": {
        "MCP_HUB_API_KEY": "YOUR_API_KEY"
      }
    }
  ]
}
```

2. Launch the tool with reference to this configuration:

```bash
cline --mcp-servers-config ./servers.json
```

#### For Tools Supporting Remote MCP Servers

Some newer MCP clients support direct HTTP connections. Configure them using:

```json
{
  "mcpServers": {
    "mcp-hub-http": {
      "url": "https://mcp.aimcp.info/api/open/v1/streamable",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

#### For Tools Using File-based Configuration (Cursor, etc.)

1. Create a configuration file:

```json
{
  "mcpServers": {
    "mcp-hub": {
      "command": "npx",
      "args": ["@aimcp/tools"],
      "environment": {
        "MCP_HUB_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

2. Reference this file in your tool's settings or launch with the appropriate configuration parameter.

### Running Manually

You can also run the stdio-based server manually for testing (ensure `MCP_HUB_API_KEY` is set in your environment):

```bash
export MCP_HUB_API_KEY="YOUR_API_KEY_HERE"
npx @aimcp/tools
```

## API Interface

This server interacts with the following MCP Hub API endpoint:

*   **Endpoint:** `GET https://www.aimcp.info/api/open/v1/search`
*   **Authentication:** Requires a Bearer token in the `Authorization` header, using the `MCP_HUB_API_KEY`.
*   **Query Parameter:** `keywords` (string)

## Using the HTTP-based MCP API

MCP Hub provides an HTTP-based MCP server at `/api/open/v1/streamable` that implements the Model Context Protocol. This allows AI assistants and tools to search for MCPs and retrieve MCP information directly.

### Connection Steps

1. First, establish a connection to get a session ID:

```bash
GET /api/open/v1/streamable
Authorization: Bearer YOUR_API_KEY
```

Response:

```json
{
  "success": true,
  "sessionId": "194830ab-eb0b-4d17-a574-af96705276c2",
  "message": "Connection established. Use this sessionId for subsequent calls."
}
```

2. Call a tool with the session ID:

```bash
POST /api/open/v1/streamable?sessionId=194830ab-eb0b-4d17-a574-af96705276c2
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "jsonrpc": "2.0",
  "method": "callTool",
  "params": {
    "name": "search_mcp_hub",
    "arguments": {
      "keywords": "example"
    }
  },
  "id": "call-1"
}
```

## Development & Deployment

### Development

1.  **Install Dependencies:** `pnpm install`
2.  **Build:** `pnpm run build` (compiles TypeScript to JavaScript in `build/`)
3.  **Watch Mode:** `pnpm run watch` (automatically recompiles on changes)
4.  **Testing with Inspector:** `pnpm run inspector` (runs the server with the MCP Inspector tool)

### Creating Your Own stdio-based MCP Server

If you want to create your own stdio-based MCP server, follow these steps:

1. **Set up your project:**
   ```bash
   mkdir my-mcp-server
   cd my-mcp-server
   npm init -y
   npm install @modelcontextprotocol/sdk
   ```

2. **Create your server implementation:**

```typescript
// index.ts
import { Server } from '@modelcontextprotocol/sdk/server';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types';
import { StdioTransport } from '@modelcontextprotocol/sdk/transports/stdio';

// Create an MCP server instance
const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {},
    }
  }
);

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'Description of my tool',
      inputSchema: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'Description of param1',
          },
        },
        required: ['param1'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Extract tool name and arguments
  const toolName = request.params.name;
  const args = request.params.arguments;
  
  if (toolName === 'my_tool') {
    // Validate arguments
    if (typeof args !== 'object' || args === null || typeof args.param1 !== 'string') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid arguments. Requires "param1" (string).'
      );
    }
    
    try {
      // Implement your tool logic here
      const result = `Processed: ${args.param1}`;
      
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  } else {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${toolName}`
    );
  }
});

// Connect the server to stdin/stdout
const transport = new StdioTransport();
server.connect(transport).catch(console.error);
```

3. **Compile and run your server:**
   ```bash
   npx tsc
   node dist/index.js
   ```

4. **Test your server with the MCP Inspector tool:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

### Deployment

1.  Ensure the server is built (`pnpm run build`).
2.  The `build` directory contains the necessary JavaScript files.
3.  The server can be run using `node build/index.js` or the command `mcphub_tools` if the package is installed appropriately (e.g., globally or linked).
4.  Configure your MCP client/manager to point to the server executable and provide the `MCP_HUB_API_KEY` environment variable.

You can also publish your MCP server to npm so others can install and use it.