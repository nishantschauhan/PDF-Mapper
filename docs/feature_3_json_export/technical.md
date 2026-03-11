## Architecture Overview
The Export feature bridges the gap between the visual frontend UI and backend document generation services. It extracts the raw variable placement data from the Zustand store, passes it through a strict runtime validation schema, and generates a downloadable file entirely on the client side.

## Key Technical Decisions

* **Runtime Schema Validation (`Zod`):** TypeScript interfaces only provide compile-time safety. To guarantee that the exported data is structurally flawless, we use Zod. Before the export triggers, the payload is parsed against a strict schema that enforces constraints like `min(0)` for coordinates, non-empty variable keys, and UUID validation. If validation fails, the export is blocked, preventing corrupt data from ever reaching a backend service.

* **Client-Side File Generation:** To maintain the strict "no-backend" requirement, the JSON file is generated dynamically in the browser. The validated JavaScript object is serialized into a JSON string, encoded into a Data URI (`data:text/json;charset=utf-8,...`), and attached to a temporary anchor (`<a>`) tag to trigger a native browser download.

* **Embedded Coordinate Metadata:** A `coordinateSystem` string is explicitly injected into the top level of the exported JSON. This serves as critical documentation for backend or downstream systems, defining that the X and Y properties are calculated as percentages (0-100) from a top-left origin, rather than absolute PDF points.

## Trade-offs
Introducing Zod slightly increases the client-side bundle size. However, the runtime guarantee that every exported template is 100% compliant with the expected backend schema heavily outweighs the minor footprint increase. It completely eliminates a major class of downstream processing errors.