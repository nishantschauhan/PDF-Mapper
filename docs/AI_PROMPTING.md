# AI Prompting & Collaboration Process

## 🤖 Tools & Models
* **Task Constraint Note:** The assignment explicitly prohibited Claude but allowed Cursor/Opus 4.6. However, I opted not to use Cursor or Opus for this project.
* **Chosen LLM:** Google Gemini(Free).
* **Primary Use Cases:** Task breakdown, documentation structuring, library evaluation, and high-level architectural examples.

## 🎭 Custom System Instructions & Persona
To ensure this project accurately reflected my own engineering capabilities as a Master's student in Software Engineering, I set strict boundaries with Gemini. I utilized the AI as an architectural mentor rather than a code generator.

The core interaction rules I established were:
> "Act as a Senior Principal Engineer. We are building a Next.js PDF variable mapper.
> - Do not write the exact code. Just explanations, and architectural discussions.
> - When I ask about integrating a specific feature, discuss best practices, suggest alternatives, and provide generic examples rather than copy-paste solutions.
> - Help me properly break down tasks and structure my project documentation."

## 🧩 Prompting Strategy
Rather than generating the application zero-shot, I utilized a **Consultative Prompting** strategy to drive the architecture and implementation myself.

1. **Task Describing & Planning:** Before writing any code, I used Gemini to break down the core assignment requirements into logical engineering phases (State Management, PDF Engine, Drag & Drop Physics, Schema Validation).

2. **Library Evaluation:** I prompted the AI to help me weigh the pros and cons of different tools before making a decision. For example, discussing the capabilities of `@dnd-kit/core` for portal rendering, or evaluating strict schema validation libraries before selecting Zod.

3. **Feature Integration Examples:** When tackling complex UI logic—such as mapping drag-and-drop deltas to percentage-based coordinates—I asked Gemini for the underlying mathematical theory and generic examples. I then wrote the specific, tailored implementation for the application independently.

4. **Documentation:** Once the codebase was complete, I collaborated with Gemini to format and structure the technical and non-technical markdown files, ensuring my architectural decisions and business logic were communicated cleanly and professionally.
