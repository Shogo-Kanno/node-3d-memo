"use client";

import { useNondonStore } from "@/src/store/useNondonStore";
import { useHydratedStore } from "@/src/hooks/useHydratedStore";
import { Nondon } from "@/src/types/node";

export function Toolbar() {
  const addNode = useNondonStore((state) => state.addNode);
  const setEditingAxis = useNondonStore((state) => state.setEditingAxis);
  const setTransformMode = useNondonStore((state) => state.setTransformMode);
  
  const editingAxis = useHydratedStore(useNondonStore, (state) => state.editingAxis, "Y");
  const selectedNodeId = useHydratedStore(useNondonStore, (state) => state.selectedNodeId, null);
  const transformMode = useHydratedStore(useNondonStore, (state) => state.transformMode, "translate");

  const handleAddNode = () => {
    // -5から5の間でランダムなX, Z座標を生成
    const x = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;

    const newNode: Nondon = {
      id: crypto.randomUUID(),
      type: "memo",
      title: "New Nondon",
      memo: "",
      position: [x, 0.5, z],
      size: [1, 1, 1],
      ports: [
        {
          id: crypto.randomUUID(),
          name: "Logic In",
          direction: "input",
          portType: "logic",
          color: "#4ade80", // Green
          offset: [-0.5, 0, 0], // Left edge
        },
        {
          id: crypto.randomUUID(),
          name: "Logic Out",
          direction: "output",
          portType: "logic",
          color: "#f87171", // Red
          offset: [0.5, 0, 0], // Right edge
        },
        {
          id: crypto.randomUUID(),
          name: "Link Out",
          direction: "output",
          portType: "link",
          color: "#fbbf24", // Yellow
          offset: [0, 0.5, 0], // Top edge
        },
      ],
    };

    addNode(newNode);
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleAddNode}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          ノードン追加
        </button>

        {/* 選択中のノードンがある場合のみ表示する移動/スケール切り替えボタン */}
        {selectedNodeId && (
          <div className="flex bg-white rounded-md shadow-md overflow-hidden border border-slate-200 ml-4">
            <button
              onClick={() => setTransformMode("translate")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                transformMode === "translate"
                  ? "bg-slate-800 text-white"
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              移動
            </button>
            <button
              onClick={() => setTransformMode("scale")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                transformMode === "scale"
                  ? "bg-slate-800 text-white"
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              サイズ
            </button>
          </div>
        )}
      </div>

      {/* 右側中央の編集軸トグルボタン */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 rounded-lg bg-white p-2 shadow-md border border-slate-200">
        <button
          onClick={() => setEditingAxis("Y")}
          className={`rounded px-4 py-3 text-sm font-semibold transition ${
            editingAxis === "Y"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-transparent text-slate-500 hover:bg-slate-100"
          }`}
        >
          Y軸 (高さ)
        </button>
        <button
          onClick={() => setEditingAxis("Z")}
          className={`rounded px-4 py-3 text-sm font-semibold transition ${
            editingAxis === "Z"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-transparent text-slate-500 hover:bg-slate-100"
          }`}
        >
          Z軸 (奥行き)
        </button>
      </div>

      {/* 左下の現在の軸HUD表示 */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="rounded-lg bg-slate-800/80 backdrop-blur-sm px-6 py-4 text-white shadow-lg border border-slate-700">
          <p className="text-xs text-slate-400 font-medium mb-1">現在の視点</p>
          <p className="text-xl font-bold tracking-wider">
            {editingAxis === "Y" ? "X-Y 平面 (正面)" : "X-Z 平面 (上面)"}
          </p>
        </div>
      </div>
    </>
  );
}
