import { useAppState } from '../../../context/AppStateContext';

// ── Data ────────────────────────────────────────────────────────────────────

interface SkillCategory {
  id: string;
  // label is derived via t(`skills.${id}`) at render time
  tags: string[];
  capabilityCount: number;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'backend', tags: ['Python', 'JSON', 'Pydantic', 'LLM'], capabilityCount: 3 },
  { id: 'database', tags: ['PostgreSQL', 'MySQL'], capabilityCount: 3 },
  { id: 'infrastructure', tags: ['Linux', 'Azure', 'Docker', 'Bash'], capabilityCount: 3 },
  { id: 'engineering', tags: ['Git', 'C', 'POSIX', 'Algorithms'], capabilityCount: 3 },
  { id: 'additional', tags: ['TypeScript', 'React', 'Astro'], capabilityCount: 3 },
];

/** Stable element ID used by PortfolioContainer to scroll here */
export const SKILLS_SECTION_ID = 'skills-section';

// ── Component ────────────────────────────────────────────────────────────────

interface SkillsContainerProps {
  activeTag: string | null;
  projectTagCounts: Readonly<Record<string, number>>;
  onSelectProjectTag: (tag: string) => void;
  onClearProjectTag: () => void;
}

export default function SkillsContainer({
  activeTag,
  projectTagCounts,
  onSelectProjectTag,
  onClearProjectTag,
}: SkillsContainerProps) {
  const { t, language, triggerHoverLog, clearHoverLog } = useAppState();

  return (
    <section
      className="w-full px-6 py-8 scroll-mt-4"
      style={{ color: 'var(--color-text)' }}
      onMouseEnter={() => triggerHoverLog('skills')}
      onMouseLeave={() => clearHoverLog()}
    >
      <div className="flex items-center gap-3 mb-6">
        <p className="text-sm leading-7 opacity-65">
          {language === 'ja'
            ? '技術名とあわせて、できることを示しています。ボタンになっている技術を選ぶと、その技術を確認できるプロジェクトへ移動します。実務経験の技術はラベルで区別しています。'
            : 'Each category describes what I can build. Select a technology button to see the projects that demonstrate it. Technologies evidenced through professional experience are shown as labels.'}
        </p>
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
            <p className="mb-3 max-w-3xl text-sm leading-7 opacity-75">
              {t(`skills.${cat.id}Description`)}
            </p>
            <ul className="mb-4 max-w-4xl list-disc space-y-1 pl-5 text-sm leading-7 opacity-70">
              {Array.from({ length: cat.capabilityCount }, (_, index) => (
                <li key={`${cat.id}-capability-${index}`}>
                  {t(`skills.${cat.id}Capabilities.${index}`)}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => {
                const isActive = activeTag === tag;
                const projectCount = projectTagCounts[tag] ?? 0;

                if (projectCount === 0) {
                  return (
                    <span
                      key={`${cat.id}-${tag}`}
                      className="inline-flex items-center gap-1.5 rounded border border-[var(--color-splitter)] px-3 py-1 font-mono text-sm opacity-65"
                      title={language === 'ja' ? '実務経験' : 'Professional experience'}
                    >
                      {tag}
                      <span className="text-[0.6rem] uppercase tracking-wider opacity-65">
                        {language === 'ja' ? '実務' : 'Work'}
                      </span>
                    </span>
                  );
                }

                return (
                  <button
                    key={`${cat.id}-${tag}`}
                    type="button"
                    onClick={() => onSelectProjectTag(tag)}
                    className={[
                      'px-3 py-1 rounded text-sm font-mono border transition-all duration-150',
                      'cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2',
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
                    aria-label={language === 'ja'
                      ? `${tag}を使用した${projectCount}件のプロジェクトを表示`
                      : `Show ${projectCount} ${projectCount === 1 ? 'project' : 'projects'} using ${tag}`}
                  >
                    {tag} <span className="opacity-60">· {projectCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activeTag && (
        <button
          type="button"
          onClick={onClearProjectTag}
          className="mt-6 text-xs underline opacity-60 hover:opacity-100 transition-opacity"
        >
          {language === 'ja' ? '絞り込みを解除' : 'Clear filter'} ✕
        </button>
      )}
    </section>
  );
}
