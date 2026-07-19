import React, { useState, useEffect, useRef } from "react";
import {
  Terminal, Shield, Radar, Bug, Wifi, Lock, Award, Home,
  ChevronRight, CheckCircle2, Circle, Play, Book, Target,
  Flame, Cpu, Search, Globe, Skull, ArrowLeft, Zap
} from "lucide-react";

// ---------- Mock content ----------
const MODULES = [
  { id: "m1", num: "00", icon: Terminal, title: "Linux & Termux Foundations", tag: "FOUNDATION", color: "#4ade80", lessons: 12, done: 12, desc: "Filesystem, permissions, pkg/apt, shell scripting, tmux, SSH." },
  { id: "m2", num: "01", icon: Globe, title: "Networking Fundamentals", tag: "FOUNDATION", color: "#4ade80", lessons: 10, done: 10, desc: "OSI model, subnetting, DNS, HTTP(S), reading packet captures." },
  { id: "m3", num: "02", icon: Radar, title: "Reconnaissance & OSINT", tag: "RECON", color: "#facc15", lessons: 14, done: 6, desc: "whois, Shodan, theHarvester, nmap, subfinder, amass." },
  { id: "m4", num: "03", icon: Bug, title: "Web App Hacking", tag: "OFFENSIVE", color: "#f97316", lessons: 18, done: 2, desc: "OWASP Top 10, Burp Suite, SQLi, XSS, IDOR, ffuf fuzzing." },
  { id: "m5", num: "04", icon: Search, title: "Vulnerability Assessment", tag: "OFFENSIVE", color: "#f97316", lessons: 9, done: 0, desc: "Nikto, Nuclei templates, CVE research, CVSS scoring." },
  { id: "m6", num: "05", icon: Skull, title: "Exploitation Basics", tag: "ADVANCED", color: "#ef4444", lessons: 11, done: 0, desc: "Metasploit fundamentals, privilege escalation concepts." },
  { id: "m7", num: "06", icon: Wifi, title: "Wireless & Network Attacks", tag: "ADVANCED", color: "#ef4444", lessons: 8, done: 0, desc: "aircrack-ng suite, MITM & ARP spoofing theory." },
  { id: "m8", num: "07", icon: Award, title: "Bug Bounty Methodology", tag: "CAREER", color: "#38bdf8", lessons: 13, done: 0, desc: "Scope reading, recon pipelines, report writing, disclosure ethics." },
  { id: "m9", num: "08", icon: Flame, title: "CTF Labs", tag: "PRACTICE", color: "#c084fc", lessons: 20, done: 3, desc: "Progressively harder simulated challenges." },
];

const BOOT_LINES = [
  "[ OK ] mounting termux-fs ...",
  "[ OK ] starting recon-shell ...",
  "[ OK ] loading lab sandbox v2.3 ...",
  "[ OK ] syncing progress ...",
  "root@hackacademy:~$ welcome, operator_"
];

const TERMINAL_HELP = {
  help: "available: whoami, nmap -sV target, ls, clear, scan, help",
  whoami: "operator_tauseef  [rank: Recon Specialist]",
  ls: "modules/  labs/  loot/  notes.md",
  scan: "scanning 192.168.1.0/24 ...\n4 hosts up. use 'nmap -sV <ip>' to enumerate.",
  "nmap -sv 192.168.1.10": "22/tcp open ssh\n80/tcp open http (nginx 1.24)\n443/tcp open https",
};

// ---------- Small UI atoms ----------
function Chip({ children, color }) {
  return (
    <span
      className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-sm border"
      style={{ color, borderColor: color + "55", background: color + "14" }}
    >
      {children}
    </span>
  );
}

function ProgressBar({ pct, color = "#4ade80" }) {
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ---------- Screens ----------
function HomeScreen({ onOpenModule, onNav }) {
  const [bootIdx, setBootIdx] = useState(0);
  useEffect(() => {
    if (bootIdx < BOOT_LINES.length) {
      const t = setTimeout(() => setBootIdx((i) => i + 1), 350);
      return () => clearTimeout(t);
    }
  }, [bootIdx]);

  const totalLessons = MODULES.reduce((a, m) => a + m.lessons, 0);
  const doneLessons = MODULES.reduce((a, m) => a + m.done, 0);
  const overallPct = Math.round((doneLessons / totalLessons) * 100);

  return (
    <div className="px-4 pt-5 pb-24 space-y-5">
      {/* Terminal boot hero */}
      <div className="rounded-lg border border-emerald-500/20 bg-black/60 p-4 font-mono text-[12px] leading-relaxed shadow-[0_0_25px_-10px_rgba(74,222,128,0.4)]">
        <div className="flex items-center gap-1.5 mb-2 opacity-60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-[10px] tracking-widest text-emerald-400/50">HACKACADEMY.SH</span>
        </div>
        {BOOT_LINES.slice(0, bootIdx).map((l, i) => (
          <div key={i} className={i === BOOT_LINES.length - 1 ? "text-emerald-300" : "text-emerald-500/70"}>
            {l}
            {i === bootIdx - 1 && i === BOOT_LINES.length - 1 && <span className="animate-pulse">▊</span>}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "XP", value: "2,140", icon: Zap, color: "#facc15" },
          { label: "STREAK", value: "9d", icon: Flame, color: "#f97316" },
          { label: "RANK", value: "Recon Spec.", icon: Award, color: "#38bdf8" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex flex-col items-start gap-1">
            <s.icon size={14} style={{ color: s.color }} />
            <div className="text-sm font-mono text-white">{s.value}</div>
            <div className="text-[9px] tracking-widest text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs tracking-widest text-white/50 font-mono">CAMPAIGN PROGRESS</span>
          <span className="text-xs font-mono text-emerald-400">{overallPct}%</span>
        </div>
        <ProgressBar pct={overallPct} />
        <div className="text-[10px] text-white/30 font-mono">{doneLessons}/{totalLessons} lessons cleared</div>
      </div>

      {/* Continue card */}
      <button
        onClick={() => onOpenModule(MODULES[2])}
        className="w-full text-left rounded-lg border border-yellow-500/25 bg-gradient-to-br from-yellow-500/10 to-transparent p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-md bg-yellow-500/15 flex items-center justify-center shrink-0">
          <Radar size={18} className="text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-widest text-yellow-400/80 font-mono">CONTINUE</div>
          <div className="text-sm text-white font-medium truncate">Reconnaissance & OSINT — Lesson 7</div>
        </div>
        <ChevronRight size={16} className="text-white/30" />
      </button>

      {/* Module list preview */}
      <div className="space-y-2">
        <div className="text-[11px] tracking-widest text-white/40 font-mono px-1">ALL MODULES</div>
        {MODULES.map((m) => (
          <ModuleRow key={m.id} m={m} onOpen={() => onOpenModule(m)} />
        ))}
      </div>
    </div>
  );
}

function ModuleRow({ m, onOpen }) {
  const pct = Math.round((m.done / m.lessons) * 100);
  const Icon = m.icon;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-3 flex items-center gap-3 active:scale-[0.98] transition-all"
    >
      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 font-mono text-[10px]" style={{ background: m.color + "14", color: m.color }}>
        {pct === 100 ? <CheckCircle2 size={16} /> : <Icon size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/30">{m.num}</span>
          <span className="text-sm text-white/90 truncate">{m.title}</span>
        </div>
        <div className="mt-1.5"><ProgressBar pct={pct} color={m.color} /></div>
      </div>
      <span className="text-[10px] font-mono text-white/30 shrink-0">{m.done}/{m.lessons}</span>
    </button>
  );
}

function ModulesScreen({ onOpenModule }) {
  return (
    <div className="px-4 pt-5 pb-24 space-y-4">
      <div>
        <h1 className="text-lg text-white font-semibold tracking-tight">Modules</h1>
        <p className="text-xs text-white/40 mt-0.5">9 modules · foundation to bug bounty</p>
      </div>
      <div className="space-y-2.5">
        {MODULES.map((m) => {
          const pct = Math.round((m.done / m.lessons) * 100);
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onOpenModule(m)}
              className="w-full text-left rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2.5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: m.color + "14", color: m.color }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <Chip color={m.color}>{m.tag}</Chip>
                    <div className="text-sm text-white mt-1">{m.title}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-white/25 pt-1">{m.num}</span>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">{m.desc}</p>
              <div className="flex items-center gap-2">
                <ProgressBar pct={pct} color={m.color} />
                <span className="text-[10px] font-mono text-white/40 shrink-0">{m.done}/{m.lessons}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModuleDetailScreen({ m, onBack, onOpenTerminal }) {
  const Icon = m.icon;
  const lessons = Array.from({ length: m.lessons }, (_, i) => ({
    n: i + 1,
    title: `Lesson ${i + 1}`,
    done: i < m.done,
  }));
  return (
    <div className="px-4 pt-5 pb-24 space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 text-xs font-mono">
        <ArrowLeft size={14} /> BACK
      </button>

      <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: m.color + "30", background: m.color + "0a" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: m.color + "18", color: m.color }}>
            <Icon size={20} />
          </div>
          <div>
            <Chip color={m.color}>{m.tag}</Chip>
            <div className="text-white font-semibold mt-1">{m.title}</div>
          </div>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{m.desc}</p>
        <ProgressBar pct={Math.round((m.done / m.lessons) * 100)} color={m.color} />
      </div>

      <button
        onClick={onOpenTerminal}
        className="w-full rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 flex items-center justify-center gap-2 text-emerald-300 text-xs font-mono active:scale-[0.98] transition-transform"
      >
        <Terminal size={14} /> OPEN SANDBOX TERMINAL
      </button>

      <div className="space-y-1.5">
        {lessons.map((l) => (
          <div key={l.n} className="flex items-center gap-3 rounded-md p-2.5 border border-white/5 bg-white/[0.02]">
            {l.done ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <Circle size={16} className="text-white/20 shrink-0" />}
            <span className={`text-sm flex-1 ${l.done ? "text-white/40 line-through" : "text-white/85"}`}>{l.title}: {lessonName(m.id, l.n)}</span>
            {!l.done && <Play size={13} className="text-white/30" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function lessonName(mid, n) {
  const names = {
    m1: ["Filesystem & permissions", "pkg / apt basics", "Shell scripting 101", "tmux sessions", "SSH keys & config"],
    m2: ["OSI model", "Subnetting drills", "DNS deep dive", "Reading pcaps"],
    m3: ["Passive recon w/ whois", "Shodan queries", "theHarvester", "nmap host discovery", "subfinder + amass"],
    m4: ["OWASP Top 10 overview", "Burp Suite setup", "SQLi fundamentals", "XSS fundamentals", "IDOR patterns"],
  };
  const arr = names[mid] || ["Core concepts", "Hands-on drill", "Tool walkthrough", "Case study"];
  return arr[(n - 1) % arr.length];
}

function TerminalScreen({ onBack }) {
  const [lines, setLines] = useState([
    "root@hackacademy:~$ type 'help' to see available commands",
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const run = () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    const key = cmd.toLowerCase();
    const out = TERMINAL_HELP[key] || `command not found: ${cmd}\n(sandbox — try: help, whoami, ls, scan)`;
    setLines((L) => [...L, `root@hackacademy:~$ ${cmd}`, out]);
    setInput("");
  };

  return (
    <div className="px-4 pt-5 pb-24 flex flex-col h-full">
      <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 text-xs font-mono mb-3">
        <ArrowLeft size={14} /> BACK
      </button>
      <div className="flex-1 rounded-lg border border-emerald-500/20 bg-black/70 p-3 font-mono text-[12px] overflow-y-auto space-y-1 min-h-[340px] max-h-[420px]">
        {lines.map((l, i) => (
          <div key={i} className={l.startsWith("root@") ? "text-emerald-300" : "text-emerald-500/70 whitespace-pre-line"}>{l}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="text-emerald-400 font-mono text-xs">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="type a command..."
          className="flex-1 bg-transparent outline-none text-white/90 font-mono text-xs placeholder:text-white/25"
        />
        <button onClick={run} className="text-emerald-400 text-xs font-mono">RUN</button>
      </div>
      <p className="text-[10px] text-white/25 font-mono mt-2">Sandboxed simulator · no real network access · safe on any device</p>
    </div>
  );
}

function LabsScreen() {
  const labs = [
    { title: "Recon a static target", diff: "EASY", color: "#4ade80", pts: 50 },
    { title: "Find the hidden subdomain", diff: "EASY", color: "#4ade80", pts: 60 },
    { title: "Exploit a login form (SQLi)", diff: "MEDIUM", color: "#facc15", pts: 120 },
    { title: "Bypass broken auth (IDOR)", diff: "MEDIUM", color: "#facc15", pts: 130 },
    { title: "Chain 3 vulns for full compromise", diff: "HARD", color: "#ef4444", pts: 300 },
  ];
  return (
    <div className="px-4 pt-5 pb-24 space-y-4">
      <div>
        <h1 className="text-lg text-white font-semibold tracking-tight">CTF Labs</h1>
        <p className="text-xs text-white/40 mt-0.5">Simulated targets · scored challenges</p>
      </div>
      <div className="space-y-2.5">
        {labs.map((l, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: l.color + "15", color: l.color }}>
              <Target size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/90 truncate">{l.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Chip color={l.color}>{l.diff}</Chip>
                <span className="text-[10px] font-mono text-white/40">+{l.pts} XP</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/25 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressScreen() {
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons, 0);
  const doneLessons = MODULES.reduce((a, m) => a + m.done, 0);
  return (
    <div className="px-4 pt-5 pb-24 space-y-4">
      <div>
        <h1 className="text-lg text-white font-semibold tracking-tight">Progress</h1>
        <p className="text-xs text-white/40 mt-0.5">{doneLessons}/{totalLessons} lessons · Recon Specialist rank</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {MODULES.map((m) => {
          const pct = Math.round((m.done / m.lessons) * 100);
          const Icon = m.icon;
          return (
            <div key={m.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
              <Icon size={15} style={{ color: m.color }} />
              <div className="text-[11px] text-white/80 leading-snug">{m.title}</div>
              <ProgressBar pct={pct} color={m.color} />
              <div className="text-[9px] font-mono text-white/30">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Root app ----------
export default function App() {
  const [tab, setTab] = useState("home");
  const [openModule, setOpenModule] = useState(null);
  const [view, setView] = useState("list"); // list | detail | terminal

  const navTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "modules", label: "Modules", icon: Book },
    { id: "labs", label: "Labs", icon: Flame },
    { id: "progress", label: "Progress", icon: Award },
  ];

  const openMod = (m) => { setOpenModule(m); setView("detail"); };
  const backToList = () => { setView("list"); setOpenModule(null); };

  let body;
  if (view === "terminal") {
    body = <TerminalScreen onBack={() => setView("detail")} />;
  } else if (view === "detail" && openModule) {
    body = <ModuleDetailScreen m={openModule} onBack={backToList} onOpenTerminal={() => setView("terminal")} />;
  } else if (tab === "home") {
    body = <HomeScreen onOpenModule={openMod} />;
  } else if (tab === "modules") {
    body = <ModulesScreen onOpenModule={openMod} />;
  } else if (tab === "labs") {
    body = <LabsScreen />;
  } else {
    body = <ProgressScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0d0d] flex justify-center">
      <div className="w-full max-w-sm min-h-screen bg-[#0a0d0d] relative flex flex-col" style={{
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(74,222,128,0.06), transparent 55%)"
      }}>
        {/* Top bar */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            <span className="text-white font-mono text-sm tracking-widest">HACK<span className="text-emerald-400">ACADEMY</span></span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40">
            <Lock size={11} /> SANDBOXED
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{body}</div>

        {/* Bottom nav */}
        {view === "list" && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a0d0d]/95 backdrop-blur px-2 py-2 flex justify-around">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-md transition-colors"
                  style={{ color: active ? "#4ade80" : "rgba(255,255,255,0.35)" }}
                >
                  <Icon size={18} />
                  <span className="text-[9px] font-mono tracking-wide">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
