import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Theme, Language } from '../types/portfolio';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Translations = Record<string, unknown>;

interface AppState {
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Language
  language: Language;
  setLanguage: (l: Language) => void;

  // Localization
  t: (key: string) => string;

  // Event Bridge: GUI hover → CLI log
  activeHoverId: string | null;
  triggerHoverLog: (elementId: string) => void;
  clearHoverLog: () => void;
}

// ---------------------------------------------------------------------------
// Fallback translations (mirrors public/locales/*.json; used before fetch)
// ---------------------------------------------------------------------------

const FALLBACK: Record<Language, Translations> = {
  en: {
    profile: {
      name: 'Hikaru Wakatsuki',
      title: 'Backend Engineer / Python',
      bio: 'After around four years designing and migrating Linux, Azure and database infrastructure for telecom systems, I now design, implement, evaluate and release Python business applications. I bring an operations-focused infrastructure perspective, plus experience with LLM integration, structured data, concurrency and algorithms, to reliable backend development.',
    },
    cli: {
      welcome: "Hikaru OS Booting...\nSystem ready. Type 'help' to see available commands.",
    },
    skills: {
      backend: 'Backend',
      backendDescription: 'Design, implement, evaluate and release Python business applications at work. In personal projects, build LLM integrations and validate structured data with JSON and Pydantic.',
      database: 'Database',
      databaseDescription: 'Experience designing, building and migrating PostgreSQL and MySQL systems, including incident and performance investigation.',
      infrastructure: 'Infrastructure & Cloud',
      infrastructureDescription: 'Design and build Linux and Azure environments, perform cloud lifts and OS upgrades, and prepare Docker and Bash-based development environments.',
      engineering: 'Engineering & CS',
      engineeringDescription: 'Implement synchronization and scheduling with C and POSIX threads, graph algorithms, and collaborative development with Git.',
      additional: 'Additional',
      additionalDescription: 'Designed and implemented this portfolio with TypeScript, React and Astro, then published it on GitHub Pages.',
    },
  },
  ja: {
    profile: {
      name: '若月 洸 / Hikaru Wakatsuki',
      title: 'Backend Engineer / Python',
      bio: '約4年間、通信基盤でLinux・Azure・データベースの設計・構築・移行を経験。現在はPythonを用いた業務アプリケーションの設計・実装・評価・リリースを担当しています。インフラで培った運用視点と、LLM連携・構造化データ・並行処理・アルゴリズムの知識を、信頼性の高いバックエンド開発に活かします。',
    },
    cli: {
      welcome: "Hikaru OS Booting...\nSystem ready. Type 'help' to see available commands.",
    },
    skills: {
      backend: 'Backend',
      backendDescription: '実務でPython業務アプリの処理設計・実装・評価・リリースを担当。個人開発ではJSON・Pydanticによる構造化データの検証とLLM連携を実装しています。',
      database: 'Database',
      databaseDescription: '通信基盤でPostgreSQL・MySQLの設計、構築、移行、障害・性能調査を経験しています。',
      infrastructure: 'Infrastructure & Cloud',
      infrastructureDescription: 'Linux・Azure環境の設計、構築、クラウドリフト、OS更改に加え、Docker環境整備とBashによる作業を行えます。',
      engineering: 'Engineering & CS',
      engineeringDescription: 'C・POSIX threadsによる排他制御とスケジューリング、グラフ探索、Gitを使ったチーム開発を実装・実践しています。',
      additional: 'Additional',
      additionalDescription: 'TypeScript・React・Astroを使い、このポートフォリオのUI設計と実装、GitHub Pagesへの公開を行っています。',
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return navigator.language.startsWith('ja') ? 'ja' : 'en';
}

/** Dot-notation key lookup: t('profile.name') */
function lookup(obj: Translations, key: string): string {
  const parts = key.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (typeof cur !== 'object' || cur === null) return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : key;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Translations>(FALLBACK[getInitialLanguage()]);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  // Track previous language to avoid refetching the same locale
  const prevLangRef = useRef<Language | null>(null);

  // ── Apply data-theme to <html> ──────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Fetch locale file when language changes ─────────────────────────────
  useEffect(() => {
    if (prevLangRef.current === language) return;
    prevLangRef.current = language;

    const localeFile = language === 'ja' ? '/locales/jp.json' : '/locales/en.json';

    fetch(localeFile)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${localeFile}`);
        return res.json() as Promise<Translations>;
      })
      .then(setTranslations)
      .catch(() => {
        // Silently fall back to inlined copy
        setTranslations(FALLBACK[language]);
      });
  }, [language]);

  // ── Theme API ────────────────────────────────────────────────────────────
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    [],
  );

  // ── Language API ─────────────────────────────────────────────────────────
  const setLanguage = useCallback((l: Language) => setLanguageState(l), []);

  // ── Localization ─────────────────────────────────────────────────────────
  const t = useCallback((key: string) => lookup(translations, key), [translations]);

  // ── Event Bridge ─────────────────────────────────────────────────────────
  const triggerHoverLog = useCallback((elementId: string) => {
    setActiveHoverId(elementId);
  }, []);

  const clearHoverLog = useCallback(() => {
    setActiveHoverId(null);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        t,
        activeHoverId,
        triggerHoverLog,
        clearHoverLog,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
