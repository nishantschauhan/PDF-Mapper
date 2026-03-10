import { create } from 'zustand';
import { VariablePlacement } from '../lib/schema';

interface PdfState {
  variables: VariablePlacement[];
  history: VariablePlacement[][];
  future: VariablePlacement[][];
  
  
  selectedVariableId: string | null;
  setSelectedVariable: (id: string | null) => void;

  
  addVariable: (variable: VariablePlacement) => { success: boolean; error?: string };
  updateVariable: (id: string, updates: Partial<VariablePlacement>) => { success: boolean; error?: string };
  deleteVariable: (id: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

export const usePdfStore = create<PdfState>((set, get) => ({
  variables: [],
  history: [],
  future: [],
  selectedVariableId: null,

  setSelectedVariable: (id) => set({ selectedVariableId: id }),

  addVariable: (variable) => {
    const { variables, history } = get();
    if (variables.some((v) => v.key === variable.key)) {
      return { success: false, error: 'Variable key must be unique.' };
    }
    set({
      history: [...history, variables],
      future: [],
      variables: [...variables, variable],
    });
    return { success: true };
  },

  updateVariable: (id, updates) => {
    const { variables, history } = get();
    
    if (updates.key) {
      const isDuplicate = variables.some((v) => v.id !== id && v.key === updates.key);
      if (isDuplicate) return { success: false, error: 'Variable key must be unique.' };
    }

    set({
      history: [...history, variables],
      future: [],
      variables: variables.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    });
    return { success: true };
  },

  deleteVariable: (id) => {
    const { variables, history, selectedVariableId } = get();
    set({
      history: [...history, variables],
      future: [],
      variables: variables.filter((v) => v.id !== id),
      // Automatically unselect if the deleted variable was the one currently selected
      selectedVariableId: selectedVariableId === id ? null : selectedVariableId, 
    });
  },

  undo: () => {
    const { variables, history, future } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      history: history.slice(0, -1),
      future: [variables, ...future],
      variables: previous,
      selectedVariableId: null, // Clear selection to avoid edge cases
    });
  },

  redo: () => {
    const { variables, history, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      history: [...history, variables],
      future: future.slice(1),
      variables: next,
      selectedVariableId: null, // Clear selection to avoid edge cases
    });
  },
  reset: () => set({
    variables: [],
    history: [],
    future: [],
    selectedVariableId: null,
  }),

}));