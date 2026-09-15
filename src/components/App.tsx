import { useState, useEffect, type ReactNode } from 'react';
import { AppStateProvider, useAppState } from '../context/AppStateContext';
import SplitView from './core/SplitView';
import ProfileContainer from './gui/Profile/ProfileContainer';
import CareerContainer from './gui/Career/CareerContainer';
import SkillsContainer, { SKILLS_SECTION_ID } from './gui/Skills/SkillsContainer';
import PortfolioContainer from './gui/Portfolio/PortfolioContainer';
import ContactContainer from './gui/Contact/ContactContainer';
import TerminalContainer from './cli/TerminalContainer';

// ── Controls bar (theme + language toggles) ───────────────────────────────────

function Controls({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
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
      className="sticky top-0 z-50 flex items-center gap-2 px-4 h-14 shrink-0"
      style={{
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${isDark ? 'rgba(0,255,102,0.1)' : 'rgba(26,26,26,0.08)'}`,
        background: isDark ? 'rgba(18,18,18,0.85)' : 'rgba(250,250,250,0.85)',
      }}
    >
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={language === 'ja' ? 'メニューを開閉' : 'Toggle navigation'}
        aria-expanded={menuOpen}
        aria-controls="section-navigation"
        className="flex items-center justify-center w-10 h-10 rounded border border-[var(--color-splitter)] hover:opacity-70 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="mr-auto font-mono text-xs sm:text-sm">Hikaru Wakatsuki</span>
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

const SECTIONS = [
  { id: 'career-section', ja: '経歴', en: 'Career' },
  { id: SKILLS_SECTION_ID, ja: 'スキル', en: 'Skills' },
  { id: 'portfolio-section', ja: 'ポートフォリオ', en: 'Portfolio' },
  { id: 'contact-section', ja: 'お問い合わせ', en: 'Contact' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function CollapsibleSection({ id, title, open, onToggle, children }: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { language } = useAppState();
  const action = language === 'ja' ? (open ? '非表示' : '表示') : (open ? 'Hide' : 'Show');

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-18 mb-6 border border-[var(--color-splitter)] rounded overflow-hidden">
      <div className="h-1 bg-[var(--color-cli-text)] opacity-60" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-[var(--color-cli-bg)]">
        <h2 id={`${id}-title`} tabIndex={-1} className="font-mono text-lg sm:text-xl font-bold focus:outline-none">{title}</h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          aria-label={`${title}: ${action}`}
          className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded border border-[var(--color-splitter)] font-mono text-xs hover:opacity-70 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span>{action}</span>
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
      </div>
      <div id={`${id}-content`} hidden={!open}>{children}</div>
    </section>
  );
}

function GuiArea() {
  const { language } = useAppState();
  const [menuOpen, setMenuOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    'career-section': true,
    [SKILLS_SECTION_ID]: true,
    'portfolio-section': true,
    'contact-section': true,
  });
  const [activeSection, setActiveSection] = useState<SectionId>('career-section');

  useEffect(() => {
    setMenuOpen(window.matchMedia('(min-width: 768px)').matches);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const navigateToSection = (id: SectionId) => {
    setOpenSections((previous) => ({ ...previous, [id]: true }));
    setActiveSection(id);
    if (window.matchMedia('(max-width: 767px)').matches) setMenuOpen(false);
    requestAnimationFrame(() => {
      const section = document.getElementById(id);
      section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
    });
  };

  const contents = [
    <CareerContainer />,
    <SkillsContainer />,
    <PortfolioContainer onNavigateToSkills={() => navigateToSection(SKILLS_SECTION_ID)} />,
    <ContactContainer />,
  ];

  return (
    <div className="w-full min-h-full" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Controls menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((previous) => !previous)} />
      <div className="flex items-start">
        {menuOpen && (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={language === 'ja' ? 'メニューを閉じる' : 'Close navigation'}
              className="fixed inset-0 top-14 z-30 bg-black/30 md:hidden"
            />
            <aside className="fixed md:sticky top-14 left-0 z-40 w-60 md:w-52 shrink-0 h-[calc(100dvh-3.5rem)] overflow-y-auto border-r border-[var(--color-splitter)] bg-[var(--color-bg)] px-4 py-7">
              <nav id="section-navigation" aria-label={language === 'ja' ? '項目一覧' : 'Sections'}>
                <p className="px-3 mb-4 font-mono text-xs opacity-50 tracking-widest">{language === 'ja' ? '目次' : 'CONTENTS'}</p>
                <div className="flex flex-col gap-2">
                  {SECTIONS.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(event) => { event.preventDefault(); navigateToSection(section.id); }}
                      aria-current={activeSection === section.id ? 'location' : undefined}
                      className="flex items-center gap-3 px-3 py-3 rounded font-mono text-sm border hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ borderColor: activeSection === section.id ? 'var(--color-cli-text)' : 'transparent' }}
                    >
                      <span className="text-xs opacity-40" aria-hidden="true">0{index + 1}</span>
                      {language === 'ja' ? section.ja : section.en}
                    </a>
                  ))}
                </div>
              </nav>
            </aside>
          </>
        )}
        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 border border-[var(--color-splitter)] rounded overflow-hidden">
              <ProfileContainer />
            </div>
            {SECTIONS.map((section, index) => (
              <CollapsibleSection
                key={section.id}
                id={section.id}
                title={language === 'ja' ? section.ja : section.en}
                open={openSections[section.id]}
                onToggle={() => setOpenSections((previous) => ({ ...previous, [section.id]: !previous[section.id] }))}
              >
                {contents[index]}
              </CollapsibleSection>
            ))}
          </div>
        </main>
      </div>
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
