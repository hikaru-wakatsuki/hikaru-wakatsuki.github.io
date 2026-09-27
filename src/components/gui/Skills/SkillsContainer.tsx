import { useAppState } from '../../../context/AppStateContext';

interface SkillArea {
  id: string;
  title: { ja: string; en: string };
  capability: { ja: string; en: string };
  evidence: { ja: string; en: string };
  tags: string[];
}

const SKILL_AREAS: SkillArea[] = [
  {
    id: 'backend',
    title: { ja: 'バックエンド開発', en: 'Backend development' },
    capability: {
      ja: 'Python業務アプリの処理設計・実装・評価・リリース。JSON入出力、型検証、エラー処理、フォールバックを実装できます。',
      en: 'Design, implement, evaluate and release Python business applications, including JSON I/O, type validation, error handling and fallback behavior.',
    },
    evidence: { ja: 'NECでの業務経験 / Call Me Maybe', en: 'Professional experience at NEC / Call Me Maybe' },
    tags: ['Python', 'JSON', 'Pydantic', 'LLM'],
  },
  {
    id: 'infrastructure-data',
    title: { ja: 'インフラ・データベース', en: 'Infrastructure & data' },
    capability: {
      ja: 'Linux・Azure・DB環境の設計、構築、移行と、障害・性能調査。Dockerによる開発環境整備ができます。',
      en: 'Design, build and migrate Linux, Azure and database environments; investigate incidents and performance; prepare Docker development environments.',
    },
    evidence: { ja: 'NECで約4年間の通信基盤業務', en: 'Around four years of telecom infrastructure work at NEC' },
    tags: ['PostgreSQL', 'MySQL', 'Linux', 'Azure', 'Docker', 'Bash'],
  },
  {
    id: 'engineering-cs',
    title: { ja: '並行処理・アルゴリズム', en: 'Concurrency & algorithms' },
    capability: {
      ja: 'mutexによる共有資源制御、FIFO・EDFスケジューリング、重み付き経路探索、DFS・BFSを実装できます。',
      en: 'Implement mutex-based shared-resource control, FIFO/EDF scheduling, weighted pathfinding and DFS/BFS.',
    },
    evidence: { ja: 'Codexion / Fly-in / A-Maze-ing', en: 'Codexion / Fly-in / A-Maze-ing' },
    tags: ['C', 'POSIX', 'Algorithms', 'Python'],
  },
  {
    id: 'collaboration-delivery',
    title: { ja: '共同開発・公開', en: 'Collaboration & delivery' },
    capability: {
      ja: 'Git・Peer Review・役割分担による共同開発と、静的ビルド・自動デプロイによる公開ができます。',
      en: 'Collaborate with Git, peer review and clear ownership, and publish static builds through automated deployment.',
    },
    evidence: { ja: 'A-Maze-ing / 42 Tokyo / このポートフォリオ', en: 'A-Maze-ing / 42 Tokyo / This portfolio' },
    tags: ['Git', 'TypeScript', 'React', 'Astro'],
  },
];

export const SKILLS_SECTION_ID = 'skills-section';

interface SkillsContainerProps {
  activeTag: string | null;
  projectTagCounts: Readonly<Record<string, number>>;
  onSelectProjectTag: (tag: string) => void;
  onClearProjectTag: () => void;
}

export default function SkillsContainer({ activeTag, projectTagCounts, onSelectProjectTag, onClearProjectTag }: SkillsContainerProps) {
  const { language } = useAppState();

  return (
    <section className="w-full px-5 py-8 sm:px-8" style={{ color: 'var(--color-text)' }}>
      <p className="mb-6 max-w-4xl text-sm leading-7 opacity-65">
        {language === 'ja'
          ? 'できること、その根拠、使用技術を対応させています。件数付きの技術を選ぶと、関連プロジェクトを確認できます。'
          : 'Capabilities, supporting evidence and technologies are shown together. Select a technology with a project count to view the related work.'}
      </p>

      <div className="overflow-hidden rounded border border-[var(--color-splitter)]">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(12rem,0.9fr)_minmax(14rem,1fr)] gap-6 border-b border-[var(--color-splitter)] bg-[var(--color-cli-bg)] px-5 py-3 text-xs font-bold uppercase tracking-wider opacity-65 md:grid">
          <span>{language === 'ja' ? 'できること' : 'Capability'}</span>
          <span>{language === 'ja' ? '根拠' : 'Evidence'}</span>
          <span>{language === 'ja' ? '技術' : 'Technologies'}</span>
        </div>

        {SKILL_AREAS.map((area) => (
          <article key={area.id} className="grid gap-5 border-b border-[var(--color-splitter)] px-5 py-5 last:border-b-0 md:grid-cols-[minmax(0,1.6fr)_minmax(12rem,0.9fr)_minmax(14rem,1fr)] md:gap-6">
            <div>
              <h3 className="font-bold">{area.title[language]}</h3>
              <p className="mt-2 text-sm leading-7 opacity-75">{area.capability[language]}</p>
            </div>

            <div>
              <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-wider opacity-50 md:hidden">{language === 'ja' ? '根拠' : 'Evidence'}</p>
              <p className="text-sm leading-7 opacity-75">{area.evidence[language]}</p>
            </div>

            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider opacity-50 md:hidden">{language === 'ja' ? '技術' : 'Technologies'}</p>
              <div className="flex flex-wrap gap-2">
                {area.tags.map((tag) => {
                  const projectCount = projectTagCounts[tag] ?? 0;
                  const isActive = activeTag === tag;

                  if (projectCount === 0) {
                    return <span key={tag} className="rounded border border-[var(--color-splitter)] px-2.5 py-1 font-mono text-xs opacity-65">{tag}</span>;
                  }

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onSelectProjectTag(tag)}
                      aria-pressed={isActive}
                      aria-label={language === 'ja' ? `${tag}を使用した${projectCount}件のプロジェクトを表示` : `Show ${projectCount} ${projectCount === 1 ? 'project' : 'projects'} using ${tag}`}
                      className="rounded border px-2.5 py-1 font-mono text-xs transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={isActive
                        ? { background: 'var(--color-cli-text)', color: 'var(--color-cli-bg)', borderColor: 'var(--color-cli-text)' }
                        : { color: 'var(--color-text)', borderColor: 'var(--color-splitter)', opacity: 0.72 }}
                    >
                      {tag} · {projectCount}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>

      {activeTag && (
        <button type="button" onClick={onClearProjectTag} className="mt-5 text-xs underline underline-offset-4 opacity-65 hover:opacity-100">
          {language === 'ja' ? '絞り込みを解除' : 'Clear filter'} ✕
        </button>
      )}
    </section>
  );
}
