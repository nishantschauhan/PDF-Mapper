## Architecture Overview
The drag-and-drop engine is built on top of @dnd-kit/core. It manages two distinct interaction flows: dragging a *new* variable from the sidebar palette onto the PDF canvas, and wiggling/moving an *existing* variable that is already rendered on the document.

## Key Technical Decisions

* **Coordinate System (Percentages over Pixels):** To ensure the application is strictly responsive, X and Y coordinates are stored in the Zustand store as percentages (0-100) relative to the PDF page's width and height. If the user resizes their browser window, the variables remain perfectly anchored to the correct underlying text.

* **Bifurcated Drop Logic:** We implemented two separate mathematical formulas inside the handleDragEnd event to perfectly align the visual "ghost" overlay with the final drop placement:

  1. **New Variables:** We calculate the exact mathematical center of the dragged overlay pill (accounting for its fixed width/height) and map that center point against the over.rect (the PDF page bounding box) to calculate the initial X/Y percentages.
  2. **Existing Variables:** Because CSS transforms (-translate-x-1/2) interfere with bounding box calculations during a re-render, we bypass the bounding box entirely. We simply capture the exact pixel movement (`event.delta`) and add it to the existing coordinate percentages.

* **Optimized Re-renders:** By separating the activeDragData state from the core variable array, we prevent the entire PDF from re-rendering on every mouse movement, ensuring a buttery-smooth 60fps drag experience.

## Trade-offs
Using @dnd-kit requires a heavier upfront architectural setup (Sensors, Context Providers, Overlays) compared to the native HTML5 Drag and Drop API. However, this trade-off is necessary to support React-specific portal rendering, custom visual overlays, and strict collision detection across different component trees.