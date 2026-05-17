import { Scene } from "@/src/components/canvas/Scene";
import { Toolbar } from "@/src/components/ui/Toolbar";
import { EditorPanel } from "@/src/components/ui/EditorPanel";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-slate-50 overflow-hidden">
      {/* UIレイヤー */}
      <Toolbar />
      <EditorPanel />
      
      {/* 3Dキャンバスエリア */}
      <Scene />
    </main>
  );
}
