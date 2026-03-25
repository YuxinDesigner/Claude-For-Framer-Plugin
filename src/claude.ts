export interface Message {
  role: "user" | "assistant"
  content: string
}

export interface ClaudeConfig {
  apiKey: string
  model: string
  systemPrompt: string
}

const DEFAULT_SYSTEM_PROMPT = `You are Claude, an AI assistant embedded in Framer — a visual design and publishing tool. You help designers and developers with:

1. **Generating code components** — When asked, produce clean React/TypeScript components compatible with Framer. Use inline styles or CSS modules. Export a default component with property controls where appropriate.
2. **Rewriting copy** — Improve, translate, or restyle text content from the canvas.
3. **Creating design tokens** — Suggest color palettes, typography scales, and spacing systems.
4. **CMS content** — Generate structured content for Framer CMS collections.
5. **General design advice** — Layout, UX patterns, accessibility, responsive design.

Keep responses concise and actionable. When generating code, output only the code block unless explanation is requested. Use Framer's property controls API (\`addPropertyControls\`) when generating components.`

export async function sendMessage(
  messages: Message[],
  config: ClaudeConfig,
  onStream?: (chunk: string) => void
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      stream: !!onStream,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  if (onStream && response.body) {
    return streamResponse(response.body, onStream)
  }

  const data = await response.json()
  return data.content[0].text
}

async function streamResponse(
  body: ReadableStream<Uint8Array>,
  onStream: (chunk: string) => void
): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let fullText = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split("\n")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6)
        if (data === "[DONE]") continue
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullText += parsed.delta.text
            onStream(fullText)
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }
  }

  return fullText
}

export const MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
] as const

export const DEFAULT_CONFIG: ClaudeConfig = {
  apiKey: "",
  model: "claude-sonnet-4-6",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
}
