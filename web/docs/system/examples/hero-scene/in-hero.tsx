// Caption: The scene under the hero text, closing the hero section.
import { HeroScene } from "@/components/hero-scene";

export default function Example() {
  return (
    <section className="hero">
      <div className="hero-in">
        <h1>One memory <span className="accent">for all your agents.</span></h1>
      </div>
      <HeroScene />
    </section>
  );
}
