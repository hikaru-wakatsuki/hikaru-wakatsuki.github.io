import { useAppState } from '../../../context/AppStateContext';

interface SkillArea {
  id: string;
  title: { ja: string; en: string };
  summary: { ja: string; en: string };
  highlights: { ja: string[]; en: string[] };
  evidence: { ja: string; en: string };
  tags: string[];
}

interface SupportingSkill {
  title: { ja: string; en: string };
  description: { ja: string; en: string };
  evidence: string;
}

const SKILL_AREAS: SkillArea[] = [
  {
    id: 'python-applications',
    title: { ja: 'Python業務アプリケーション開発', en: 'Python business application development' },
    summary: {
      ja: '大枠の要件を処理フローと入出力へ落とし込み、実装・評価・リリースまで進められます。',
      en: 'Turn high-level requirements into processing flows and I/O contracts, then carry them through implementation, evaluation and release.',
    },
    highlights: {
      ja: [
        'JSONを用いたデータ連携、例外処理、画面表示までを一連の処理として実装',
        '登録、検索・推薦、ログ、外部通信などを責務ごとに分けて構成',
      ],
      en: [
        'Implement end-to-end flows covering JSON data exchange, exception handling and UI output',
        'Separate registration, search and recommendation, logging, and external communication by responsibility',
      ],
    },
    evidence: {
      ja: 'NEC｜RPA・自動化ツール登録／検索／推薦アプリ、Action List抽出ツール',
      en: 'NEC | RPA and automation-tool registration, search and recommendation app; Action List extraction tool',
    },
    tags: ['Python', 'JSON', 'Docker'],
  },
  {
    id: 'llm-applications',
    title: { ja: '生成AIを用いた処理設計', en: 'LLM application design' },
    summary: {
      ja: '業務上の依頼を複数段階のLLM処理へ分解し、構造化した結果を後続処理へつなげられます。',
      en: 'Break business requests into multi-stage LLM processing and connect structured results safely to downstream logic.',
    },
    highlights: {
      ja: [
        '要求の構造化、候補抽出、ランキングに分けた検索・推薦処理を設計・実装',
        'JSON形式の出力、利用前の人による確認、障害時の代替処理まで設計・実装',
      ],
      en: [
        'Design and implement search and recommendation as request structuring, candidate extraction and ranking',
        'Handle JSON output, human review before use and fallback behavior during service failure',
      ],
    },
    evidence: {
      ja: 'NEC｜生成AI業務アプリ　／　Call Me Maybe｜制約付きFunction Calling',
      en: 'NEC | Generative-AI business applications / Call Me Maybe | Constrained function calling',
    },
    tags: ['Python', 'LLM', 'JSON', 'Pydantic'],
  },
  {
    id: 'reliability-maintainability',
    title: { ja: '保守性・障害対応を考慮した実装', en: 'Maintainability and failure handling' },
    summary: {
      ja: '変更箇所と障害原因を追いやすくし、外部サービス障害時の代替経路まで実装できます。',
      en: 'Organize code so changes and failures are easier to trace, while accounting for continued operation during errors.',
    },
    highlights: {
      ja: [
        'LLM通信の共通化、責務単位のコード再構成、例外処理とログ整備を実施',
        '外部APIを利用できない状態を試験し、ルールベース検索への自動切替を実装',
      ],
      en: [
        'Centralize LLM communication and improve responsibility boundaries, exception handling and logging',
        'Test unavailable external APIs and implement automatic fallback to rule-based search',
      ],
    },
    evidence: {
      ja: 'NEC｜RPA・自動化ツール登録／検索／推薦アプリ',
      en: 'NEC | RPA and automation-tool registration, search and recommendation app',
    },
    tags: ['Python', 'LLM', 'Testing'],
  },
  {
    id: 'system-infrastructure',
    title: { ja: 'インフラを含むシステム全体の理解', en: 'System-wide infrastructure experience' },
    summary: {
      ja: 'Linux・Azure・DB・Middlewareをまたいで、設計、構築、移行、試験、障害調査を進められます。',
      en: 'Work across Linux, Azure, databases and middleware through design, build, migration, testing and troubleshooting.',
    },
    highlights: {
      ja: [
        '複数方式の比較、PoC、チームへの提案を経て、本番環境への導入まで担当',
        'ログ、設定、ネットワーク、リソース状況から問題箇所を切り分け',
      ],
      en: [
        'Compare approaches, run proofs of concept, propose a direction and deliver it to production',
        'Isolate problems using logs, configuration, networking and resource usage',
      ],
    },
    evidence: {
      ja: 'NEC｜Azure NAT Gateway導入、RHEL更改、PostgreSQL移行、Middleware障害調査',
      en: 'NEC | Azure NAT Gateway rollout, RHEL upgrade, PostgreSQL migration and middleware troubleshooting',
    },
    tags: ['Linux', 'Azure', 'PostgreSQL', 'Bash', 'Docker'],
  },
];

const SUPPORTING_SKILLS: SupportingSkill[] = [
  {
    title: { ja: '並行処理・スケジューリング', en: 'Concurrency and scheduling' },
    description: {
      ja: 'POSIX Threads、mutex、Lock ordering、FIFO／EDF、完了・期限超過の監視を実装',
      en: 'POSIX threads, mutexes, lock ordering, FIFO/EDF and completion or timeout monitoring',
    },
    evidence: 'Codexion',
  },
  {
    title: { ja: 'アルゴリズム・データモデル', en: 'Algorithms and data modelling' },
    description: {
      ja: 'グラフ探索、容量予約、混雑時の再探索、DFS／BFS、最短経路、4ビット壁表現を実装',
      en: 'Graph search, capacity reservation, congestion rerouting, DFS/BFS, shortest paths and four-bit wall encoding',
    },
    evidence: 'Fly-in / A-Maze-ing',
  },
  {
    title: { ja: '品質確保・共同開発', en: 'Quality and collaboration' },
    description: {
      ja: 'Pythonロジックのパッケージ化、単体・結合テスト、Gitでの共同開発、TypeScript／React／Astroによる本サイトの自動公開を経験',
      en: 'Package Python logic, run unit and integration tests, collaborate with Git, and automatically deploy this TypeScript, React and Astro site',
    },
    evidence: 'A-Maze-ing / Portfolio',
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

  const renderTag = (tag: string) => {
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
  };

  return (
    <section className="w-full px-5 py-8 sm:px-8" style={{ color: 'var(--color-text)' }}>
      <p className="mb-6 max-w-3xl text-sm leading-7 opacity-65">
        {language === 'ja'
          ? '業務で担える領域を4つに整理しています。各項目の実績と技術から、関連する経験・プロジェクトを確認できます。'
          : 'Four areas summarize the work I can take ownership of. Each area connects the capability to evidence and relevant technologies.'}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {SKILL_AREAS.map((area, index) => (
          <article key={area.id} className="flex flex-col rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-xs font-bold text-[var(--color-cli-text)] opacity-60">0{index + 1}</span>
              <div>
                <h3 className="font-bold leading-6">{area.title[language]}</h3>
                <p className="mt-2 text-sm font-medium leading-6">{area.summary[language]}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-[var(--color-splitter)] pt-4 text-sm leading-6 opacity-75">
              {area.highlights[language].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden="true" className="shrink-0 text-[var(--color-cli-text)]">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5">
              <p className="text-xs leading-5 opacity-55">
                <span className="mr-2 font-bold">{language === 'ja' ? '実績' : 'Evidence'}</span>
                {area.evidence[language]}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">{area.tags.map(renderTag)}</div>
            </div>
          </article>
        ))}
      </div>

      <details className="group mt-5 overflow-hidden rounded-lg border border-[var(--color-splitter)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[var(--color-cli-bg)] px-5 py-3">
          <span className="text-xs font-bold tracking-wide opacity-70">
            {language === 'ja' ? '公開コードで確認できる実装経験' : 'Implementation experience demonstrated in public code'}
          </span>
          <span className="shrink-0 font-mono text-xs opacity-60 group-open:hidden">{language === 'ja' ? '表示 ＋' : 'Show +'}</span>
          <span className="hidden shrink-0 font-mono text-xs opacity-60 group-open:inline">{language === 'ja' ? '非表示 −' : 'Hide −'}</span>
        </summary>
        <div className="grid divide-y divide-[var(--color-splitter)] border-t border-[var(--color-splitter)] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {SUPPORTING_SKILLS.map((skill) => (
            <article key={skill.evidence} className="p-5">
              <h4 className="text-sm font-bold">{skill.title[language]}</h4>
              <p className="mt-2 text-sm leading-6 opacity-70">{skill.description[language]}</p>
              <p className="mt-3 font-mono text-xs text-[var(--color-cli-text)] opacity-70">{skill.evidence}</p>
            </article>
          ))}
        </div>
      </details>

      {activeTag && (
        <button type="button" onClick={onClearProjectTag} className="mt-5 text-xs underline underline-offset-4 opacity-65 hover:opacity-100">
          {language === 'ja' ? '絞り込みを解除' : 'Clear filter'} ✕
        </button>
      )}
    </section>
  );
}
