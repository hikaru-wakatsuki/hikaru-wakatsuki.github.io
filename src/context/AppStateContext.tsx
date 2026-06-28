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
      title: 'Infrastructure Engineer',
      bio: 'Infrastructure engineer at NEC. Currently deep in low-level C at 42 Tokyo.',
    },
    cli: {
      welcome: "Hikaru OS Booting...\nSystem ready. Type 'help' to see available commands.",
    },
  },
  ja: {
    profile: {
      name: 'Hikaru Wakatsuki',
      title: 'Infrastructure Engineer',
      bio: 'NEC所属のインフラエンジニア。42 Tokyoで低レイヤC言語の世界に没頭中。',
    },
    cli: {
      welcome: "Hikaru OS Booting...\nSystem ready. Type 'help' to see available commands.",
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
