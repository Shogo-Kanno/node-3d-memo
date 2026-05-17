import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  GlobalState,
  GlobalStateSchema,
  Nondon,
  Connection,
} from "../types/node";

interface NondonStore extends GlobalState {
  addNode: (node: Nondon) => void;
  updateNode: (id: string, updatedFields: Partial<Nondon>) => void;
  removeNode: (id: string) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  selectNode: (id: string | null) => void;
  setEditingAxis: (axis: "Y" | "Z") => void;
  setTransformMode: (mode: "translate" | "scale") => void;
  startConnection: (nodeId: string, portId: string) => void;
  completeConnection: (toNodeId: string, toPortId: string) => void;
  reset: () => void;
}

const initialState: GlobalState = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  connectingPort: null,
  editingAxis: "Y",
  transformMode: "translate",
};

export const useNondonStore = create<NondonStore>()(
  persist(
    (set) => ({
      ...initialState,
      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node] })),
      updateNode: (id, updatedFields) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updatedFields } : node
          ),
        })),
      removeNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          connections: state.connections.filter(
            (c) => c.fromNodeId !== id && c.toNodeId !== id
          ),
          selectedNodeId:
            state.selectedNodeId === id ? null : state.selectedNodeId,
        })),
      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),
      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        })),
      selectNode: (id) =>
        set((state) => ({
          selectedNodeId: id,
          // 何もない空間をクリックして選択解除したときは結線モードもキャンセル
          ...(id === null ? { connectingPort: null } : {}),
        })),
      setEditingAxis: (axis) => set({ editingAxis: axis }),
      setTransformMode: (mode) => set({ transformMode: mode }),
      startConnection: (nodeId, portId) =>
        set({ connectingPort: { nodeId, portId } }),
      completeConnection: (toNodeId, toPortId) =>
        set((state) => {
          if (!state.connectingPort) return {};
          
          // 同じポートをクリックした場合はキャンセル
          if (
            state.connectingPort.nodeId === toNodeId &&
            state.connectingPort.portId === toPortId
          ) {
            return { connectingPort: null };
          }

          const newConnection: Connection = {
            id: crypto.randomUUID(),
            fromNodeId: state.connectingPort.nodeId,
            fromPortId: state.connectingPort.portId,
            toNodeId: toNodeId,
            toPortId: toPortId,
          };

          return {
            connections: [...state.connections, newConnection],
            connectingPort: null,
          };
        }),
      reset: () => set(initialState),
    }),
    {
      name: "nondon-storage",
      storage: createJSONStorage(() => localStorage),
      // Zodを用いた型安全な再構築 (Rehydration)
      merge: (persistedState: unknown, currentState: NondonStore) => {
        const parsed = GlobalStateSchema.safeParse(persistedState);
        if (parsed.success) {
          return { ...currentState, ...parsed.data };
        }
        console.error("Zustand state validation failed on rehydration:", parsed.error);
        return currentState;
      },
    }
  )
);
