import { Fragment } from "react";
import Image from "next/image";
import { HeroScene } from "@/components/hero-scene";
import { InstallButton } from "@/components/install-button";
import { Logo } from "@/components/logo";
import { TerminalDemo } from "@/components/terminal-demo";

const GITHUB = "https://github.com/mfinikov/bravogram";
const NPM = "https://www.npmjs.com/package/bravogram";

// Each tool's own mark, shown beside its name. Claude and MCP come from simple-icons (CC0),
// Hermes from the hermes-agent repo (MIT); the shell glyph is ours.
const WORKS_WITH = [
  { name: "Claude Code", logo: "/logos/claude.svg" },
  { name: "Hermes", logo: "/logos/hermes.svg" },
  { name: "any MCP client", logo: "/logos/mcp.svg" },
  { name: "any shell", logo: "/logos/shell.svg" },
];

const STEPS = [
  { title: "Install it.", code: "npm i -g bravogram" },
  { title: "Connect your agents.", code: "claude mcp add --scope user bravogram -- bravogram mcp" },
  { title: "Look at what they know.", code: "bravogram import ~/notes && bravogram graph" },
];

// Measured on 2026-10-03 on one real 19-note vault: grep plus the first 15 lines of each hit, against `bravogram recall`.
// Characters returned. 0 means the search found nothing.
const NUMBERS = [
  { q: "“turso”", grep: 1696, us: 307 },
  { q: "“chapter 2”", grep: 3962, us: 632 },
  { q: "“sqlite lock”", grep: 0, us: 559 },
];
const LONGEST = Math.max(...NUMBERS.map((n) => n.grep));
const chars = (n: number) => `${n.toLocaleString("en-US")} chars`;

const COMMANDS = [
  { cmd: "remember", does: "Save a fact, a decision or a lesson" },
  { cmd: "recall", does: "Ranked search, short snippets back" },
  { cmd: "show", does: "Read one memory in full" },
  { cmd: "append", does: "Add to a memory without rewriting it" },
  { cmd: "link", does: "Connect two memories" },
  { cmd: "history/restore", does: "See old versions, bring one back" },
  { cmd: "graph", does: "Open the memory graph in a browser" },
  { cmd: "import/export", does: "Markdown in, Markdown out" },
  { cmd: "mcp", does: "Serve all of it to any MCP agent" },
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

      <header>
        <nav className="nav" aria-label="Site">
          <a className="brand" href="#top" aria-label="Bravogram, home"><Logo />bravogram</a>
          <a className="link" href={NPM}>npm</a>
          <a className="link" href={GITHUB}>GitHub</a>
        </nav>
      </header>

      <main id="main">
        <div className="wrap" id="top">
          <section className="hero">
            <HeroScene />
            <div className="hero-in">
              <h1><span className="hl">One memory</span> for all your agents</h1>
              <p className="lede">
                A local memory shared by Claude, Hermes and any MCP agent. They save what they learn and find it again in milliseconds.
              </p>
              <InstallButton />
              <ul className="works" aria-label="Works with">
                <li className="lead" aria-hidden="true">Works with</li>
                {WORKS_WITH.map((w) => (
                  <li key={w.name}><Image src={w.logo} alt="" width={16} height={16} />{w.name}</li>
                ))}
              </ul>
              <p className="meta">Open source · runs on your machine · Node 24 or newer · zero dependencies</p>
            </div>
          </section>

          <section className="pad" id="how">
            <h2 className="sr-only">Three commands to a shared memory</h2>
            <div className="demo">
              <Mock label="zsh"><TerminalDemo /></Mock>
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

          <section className="pad" id="what">
            <h2 className="sr-only">What it does</h2>
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

          <section className="pad bento" id="numbers">
            <div className="tile">
              <h2>Less text for the same answer</h2>
              <p>The same three questions, asked of a folder of Markdown notes with grep and of Bravogram. Text returned:</p>
              <div className="bars">
                {NUMBERS.map((n) => (
                  <Fragment key={n.q}>
                    <div className="q">{n.q}</div>
                    <div className="bar">
                      <span>grep</span>
                      <span className="track"><i style={{ width: `${(n.grep / LONGEST) * 100}%` }} /></span>
                      <span className="val">{n.grep ? chars(n.grep) : "found nothing"}</span>
                    </div>
                    <div className="bar us">
                      <span>bravogram</span>
                      <span className="track"><i style={{ width: `${(n.us / LONGEST) * 100}%` }} /></span>
                      <span className="val">{chars(n.us)} <small>{n.grep ? `${(n.grep / n.us).toFixed(1)}x less` : "found it"}</small></span>
                    </div>
                  </Fragment>
                ))}
              </div>
              <p className="note">
                Measured on October 3, 2026 on one real 19-note vault: grep plus the first 15 lines of each hit, against{" "}
                <code>bravogram recall</code>. A small sample, so run it on your own notes.
              </p>
            </div>
            <div className="tile">
              <h2>Simple CLI</h2>
              <ul className="api">
                {COMMANDS.map((c) => (
                  <li key={c.cmd}><code><span>$</span> bravogram {c.cmd}</code>{c.does}</li>
                ))}
              </ul>
              <p className="note">
                Plus <code>doctor</code>, <code>forget</code> and <code>--json</code> output. Agents get the same tools over MCP.
              </p>
            </div>
          </section>

          <a className="cta" href={`${GITHUB}#readme`}>
            <div>
              <h2>Get started <small>(three commands)</small></h2>
              <p>Install it, connect an agent, open the graph.</p>
            </div>
            <span className="go">
              Read the docs
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </a>

          <section className="pad" id="faq">
            <h2>FAQ</h2>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        </div>
      </main>

      <footer>
        <div className="foot">
          <div className="cols">
            <div><span>Project</span><a className="link" href={GITHUB}>GitHub</a><a className="link" href={NPM}>npm</a></div>
            <div><span>Help</span><a className="link" href={`${GITHUB}#readme`}>Docs</a><a className="link" href={`${GITHUB}/issues`}>Issues</a></div>
            <div><span>Legal</span><a className="link" href={`${GITHUB}/blob/main/LICENSE`}>MIT license</a></div>
          </div>
          <p><Logo size={18} />© 2026 Bravogram</p>
        </div>
        <HeroScene band />
      </footer>
    </>
  );
}
