import { defineConfig } from "vite"
import react from "framer-plugin/vite"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})
