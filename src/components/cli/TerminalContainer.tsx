import { useState, useEffect, useRef, useCallback } from 'react';
import CommandInput, { PROMPT } from './CommandInput';

// ─── Boot sequence ──────────────────────────────────────────────────────────

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
};

// ─── Command processor ───────────────────────────────────────────────────────

function processCommand(raw: string): { clear: boolean; output: string[] } {
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
        '│  Infrastructure Engineer / 42 Tokyo      │',
        '│                                          │',
        '│  Skills: Docker · Kubernetes · Linux     │',
        '│          TypeScript · React · C · Go     │',
        '│  GitHub:  github.com/waka9648            │',
        '└──────────────────────────────────────────┘',
      ],
    };
  }

  // ask "question" または ask question
  const askMatch =
    trimmed.match(/^ask\s+"(.+)"$/i) ?? trimmed.match(/^ask\s+(.+)$/i);
  if (askMatch) {
    const question = askMatch[1];
    return {
      clear: false,
      output: [
        `AI Engine: "${question}" について解析中...`,
        '(API連携は後ほど実装されます)',
      ],
    };
  }

  if (trimmed === '') {
    return { clear: false, output: [] };
  }

  return {
    clear: false,
    output: [`bash: ${trimmed}: command not found  (try 'help')`],
  };
}

// ─── Theme detection ─────────────────────────────────────────────────────────

function detectDark(): boolean {
  if (typeof document === 'undefined') return true;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light') return false;
  if (theme === 'dark') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TerminalContainer() {
  const [isDark, setIsDark] = useState(true);
  const [bootText, setBootText] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // ── Command handler ─────────────────────────────────────────────────────
  const handleSubmit = useCallback((value: string) => {
    setInputValue('');

    const { clear, output } = processCommand(value);

    if (clear) {
      setLogs([]);
      return;
    }

    setLogs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), command: value, output },
    ]);
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // ── Derived styles ──────────────────────────────────────────────────────
  const bg = isDark ? '#050505' : '#F0F0F0';
  const textColor = isDark ? '#00FF66' : '#1A1A1A';

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
            <div
              key={entry.id}
              className="mt-1"
            >
              <div
                className="text-sm font-mono"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <span style={{ opacity: 0.7 }}>{PROMPT}</span>
                {entry.command}
              </div>
              {entry.output.length > 0 && (
                <pre
                  className="whitespace-pre-wrap break-words text-sm font-mono m-0 mt-0.5 leading-relaxed"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
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
