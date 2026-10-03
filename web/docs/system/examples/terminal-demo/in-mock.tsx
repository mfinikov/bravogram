// Caption: The demo inside a mock window on a card, as in the live demo section.
import { TerminalDemo } from "@/components/terminal-demo";

export default function Example() {
  return (
    <div className="card">
      <div className="mock" aria-hidden="true">
        <div className="bar"><i /><i /><i /><span>zsh</span></div>
        <TerminalDemo />
      </div>
    </div>
  );
}
