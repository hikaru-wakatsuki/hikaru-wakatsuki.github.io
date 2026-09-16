import { useRef, useCallback } from 'react';
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
    "highlights": {
      "ja": [
        "自然言語をローカルLLMでFunction Call JSONへ変換。",
        "JSON構文と引数型の制約を守る生成が課題。",
        "関数選択と引数生成を分離し、制約付き生成・Pydantic検証を実装。",
        "責務分離とエラー処理を備え、Integration Testで動作を検証。"
      ],
      "en": [
        "Local LLM converts natural language into function-call JSON.",
        "Challenge: enforce JSON syntax and argument types.",
        "Separate selection and argument generation with constrained decoding and Pydantic.",
        "Modular responsibilities, error handling and integration tests."
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
    "highlights": {
      "ja": [
        "複数スレッドが共有資源を取り合う並行処理シミュレーション。",
        "デッドロック・飢餓・資源配分の公平性が課題。",
        "mutexの取得順序とmin-heapによるFIFO・EDFを実装。",
        "資源の待機・クールダウン・停止監視とログ出力を実装。"
      ],
      "en": [
        "POSIX-thread simulation of shared resource contention.",
        "Challenge: deadlocks, starvation and fair arbitration.",
        "Ordered mutex acquisition and min-heap FIFO/EDF scheduling.",
        "Implemented waiting, cooldown, stop monitoring and serialized logs."
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
    "highlights": {
      "ja": [
        "グラフ上で複数ドローンの移動を計画・可視化。",
        "経路だけでなく、区画・接続の容量と混雑を考慮。",
        "重み付き経路探索とターン単位の移動制御を分離。",
        "入力検証、容量チェック、pygameによる可視化まで実装。"
      ],
      "en": [
        "Plan and visualize drone movements across a graph.",
        "Challenge: zone/link capacities and congestion.",
        "Separate weighted pathfinding from turn-based scheduling.",
        "Implemented input validation, capacity checks and pygame visualization."
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
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}

function PortfolioCard({
  project,
  language,
  activeTag,
  onTagClick,
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
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-bold text-base leading-snug">{project.title}</h3>

        <dl className="space-y-2 text-sm leading-relaxed">
          {project.highlights?.[language].map((value, index) => (
            <div key={index}>
              <dt className="font-bold text-xs mb-0.5">{(language === 'ja' ? ['作ったもの', '課題', '工夫', '実装・検証'] : ['Built', 'Challenge', 'Approach', 'Outcome'])[index]}</dt>
              <dd className="opacity-75">{value}</dd>
            </div>
          ))}
        </dl>

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
          className="text-xs font-mono hover:underline transition-opacity opacity-70 hover:opacity-100 w-fit"
          style={{ color: 'var(--color-cli-text)' }}
        >
          GitHub ↗
        </a>
      </div>
    </article>
  );
}

// ── PortfolioContainer ────────────────────────────────────────────────────────

export default function PortfolioContainer({ onNavigateToSkills }: { onNavigateToSkills?: () => void }) {
  // [C-3] Use language from AppStateContext so EN/JP toggle updates card descriptions
  const { language, triggerHoverLog, clearHoverLog } = useAppState();

  const { activeTag, toggleTag } = useTagFilter();

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

      <p className="text-sm opacity-65 mb-6">{language === 'ja' ? '42 Tokyoでの個人・共同開発。設計と実装の詳細は各GitHub READMEへ。' : 'Individual and collaborative 42 Tokyo projects. See each GitHub README for implementation details.'}</p>
      {/* Cards grid */}
      {displayed.length === 0 ? (
        <p className="text-sm opacity-50 font-mono py-12 text-center">
          No projects match &ldquo;{activeTag}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {displayed.map((project) => (
            <PortfolioCard
              key={project.id}
              project={project}
              language={language}
              activeTag={activeTag}
              onTagClick={handleCardTagClick}
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
    </section>
  );
}
