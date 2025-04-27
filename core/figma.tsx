import React from "react"
import { createRoot } from "react-dom/client"
import Interface from "@/app"

document.addEventListener("DOMContentLoaded", function () {
   const container = document.getElementById("react-page")
   const root = createRoot(container)
   root.render(<Interface />)
})
