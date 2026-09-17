import { useRef, useCallback, useEffect, useState } from 'react';
import type { PortfolioProject } from '../../../types/portfolio';
import { useTagFilter } from '../Skills/tagFilterStore';
import { SKILLS_SECTION_ID } from '../Skills/SkillsContainer';
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
      "ja": "Schema validation · 4 / 4 PASSED",
      "en": "Schema validation · 4 / 4 PASSED"
    },
    "highlights": {
      "ja": [
        "自然言語から呼び出す関数を選び、型付きJSON引数を生成するローカルLLMツール。",
        "JSON構文と引数型の制約を守る生成が課題。",
        "関数選択と引数生成を分離し、制約付き生成・Pydantic検証を実装。",
        "4種類の関数で関数選択・JSON生成・型整合性をIntegration Testにより検証。"
      ],
      "en": [
        "A local LLM tool that selects a function and generates typed JSON arguments from natural language.",
        "Challenge: enforce JSON syntax and argument types.",
        "Separate selection and argument generation with constrained decoding and Pydantic.",
        "Integration tests verify function selection, JSON generation and type safety across four functions."
      ]
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
      "Algorithms"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Codexion",
    "imageUrl": "/videos/codexion-demo-poster.png",
    "videoUrl": "/videos/codexion-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "Deadlocks · 0",
      "en": "Deadlocks · 0"
    },
    "highlights": {
      "ja": [
        "複数スレッドが共有資源を取り合う並行処理シミュレーション。",
        "デッドロック・飢餓・資源配分の公平性が課題。",
        "mutexの取得順序とmin-heapによるFIFO・EDFを実装。",
        "待機・コンパイル・回復の状態を管理し、各ワーカーの完了までを可視化。"
      ],
      "en": [
        "POSIX-thread simulation of shared resource contention.",
        "Challenge: deadlocks, starvation and fair arbitration.",
        "Ordered mutex acquisition and min-heap FIFO/EDF scheduling.",
        "Managed waiting, compiling and recovery states, with visualization through worker completion."
      ]
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
      "pygame"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Fly-in",
    "imageUrl": "/videos/fly-in-demo-poster.png",
    "videoUrl": "/videos/fly-in-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "Capacity violations · 0",
      "en": "Capacity violations · 0"
    },
    "highlights": {
      "ja": [
        "グラフ上で複数ドローンの移動を計画・可視化。",
        "経路だけでなく、区画・接続の容量と混雑を考慮。",
        "重み付き経路探索とターン単位の移動制御を分離。",
        "入力検証と容量違反チェックを行い、全ドローンの到着までをpygameで可視化。"
      ],
      "en": [
        "Plan and visualize drone movements across a graph.",
        "Challenge: zone/link capacities and congestion.",
        "Separate weighted pathfinding from turn-based scheduling.",
        "Validated inputs and capacity constraints, then visualized every drone through arrival in pygame."
      ]
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
      "Algorithms"
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
    "collaboration": {
      "ja": [
        "2名で機能を分担し、Gitで変更を管理",
        "迷路生成・最短経路・可視化を結合し、動作を確認"
      ],
      "en": [
        "Split features between two developers and managed changes with Git",
        "Integrated maze generation, shortest-path search and visualization"
      ]
    },
    "highlights": {
      "ja": [
        "2名でPythonの迷路生成・最短経路・可視化を開発。",
        "壁のビット表現と生成条件を満たす迷路が課題。",
        "DFS・BFS、設定検証、再現可能な乱数シードを実装。",
        "mazegenを再利用可能なパッケージとして配布できる形に整理。"
      ],
      "en": [
        "Two-person Python maze generation and visualization project.",
        "Challenge: bit-encoded walls and generation constraints.",
        "DFS/BFS, configuration validation and reproducible seeds.",
        "Packaged mazegen as reusable wheel/source distributions."
      ]
    }
  }
];

// ── PortfolioCard ─────────────────────────────────────────────────────────────

interface CardProps {
  project: PortfolioProject;
  language: 'ja' | 'en';
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  onOpenVideo: (project: PortfolioProject) => void;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}

function PortfolioCard({
  project,
  language,
  activeTag,
  onTagClick,
  onOpenVideo,
  onHoverEnter,
  onHoverLeave,
}: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    onHoverEnter();
    videoRef.current?.play().catch(() => {
      // Autoplay may be blocked by browser policy; silently ignore
    });
  }, [onHoverEnter]);

  const handleMouseLeave = useCallback(() => {
    onHoverLeave();
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, [onHoverLeave]);

  return (
    <article
      className={[
        'rounded-lg overflow-hidden border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
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
        <dl className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
          {project.highlights?.[language].map((value, index) => (
            <div key={index} className="border-l-2 border-[var(--color-splitter)] pl-3">
              <dt className="mb-1 text-xs font-bold uppercase tracking-wide">{(language === 'ja' ? ['作ったもの', '技術的課題', '実装', '結果'] : ['Built', 'Technical challenge', 'Implementation', 'Result'])[index]}</dt>
              <dd className="opacity-75">{value}</dd>
            </div>
          ))}
        </dl>

        {project.collaboration && (
          <div className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider">
              {language === 'ja' ? '共同開発' : 'Collaboration'}
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

export default function PortfolioContainer({ onNavigateToSkills }: { onNavigateToSkills?: () => void }) {
  // [C-3] Use language from AppStateContext so EN/JP toggle updates card descriptions
  const { language, triggerHoverLog, clearHoverLog } = useAppState();

  const { activeTag, toggleTag } = useTagFilter();
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
    : PROJECTS;

  // ── Tag click from card: set filter + scroll to Skills ───────────────────
  const handleCardTagClick = useCallback((tag: string) => {
    toggleTag(tag);
    if (onNavigateToSkills) {
      onNavigateToSkills();
    } else {
      document.getElementById(SKILLS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [toggleTag, onNavigateToSkills]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      className="w-full px-6 py-8"
      style={{ color: 'var(--color-text)' }}
      onMouseEnter={() => triggerHoverLog('portfolio')}
      onMouseLeave={() => clearHoverLog()}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {activeTag && (
          <span
            className="text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            filtered: {activeTag}
          </span>
        )}
        {activeTag && (
          <button
            onClick={() => toggleTag(activeTag)}
            className="text-xs underline opacity-50 hover:opacity-100 transition-opacity ml-auto"
          >
            Clear ✕
          </button>
        )}
      </div>

      <p className="text-sm opacity-65 mb-6">{language === 'ja' ? 'バックエンドの信頼性、構造化データ、並行処理、アルゴリズムに焦点を当てた技術プロジェクト。' : 'Selected engineering projects focused on backend reliability, structured data, concurrency, and algorithms.'}</p>
      {/* Cards grid */}
      {displayed.length === 0 ? (
        <p className="text-sm opacity-50 font-mono py-12 text-center">
          No projects match &ldquo;{activeTag}&rdquo;.
        </p>
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
              onHoverEnter={() => triggerHoverLog(`portfolio-${project.id}`)}
              onHoverLeave={() => clearHoverLog()}
            />
          ))}
        </div>
      )}
      <div className="mt-8 pt-6 border-t border-[var(--color-splitter)]">
        <h3 className="font-bold mb-3">{language === 'ja' ? 'その他42課題' : 'Other 42 projects'}</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {['Push_swap', 'get_next_line', 'printf', 'Born2beroot', 'NetPractice'].map((name) => <a key={name} href={`https://github.com/hikaru-wakatsuki/${name}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{name} ↗</a>)}
        </div>
      </div>
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
