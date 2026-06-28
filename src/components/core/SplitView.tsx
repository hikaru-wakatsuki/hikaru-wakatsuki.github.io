import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

const MIN_UPPER_PCT = 20;
const MAX_UPPER_PCT = 80;
const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 40; // px delta to trigger open/close

interface SplitViewProps {
  upperContent?: ReactNode;
  lowerContent?: ReactNode;
}

export default function SplitView({ upperContent, lowerContent }: SplitViewProps) {
  const [upperPct, setUpperPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Touch tracking for main area (swipe-up to open)
  const mainTouchStartY = useRef<number | null>(null);
  // Touch tracking for sheet (swipe-down to close)
  const sheetTouchStartY = useRef<number | null>(null);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // PC drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pct = (e.clientY / window.innerHeight) * 100;
      setUpperPct(Math.min(MAX_UPPER_PCT, Math.max(MIN_UPPER_PCT, pct)));
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ── Main area: swipe-up to OPEN sheet ────────────────────────────────────
  const handleMainTouchStart = useCallback((e: React.TouchEvent) => {
    mainTouchStartY.current = e.touches[0].clientY;
  }, []);

  const handleMainTouchMove = useCallback((e: React.TouchEvent) => {
    if (mainTouchStartY.current === null) return;
    const delta = mainTouchStartY.current - e.touches[0].clientY; // positive = up
    if (delta > SWIPE_THRESHOLD) {
      setIsSheetOpen(true);
      mainTouchStartY.current = null;
    }
  }, []);

  const handleMainTouchEnd = useCallback(() => {
    mainTouchStartY.current = null;
  }, []);

  // ── Sheet area: swipe-down to CLOSE sheet ─────────────────────────────────
  const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
    sheetTouchStartY.current = e.touches[0].clientY;
  }, []);

  const handleSheetTouchMove = useCallback((e: React.TouchEvent) => {
    if (sheetTouchStartY.current === null) return;
    const delta = e.touches[0].clientY - sheetTouchStartY.current; // positive = down
    if (delta > SWIPE_THRESHOLD) {
      setIsSheetOpen(false);
      sheetTouchStartY.current = null;
    }
  }, []);

  const handleSheetTouchEnd = useCallback(() => {
    sheetTouchStartY.current = null;
  }, []);

  // Disable body scroll while in split view
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (isMobile) {
    return (
      <div
        className="relative w-full h-screen overflow-hidden"
        onTouchStart={handleMainTouchStart}
        onTouchMove={handleMainTouchMove}
        onTouchEnd={handleMainTouchEnd}
      >
        {/* GUI — full screen on mobile */}
        <div className="w-full h-full overflow-y-auto bg-[var(--color-bg,#121212)]">
          {upperContent}
        </div>

        {/* Bottom sheet (CLI) — swipe-down to close */}
        <div
          className={[
            'fixed bottom-0 left-0 right-0 overflow-y-auto bg-[var(--color-cli-bg,#050505)]',
            'transition-[height] duration-300 ease-in-out',
            isSheetOpen ? 'h-[60vh]' : 'h-0',
          ].join(' ')}
          onTouchStart={handleSheetTouchStart}
          onTouchMove={handleSheetTouchMove}
          onTouchEnd={handleSheetTouchEnd}
        >
          {lowerContent}
        </div>

        {/* Terminal toggle button */}
        <button
          onClick={() => setIsSheetOpen((v) => !v)}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full bg-[var(--color-cli-text,#00FF66)] text-black font-mono text-sm font-bold shadow-lg"
        >
          {isSheetOpen ? '✕ Close' : 'Terminal'}
        </button>
      </div>
    );
  }

  // PC layout
  const lowerPct = 100 - upperPct;

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden select-none">
      {/* Upper area — GUI */}
      <div
        className="w-full overflow-y-auto bg-[var(--color-bg,#121212)]"
        style={{ height: `${upperPct}vh` }}
      >
        {upperContent}
      </div>

      {/* Splitter bar */}
      <div
        onMouseDown={handleMouseDown}
        className={[
          'w-full shrink-0 cursor-ns-resize',
          'bg-[var(--color-splitter,#333)] hover:bg-[var(--color-splitter-hover,#00FF66)]',
          'transition-colors duration-150',
          isDragging ? 'bg-[var(--color-splitter-hover,#00FF66)]' : '',
        ].join(' ')}
        style={{ height: '4px' }}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Drag to resize panels"
      />

      {/* Lower area — CLI */}
      <div
        className="w-full overflow-y-auto bg-[var(--color-cli-bg,#050505)]"
        style={{ height: `${lowerPct}vh` }}
      >
        {lowerContent}
      </div>
    </div>
  );
}
