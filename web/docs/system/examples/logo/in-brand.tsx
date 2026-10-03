// Caption: The mark beside the wordmark in the home link, as in the nav.
import { Logo } from "@/components/logo";

export default function Example() {
  return (
    <a className="brand" href="#top" aria-label="Bravogram, home">
      <Logo />
      bravogram
    </a>
  );
}
