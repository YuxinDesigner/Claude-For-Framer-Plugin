import { useState, useEffect, useCallback } from "react"
import { framer } from "framer-plugin"
import { type Message, type ClaudeConfig, DEFAULT_CONFIG } from "./claude"

const STORAGE_KEY_API = "claude-api-key"
const STORAGE_KEY_MODEL = "claude-model"
const STORAGE_KEY_HISTORY = "claude-history"

export function useConfig() {
  const [config, setConfig] = useState<ClaudeConfig>(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const [apiKey, model] = await Promise.all([
        framer.getPluginData(STORAGE_KEY_API),
        framer.getPluginData(STORAGE_KEY_MODEL),
      ])
      setConfig((prev) => ({
        ...prev,
        apiKey: apiKey || "",
        model: model || prev.model,
      }))
      setLoaded(true)
    }
    load()
  }, [])

  const updateConfig = useCallback(
    (updates: Partial<ClaudeConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...updates }
        if (updates.apiKey !== undefined)
          framer.setPluginData(STORAGE_KEY_API, updates.apiKey)
        if (updates.model !== undefined)
          framer.setPluginData(STORAGE_KEY_MODEL, updates.model)
        return next
      })
    },
    []
  )

  return { config, updateConfig, loaded }
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    framer.getPluginData(STORAGE_KEY_HISTORY).then((data) => {
      if (data) {
        try {
          setMessages(JSON.parse(data))
        } catch {
          // corrupted history
        }
      }
    })
  }, [])

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      const next = [...prev, msg]
      framer.setPluginData(STORAGE_KEY_HISTORY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateLastAssistant = useCallback((content: string) => {
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === "assistant") {
        next[next.length - 1] = { ...last, content }
      }
      framer.setPluginData(STORAGE_KEY_HISTORY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    framer.setPluginData(STORAGE_KEY_HISTORY, "")
  }, [])

  return { messages, addMessage, updateLastAssistant, clearMessages }
}

export function useSelection() {
  const [selectedText, setSelectedText] = useState<string | null>(null)

  useEffect(() => {
    return framer.subscribeToSelection(async (selection) => {
      if (selection.length === 0) {
        setSelectedText(null)
        return
      }
      // Try to get text from first selected node
      try {
        const node = selection[0]
        if (node && "getText" in node) {
          const text = await (node as { getText: () => Promise<string | null> }).getText()
          setSelectedText(text)
        } else {
          setSelectedText(null)
        }
      } catch {
        setSelectedText(null)
      }
    })
  }, [])

  return selectedText
}
