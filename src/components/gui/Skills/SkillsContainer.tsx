import { useAppState } from '../../../context/AppStateContext';
import { useTagFilter } from './tagFilterStore';

// ── Data ────────────────────────────────────────────────────────────────────

interface SkillCategory {
  id: string;
  // label is derived via t(`skills.${id}`) at render time
  tags: string[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'backend', tags: ['Python', 'JSON', 'Pydantic', 'LLM'] },
  { id: 'database', tags: ['PostgreSQL', 'MySQL'] },
  { id: 'infrastructure', tags: ['Linux', 'Azure', 'Docker', 'Bash'] },
  { id: 'engineering', tags: ['Git', 'C', 'POSIX', 'Algorithms'] },
  { id: 'additional', tags: ['TypeScript', 'React', 'Astro'] },
];

/** Stable element ID used by PortfolioContainer to scroll here */
export const SKILLS_SECTION_ID = 'skills-section';

// ── Component ────────────────────────────────────────────────────────────────

export default function SkillsContainer() {
  const { t, triggerHoverLog, clearHoverLog } = useAppState();
  const { activeTag, toggleTag } = useTagFilter();

  return (
    <section
      className="w-full px-6 py-8 scroll-mt-4"
      style={{ color: 'var(--color-text)' }}
      onMouseEnter={() => triggerHoverLog('skills')}
      onMouseLeave={() => clearHoverLog()}
    >
      <div className="flex items-center gap-3 mb-6">
        {activeTag && (
          <span
            className="text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            {activeTag}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {SKILL_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-50">
              {t(`skills.${cat.id}`) || cat.id}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={`${cat.id}-${tag}`}
                    onClick={() => toggleTag(tag)}
                    className={[
                      'px-3 py-1 rounded text-sm font-mono border transition-all duration-150',
                      'cursor-pointer select-none',
                      isActive
                        ? 'font-bold scale-105'
                        : 'opacity-70 hover:opacity-100',
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
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activeTag && (
        <button
          onClick={() => toggleTag(activeTag)}
          className="mt-6 text-xs underline opacity-60 hover:opacity-100 transition-opacity"
        >
          Clear filter ✕
        </button>
      )}
    </section>
  );
}
