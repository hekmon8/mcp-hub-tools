# MCP Hub Tools - HTTP MCP Server Documentation

This is the documentation and configuration repository for MCP Hub's HTTP-based MCP (Model Context Protocol) server. The server allows searching and discovering MCPs through a standardized HTTP interface.

## Overview

MCP Hub implements [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/specification) HTTP endpoints within a Next.js application, providing a modern and accessible way for AI assistants and development tools to discover and interact with MCPs from [MCP Hub](https://www.aimcp.info).

## Protocol Support

**⚠️ Important Change**: This server **only supports HTTP-based MCP connections**. The traditional stdio-based implementation has been deprecated in favor of the more accessible and reliable HTTP interface.

## Introduction

`mcp-hub-tools` provides documentation and configuration for interacting with [MCP Hub](https://www.aimcp.info). The server offers standardized JSON-RPC 2.0 endpoints for searching MCPs and retrieving detailed information about registered Model Context Protocols.

**Server Implementation Location**: The HTTP MCP server is actually implemented in MCP Hub's Next.js application at `/nextjs/app/api/open/mcp/route.ts`.

## Available Tools

The HTTP MCP server provides the following tools via JSON-RPC 2.0:

### `search_mcp`

*   **Description:** Search for MCPs in the MCP Hub database using keywords. Returns a list of matching MCPs with basic information.
*   **Input Schema:**
    ```json
    {
      "type": "object",
      "properties": {
        "keywords": {
          "type": "string",
          "description": "Keywords to search for in MCP names, descriptions, and metadata"
        },
        "limit": {
          "type": "number",
          "description": "Maximum number of results to return (default: 50)",
          "default": 50
        }
      },
      "required": ["keywords"]
    }
    ```
*   **Output:** Returns search results with basic MCP information including:
    - `uuid`: Unique identifier for the MCP
    - `name`: MCP name
    - `brief`: Short description
    - `clicks`: Usage statistics
    - `count`: Total number of results found
    - `keywords`: Search terms used

### `get_mcp_detail`

*   **Description:** Get detailed information about a specific MCP using its UUID.
*   **Input Schema:**
    ```json
    {
      "type": "object",
      "properties": {
        "mcp_id": {
          "type": "string",
          "description": "The UUID of the MCP to retrieve details for"
        }
      },
      "required": ["mcp_id"]
    }
    ```
*   **Output:** Returns comprehensive MCP information including:
    - `id`: Internal database ID
    - `uuid`: Unique identifier
    - `name`: MCP name
    - `brief`: Description
    - `website_url`: Official website
    - `author_name`: Creator information
    - `created_at` / `updated_at`: Timestamps
    - `is_recommended` / `is_official`: Status flags
    - `clicks`: Usage statistics
    - `tags`: Associated categories
    - `metadata`: Additional information
    - `mcp_avatar_url` / `user_avatar_url`: Profile images

### Example Tool Responses

#### `search_mcp` Response Example

```json
{
  "success": true,
  "data": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Blockchain MCP",
      "brief": "A Model Context Protocol for blockchain data analysis",
      "clicks": 142
    }
  ],
  "count": 1,
  "total_results": 1,
  "keywords": "blockchain"
}
```

#### `get_mcp_detail` Response Example

```json
{
  "success": true,
  "data": {
    "id": 123,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Blockchain MCP",
    "brief": "A comprehensive Model Context Protocol for blockchain data analysis",
    "website_url": "https://github.com/example/blockchain-mcp",
    "author_name": "Example Developer",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-03-20T14:45:00Z",
    "is_recommended": true,
    "is_official": false,
    "clicks": 142,
    "tags": ["blockchain", "crypto", "data-analysis"],
    "metadata": {
      "version": "1.2.0",
      "license": "MIT"
    },
    "mcp_avatar_url": "https://example.com/avatar.png",
    "user_avatar_url": "https://example.com/user.png"
  }
}
```

## HTTP-based MCP Server

MCP Hub provides a modern HTTP-based MCP server implementation within its Next.js application that offers superior reliability and accessibility compared to traditional stdio-based approaches. The server implements the Model Context Protocol using JSON-RPC 2.0 over HTTP.

### Server Endpoint

**Production URL**: https://www.aimcp.info/api/open/mcp

### Supported Transports

- **HTTP POST**: Standard JSON-RPC 2.0 requests
- **Server-Sent Events (SSE)**: Real-time streaming connection for better client integration

### Key Features

- ✅ **JSON-RPC 2.0 Compliance**: Full compatibility with MCP protocol specification
- ✅ **Dual Transport Support**: HTTP POST and SSE for different client needs  
- ✅ **API Key Authentication**: Secure access control
- ✅ **Rate Limiting**: Built-in protection against abuse
- ✅ **CORS Support**: Cross-origin requests enabled
- ✅ **Error Handling**: Comprehensive error responses

## Usage

### Prerequisites

*   An API key from MCP Hub ([https://www.aimcp.info](https://www.aimcp.info))

#### How to get an API key

1. Visit [https://www.aimcp.info](https://www.aimcp.info)
2. Sign up or log in to your account
3. Navigate to [API Keys page](https://www.aimcp.info/en/api-keys)
4. Generate a new API key for your application

**Note**: API keys have a rate limit of 20 requests per hour.

### Authentication

All requests to the HTTP MCP server require authentication using a Bearer token in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

### MCP Client Configuration

#### HTTP-based Configuration (Recommended)

Modern MCP clients can connect directly to the HTTP server:

```json
{
  "mcpServers": {
    "mcp-hub": {
      "url": "https://www.aimcp.info/api/open/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

#### Simplified Configuration

For clients supporting simplified configuration:

```json
{
  "mcpServers": {
    "mcp-hub": {
      "url": "https://www.aimcp.info/api/open/mcp",
      "apiKey": "YOUR_API_KEY"
    }
  }
}
```

#### Cursor IDE Configuration

For Cursor IDE, add to your MCP configuration:

```json
{
  "mcpServers": {
    "mcp-hub": {
      "url": "https://www.aimcp.info/api/open/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

### Testing the Connection

You can test the HTTP MCP server using curl:

```bash
# Initialize connection
curl -X POST https://www.aimcp.info/api/open/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize"}'

# List available tools
curl -X POST https://www.aimcp.info/api/open/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}'

# Search for MCPs
curl -X POST https://www.aimcp.info/api/open/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "search_mcp", "arguments": {"keywords": "blockchain", "limit": 5}}}'
```

## MCP Protocol Implementation

### Supported Methods

The HTTP MCP server implements the following JSON-RPC 2.0 methods:

- **`initialize`**: Establish connection and get server capabilities
- **`tools/list`**: Retrieve available tools
- **`tools/call`**: Execute specific tools with arguments

### Response Format

All responses follow the JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "id": "request_id",
  "result": {
    // Response data
  }
}
```

### Error Handling

Errors are returned in standard JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": "request_id", 
  "error": {
    "code": -32603,
    "message": "Error description"
  }
}
```

## Server Information

### Protocol Specification

- **Protocol Version**: `2024-11-05`
- **Server Name**: `mcp-hub-search`
- **Version**: `1.0.0`
- **Capabilities**: Tools enabled with change notifications

### Rate Limits

- **API Requests**: 20 requests per hour per API key

### CORS Support

The server supports cross-origin requests with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key`

## Troubleshooting

### Common Issues

1. **"0 tools enabled"**: Ensure your MCP client properly handles the `initialize` response and `capabilities.tools.listChanged` flag.

2. **Authentication errors**: Verify your API key is valid and included in the `Authorization` header.

3. **Connection timeouts**: Verify that the MCP Hub server at https://www.aimcp.info is accessible.

4. **CORS errors**: Ensure your client includes proper headers and handles preflight OPTIONS requests.

### Debug Mode

For debugging, you can inspect the raw HTTP requests and responses using browser developer tools or command-line tools like curl.

## Migration from stdio-based Implementation

**Important**: The stdio-based implementation has been deprecated. To migrate:

1. Update your MCP client configuration to use HTTP endpoints
2. Replace command-based configurations with URL-based ones
3. Update authentication from environment variables to HTTP headers
4. Test the new connection using the provided curl examples

## Server Architecture

The HTTP MCP server is integrated into MCP Hub's Next.js application:

- **Source Code Location**: `/nextjs/app/api/open/mcp/route.ts`
- **Production Service**: https://www.aimcp.info/api/open/mcp

## Contributing

This HTTP MCP server is part of the MCP Hub project. For issues or contributions, please visit the main repository.

## License

MIT License

## Related Links

- [MCP Hub Website](https://www.aimcp.info)
- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/specification)
- [API Documentation](https://www.aimcp.info/docs/api)
