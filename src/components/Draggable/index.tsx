import React, { useState, useRef, useEffect, act } from "react"
import styles from "./draggable.module.scss"

interface Props {
   items: any[]
   maxHeight?: string
   itemHeight?: number
}

// const isEmptyArray = (arr) => arr.length === 0

export const ReorderableList = ({ items }: Props) => {
   const [activeIndex, setActiveIndex] = useState(-1)
   const [activePlaceholderIdx, setActivePlaceholderIdx] = useState(-1)
   const [clientY, setClientY] = useState(0)
   const [downY, setDownY] = useState(0)
   const isDragging = activeIndex !== -1
   const itemsBoundingRect = useRef([])

   const onMouseUp = () => {
      setClientY(0)
      setDownY(0)
      setActiveIndex(-1)
      setActivePlaceholderIdx(-1)
      // Reorder items array
      // Recalculate Boundings | reorder boundings
   }

   const onMouseMove = (e) => {
      e.preventDefault()
      setClientY(e.clientY)

      // Check if the mouse is over another div
      setActivePlaceholderIdx(dragItemSlotIndx(e))
   }

   /** Placeholder that should activate to accomodate dragged item */
   const dragItemSlotIndx = (e: MouseEvent) => {
      /** Index of the item currently being hovered */
      const hoverIdx = itemsBoundingRect.current.findIndex((rect) => rect && e.clientY >= rect.top && e.clientY <= rect.bottom)
      console.log(itemsBoundingRect.current[0].top >= e.clientY ? 0 : itemsBoundingRect.current.length)
      if (hoverIdx === -1) return itemsBoundingRect.current[0].top >= e.clientY ? 0 : itemsBoundingRect.current.length
      else return hoverIdx < activeIndex ? hoverIdx : hoverIdx + 1
   }

   // Listeners
   useEffect(() => {
      if (isDragging) {
         window.addEventListener("mousemove", onMouseMove)
         window.addEventListener("mouseup", onMouseUp)
      } else {
         window.removeEventListener("mousemove", onMouseMove)
         window.removeEventListener("mouseup", onMouseUp)
      }
      return () => {
         window.removeEventListener("mousemove", onMouseMove)
         window.removeEventListener("mouseup", onMouseUp)
      }
   }, [isDragging])

   console.log("active: " + 1, clientY - downY)
   console.log("fails: ", itemsBoundingRect.current[activePlaceholderIdx - 1]?.height ?? 1364)

   return (
      <div className="pos-relative">
         {items.map((item, index) => {
            const actPlcHeight = activePlaceholderIdx !== -1 ? itemsBoundingRect.current[activeIndex].height : 0

            return (
               <>
                  <div
                     className={`${styles.placeholder} bg-pink w-20px`}
                     style={{
                        height: activePlaceholderIdx === index ? itemsBoundingRect.current[activeIndex].height : 0,
                        width: activePlaceholderIdx === index && 20 * activePlaceholderIdx + 20,
                     }}
                  />
                  <div>
                     {/* Draggable */}
                     <div
                        style={{
                           position: activeIndex === index ? "absolute" : "relative",
                           transform: `translateY(${
                              activeIndex === index ? clientY - downY + actPlcHeight * (activePlaceholderIdx <= index ? -1 : 0) : 0
                           }px)`,
                           width: activeIndex === index ? itemsBoundingRect.current[index].width : "auto",
                           height: activeIndex === index ? itemsBoundingRect.current[index].height : "auto",
                        }}
                        onMouseDown={(e) => {
                           setActivePlaceholderIdx(index)
                           setClientY(e.clientY)
                           setDownY(e.clientY)
                           setActiveIndex(index)
                        }}
                        ref={(node) => !isDragging && node && (itemsBoundingRect.current[index] = node.getBoundingClientRect())}
                     >
                        {/* Item JSX */}
                        {item}
                     </div>
                  </div>
               </>
            )
         })}
         <div
            className={`${styles.placeholder} bg-pink w-20px`}
            style={{
               height: activePlaceholderIdx === items.length ? itemsBoundingRect.current[activeIndex].height : 0,
               width: activePlaceholderIdx === items.length && 20 * activePlaceholderIdx + 20,
            }}
         />
      </div>
   )
}

export const ReorderableList2 = ({ items: InitItems, maxHeight = "200px", itemHeight = 20 }: Props) => {
   const [items, setItems] = useState(InitItems)
   // The index of the item currently being dragged; -1 if none.
   const [draggingIndex, setDraggingIndex] = useState(-1)
   // The current Y position of the mouse, used for transforming the dragged item.
   const [currentY, setCurrentY] = useState(0)
   // Where the mouse started (used to calculate transform offset).
   const [startY, setStartY] = useState(0)
   const [activePlaceholderIdx, setActivePlaceholderIdx] = useState(-1)

   // Use a ref to store the heights and positions of each item’s DOM node.
   const itemPositions = useRef([])

   // We'll attach global listeners once dragging starts, and remove them on end.
   useEffect(() => {
      if (draggingIndex !== -1) {
         window.addEventListener("mousemove", onMouseMove)
         window.addEventListener("mouseup", onMouseUp)
      } else {
         window.removeEventListener("mousemove", onMouseMove)
         window.removeEventListener("mouseup", onMouseUp)
      }

      return () => {
         window.removeEventListener("mousemove", onMouseMove)
         window.removeEventListener("mouseup", onMouseUp)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [draggingIndex, currentY])

   const onMouseDown = (e, index) => {
      // Record the initial positions for the drag
      setActivePlaceholderIdx(index)
      setDraggingIndex(index)
      setStartY(e.clientY)
      setCurrentY(e.clientY)
   }

   const onMouseMove = (e) => {
      e.preventDefault()
      setCurrentY(e.clientY)
      // hovering item index
      const hoveringIndx = itemPositions.current
         .filter((_, i) => i !== draggingIndex)
         .findIndex((item) => item.top < e.clientY && item.top + item.height > e.clientY)
      console.log(hoveringIndx, itemPositions.current, e.clientY)
      hoveringIndx !== -1 && setActivePlaceholderIdx(hoveringIndx)
   }

   const onMouseUp = () => {
      // Figure out the item we’re currently hovered over
      // and reorder the list accordingly.
      const draggedItem = items[draggingIndex]
      const newOrder = [...items]

      // The center of the dragged item:
      const draggedCenterY = currentY - itemHeight / 2

      // Find which index we’re hovering.
      // We'll check each item’s midpoint and see where the dragged item’s center “fits”.
      let hoverIndex = draggingIndex
      for (let i = 0; i < itemPositions.current.length; i++) {
         const { top, height } = itemPositions.current[i]
         const midpoint = top + height / 2
         if (draggedCenterY < midpoint) {
            hoverIndex = i
            break
         }
         // If we never break, it means we’re after the last item.
         if (i === itemPositions.current.length - 1) {
            hoverIndex = i
         }
      }

      // Remove the dragged item from its old place
      newOrder.splice(draggingIndex, 1)
      // Insert it at the new index
      newOrder.splice(hoverIndex, 0, draggedItem)

      setItems(newOrder)
      // Reset the drag state
      setDraggingIndex(-1)
      setActivePlaceholderIdx(-1)
   }

   // We'll store each item’s vertical position (top offset + height) after render.
   const updateItemPosition = (index, node) => {
      if (node) {
         const rect = node.getBoundingClientRect()
         // We store the top and height for each item.
         // Alternatively, you could store many details if needed.
         itemPositions.current[index] = {
            top: rect.top + window.scrollY,
            height: rect.height,
         }
      }
   }

   // The offset the dragged item should move.
   // E.g. if you moved your cursor 20px down from where you started dragging.
   const yOffset = currentY - startY

   return (
      <div
         style={{
            maxHeight,
            overflowY: "auto",
            border: "1px solid #ccc",
            width: "100%",
            margin: "0 auto",
         }}
      >
         {items.map((item, index) => {
            // If this is the item currently being dragged, we absolutely position it
            // over the others using transform.
            const isDragging = index === draggingIndex

            // If dragging, hide its original place and show a placeholder
            // so other items don't shift up. We'll define a style for the placeholder below.

            // Use dynamic z-index to put dragged item on top
            const itemStyle: React.CSSProperties = isDragging
               ? {
                    position: "absolute",
                    transform: `translateY(${yOffset}px)`,
                    zIndex: 999,
                 }
               : {
                    position: "relative",
                    cursor: "grab",
                 }

            return (
               <div className="">
                  <div
                     key={item.id}
                     // Attach ref so we can measure position
                     ref={(node) => draggingIndex !== -1 && updateItemPosition(index, node)}
                     style={{
                        // We'll give each item the same height so they line up easily.
                        height: itemHeight,
                        // If it's the dragging item, we absolutely position it (via itemStyle).
                        // Otherwise, it’s “relative” within the flow.
                        ...itemStyle,
                        border: "1px solid #ccc",
                        margin: "4px 0",
                        display: "flex",
                        alignItems: "center",
                        padding: "8px",
                        boxSizing: "border-box",
                     }}
                     onMouseDown={(e) => onMouseDown(e, index)}
                  >
                     {isDragging
                        ? // Display the item’s content while dragging
                          item
                        : // If not dragging, show the item normally
                          item}
                  </div>
                  <div className="placeholder" style={{ height: activePlaceholderIdx === index ? itemHeight : 0, margin: 4 }} />
               </div>
            )
         })}
      </div>
   )
}

export default ReorderableList
