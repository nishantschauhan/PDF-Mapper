import { z } from 'zod';

// Define the allowed variable types
export const VariableTypeEnum = z.enum(['text', 'number', 'date']);
export type VariableType = z.infer<typeof VariableTypeEnum>;

// Minimal shape for one variable
export const VariablePlacementSchema = z.object({
  id: z.string(), // internal unique ID
  key: z.string().min(1, "Key cannot be empty"),
  label: z.string().optional(),
  type: VariableTypeEnum,
  page: z.number().int().positive(),
  x: z.number().min(0).max(100), // Percentage based
  y: z.number().min(0).max(100), // Percentage based
  width: z.number().optional(),
  height: z.number().optional(),
});

export type VariablePlacement = z.infer<typeof VariablePlacementSchema>;

// Top-level export validation
export const TemplateExportSchema = z.object({
  documentName: z.string().optional(),
  variables: z.array(VariablePlacementSchema),
});

export type TemplateExport = z.infer<typeof TemplateExportSchema>;