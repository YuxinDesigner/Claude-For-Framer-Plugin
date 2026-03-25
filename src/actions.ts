import { framer } from "framer-plugin"

/**
 * Apply generated code as a new Code File in the Framer project.
 */
export async function applyCodeComponent(code: string, name: string) {
  try {
    await framer.createCodeFile(`${name}.tsx`, code)
    framer.notify(`Component "${name}" created!`)
  } catch (err) {
    framer.notify(`Error creating component: ${err}`)
  }
}

/**
 * Replace selected text node content with new text.
 */
export async function replaceSelectedText(newText: string) {
  const selection = await framer.getSelection()
  if (selection.length === 0) {
    framer.notify("No element selected")
    return
  }

  const node = selection[0]
  if (node && "setText" in node) {
    await (node as { setText: (t: string) => Promise<void> }).setText(newText)
    framer.notify("Text updated!")
  } else {
    framer.notify("Selected element doesn't support text editing")
  }
}

/**
 * Extract code blocks from Claude's response.
 */
export function extractCodeBlock(text: string): string | null {
  const match = text.match(/```(?:tsx?|jsx?|javascript|typescript)?\n([\s\S]*?)```/)
  return match ? match[1].trim() : null
}
