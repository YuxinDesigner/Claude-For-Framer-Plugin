import { useState, useRef, useEffect } from "react"
import { framer } from "framer-plugin"
import { sendMessage, MODELS } from "./claude"
import { useConfig, useMessages, useSelection } from "./hooks"
import { applyCodeComponent, replaceSelectedText, extractCodeBlock } from "./actions"
import "./App.css"

type View = "chat" | "settings"

export function App() {
  const { config, updateConfig, loaded } = useConfig()
  const { messages, addMessage, updateLastAssistant, clearMessages } = useMessages()
  const selectedText = useSelection()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<View>("chat")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!loaded) return
    if (!config.apiKey) setView("settings")
  }, [loaded, config.apiKey])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    if (!config.apiKey) {
      framer.notify("Please set your API key in settings")
      setView("settings")
      return
    }

    const userMessage = selectedText
      ? `[Selected text on canvas: "${selectedText}"]\n\n${text}`
      : text

    addMessage({ role: "user", content: userMessage })
    addMessage({ role: "assistant", content: "" })
    setInput("")
    setLoading(true)

    try {
      const allMessages = [...messages, { role: "user" as const, content: userMessage }]
      await sendMessage(allMessages, config, (streamedText) => {
        updateLastAssistant(streamedText)
      })
    } catch (err) {
      updateLastAssistant(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleApplyCode(content: string) {
    const code = extractCodeBlock(content)
    if (code) {
      const name = prompt("Component name:") || "GeneratedComponent"
      await applyCodeComponent(code, name)
    } else {
      framer.notify("No code block found in this message")
    }
  }

  async function handleApplyText(content: string) {
    // Extract text outside code blocks
    const plainText = content.replace(/```[\s\S]*?```/g, "").trim()
    if (plainText) {
      await replaceSelectedText(plainText)
    }
  }

  if (!loaded) return <div className="loading">Loading...</div>

  if (view === "settings") {
    return (
      <div className="settings">
        <div className="settings-header">
          <h2>Settings</h2>
          {config.apiKey && (
            <button className="btn-ghost" onClick={() => setView("chat")}>
              Back
            </button>
          )}
        </div>

        <label className="field">
          <span>API Key</span>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => updateConfig({ apiKey: e.target.value })}
            placeholder="sk-ant-..."
          />
        </label>

        <label className="field">
          <span>Model</span>
          <select
            value={config.model}
            onChange={(e) => updateConfig({ model: e.target.value })}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <p className="hint">
          Get your API key at{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank">
            console.anthropic.com
          </a>
        </p>

        {config.apiKey && (
          <button className="btn-primary" onClick={() => setView("chat")}>
            Save & Start
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h2>Claude</h2>
          <span className="model-badge">
            {MODELS.find((m) => m.id === config.model)?.name || config.model}
          </span>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={clearMessages} title="Clear chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
            </svg>
          </button>
          <button className="btn-icon" onClick={() => setView("settings")} title="Settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12,1v4M12,19v4M4.22,4.22l2.83,2.83M16.95,16.95l2.83,2.83M1,12h4M19,12h4M4.22,19.78l2.83-2.83M16.95,7.05l2.83-2.83" />
            </svg>
          </button>
        </div>
      </div>

      {/* Selection indicator */}
      {selectedText && (
        <div className="selection-bar">
          <span>Selected: </span>
          <em>"{selectedText.slice(0, 50)}{selectedText.length > 50 ? "..." : ""}"</em>
        </div>
      )}

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p><strong>Claude for Framer</strong></p>
            <p>Ask me to generate components, rewrite copy, create styles, or anything else.</p>
            <div className="suggestions">
              <button onClick={() => setInput("Create a responsive hero section with a headline, subtitle, and CTA button")}>
                Generate a hero component
              </button>
              <button onClick={() => setInput("Create a color palette for a modern SaaS product")}>
                Design a color palette
              </button>
              <button onClick={() => setInput("Rewrite this text to be more engaging and concise")}>
                Improve selected text
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.role === "assistant" && !msg.content && loading ? (
                <div className="typing">
                  <span /><span /><span />
                </div>
              ) : (
                <>
                  <div className="message-text">{msg.content}</div>
                  {msg.role === "assistant" && msg.content && (
                    <div className="message-actions">
                      {extractCodeBlock(msg.content) && (
                        <button
                          className="btn-action"
                          onClick={() => handleApplyCode(msg.content)}
                        >
                          Add as Component
                        </button>
                      )}
                      <button
                        className="btn-action"
                        onClick={() => handleApplyText(msg.content)}
                      >
                        Apply to Selection
                      </button>
                      <button
                        className="btn-action"
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedText
              ? "What should I do with the selected text?"
              : "Ask Claude anything..."
          }
          rows={2}
          disabled={loading}
        />
        <button
          className="btn-send"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
