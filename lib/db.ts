const globalForDb = globalThis as unknown as {
  pdfDatabase: Map<string, { buffer: string; schema: any }>;
};

export const db = globalForDb.pdfDatabase || new Map();
if (process.env.NODE_ENV !== 'production') globalForDb.pdfDatabase = db;