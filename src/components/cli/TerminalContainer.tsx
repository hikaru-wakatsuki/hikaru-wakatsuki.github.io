import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppState } from '../../context/AppStateContext';
import CommandInput, { PROMPT } from './CommandInput';

// ─── Boot sequence (language-neutral system log) ─────────────────────────────

const BOOT_LINES = [
  'Hikaru OS v1.0.0 — Initializing...',
  '  [OK] Loading kernel modules',
  '  [OK] Initializing network interfaces',
  '  [OK] Loading user profile: wakatsuki',
  '  [OK] Mounting file systems',
  '  [OK] Starting SSH daemon',
  '  [OK] Loading portfolio engine',
  '',
  'All systems nominal.',
  "Type 'help' to see available commands.",
];

const BOOT_TEXT = BOOT_LINES.join('\n');

// ─── Types ───────────────────────────────────────────────────────────────────

type LogEntry = {
  id: string;
  command: string;
  output: string[];
  isAuto?: boolean; // true for hover-generated entries
};

// ─── Command processor (language-aware) ──────────────────────────────────────

function processCommand(
  raw: string,
  t: (key: string) => string,
): { clear: boolean; output: string[] } {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'help') {
    return {
      clear: false,
      output: [
        'Available commands:',
        '',
        '  help              Show this help message',
        '  clear             Clear terminal output',
        '  info              Display profile information',
        '  ask "<question>"  Query the AI engine',
      ],
    };
  }

  if (lower === 'clear') {
    return { clear: true, output: [] };
  }

  if (lower === 'info') {
    return {
      clear: false,
      output: [
        '┌──────────────────────────────────────────┐',
        '│  Hikaru Wakatsuki                        │',
        '│  Backend Engineer / Python               │',
        '│                                          │',
        '│  Skills: Python · JSON · PostgreSQL      │',
        '│          Linux · Azure · C · POSIX       │',
        '│  GitHub:  github.com/hikaru-wakatsuki            │',
        '└──────────────────────────────────────────┘',
      ],
    };
  }

  // ask "question" or ask question — [C-2] response text now goes through t()
  const askMatch =
    trimmed.match(/^ask\s+"(.+)"$/i) ?? trimmed.match(/^ask\s+(.+)$/i);
  if (askMatch) {
    const question = askMatch[1];
    return {
      clear: false,
      output: [
        `AI Engine: "${question}" ${t('cli.askSuffix')}`,
        t('cli.askPending'),
      ],
    };
  }

  if (trimmed === '') {
    return { clear: false, output: [] };
  }

  // [C-2] error message localized
  return {
    clear: false,
    output: [`bash: ${trimmed}: ${t('cli.notFound')}`],
  };
}

// ─── Hover log builder ────────────────────────────────────────────────────────

function buildHoverInfo(
  hoverId: string,
  t: (key: string) => string,
): { cmd: string; content: string[] } | null {
  // Top-level section hovers
  const sections = ['profile', 'skills', 'portfolio', 'contact'] as const;
  for (const section of sections) {
    if (hoverId === section) {
      const cmd = t(`cli.hover.${section}.cmd`);
      const content = t(`cli.hover.${section}.content`);
      // If t() returned the key itself, locale hasn't loaded yet — skip
      if (cmd === `cli.hover.${section}.cmd`) return null;
      return { cmd, content: content ? [content] : [] };
    }
  }

  // Portfolio card-level hover: portfolio-{id}
  if (hoverId.startsWith('portfolio-')) {
    const projectId = hoverId.replace('portfolio-', '');
    return {
      cmd: `cat portfolio/${projectId}.json`,
      content: [],
    };
  }

  // Profile link hovers: profile-link-{platform}
  if (hoverId.startsWith('profile-link-')) {
    const platform = hoverId.replace('profile-link-', '');
    return {
      cmd: `open ${platform}`,
      content: [],
    };
  }

  return null;
}

// ─── Theme detection (local — Terminal is independent of provider theme) ──────

function detectDark(): boolean {
  if (typeof document === 'undefined') return true;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light') return false;
  if (theme === 'dark') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TerminalContainer() {
  // [C-1][C-2] Pull t() and activeHoverId from AppStateContext
  const { t, activeHoverId } = useAppState();

  const [isDark, setIsDark] = useState(true);
  const [bootText, setBootText] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep a ref to t() so hover effect closures always use the latest translator
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  // Track last hover id and isBooting to prevent duplicate/early triggers
  const lastHoverIdRef = useRef<string | null>(null);
  const isBootingRef = useRef(isBooting);
  useEffect(() => { isBootingRef.current = isBooting; }, [isBooting]);

  // Pending timers for hover log (cancelled on new hover)
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Theme observer ──────────────────────────────────────────────────────
  useEffect(() => {
    setIsDark(detectDark());

    const htmlEl = document.documentElement;
    const attrObserver = new MutationObserver(() => setIsDark(detectDark()));
    attrObserver.observe(htmlEl, { attributes: true, attributeFilter: ['data-theme'] });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const mqHandler = () => setIsDark(detectDark());
    mq.addEventListener('change', mqHandler);

    return () => {
      attrObserver.disconnect();
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  // ── Boot animation ──────────────────────────────────────────────────────
  useEffect(() => {
    let index = 0;
    const id = setInterval(() => {
      index++;
      if (index >= BOOT_TEXT.length) {
        setBootText(BOOT_TEXT);
        setIsBooting(false);
        clearInterval(id);
      } else {
        setBootText(BOOT_TEXT.slice(0, index));
      }
    }, 30);
    return () => clearInterval(id);
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [bootText, logs]);

  // ── Focus input after boot ──────────────────────────────────────────────
  useEffect(() => {
    if (!isBooting) inputRef.current?.focus();
  }, [isBooting]);

  // ── [C-1] Event Bridge: GUI hover → CLI auto-log ────────────────────────
  useEffect(() => {
    // Cancel any in-flight hover timers first
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];

    if (!activeHoverId) {
      // Mouse left any section — reset so the next entry to same section re-fires
      lastHoverIdRef.current = null;
      return;
    }

    // Don't fire during boot or for the same element twice in a row
    if (isBootingRef.current) return;
    if (activeHoverId === lastHoverIdRef.current) return;
    lastHoverIdRef.current = activeHoverId;

    const info = buildHoverInfo(activeHoverId, tRef.current);
    if (!info) return;

    const logId = crypto.randomUUID();

    // Phase 1 (200ms dwell): prevents flooding from rapid hover across sections
    const phase1 = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        { id: logId, command: info.cmd, output: ['...'], isAuto: true },
      ]);

      // Phase 2 (500ms later): reveal actual content; keep '...' if empty
      if (info.content.length > 0) {
        const phase2 = setTimeout(() => {
          setLogs((prev) =>
            prev.map((e) =>
              e.id === logId ? { ...e, output: info.content } : e,
            ),
          );
        }, 500);
        pendingTimersRef.current.push(phase2);
      }
    }, 200);

    pendingTimersRef.current = [phase1];

    // Cleanup: cancel all pending timers on re-run or unmount
    return () => {
      pendingTimersRef.current.forEach(clearTimeout);
      pendingTimersRef.current = [];
    };
  }, [activeHoverId]);

  // ── Command handler ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (value: string) => {
      setInputValue('');

      const { clear, output } = processCommand(value, tRef.current);

      if (clear) {
        setLogs([]);
        return;
      }

      setLogs((prev) => [
        ...prev,
        { id: crypto.randomUUID(), command: value, output },
      ]);
    },
    [], // tRef.current used inside — no dep needed
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // ── Derived styles ──────────────────────────────────────────────────────
  const bg = isDark ? '#050505' : '#F0F0F0';
  const textColor = isDark ? '#00FF66' : '#1A1A1A';
  const autoColor = isDark ? 'rgba(0,255,102,0.45)' : 'rgba(26,26,26,0.4)';

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden cursor-text"
      style={{ backgroundColor: bg, color: textColor }}
      onClick={focusInput}
    >
      {/* ── Scrollable output area ── */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {/* Boot sequence */}
        <pre
          className="whitespace-pre-wrap break-words leading-relaxed text-sm font-mono m-0"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {bootText}
          {isBooting && (
            <span className="terminal-cursor" style={{ color: textColor }}>
              █
            </span>
          )}
        </pre>

        {/* Command history */}
        {!isBooting &&
          logs.map((entry) => (
            <div key={entry.id} className="mt-1">
              {/* Command line — dimmed for auto-generated hover entries */}
              <div
                className="text-sm font-mono"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  color: entry.isAuto ? autoColor : textColor,
                }}
              >
                <span style={{ opacity: 0.6 }}>{PROMPT}</span>
                {entry.command}
              </div>

              {entry.output.length > 0 && (
                <pre
                  className="whitespace-pre-wrap break-words text-sm font-mono m-0 mt-0.5 leading-relaxed"
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    color: entry.isAuto ? autoColor : textColor,
                  }}
                >
                  {entry.output.join('\n')}
                </pre>
              )}
            </div>
          ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input line ── */}
      {!isBooting && (
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          isDark={isDark}
        />
      )}
    </div>
  );
}
