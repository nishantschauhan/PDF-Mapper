import { z } from 'zod';


export const VariableTypeSchema = z.enum(['text', 'number', 'date','signature', 'checkbox']);
export type VariableType = z.infer<typeof VariableTypeSchema>;


export const VariablePlacementSchema = z.object({
  id: z.string(), 
  key: z.string().min(1, "Variable cannot be empty"),
  label: z.string().optional(),
  type: VariableTypeSchema,
  page: z .number().int().positive(),
  x: z.number().min(0).max(100), 
  y: z.number().min(0).max(100), 
  width: z.number().optional(),
  height: z.number().optional(),
});

export type VariablePlacement = z.infer<typeof VariablePlacementSchema>;

export const TemplateExportSchema = z.object({
  documentName: z.string().optional(),
  coordinateSystem: z.string(),
  variables: z.array(VariablePlacementSchema),
});

export type TemplateExport = z.infer<typeof TemplateExportSchema>;