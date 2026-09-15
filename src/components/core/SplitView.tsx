import { useState, useEffect, useRef, useCallback, useId, type ReactNode } from 'react';

interface SplitViewProps {
  upperContent?: ReactNode;
  lowerContent?: ReactNode;
}

export default function SplitView({ upperContent, lowerContent }: SplitViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const terminalId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const closeTerminal = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeTerminal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeTerminal]);

  return (
    <div className="flex flex-col w-full h-dvh overflow-hidden">
      <div
        className="w-full flex-1 min-h-0 overflow-y-auto bg-[var(--color-bg,#121212)]"
        style={{ paddingBottom: isOpen ? 0 : '5rem' }}
      >
        {upperContent}
      </div>

      <section
        ref={panelRef}
        id={terminalId}
        aria-label="Terminal"
        className="flex-col w-full shrink-0 h-[60dvh] md:h-[45dvh] border-t border-[var(--color-splitter,#333)] bg-[var(--color-cli-bg,#050505)] text-[var(--color-cli-text,#00FF66)]"
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-[var(--color-splitter,#333)] font-mono text-sm">
          <span>Terminal</span>
          <button
            type="button"
            onClick={closeTerminal}
            aria-label="Close Terminal"
            className="px-3 py-1 rounded border border-[var(--color-splitter,#333)] hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
          >
            ✕ Close
          </button>
        </div>
        <div className="flex-1 min-h-0">
          {hasOpened && lowerContent}
        </div>
      </section>

      {!isOpen && (
        <button
          ref={toggleRef}
          type="button"
          onClick={() => {
            setHasOpened(true);
            setIsOpen(true);
          }}
          aria-expanded={isOpen}
          aria-controls={terminalId}
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-full border border-[var(--color-splitter,#333)] bg-[var(--color-cli-bg,#050505)] text-[var(--color-cli-text,#00FF66)] font-mono text-sm font-bold shadow-lg hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
        >
          &gt;_ Terminal
        </button>
      )}
    </div>
  );
}
