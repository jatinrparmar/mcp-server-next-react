import { mcpResponse, executeToolSafely, ToolResponse } from './mcp-response.js'

/**
 * Legacy wrapper for tool execution - use executeToolSafely instead
 * @deprecated Use executeToolSafely from mcp-response.ts
 */
export async function runTool<Input, Output>(
  input: Input,
  fn: () => Promise<Output>,
  category: string = 'general'
): Promise<ToolResponse> {
  return executeToolSafely(input, fn, category)
}
