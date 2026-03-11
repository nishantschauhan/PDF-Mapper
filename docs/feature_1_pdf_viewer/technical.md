## Architecture Overview
The PDF Viewer is responsible for ingesting, parsing, and rendering user-uploaded documents entirely within the client's browser. To satisfy strict privacy and infrastructure constraints, this feature relies exclusively on in-memory storage, bypassing server-side persistence entirely.

## Key Technical Decisions

* **Client-Side Rendering (`react-pdf`):** We utilize react-pdf (a React wrapper around Mozilla's PDF.js) to render the document as a standard HTML canvas. This allows for precise coordinate mapping later in the pipeline.

* **In-Memory State:** When a user uploads a file via the drag-and-drop zone, the File object is captured and stored directly in React state. No API calls are made, and no Blobs are sent to an external database or cloud bucket.

* **Memory Management:** By keeping the file in the React lifecycle rather than pushing it to a global store unnecessarily, we rely on standard browser garbage collection to clear the file from memory as soon as the user refreshes or closes the application.

* **Pagination Handling:** The viewer maintains a currentPage integer state. Next/Previous navigation buttons increment or decrement this state, triggering react-pdf to re-render the specific page layer without needing to reload the entire document buffer.

## Trade-offs
Rendering large PDFs entirely on the client side can be computationally expensive for lower-end devices. However, this trade-off was intentionally chosen to guarantee absolute zero-latency loading post-upload and strictly enforce the "no backend" architectural constraint.