interface ToastProps {
  message: string;
  visible: boolean;
  isDark: boolean;
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

export default function Toast({ message, visible, isDark }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--color-cli-text)',
        color: isDark ? '#0b1713' : '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: '6px',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        boxShadow: isDark
          ? '0 4px 28px rgba(112,199,167,0.24), 0 2px 8px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0,0,0,0.18)',
        // Fade + slide animation driven purely by visible prop
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        userSelect: 'none',
      }}
    >
      <CheckIcon />
      {message}
    </div>
  );
}
