// Caption: The graph behind the hero text, faded out in the middle so the headline stays readable.
import { HeroGraph } from "@/components/hero-graph";

export default function Example() {
  return (
    <section className="hero">
      <HeroGraph />
      <div className="hero-in">
        <h1>One memory <span className="accent">for all your agents.</span></h1>
      </div>
    </section>
  );
}
