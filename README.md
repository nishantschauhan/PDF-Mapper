# PDF Variable Mapper

A standalone Next.js application that allows users to upload a PDF, visually map dynamic variables onto the document using a drag-and-drop interface, and export a strictly validated JSON schema of the percentage-based coordinates.

This project was built to demonstrate complex frontend state management, drag-and-drop physics, and strict data validation without relying on a persistent backend.

## 🚀 Quick Start

### Option 1: Docker (Recommended)
This application is fully containerized using a multi-stage Next.js `standalone` build for an optimized, lightweight footprint.

1. Ensure Docker and Docker Compose are installed on your machine.
2. Run the following command in the root directory:
   ```bash
   docker compose up --build
   ```

Open your browser and navigate to http://localhost:3000.



--------------------------------------------

Option 2: Local Development
Install dependencies:

Bash
```
npm install
```

Start the development server:

Bash
```
npm run dev
```
Open your browser and navigate to http://localhost:3000.
