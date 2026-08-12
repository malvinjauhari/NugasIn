import { ConfigPanel } from "./ConfigPanel";
import { PreviewPanel } from "./PreviewPanel";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <ConfigPanel />
      <PreviewPanel />
    </div>
  );
}
