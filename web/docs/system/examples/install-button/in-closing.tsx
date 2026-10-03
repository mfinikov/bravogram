// Caption: The install box under the closing heading, as at the end of the page.
import { InstallButton } from "@/components/install-button";

export default function Example() {
  return (
    <section className="closing">
      <div className="pad">
        <h2>Give your agents a memory.</h2>
        <InstallButton />
      </div>
    </section>
  );
}
