import { z } from 'zod';


export const VariableTypeEnum = z.enum(['text', 'number', 'date',]);
export type VariableType = z.infer<typeof VariableTypeEnum>;


export const VariablePlacementSchema = z.object({
  id: z.string(), 
  key: z.string().min(1, "Key cannot be empty"),
  label: z.string().optional(),
  type: VariableTypeEnum,
  page: z.number().int().positive(),
  x: z.number().min(0).max(100), 
  y: z.number().min(0).max(100), 
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