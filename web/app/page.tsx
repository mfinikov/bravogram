import { HeroScene } from "@/components/hero-scene";
import { InstallButton } from "@/components/install-button";
import { Logo } from "@/components/logo";
import { TerminalDemo } from "@/components/terminal-demo";

const GITHUB = "https://github.com/mfinikov/bravogram";
const NPM = "https://www.npmjs.com/package/bravogram";

const WORKS_WITH = ["Claude Code", "Hermes", "any MCP client", "any shell"];

const STEPS = [
  { title: "Install it.", code: "npm i -g bravogram" },
  { title: "Connect your agents.", code: "claude mcp add --scope user bravogram -- bravogram mcp" },
  { title: "Look at what they know.", code: "bravogram import ~/notes && bravogram graph" },
];

// Measured on 2026-10-03 on one real 19-note vault: grep plus the first 15 lines of each hit, against `bravogram recall`.
const NUMBERS = [
  { q: "“turso”", grep: "1,696 characters", us: "307", unit: "characters" },
  { q: "“chapter 2”", grep: "3,962 characters", us: "632", unit: "characters" },
  { q: "“sqlite lock”", grep: "found nothing", us: "found it", unit: "· 559 characters" },
];

const FAQ = [
  {
    q: "Where does my data live?",
    a: <>In one SQLite file at <code>~/.bravogram/memory.db</code> on your computer. No accounts, no telemetry, nothing sent anywhere.</>,
  },
  { q: "Which agents work with it?", a: "Anything that speaks MCP or can run a shell command. It is tested with Claude Code." },
  { q: "Can two agents write at the same time?", a: "Yes. Writes take turns under a lock, and the test suite covers it." },
  { q: "Is it a replacement for Obsidian?", a: "For agents, yes: it imports a vault and exports back to Markdown. For long notes by hand, keep Obsidian." },
  { q: "What doesn’t it do yet?", a: "No search by meaning, no sync between machines, and the graph page needs a connection the first time. It’s version 0.1." },
  { q: "What does it cost?", a: "Nothing. It’s MIT licensed and the code is on GitHub." },
];

function Mock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mock" aria-hidden="true">
      <div className="bar"><i /><i /><i /><span>{label}</span></div>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <header className="top">
        <nav className="nav" aria-label="Site">
          <a className="brand" href="#top" aria-label="Bravogram, home"><Logo />bravogram</a>
          <a className="link" href={NPM}>npm</a>
          <a className="link" href={GITHUB}>GitHub</a>
        </nav>
      </header>

      <main id="main">
        <div className="wrap" id="top">
          <section className="hero">
            <div className="hero-in">
              <span className="eyebrow">Open source · runs on your machine</span>
              <h1>One memory <span className="accent">for all your agents.</span></h1>
              <p className="lede">
                A local memory shared by Claude, Hermes and any MCP agent. They save what they learn and find it again in milliseconds.
              </p>
              <InstallButton />
              <ul className="works" aria-label="Works with">
                <li className="lead" aria-hidden="true">Works with</li>
                {WORKS_WITH.map((w) => <li key={w}>{w}</li>)}
              </ul>
              <p className="meta">Node 24 or newer · zero dependencies · MIT license</p>
            </div>
            <HeroScene />
          </section>

          <section className="pad" id="what">
            <span className="eyebrow">What it does</span>
            <div className="head"><h2>Four things, one small tool.</h2></div>
            <div className="grid two">
              <article className="card">
                <div>
                  <h3>Remember</h3>
                  <p>Any agent saves a fact, a decision or a lesson with one call, into one file on your machine.</p>
                </div>
                <Mock label="~/.bravogram/memory.db">
                  <pre>
                    <b>$ bravogram remember</b>{' "Ship on Fridays only\nafter the smoke test passes" --type decision\nsaved #24 Ship on Fridays only after the smoke…'}
                  </pre>
                </Mock>
              </article>
              <article className="card">
                <div>
                  <h3>Recall</h3>
                  <p>Ranked full-text search returns short snippets, not whole notes, so every lookup costs fewer tokens.</p>
                </div>
                <Mock label={'bravogram recall "smoke test"'}>
                  <pre>
                    <b>#24 Ship on Fridays only…</b>{" [decision]\n    …only after the "}<mark>smoke</mark> <mark>test</mark>{" passes\n"}
                    <b>#11 release checklist</b>{" [project]\n    …run the "}<mark>smoke</mark> <mark>test</mark>{" against staging…"}
                  </pre>
                </Mock>
              </article>
              <article className="card">
                <div>
                  <h3>See the graph</h3>
                  <p>Memories link with <code>[[wikilinks]]</code>. One command opens them as a graph you can search.</p>
                </div>
                <Mock label="127.0.0.1:4747">
                  <svg viewBox="0 0 440 190" fill="none">
                    <g stroke="var(--soft)" strokeOpacity=".5" strokeWidth="1">
                      <path d="M96 60L190 96M190 96L300 56M190 96L250 150M300 56L360 110M250 150L360 110M96 60L70 130M190 96L140 158M300 56L384 40" />
                    </g>
                    <circle cx="190" cy="96" r="13" fill="var(--graph-project)" /><circle cx="96" cy="60" r="8" fill="var(--graph-system)" />
                    <circle cx="300" cy="56" r="10" fill="var(--graph-decision)" /><circle cx="250" cy="150" r="7" fill="var(--graph-lesson)" />
                    <circle cx="360" cy="110" r="8" fill="var(--graph-fact)" /><circle cx="70" cy="130" r="6" fill="var(--graph-note)" />
                    <circle cx="140" cy="158" r="6" fill="var(--graph-note)" /><circle cx="384" cy="40" r="6" stroke="var(--soft)" strokeWidth="1.4" />
                  </svg>
                </Mock>
              </article>
              <article className="card">
                <div>
                  <h3>Undo anything</h3>
                  <p>Every change and delete is kept. One command brings an old version back.</p>
                </div>
                <Mock label="bravogram history roadmap">
                  <pre>
                    <b>roadmap</b>{": current #9, 1,231 chars\n  rev 3  10-03 15:22  update  by claude-code\n  rev 2  10-03 14:10  update  by hermes\n"}
                    <b>$ bravogram restore</b>{" roadmap --rev 2"}
                  </pre>
                </Mock>
              </article>
            </div>
          </section>

          <section className="pad" id="how">
            <span className="eyebrow">Live demo</span>
            <div className="head"><h2>Three commands to a shared memory.</h2></div>
            <div className="demo">
              <div className="card">
                <Mock label="zsh"><TerminalDemo /></Mock>
              </div>
              <div className="steps">
                {STEPS.map((s) => (
                  <div className="step" key={s.title}>
                    <p><b>{s.title}</b></p>
                    <code className="block">{s.code}</code>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pad" id="numbers">
            <span className="eyebrow">Receipts</span>
            <div className="head split">
              <h2>Less text for the same answer.</h2>
              <p>The same three questions, asked of a folder of Markdown notes and of Bravogram.</p>
            </div>
            <table>
              <thead>
                <tr><th scope="col">Question</th><th scope="col">Markdown notes, grep</th><th scope="col">Bravogram</th></tr>
              </thead>
              <tbody>
                {NUMBERS.map((n) => (
                  <tr key={n.q}>
                    <td>{n.q}</td>
                    <td>{n.grep}</td>
                    <td className="win">{n.us} <small>{n.unit}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">
              Measured on October 3, 2026 on one real 19-note vault: grep plus the first 15 lines of each hit, against{" "}
              <code>bravogram recall</code>. A small sample, so run it on your own notes.
            </p>
          </section>

          <section className="pad" id="faq">
            <span className="eyebrow">You were going to ask</span>
            <div className="head"><h2>Common questions.</h2></div>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>

          <footer>
            <div className="closing pad">
              <span className="eyebrow">That&rsquo;s the whole pitch</span>
              <InstallButton />
            </div>
            <div className="nav">
              <span>© 2026 Bravogram · MIT license</span>
              <a className="link" href={GITHUB}>GitHub</a>
              <a className="link" href={NPM}>npm</a>
              <a className="link" href={`${GITHUB}#readme`}>Docs</a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
