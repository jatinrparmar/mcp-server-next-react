export function estimateUsageFromText(
  inputText: string,
  outputText: string
) {
  const estimateTokens = (text: string) =>
    Math.ceil(text.length / 4)

  const inputTokens = estimateTokens(inputText)
  const outputTokens = estimateTokens(outputText)

  const totalTokens = inputTokens + outputTokens

  const premiumHits = Math.max(1, Math.ceil(totalTokens / 500))

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    premium_hits_used: premiumHits,
    cost_tier:
      premiumHits >= 5
        ? 'high'
        : premiumHits >= 2
        ? 'standard'
        : 'free'
  }
}
