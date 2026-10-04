// Caption: The scene opening the hero, with the hero text sitting in the hole at its bottom centre.
import { HeroScene } from "@/components/hero-scene";

export default function Example() {
  return (
    <section className="hero">
      <HeroScene />
      <div className="hero-in">
        <h1><span className="hl">One memory</span> for all your agents</h1>
      </div>
    </section>
  );
}
