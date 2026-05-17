"use client";

import { QuadraticBezierLine } from "@react-three/drei";
import { useNondonStore } from "@/src/store/useNondonStore";
import { useHydratedStore } from "@/src/hooks/useHydratedStore";

export function Wires() {
  const connections = useHydratedStore(useNondonStore, (state) => state.connections, []);
  const nodes = useHydratedStore(useNondonStore, (state) => state.nodes, []);

  return (
    <>
      {connections?.map((connection) => {
        const safeNodes = nodes || [];
        const fromNode = safeNodes.find((n) => n.id === connection.fromNodeId);
        const toNode = safeNodes.find((n) => n.id === connection.toNodeId);

        if (!fromNode || !toNode) return null;

        const fromPort = fromNode.ports.find((p) => p.id === connection.fromPortId);
        const toPort = toNode.ports.find((p) => p.id === connection.toPortId);

        if (!fromPort || !toPort) return null;

        const fromSize = fromNode.size || [1, 1, 1];
        const toSize = toNode.size || [1, 1, 1];

        // 絶対座標の計算
        const start: [number, number, number] = [
          fromNode.position[0] + fromPort.offset[0] * fromSize[0],
          fromNode.position[1] + fromPort.offset[1] * fromSize[1],
          fromNode.position[2] + fromPort.offset[2] * fromSize[2],
        ];

        const end: [number, number, number] = [
          toNode.position[0] + toPort.offset[0] * toSize[0],
          toNode.position[1] + toPort.offset[1] * toSize[1],
          toNode.position[2] + toPort.offset[2] * toSize[2],
        ];

        // いい感じにたわむように中間点を計算
        const mid: [number, number, number] = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 + 1.5, // 上にたわませる
          (start[2] + end[2]) / 2,
        ];

        const lineWidth = fromPort.portType === "link" ? 5 : 2;

        return (
          <QuadraticBezierLine
            key={connection.id}
            start={start}
            end={end}
            mid={mid}
            color={fromPort.color}
            lineWidth={lineWidth}
            dashed={false}
          />
        );
      })}
    </>
  );
}
