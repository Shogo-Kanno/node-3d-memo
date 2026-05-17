"use client";

import { useNondonStore } from "@/src/store/useNondonStore";
import { useHydratedStore } from "@/src/hooks/useHydratedStore";

export function EditorPanel() {
  const selectedNodeId = useHydratedStore(useNondonStore, (state) => state.selectedNodeId, null);
  const nodes = useHydratedStore(useNondonStore, (state) => state.nodes, []);
  const connections = useHydratedStore(useNondonStore, (state) => state.connections, []);
  
  const updateNode = useNondonStore((state) => state.updateNode);
  const removeNode = useNondonStore((state) => state.removeNode);
  const removeConnection = useNondonStore((state) => state.removeConnection);
  const selectNode = useNondonStore((state) => state.selectNode);

  if (!selectedNodeId) return null;

  const safeNodes = nodes || [];
  const safeConnections = connections || [];

  const node = safeNodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  // このノードンに関連する結線を取得
  const connectedWires = safeConnections.filter(
    (c) => c.fromNodeId === node.id || c.toNodeId === node.id
  );

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-20 flex flex-col overflow-y-auto animate-in slide-in-from-right-full duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="font-bold text-slate-800">ノードン設定</h2>
        <button
          onClick={() => selectNode(null)}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          ✕
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* メモ編集 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              タイトル
            </label>
            <input
              type="text"
              value={node.title}
              onChange={(e) => updateNode(node.id, { title: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="タイトルを入力..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              メモ
            </label>
            <textarea
              value={node.memo}
              onChange={(e) => updateNode(node.id, { memo: e.target.value })}
              rows={5}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              placeholder="詳細なメモを入力..."
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* 結線（ワイヤー）の管理 */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            接続中のワイヤー ({connectedWires.length})
          </label>
          {connectedWires.length === 0 ? (
            <p className="text-sm text-slate-400 italic">接続はありません</p>
          ) : (
            <ul className="space-y-2">
              {connectedWires.map((wire) => {
                const isFrom = wire.fromNodeId === node.id;
                const otherNodeId = isFrom ? wire.toNodeId : wire.fromNodeId;
                const otherNode = safeNodes.find((n) => n.id === otherNodeId);
                
                return (
                  <li key={wire.id} className="flex justify-between items-center bg-slate-50 rounded p-2 text-sm border border-slate-100">
                    <span className="truncate flex-1 text-slate-600">
                      {isFrom ? "→ 出力先: " : "← 入力元: "}
                      <span className="font-semibold text-slate-800">
                        {otherNode?.title || "Unknown"}
                      </span>
                    </span>
                    <button
                      onClick={() => removeConnection(wire.id)}
                      className="ml-2 text-red-500 hover:bg-red-50 px-2 py-1 rounded transition text-xs"
                      title="ワイヤーを切断"
                    >
                      ✂️ 切断
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-auto pt-6">
          <button
            onClick={() => {
              removeNode(node.id);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300"
          >
            <span>🗑️</span> ノードンを削除
          </button>
        </div>
      </div>
    </div>
  );
}
