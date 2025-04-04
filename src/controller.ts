// Interface
figma.showUI(__html__)
figma.ui.resize(700, 500)

// Methods
figma.ui.onmessage = (msg) => {
   if (msg.type === "create") {
      console.log(msg)
   }

   if (msg.type === "create-rectangles") {
      const nodes = []

      for (let i = 0; i < msg.count; i++) {
         const rect = figma.createRectangle()
         rect.x = i * 150
         rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }]
         figma.currentPage.appendChild(rect)
         nodes.push(rect)
      }

      figma.currentPage.selection = nodes
      figma.viewport.scrollAndZoomIntoView(nodes)

      figma.notify("Created rectangles")

      // This is how figma responds back to the ui
      figma.ui.postMessage({
         type: "create-rectangles",
         message: `Created ${msg.count} Rectangles`,
      })
   } else if (msg.type === "cancel") {
      figma.closePlugin()
   }
}
