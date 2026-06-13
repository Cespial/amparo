// lib/store.ts — Estado global de casos (Zustand).

import { create } from "zustand";
import type { Caso, EventoCaso, RolUsuario } from "./types";
import { casosSeed } from "./seed";
import { progresoDeEstado } from "./progreso";

interface CasoStore {
  /** Lista de casos en memoria. */
  casos: Caso[];
  /** Rol activo en la UI (selector de rol). */
  rolActivo: RolUsuario;
  /** Caso seleccionado actualmente (id), si aplica. */
  casoSeleccionadoId: string | null;

  /** Devuelve un caso por id. */
  getCaso: (id: string) => Caso | undefined;
  /** Aplica un patch parcial a un caso; recalcula progreso si cambia el estado. */
  updateCaso: (id: string, patch: Partial<Caso>) => void;
  /** Agrega un evento al timeline de un caso. */
  addEvento: (id: string, ev: EventoCaso) => void;
  /** Agrega un caso nuevo. */
  addCaso: (caso: Caso) => void;
  /** Fija el rol activo. */
  setRolActivo: (rol: RolUsuario) => void;
  /** Fija el caso seleccionado. */
  seleccionarCaso: (id: string | null) => void;
  /** Restaura los casos a la semilla. */
  reset: () => void;
}

export const useCasoStore = create<CasoStore>((set, get) => ({
  casos: casosSeed,
  rolActivo: "demandante",
  casoSeleccionadoId: null,

  getCaso: (id) => get().casos.find((c) => c.id === id),

  updateCaso: (id, patch) =>
    set((state) => ({
      casos: state.casos.map((c) => {
        if (c.id !== id) return c;
        const merged = { ...c, ...patch };
        // Si cambió el estado y no se pasó un progreso explícito, recalcular.
        if (patch.estado && patch.progreso === undefined) {
          merged.progreso = progresoDeEstado(patch.estado);
        }
        return merged;
      }),
    })),

  addEvento: (id, ev) =>
    set((state) => ({
      casos: state.casos.map((c) =>
        c.id === id ? { ...c, timeline: [...c.timeline, ev] } : c,
      ),
    })),

  addCaso: (caso) => set((state) => ({ casos: [...state.casos, caso] })),

  setRolActivo: (rol) => set({ rolActivo: rol }),

  seleccionarCaso: (id) => set({ casoSeleccionadoId: id }),

  reset: () => set({ casos: casosSeed, casoSeleccionadoId: null }),
}));
