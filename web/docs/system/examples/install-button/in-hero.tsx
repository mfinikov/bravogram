// Caption: The install box under the lede, on top of the scene.
import { InstallButton } from "@/components/install-button";

export default function Example() {
  return (
    <div className="hero-in">
      <p className="lede">A local memory shared by Claude, Hermes and any MCP agent.</p>
      <InstallButton />
    </div>
  );
}
