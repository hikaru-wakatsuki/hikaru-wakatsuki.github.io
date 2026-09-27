import { useRef, useCallback, useEffect, useState } from 'react';
import type { PortfolioProject } from '../../../types/portfolio';
import { useAppState } from '../../../context/AppStateContext';

const PROJECTS: PortfolioProject[] = [
  {
    "id": "Call_Me_Maybe",
    "title": "Call Me Maybe",
    "description": {
      "ja": "自然言語をローカルLLMでFunction Call JSONへ変換。",
      "en": "Local LLM converts natural language into function-call JSON."
    },
    "tags": [
      "Python",
      "JSON",
      "LLM",
      "Pydantic"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Call_Me_Maybe",
    "imageUrl": "/videos/call-me-maybe-demo-poster.png",
    "videoUrl": "/videos/call-me-maybe-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "Demo · 4 / 4 schema-valid outputs",
      "en": "Demo · 4 / 4 schema-valid outputs"
    },
    "demoFocus": {
      "ja": "自然言語の入力から、関数選択、型付きJSON生成、スキーマ検証までの流れ",
      "en": "Natural-language input through function selection, typed JSON generation and schema validation"
    },
    "technicalDetails": {
      "ja": {
        "challenge": "生成後の検証だけでは、不正なJSONや関数スキーマに合わない引数型を生成段階で防げないこと。",
        "design": [
          "関数選択と引数生成を分離し、それぞれの責務を明確化",
          "スキーマに基づく制約付きデコードで、生成可能なトークンを制御",
          "生成結果をPydanticで検証し、型付きFunctionCallとして返却"
        ],
        "verification": "4種類の関数について、関数選択・JSON生成・引数型の整合性をIntegration Testで確認。",
        "limitations": "事前定義した関数スキーマを対象とし、任意の外部API実行は扱いません。"
      },
      "en": {
        "challenge": "Post-generation validation alone cannot prevent malformed JSON or schema-incompatible argument types during generation.",
        "design": [
          "Separated function selection from argument generation to keep responsibilities explicit",
          "Constrained token generation according to the selected function schema",
          "Validated generated data with Pydantic and returned a typed FunctionCall"
        ],
        "verification": "Integration tests check function selection, JSON generation and argument types across four functions.",
        "limitations": "The implementation targets predefined function schemas and does not execute arbitrary external APIs."
      }
    }
  },
  {
    "id": "Codexion",
    "title": "Codexion",
    "description": {
      "ja": "複数スレッドが共有資源を取り合う並行処理シミュレーション。",
      "en": "POSIX-thread simulation of shared resource contention."
    },
    "tags": [
      "C",
      "POSIX",
      "Algorithms",
      "Git"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Codexion",
    "imageUrl": "/videos/codexion-demo-poster.png",
    "videoUrl": "/videos/codexion-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "デモ · デッドロックなしで完了",
      "en": "Demo · completed without deadlock"
    },
    "demoFocus": {
      "ja": "各ワーカーの状態遷移、共有ドングルの排他制御、段階的な完了",
      "en": "Worker state transitions, exclusive access to shared dongles and progressive completion"
    },
    "technicalDetails": {
      "ja": {
        "challenge": "各ワーカーがコンパイルに2つの共有ドングルを必要とする状況で、デッドロックと飢餓を避けながら公平に割り当てること。",
        "design": [
          "mutexの取得順序を統一し、循環待ちを防止",
          "min-heapを用いてFIFO・EDFの待ち順を管理",
          "WAITING・COMPILING・DEBUGGING・REFACTORING・COMPLETEを明示的に管理"
        ],
        "verification": "収録したシミュレーションで、5ワーカーがデッドロックせず目標回数まで完了する状態遷移を確認。",
        "limitations": "POSIX threadsを使ったシミュレーションであり、汎用OSスケジューラの実装や性能比較ではありません。"
      },
      "en": {
        "challenge": "Allocate two shared dongles per compile fairly while avoiding deadlock and starvation across concurrent workers.",
        "design": [
          "Used a consistent mutex acquisition order to prevent circular wait",
          "Managed FIFO/EDF waiting order with a min-heap",
          "Modelled WAITING, COMPILING, DEBUGGING, REFACTORING and COMPLETE explicitly"
        ],
        "verification": "The recorded simulation shows five workers reaching their target count without deadlock.",
        "limitations": "This is a POSIX-thread simulation, not a general-purpose OS scheduler or performance benchmark."
      }
    }
  },
  {
    "id": "Fly-in",
    "title": "Fly-in",
    "description": {
      "ja": "グラフ上で複数ドローンの移動を計画・可視化。",
      "en": "Plan and visualize drone movements across a graph."
    },
    "tags": [
      "Python",
      "Algorithms",
      "pygame",
      "Git"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Fly-in",
    "imageUrl": "/videos/fly-in-demo-poster.png",
    "videoUrl": "/videos/fly-in-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "デモ · 容量制約内で完了",
      "en": "Demo · completed within capacity constraints"
    },
    "demoFocus": {
      "ja": "区画・接続の容量を守る経路選択と、全ドローンが到着するまでの進行",
      "en": "Capacity-aware route selection and turn-by-turn progress until every drone arrives"
    },
    "technicalDetails": {
      "ja": {
        "challenge": "最短経路だけでなく、区画と接続の容量、混雑、複数ドローンの同時移動を考慮すること。",
        "design": [
          "重み付きグラフ探索とターン単位の移動制御を分離",
          "区画・接続ごとの容量を確認してから移動を確定",
          "現在位置、移動中、待機中、到着済みの状態を可視化"
        ],
        "verification": "入力と容量制約を検証し、収録した実行で全ドローンが制約内で到着することを確認。",
        "limitations": "離散ターンのグラフシミュレーションであり、実機の飛行制御や通信遅延は扱いません。"
      },
      "en": {
        "challenge": "Account for zone and link capacity, congestion and simultaneous drone movement in addition to path length.",
        "design": [
          "Separated weighted graph search from turn-based movement scheduling",
          "Checked zone and connection capacity before committing movement",
          "Visualized current, moving, waiting and arrived states"
        ],
        "verification": "Validated inputs and capacity constraints; the recorded run shows every drone arriving within those constraints.",
        "limitations": "This is a discrete-turn graph simulation and does not model physical flight control or network latency."
      }
    }
  },
  {
    "id": "souaoao/A-Maze-ing",
    "title": "A-Maze-ing",
    "description": {
      "ja": "2名でPythonの迷路生成・最短経路・可視化を開発。",
      "en": "Two-person Python maze generation and visualization project."
    },
    "tags": [
      "Python",
      "Pydantic",
      "Algorithms",
      "Git"
    ],
    "githubUrl": "https://github.com/souaoao/A-Maze-ing",
    "imageUrl": "/videos/a-maze-ing-demo-poster.png",
    "videoUrl": "/videos/a-maze-ing-demo.mp4",
    "projectType": {
      "ja": "共同開発 · 2名",
      "en": "Team project · 2 developers"
    },
    "resultBadge": {
      "ja": "再利用可能なPythonパッケージ",
      "en": "Reusable Python package"
    },
    "demoFocus": {
      "ja": "生成された迷路、探索結果、スタートからゴールまでの最短経路",
      "en": "The generated maze, search result and shortest path from start to goal"
    },
    "collaboration": {
      "ja": [
        "2名で機能を分担し、Gitで変更を管理",
        "本人はDFS/BFS、最短経路、壁の4ビット表現、パッケージ化を担当"
      ],
      "en": [
        "Split features between two developers and managed changes with Git",
        "My contribution: DFS/BFS, shortest-path search, four-bit wall encoding and packaging"
      ]
    },
    "technicalDetails": {
      "ja": {
        "challenge": "上下左右の壁を4ビットで表現し、生成条件を満たす迷路と最短経路探索を一貫して扱うこと。",
        "design": [
          "本人担当としてDFSによる迷路生成とBFSによる最短経路探索を実装",
          "壁情報を4ビットで表現し、隣接セル間の整合性を管理",
          "担当機能をmazegenパッケージとして再利用可能な形に整理"
        ],
        "verification": "小さい迷路、42パターン、外周壁などの条件と、パッケージ生成をテストで確認。",
        "limitations": "生成・探索・可視化を目的とした課題であり、大規模迷路の性能測定は行っていません。"
      },
      "en": {
        "challenge": "Represent four directional walls in four bits while keeping maze-generation constraints and shortest-path search consistent.",
        "design": [
          "My contribution implemented DFS maze generation and BFS shortest-path search",
          "Encoded walls in four bits and maintained consistency between adjacent cells",
          "Packaged the contributed functionality as reusable mazegen functionality"
        ],
        "verification": "Tests cover small mazes, the 42 pattern, outer-wall constraints and package generation.",
        "limitations": "The project focuses on generation, search and visualization; it does not benchmark very large mazes."
      }
    }
  },
  {
    "id": "this-portfolio",
    "title": "This Portfolio",
    "description": {
      "ja": "経歴と技術実績を日英で伝えるポートフォリオサイト。",
      "en": "A bilingual portfolio presenting career history and engineering evidence."
    },
    "tags": [
      "TypeScript",
      "React",
      "Astro",
      "Git"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/hikaru-wakatsuki.github.io",
    "projectType": {
      "ja": "個人開発 · Web",
      "en": "Individual project · Web"
    },
    "resultBadge": {
      "ja": "GitHub Pages · 自動デプロイ",
      "en": "GitHub Pages · Automated deploy"
    },
    "compact": true,
    "technicalDetails": {
      "ja": {
        "challenge": "経歴と技術情報を保ちながら、採用担当が短時間で主要実績へ移動できる構成にすること。",
        "design": [
          "Astroで静的生成し、操作が必要な部分をReact・TypeScriptで実装",
          "日英切り替え、テーマ変更、技術タグによる作品絞り込みを実装"
        ],
        "verification": "Astroのビルドと型チェックを行い、GitHub ActionsからGitHub Pagesへ自動公開。",
        "limitations": "静的ポートフォリオであり、問い合わせ送信以外のサーバー機能は持ちません。"
      },
      "en": {
        "challenge": "Preserve career and technical detail while helping recruiters reach the strongest evidence quickly.",
        "design": [
          "Used Astro for static generation and React with TypeScript for interactive behavior",
          "Implemented language and theme switching plus technology-based project filtering"
        ],
        "verification": "Runs Astro build and type checks, then deploys to GitHub Pages through GitHub Actions.",
        "limitations": "This is a static portfolio and has no server-side features beyond contact-form submission."
      }
    }
  }
];

export const PROJECT_TAG_COUNTS: Readonly<Record<string, number>> = Object.freeze(
  PROJECTS.reduce<Record<string, number>>((counts, project) => {
    project.tags.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
    return counts;
  }, {}),
);

// ── PortfolioCard ─────────────────────────────────────────────────────────────

interface CardProps {
  project: PortfolioProject;
  language: 'ja' | 'en';
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  onOpenVideo: (project: PortfolioProject) => void;
}

function PortfolioCard({
  project,
  language,
  activeTag,
  onTagClick,
  onOpenVideo,
}: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    videoRef.current?.play().catch(() => {
      // Autoplay may be blocked by browser policy; silently ignore
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  return (
    <article
      className={[
        'rounded-lg overflow-hidden border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        project.compact ? 'max-w-4xl' : '',
      ].join(' ')}
      style={{
        borderColor: 'var(--color-splitter)',
        background: 'var(--color-cli-bg)',
        color: 'var(--color-text)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-splitter)] p-5">
        <div>
          <h3 className="text-xl font-bold leading-snug sm:text-2xl">{project.title}</h3>
          {project.projectType && (
            <p className="mt-2 font-mono text-xs uppercase tracking-wider opacity-60">
              {project.projectType[language]}
            </p>
          )}
          <p className="mt-3 max-w-3xl text-sm leading-6 opacity-75">
            {project.description[language]}
          </p>
        </div>
        {project.resultBadge && (
          <span
            className="rounded-full border px-3 py-1 font-mono text-xs font-bold"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            {project.resultBadge[language]}
          </span>
        )}
      </div>

      {/* ── Media area ── */}
      {project.demoFocus && (
        <div className="border-b border-[var(--color-splitter)] px-5 py-3 text-sm leading-6 sm:px-6">
          <span className="mr-2 font-mono text-xs font-bold uppercase tracking-wide text-[var(--color-cli-text)]">
            {language === 'ja' ? '動画の見どころ' : 'What to watch'}
          </span>
          <span className="opacity-75">{project.demoFocus[language]}</span>
        </div>
      )}
      <div
        className="relative w-full overflow-hidden"
        style={project.videoUrl
          ? { aspectRatio: '16 / 9', background: '#050505' }
          : { height: '3rem', background: 'var(--color-splitter)' }}
      >
        {project.imageUrl && !project.videoUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : !project.videoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm opacity-30">
            {project.title}
          </div>
        ) : null}

        {project.videoUrl && (
          <>
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={project.imageUrl}
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={`${project.title} demo`}
              className="absolute inset-0 h-full w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onOpenVideo(project)}
              aria-label={language === 'ja' ? `${project.title}のデモを拡大` : `Expand ${project.title} demo`}
              className="absolute right-3 top-3 z-10 rounded border border-white/50 bg-black/80 px-3 py-2 font-mono text-xs font-bold text-white shadow-lg hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {language === 'ja' ? 'デモを拡大 ↗' : 'Expand demo ↗'}
            </button>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {project.technicalDetails && (() => {
          const details = project.technicalDetails[language];
          return (
            <div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
              <section className="border-l-2 border-[var(--color-splitter)] pl-3">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wide">
                  {language === 'ja' ? '技術的課題' : 'Technical challenge'}
                </h4>
                <p className="opacity-75">{details.challenge}</p>
              </section>

              <section className="border-l-2 border-[var(--color-splitter)] pl-3">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wide">
                  {language === 'ja' ? '設計・実装' : 'Design & implementation'}
                </h4>
                <ul className="list-disc space-y-1 pl-4 opacity-75">
                  {details.design.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section className="border-l-2 border-[var(--color-splitter)] pl-3">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wide">
                  {language === 'ja' ? '検証' : 'Verification'}
                </h4>
                <p className="opacity-75">{details.verification}</p>
              </section>

              <section className="border-l-2 border-[var(--color-splitter)] pl-3">
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wide">
                  {language === 'ja' ? '制約・前提' : 'Limitations & scope'}
                </h4>
                <p className="opacity-75">{details.limitations}</p>
              </section>
            </div>
          );
        })()}

        {project.collaboration && (
          <div className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider">
              {language === 'ja' ? '共同開発・本人担当' : 'Team & my contribution'}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-7 opacity-75">
              {project.collaboration[language].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className={[
                    'px-2 py-0.5 rounded text-xs font-mono border transition-all duration-150',
                    'cursor-pointer',
                    isActive ? 'font-bold' : 'opacity-60 hover:opacity-100',
                  ].join(' ')}
                  style={
                    isActive
                      ? {
                          background: 'var(--color-cli-text)',
                          color: 'var(--color-cli-bg)',
                          borderColor: 'var(--color-cli-text)',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--color-text)',
                          borderColor: 'var(--color-splitter)',
                        }
                  }
                  aria-pressed={isActive}
                  aria-label={language === 'ja' ? `${tag}でプロジェクトを絞り込む` : `Filter projects by ${tag}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* GitHub link */}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit font-mono text-xs opacity-70 transition-opacity hover:underline hover:opacity-100"
            style={{ color: 'var(--color-cli-text)' }}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </article>
  );
}

function VideoModal({ project, language, onClose }: {
  project: PortfolioProject;
  language: 'ja' | 'en';
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} demo`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col sm:max-h-[calc(100vh-4rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <div>
            <p className="text-lg font-bold sm:text-2xl">{project.title}</p>
            {project.resultBadge && (
              <p className="mt-1 font-mono text-xs opacity-70">{project.resultBadge[language]}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded border border-white/50 px-3 py-2 font-mono text-xs font-bold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={language === 'ja' ? '拡大動画を閉じる' : 'Close expanded video'}
          >
            {language === 'ja' ? '閉じる ✕' : 'Close ✕'}
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded border border-white/20 bg-black">
          <video
            src={project.videoUrl}
            poster={project.imageUrl}
            controls
            autoPlay
            muted
            playsInline
            className="max-h-[calc(100vh-6.5rem)] w-full object-contain sm:max-h-[calc(100vh-9rem)]"
          />
        </div>
      </div>
    </div>
  );
}

// ── PortfolioContainer ────────────────────────────────────────────────────────

interface PortfolioContainerProps {
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
}

export default function PortfolioContainer({
  activeTag,
  onSelectTag,
  onClearTag,
}: PortfolioContainerProps) {
  // [C-3] Use language from AppStateContext so EN/JP toggle updates card descriptions
  const { language } = useAppState();

  const [expandedProject, setExpandedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    if (!expandedProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpandedProject(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [expandedProject]);

  // ── Filtered view ─────────────────────────────────────────────────────────
  const displayed = activeTag
    ? PROJECTS.filter((p) => p.tags.includes(activeTag))
    : PROJECTS.filter((p) => !p.compact);

  // Keep card-tag filtering in the Projects section so the result remains in view.
  const handleCardTagClick = useCallback((tag: string) => {
    onSelectTag(tag);
  }, [onSelectTag]);

  const projectCountLabel = language === 'ja'
    ? `${displayed.length}件のプロジェクト`
    : `${displayed.length} ${displayed.length === 1 ? 'project' : 'projects'}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      className="w-full px-6 py-8"
      style={{ color: 'var(--color-text)' }}
    >
      {/* Header */}
      <div
        id="portfolio-filter-status"
        tabIndex={-1}
        aria-live="polite"
        className="flex flex-wrap items-center gap-3 mb-6 focus:outline-none"
      >
        {activeTag && (
          <span
            className="text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            {language === 'ja' ? '選択中の技術' : 'Technology'}: {activeTag}
          </span>
        )}
        <span className="font-mono text-xs opacity-60">{projectCountLabel}</span>
        {activeTag && (
          <button
            type="button"
            onClick={onClearTag}
            className="text-xs underline opacity-50 hover:opacity-100 transition-opacity ml-auto"
          >
            {language === 'ja' ? '絞り込みを解除' : 'Clear filter'} ✕
          </button>
        )}
      </div>

      <p className="text-sm opacity-65 mb-6">{language === 'ja' ? '構造化データ、並行処理、スケジューリング、グラフ探索を扱った技術プロジェクト。' : 'Selected engineering projects covering structured data, concurrency, scheduling and graph search.'}</p>
      {/* Cards grid */}
      {displayed.length === 0 ? (
        <div className="py-12 text-center font-mono text-sm opacity-60">
          <p>
            {language === 'ja'
              ? `「${activeTag}」に対応するプロジェクトが見つかりません。`
              : `No projects match “${activeTag}”.`}
          </p>
          <button type="button" onClick={onClearTag} className="mt-3 underline underline-offset-4">
            {language === 'ja' ? 'すべてのプロジェクトを表示' : 'Show all projects'}
          </button>
        </div>
      ) : (
        <div className="grid gap-8">
          {displayed.map((project) => (
            <PortfolioCard
              key={project.id}
              project={project}
              language={language}
              activeTag={activeTag}
              onTagClick={handleCardTagClick}
              onOpenVideo={setExpandedProject}
            />
          ))}
        </div>
      )}
      {!activeTag && (
        <div className="mt-8 pt-6 border-t border-[var(--color-splitter)]">
          <h3 className="font-bold mb-3">{language === 'ja' ? 'その他42課題' : 'Other 42 projects'}</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {['Push_swap', 'get_next_line', 'printf', 'Born2beroot', 'NetPractice'].map((name) => <a key={name} href={`https://github.com/hikaru-wakatsuki/${name}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{name} ↗</a>)}
          </div>
        </div>
      )}
      {expandedProject && (
        <VideoModal
          project={expandedProject}
          language={language}
          onClose={() => setExpandedProject(null)}
        />
      )}
    </section>
  );
}
