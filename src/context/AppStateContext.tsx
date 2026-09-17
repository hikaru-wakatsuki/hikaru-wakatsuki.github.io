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
      backendDescription: 'Design, implement, evaluate and release Python business applications.',
      backendCapabilities: [
        'Translate business requirements into processing flows, implement them in Python, evaluate them and carry them through release',
        'Design JSON input/output and implement output validation, error handling and fallback behavior for API failures',
        'Implement Pydantic type validation and local-LLM function calling in personal projects',
      ],
      database: 'Database',
      databaseDescription: 'Design, build and migrate database systems.',
      databaseCapabilities: [
        'Design and build system configurations using PostgreSQL and MySQL',
        'Plan database migrations, execute them and verify operation after migration',
        'Investigate logs and execution behavior to isolate incidents and performance issues',
      ],
      infrastructure: 'Infrastructure & Cloud',
      infrastructureDescription: 'Build Linux, Azure and Docker environments.',
      infrastructureCapabilities: [
        'Design, build and migrate Linux and Azure environments with production operations in mind',
        'Plan and execute Azure cloud lifts, OS upgrades and private-cloud migrations',
        'Prepare Docker development environments and execute or automate routine work with Bash',
      ],
      engineering: 'Engineering & CS',
      engineeringDescription: 'Implement synchronization, scheduling and graph search, and develop with Git.',
      engineeringCapabilities: [
        'Control shared resources with C, POSIX threads and mutexes while accounting for deadlocks and fairness',
        'Implement FIFO/EDF scheduling, weighted graph search and turn-based movement control',
        'Design and implement collaboratively using Git, peer review and clear task ownership',
      ],
      additional: 'Additional',
      additionalDescription: 'Implement this portfolio UI and publish it on GitHub Pages.',
      additionalCapabilities: [
        'Build a responsive portfolio UI with TypeScript, React and Astro',
        'Implement language and theme switching, tag filters and video presentation',
        'Create a static Astro build and continuously deploy it to GitHub Pages with GitHub Actions',
      ],
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
      backendDescription: 'Python業務アプリの設計・実装・評価・リリースができます。',
      backendCapabilities: [
        '業務要件を処理フローへ落とし込み、Pythonで実装・評価してリリースまで進める',
        'JSON入出力の設計、出力検証、エラー処理、API障害時のフォールバックを実装する',
        '個人開発でPydanticによる型検証と、ローカルLLMのFunction Callingを実装する',
      ],
      database: 'Database',
      databaseDescription: 'データベースの設計・構築・移行ができます。',
      databaseCapabilities: [
        'PostgreSQL・MySQLを使用するシステムの構成を設計し、環境を構築する',
        '既存データベースの移行計画を検討し、移行と動作確認を行う',
        '障害発生時のログ・実行状況を調査し、性能上の問題を切り分ける',
      ],
      infrastructure: 'Infrastructure & Cloud',
      infrastructureDescription: 'Linux・Azure・Docker環境の構築ができます。',
      infrastructureCapabilities: [
        'Linux・Azure環境を設計・構築し、通信基盤の運用を考慮して移行する',
        'Azureクラウドリフト、OS更改、プライベートクラウド移行を計画・実施する',
        'Dockerで開発環境を整備し、Bashで定型作業を実行・自動化する',
      ],
      engineering: 'Engineering & CS',
      engineeringDescription: '排他制御、スケジューリング、グラフ探索、Gitを使った開発ができます。',
      engineeringCapabilities: [
        'C・POSIX threads・mutexで共有資源を制御し、デッドロックと公平性を考慮する',
        'FIFO・EDFスケジューリング、重み付きグラフ探索、ターン単位の移動制御を実装する',
        'Git、Peer Review、役割分担を使ってチームで設計・実装する',
      ],
      additional: 'Additional',
      additionalDescription: 'このポートフォリオのUI実装とGitHub Pagesへの公開ができます。',
      additionalCapabilities: [
        'TypeScript・React・AstroでレスポンシブなポートフォリオUIを実装する',
        '日英切り替え、テーマ変更、タグ絞り込み、動画表示などの操作を実装する',
        'Astroで静的ビルドし、GitHub ActionsからGitHub Pagesへ継続的に公開する',
      ],
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
