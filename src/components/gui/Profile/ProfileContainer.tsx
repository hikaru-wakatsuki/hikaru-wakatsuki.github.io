import { useAppState } from '../../../context/AppStateContext';
import MagnetIcon from './MagnetIcon';

// ─── SVG icons ────────────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

// ─── Social link definitions ───────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/hikaru-wakatsuki',
    icon: <GitHubIcon />,
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    href: 'https://x.com/',
    icon: <XIcon />,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/',
    icon: <LinkedInIcon />,
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:waka9648hika46@gmail.com',
    icon: <MailIcon />,
  },
] as const;

// ─── Avatar ────────────────────────────────────────────────────────────────

function Avatar({ isDark }: { isDark: boolean }) {
  const borderColor = isDark ? '#00FF66' : '#1A1A1A';

  return (
    <img
      src="/profile-avatar.jpg"
      alt="Hikaru Wakatsuki"
      width={80}
      height={80}
      style={{
        width: '5rem',
        height: '5rem',
        borderRadius: '9999px',
        border: `2px solid ${borderColor}`,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Profile section header tag ────────────────────────────────────────────

function Tag({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '0.65rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: isDark ? 'rgba(0,255,102,0.5)' : 'rgba(26,26,26,0.45)',
        border: `1px solid ${isDark ? 'rgba(0,255,102,0.2)' : 'rgba(26,26,26,0.18)'}`,
        borderRadius: '3px',
        padding: '1px 6px',
      }}
    >
      {children}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ProfileContainer() {
  const { t, theme, triggerHoverLog, clearHoverLog } = useAppState();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#00FF66' : '#1A1A1A';
  const dimColor = isDark ? 'rgba(0,255,102,0.65)' : 'rgba(26,26,26,0.6)';

  return (
    <section
      onMouseEnter={() => triggerHoverLog('profile')}
      onMouseLeave={() => clearHoverLog()}
      style={{
        padding: '2rem',
        fontFamily: "'Courier New', Courier, monospace",
      }}
      aria-label="Profile"
    >
      {/* ── Section label ── */}
      <Tag isDark={isDark}>$ cat profile.json</Tag>

      {/* ── Main card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.5rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <Avatar isDark={isDark} />

        <div style={{ flex: 1, minWidth: 0, flexBasis: '14rem' }}>
          {/* Name */}
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: textColor,
              letterSpacing: '0.02em',
            }}
          >
            {t('profile.name')}
          </h1>

          {/* Title */}
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.85rem',
              color: dimColor,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {t('profile.title')}
          </p>

          {/* Bio */}
          <p
            style={{
              margin: '0.75rem 0 0',
              fontSize: '0.9rem',
              color: dimColor,
              lineHeight: 1.7,
              maxWidth: '38rem',
            }}
          >
            {t('profile.bio')}
          </p>

          {/* ── Social links with magnet effect ── */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            {SOCIAL_LINKS.map(({ id, label, href, icon }) => (
              <MagnetIcon
                key={id}
                href={href}
                label={label}
                isDark={isDark}
                onFocusEnter={() => triggerHoverLog(`profile-link-${id}`)}
                onFocusLeave={() => clearHoverLog()}
              >
                {icon}
              </MagnetIcon>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
