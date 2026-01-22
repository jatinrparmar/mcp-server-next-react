import { estimateUsageFromText } from './billing.js'

/**
 * MCP Tool Response Type
 * Ensures consistent response format across all tools
 */
export interface ToolResponse {
  [key: string]: unknown
  content: Array<{
    type: 'text'
    text: string
  }>
  _meta?: {
    usage?: {
      input_tokens: number
      output_tokens: number
      total_tokens: number
      premium_hits_used: number
      cost_tier: string
    }
  }
  structuredContent?: {
    [key: string]: unknown
  }
  isError?: boolean
}

/**
 * Centralized MCP Response Handler
 * Validates and standardizes all tool returns with proper type checking
 */
export function mcpResponse<T>(
  params: {
    input: unknown
    output: T
    isError?: boolean
    stringify?: boolean
    category?: string
  }
): ToolResponse {
  const {
    input,
    output,
    isError = false,
    stringify = true,
    category = 'general'
  } = params

  // Type validation
  if (output === null || output === undefined) {
    const errorMessage = 'Error: Tool returned null or undefined output'
    const usage = estimateUsageFromText(
      JSON.stringify(input),
      errorMessage
    )

    return {
      content: [
        {
          type: 'text',
          text: errorMessage
        }
      ],
      _meta: {
        usage
      },
      isError: true
    }
  }

  const outputText =
    typeof output === 'string'
      ? output
      : stringify
      ? JSON.stringify(output, null, 2)
      : String(output)

  const usage = estimateUsageFromText(
    JSON.stringify(input),
    outputText
  )

  return {
    content: [
      {
        type: 'text',
        text: outputText
      }
    ],
    _meta: {
      usage
    },
    ...(isError ? { isError: true } : {})
  } as ToolResponse
}

/**
 * Wrapper for safe tool execution with automatic error handling
 */
export async function executeToolSafely<Input, Output>(
  input: Input,
  toolFn: () => Promise<Output>,
  category: string = 'general'
): Promise<ToolResponse> {
  try {
    const output = await toolFn()

    if (output === null || output === undefined) {
      throw new Error(`Tool returned invalid output: ${typeof output}`)
    }

    return mcpResponse({
      input,
      output,
      category
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred'

    return mcpResponse({
      input,
      output: errorMessage,
      isError: true,
      category
    })
  }
}
