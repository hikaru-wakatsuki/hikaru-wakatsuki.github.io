import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 50; // px — proximity radius for activation
const MAX_PULL = 20;  // px — maximum displacement toward cursor

interface MagnetIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
  isDark: boolean;
  /** Called when focus enters/leaves this icon (for event bridge) */
  onFocusEnter?: () => void;
  onFocusLeave?: () => void;
}

export default function MagnetIcon({
  href,
  label,
  children,
  isDark,
  onFocusEnter,
  onFocusLeave,
}: MagnetIconProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [inRange, setInRange] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const el = anchorRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < THRESHOLD && dist > 0) {
        // Proportional pull: stronger as cursor approaches center
        const ratio = 1 - dist / THRESHOLD;
        setPos({
          x: (dx / dist) * MAX_PULL * ratio,
          y: (dy / dist) * MAX_PULL * ratio,
        });
        if (!inRange) setInRange(true);
      } else {
        if (inRange) {
          setPos({ x: 0, y: 0 });
          setInRange(false);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inRange]);

  const isMailto = href.startsWith('mailto:');

  const baseColor = isDark ? '#00FF66' : '#1A1A1A';
  const hoverBg = isDark ? 'rgba(0,255,102,0.12)' : 'rgba(26,26,26,0.08)';

  return (
    <a
      ref={anchorRef}
      href={href}
      target={isMailto ? undefined : '_blank'}
      rel={isMailto ? undefined : 'noopener noreferrer'}
      aria-label={label}
      onMouseEnter={onFocusEnter}
      onMouseLeave={onFocusLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '9999px',
        color: baseColor,
        border: `1px solid ${isDark ? 'rgba(0,255,102,0.25)' : 'rgba(26,26,26,0.2)'}`,
        backgroundColor: inRange ? hoverBg : 'transparent',
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: inRange
          ? 'transform 0.08s ease-out, background-color 0.15s ease'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
        willChange: 'transform',
        cursor: 'pointer',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {children}
    </a>
  );
}
