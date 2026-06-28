import { useState, useEffect, useRef, useCallback } from 'react';
import type { PortfolioProject } from '../../../types/portfolio';
import { useTagFilter } from '../Skills/tagFilterStore';
import { SKILLS_SECTION_ID } from '../Skills/SkillsContainer';
import { useAppState } from '../../../context/AppStateContext';

// ── Config ───────────────────────────────────────────────────────────────────

const GITHUB_USERNAME =
  (import.meta.env.PUBLIC_GITHUB_USERNAME as string | undefined) ?? 'waka9648';

// ── Mock data (shown on API error / rate limit) ───────────────────────────────

const MOCK_PROJECTS: PortfolioProject[] = [
  {
    id: 'portfolio',
    title: 'Portfolio Site',
    description: {
      ja: 'AstroとReactで構築したポートフォリオ。CLI/GUIの2分割レイアウトとAIチャットを実装。',
      en: 'Portfolio built with Astro & React. Dual CLI/GUI split layout with AI chat integration.',
    },
    tags: ['React', 'Astro', 'TypeScript', 'Tailwind CSS', 'Docker'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/portfolio`,
    videoUrl: '',
    imageUrl: '',
  },
  {
    id: 'minishell',
    title: 'minishell',
    description: {
      ja: '42 TokyoのプロジェクトでCで実装したBashライクなシェル。パイプ、リダイレクト、シグナル処理に対応。',
      en: 'Bash-like shell in C for 42 Tokyo. Supports pipes, redirections, and signal handling.',
    },
    tags: ['C', 'POSIX', 'Algorithms', 'Makefile'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/minishell`,
    videoUrl: '',
    imageUrl: '',
  },
  {
    id: 'inception',
    title: 'Inception',
    description: {
      ja: 'Dockerを使ってNginx・WordPress・MariaDBのマルチコンテナ環境を1から構築する42プロジェクト。',
      en: '42 project: multi-container Nginx/WordPress/MariaDB stack built from scratch with Docker.',
    },
    tags: ['Docker', 'Linux', 'Nginx', 'Bash'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/inception`,
    videoUrl: '',
    imageUrl: '',
  },
  {
    id: 'ft_printf',
    title: 'ft_printf',
    description: {
      ja: '42の課題で実装した printf の再実装。書式指定子と可変長引数を完全サポート。',
      en: 'Custom printf reimplementation for 42. Full format specifier and variadic argument support.',
    },
    tags: ['C', 'Algorithms', 'Makefile'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/ft_printf`,
    videoUrl: '',
    imageUrl: '',
  },
];

// ── GitHub API types ─────────────────────────────────────────────────────────

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  topics: string[];
  homepage: string | null;
}

function reposToProjects(repos: GitHubRepo[]): PortfolioProject[] {
  return repos
    .filter((r) => r.topics.includes('portfolio'))
    .map((r) => ({
      id: String(r.id),
      title: r.name,
      description: { ja: r.description ?? '', en: r.description ?? '' },
      tags: r.topics.filter((t) => t !== 'portfolio'),
      githubUrl: r.html_url,
      videoUrl: r.homepage ?? undefined,
      imageUrl: undefined,
    }));
}

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
        style={{ aspectRatio: '16/9', background: 'var(--color-splitter)' }}
      >
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm opacity-30">
            {project.title}
          </div>
        )}

        {project.videoUrl && (
          <video
            ref={videoRef}
            src={project.videoUrl}
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-bold text-base leading-snug">{project.title}</h3>

        <p className="text-sm leading-relaxed opacity-75">
          {project.description[language] || project.description.en}
        </p>

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

export default function PortfolioContainer() {
  // [C-3] Use language from AppStateContext so EN/JP toggle updates card descriptions
  const { language, triggerHoverLog, clearHoverLog } = useAppState();

  const [projects, setProjects] = useState<PortfolioProject[]>(MOCK_PROJECTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromApi, setIsFromApi] = useState(false);

  const { activeTag, toggleTag } = useTagFilter();

  // ── GitHub API fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchRepos() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
          { headers: { Accept: 'application/vnd.github+json' } },
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const repos = (await res.json()) as GitHubRepo[];
        const portfolio = reposToProjects(repos);
        if (!cancelled && portfolio.length > 0) {
          setProjects(portfolio);
          setIsFromApi(true);
        }
      } catch {
        // Rate-limited or network error — keep mock data silently
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchRepos();
    return () => { cancelled = true; };
  }, []);

  // ── Filtered view ─────────────────────────────────────────────────────────
  const displayed = activeTag
    ? projects.filter((p) => p.tags.includes(activeTag))
    : projects;

  // ── Tag click from card: set filter + scroll to Skills ───────────────────
  const handleCardTagClick = useCallback((tag: string) => {
    toggleTag(tag);
    const skillsEl = document.getElementById(SKILLS_SECTION_ID);
    skillsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [toggleTag]);

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
        <h2 className="text-2xl font-bold tracking-wide">Portfolio</h2>
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
        {isLoading && (
          <span className="text-xs opacity-40 font-mono animate-pulse">fetching repos…</span>
        )}
        {!isLoading && isFromApi && (
          <span className="text-xs opacity-30 font-mono">via GitHub API</span>
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

      {/* Cards grid */}
      {displayed.length === 0 ? (
        <p className="text-sm opacity-50 font-mono py-12 text-center">
          No projects match &ldquo;{activeTag}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
