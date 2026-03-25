import "./global.css"
import ReactDOM from "react-dom/client"
import { framer } from "framer-plugin"
import { App } from "./App"

framer.showUI({
  position: "top right",
  width: 360,
  height: 500,
})

const root = document.getElementById("root")!
ReactDOM.createRoot(root).render(<App />)
