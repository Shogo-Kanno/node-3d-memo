"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, PerspectiveCamera } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import { useNondonStore } from "@/src/store/useNondonStore";
import { useHydratedStore } from "@/src/hooks/useHydratedStore";
import { Nondon3D } from "./Nondon3D";
import { Wires } from "./Wires";

// アニメーション用のコンポーネントを生成
const AnimatedCamera = animated(PerspectiveCamera);
const AnimatedGrid = animated(Grid);

export function Scene() {
  const nodes = useHydratedStore(useNondonStore, (state) => state.nodes, []);
  const editingAxis = useHydratedStore(useNondonStore, (state) => state.editingAxis, "Y");

  // editingAxisの変化に応じてカメラ位置・回転・グリッドの透明度をアニメーション
  const { cameraPos, cameraRot, opacityY, opacityZ } = useSpring({
    cameraPos: editingAxis === "Y" ? [0, 0, 10] : [0, 10, 0],
    cameraRot: editingAxis === "Y" ? [0, 0, 0] : [-Math.PI / 2, 0, 0],
    opacityY: editingAxis === "Y" ? 1 : 0,
    opacityZ: editingAxis === "Z" ? 1 : 0,
    config: { mass: 1, tension: 120, friction: 20 },
  });

  return (
    <div className="w-full h-screen relative">
      <Canvas
        className="w-full h-full"
        onPointerMissed={() => useNondonStore.getState().selectNode(null)}
      >
        {/* 環境光と指向性ライト */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* 空間の原点と軸の視覚化（赤:X, 緑:Y, 青:Z） */}
        <axesHelper args={[5]} />

        {/* 動的に移動・回転するカメラ */}
        <AnimatedCamera
          makeDefault
          position={cameraPos as any}
          rotation={cameraRot as any}
          fov={50}
        />

        {/* 壁面（XY平面）のグリッド: Y軸編集時に表示 */}
        <AnimatedGrid
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[10.5, 10.5]}
          cellSize={1}
          cellThickness={1}
          cellColor="#e5e5e5"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#cbd5e1"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
          // @ts-ignore
          material-transparent={true}
          material-opacity={opacityY}
        />

        {/* 床面（XZ平面）のグリッド: Z軸編集時に表示 */}
        <AnimatedGrid
          position={[0, -0.01, 0]}
          args={[10.5, 10.5]}
          cellSize={1}
          cellThickness={1}
          cellColor="#e5e5e5"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#cbd5e1"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
          // @ts-ignore
          material-transparent={true}
          material-opacity={opacityZ}
        />

        {/* Storeに保存されたノードンの描画 */}
        {nodes?.map((node) => (
          <Nondon3D key={node.id} node={node} />
        ))}

        {/* 結線（ワイヤー）の描画 */}
        <Wires />
      </Canvas>
    </div>
  );
}

