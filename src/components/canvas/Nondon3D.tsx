"use client";

import { useRef } from "react";
import { Mesh } from "three";
import { TransformControls } from "@react-three/drei";
import { Nondon } from "@/src/types/node";
import { useNondonStore } from "@/src/store/useNondonStore";
import { useHydratedStore } from "@/src/hooks/useHydratedStore";

export function Nondon3D({ node }: { node: Nondon }) {
  const meshRef = useRef<Mesh>(null);
  
  const selectNode = useNondonStore((state) => state.selectNode);
  const updateNode = useNondonStore((state) => state.updateNode);
  const startConnection = useNondonStore((state) => state.startConnection);
  const completeConnection = useNondonStore((state) => state.completeConnection);
  
  const selectedNodeId = useHydratedStore(useNondonStore, (state) => state.selectedNodeId, null);
  const transformMode = useHydratedStore(useNondonStore, (state) => state.transformMode, "translate");
  const connectingPort = useHydratedStore(useNondonStore, (state) => state.connectingPort, null);
  const editingAxis = useHydratedStore(useNondonStore, (state) => state.editingAxis, "Y");

  const isSelected = selectedNodeId === node.id;
  const size = node.size || [1, 1, 1];

  const handleMouseUp = () => {
    if (meshRef.current) {
      const pos = meshRef.current.position;
      const scale = meshRef.current.scale;
      
      updateNode(node.id, {
        position: [pos.x, pos.y, pos.z],
        // スケール変更をサイズに適用
        size: [size[0] * scale.x, size[1] * scale.y, size[2] * scale.z],
      });
      
      // Storeにサイズとして保存した後はスケールをリセット
      meshRef.current.scale.set(1, 1, 1);
    }
  };

  const handlePortClick = (e: any, portId: string) => {
    e.stopPropagation();
    if (connectingPort) {
      completeConnection(node.id, portId);
    } else {
      startConnection(node.id, portId);
    }
  };

  return (
    <>
      <mesh
        ref={meshRef}
        position={node.position}
        onClick={(e) => {
          e.stopPropagation(); // 背景のCanvasへのクリックイベント伝播を防ぐ
          selectNode(node.id);
        }}
      >
        <boxGeometry args={size as [number, number, number]} />
        <meshStandardMaterial color={isSelected ? "#6366f1" : "#4f46e5"} />

        {/* ポートの描画（サイズに合わせてオフセットをスケーリング） */}
        {node.ports.map((port) => {
          const portX = port.offset[0] * size[0];
          const portY = port.offset[1] * size[1];
          const portZ = port.offset[2] * size[2];
          const isConnectingThis =
            connectingPort?.nodeId === node.id && connectingPort?.portId === port.id;

          return (
            <mesh
              key={port.id}
              position={[portX, portY, portZ]}
              onClick={(e) => handlePortClick(e, port.id)}
            >
              <sphereGeometry args={isConnectingThis ? [0.25, 16, 16] : [0.15, 16, 16]} />
              {/* 接続中ならエミッシブ（発光）を強調 */}
              <meshStandardMaterial
                color={port.color}
                emissive={port.color}
                emissiveIntensity={isConnectingThis ? 0.8 : 0.2}
              />
            </mesh>
          );
        })}
      </mesh>

      {isSelected && (
        <TransformControls
          // @ts-expect-error: Dreiの型定義とReact19のRefObject型の不一致を回避
          object={meshRef}
          mode={transformMode}
          showZ={editingAxis !== "Y"} // Y軸（正面）編集中はZ方向への移動をロック
          showY={editingAxis !== "Z"} // Z軸（上面）編集中はY方向への移動をロック
          onMouseUp={handleMouseUp}
        />
      )}
    </>
  );
}
