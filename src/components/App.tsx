import { AppStateProvider, useAppState } from '../context/AppStateContext';
import SplitView from './core/SplitView';
import ProfileContainer from './gui/Profile/ProfileContainer';
import SkillsContainer from './gui/Skills/SkillsContainer';
import PortfolioContainer from './gui/Portfolio/PortfolioContainer';
import ContactContainer from './gui/Contact/ContactContainer';
import TerminalContainer from './cli/TerminalContainer';

// ── Controls bar (theme + language toggles) ───────────────────────────────────

function Controls() {
  const { theme, toggleTheme, language, setLanguage } = useAppState();
  const isDark = theme === 'dark';

  const btnBase: React.CSSProperties = {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    background: 'transparent',
    border: `1px solid ${isDark ? 'rgba(0,255,102,0.25)' : 'rgba(26,26,26,0.2)'}`,
    borderRadius: '3px',
    padding: '2px 8px',
    color: isDark ? '#00FF66' : '#1A1A1A',
    transition: 'opacity 0.15s',
  };

  const activeBtn: React.CSSProperties = {
    ...btnBase,
    background: isDark ? 'rgba(0,255,102,0.12)' : 'rgba(26,26,26,0.08)',
  };

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-end gap-2 px-4 py-2"
      style={{
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${isDark ? 'rgba(0,255,102,0.1)' : 'rgba(26,26,26,0.08)'}`,
        background: isDark ? 'rgba(18,18,18,0.85)' : 'rgba(250,250,250,0.85)',
      }}
    >
      {/* Language */}
      <button
        style={language === 'en' ? activeBtn : btnBase}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        style={language === 'ja' ? activeBtn : btnBase}
        onClick={() => setLanguage('ja')}
        aria-pressed={language === 'ja'}
      >
        JP
      </button>

      {/* Divider */}
      <span style={{ opacity: 0.2, fontSize: '0.75rem' }}>|</span>

      {/* Theme */}
      <button
        style={btnBase}
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? '☀ LIGHT' : '● DARK'}
      </button>
    </div>
  );
}

// ── GUI area (all visible sections) ──────────────────────────────────────────

function GuiArea() {
  return (
    <div
      className="w-full min-h-full"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <Controls />
      <ProfileContainer />
      <SkillsContainer />
      <PortfolioContainer />
      <ContactContainer />
    </div>
  );
}

// ── Root app component ────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppStateProvider>
      <SplitView
        upperContent={<GuiArea />}
        lowerContent={<TerminalContainer />}
      />
    </AppStateProvider>
  );
}
