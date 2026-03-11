## Architecture Overview
The Undo/Redo system provides a robust, single-history stack for all user interactions on the canvas (adding, moving, editing, or deleting variables). It is built entirely within the Zustand global state store, ensuring that state mutations are strictly tracked and easily reversible.

## Key Technical Decisions

* **History Stack Architecture:** The Zustand store implements a custom history slice containing three primary arrays: `past`, `present` (the active `variables` array), and `future`. Every modifying action pushes a deep snapshot of the `present` state into the `past` array before applying the new mutation.

* **Immutability:** Because React relies on referential equality to trigger re-renders, every state snapshot must be completely immutable. When a variable's X/Y coordinates change during a drag, the entire variable array is cloned, modified, and saved, rather than mutating the existing objects in memory.

* **Global Event Listeners:** A customized React `useEffect` hook is bound to the global `window` object to capture `Ctrl+Z` (Undo) and `Ctrl+Y` / `Ctrl+Shift+Z` (Redo) keystrokes. This ensures the shortcuts work seamlessly regardless of which specific DOM element currently has focus.

## Trade-offs
Storing deep copies of the variable array on every single micro-movement (like dragging a pixel) would instantly blow up the browser's memory. To solve this, the drag-and-drop engine only commits a snapshot to the `past` array on the `onDragEnd` event, completely ignoring the intermediary `onDragMove` frames. This trade-off drastically optimizes memory usage while preserving the logical "steps" a user expects to undo.