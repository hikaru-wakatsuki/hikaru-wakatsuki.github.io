import { useAppState } from '../../../context/AppStateContext';

interface SkillArea {
  id: string;
  title: { ja: string; en: string };
  experience: { ja: string[]; en: string[] };
  evidence: { ja: string[]; en: string[] };
  tags: string[];
}

const SKILL_AREAS: SkillArea[] = [
  {
    id: 'backend',
    title: { ja: 'Pythonバックエンド・業務アプリ', en: 'Python backend & business applications' },
    experience: {
      ja: [
        '要件を処理フローと入出力仕様に分解し、Pythonで実装・評価・リリースまで担当',
        'JSONベースの構造化データ、Pydanticによる入力検証、異常系とフォールバックを含む処理を設計',
        'LLM処理を関数選択・引数生成・スキーマ検証に分離し、機械可読な出力を生成',
      ],
      en: [
        'Translate requirements into processing flows and I/O contracts, then implement, evaluate and release Python applications',
        'Design JSON data flows with Pydantic validation, explicit error handling and fallback behavior',
        'Separate LLM function selection, argument generation and schema validation to produce machine-readable output',
      ],
    },
    evidence: { ja: ['NECでのPython業務アプリ開発', 'Call Me Maybe：制約付きFunction Calling'], en: ['Python business-application development at NEC', 'Call Me Maybe: constrained function calling'] },
    tags: ['Python', 'JSON', 'Pydantic', 'LLM'],
  },
  {
    id: 'infrastructure-data',
    title: { ja: 'データベース・インフラ', en: 'Database & infrastructure' },
    experience: {
      ja: [
        '通信事業者向け基幹システムで、Linux・Azure・データベースの設計、構築、移行を経験',
        'ログ・構成・リソース使用状況から障害と性能劣化を切り分け、影響と対応方針を整理',
        'DockerとBashを使って、実行条件を再現できる開発・検証環境を整備',
      ],
      en: [
        'Design, build and migrate Linux, Azure and database environments for telecom mission-critical systems',
        'Investigate incidents and performance degradation from logs, configuration and resource usage',
        'Prepare reproducible development and verification environments with Docker and Bash',
      ],
    },
    evidence: { ja: ['NEC：約4年間の通信基盤業務'], en: ['NEC: around four years in telecom infrastructure'] },
    tags: ['PostgreSQL', 'MySQL', 'Linux', 'Azure', 'Docker', 'Bash'],
  },
  {
    id: 'engineering-cs',
    title: { ja: '並行処理・信頼性', en: 'Concurrency & reliability' },
    experience: {
      ja: [
        'POSIX threadsで共有状態の保護範囲を分け、グローバルなmutex取得順序で循環待ちを防止',
        'バイナリmin-heapを用いたFIFO/EDF優先度制御と、完了・タイムアウトを判定する監視スレッドを実装',
        'ブラックボックステストで状態遷移、資源取得回数、ログの単調性を検証',
      ],
      en: [
        'Partition shared state across mutexes and prevent circular wait through global lock ordering in POSIX threads',
        'Implement FIFO/EDF priority control with a binary min-heap plus monitoring for completion and timeout',
        'Validate state transitions, acquisition counts and monotonic logs through black-box tests',
      ],
    },
    evidence: { ja: ['Codexion：共有資源とスケジューリング'], en: ['Codexion: shared resources and scheduling'] },
    tags: ['C', 'POSIX', 'Algorithms'],
  },
  {
    id: 'algorithms-modelling',
    title: { ja: 'アルゴリズム・データモデル', en: 'Algorithms & data modelling' },
    experience: {
      ja: [
        'ドメインデータをグラフにモデル化し、Dijkstra型重み付き探索、混雑時の再探索、容量予約を実装',
        'DFS/BFSによる迷路生成と最短経路復元、シードによる決定的な再現を実装',
        '壁を4ビットで表現し、隣接関係、外周、木構造などの不変条件をテスト',
      ],
      en: [
        'Model domain data as graphs and implement weighted Dijkstra-style routing, congestion rerouting and capacity reservation',
        'Implement DFS/BFS maze generation, shortest-path reconstruction and seeded reproducibility',
        'Encode walls in four bits and test adjacency, boundary and tree invariants',
      ],
    },
    evidence: { ja: ['Fly-in：容量制約付きルーティング', 'A-Maze-ing：生成・探索・ビット表現'], en: ['Fly-in: capacity-aware routing', 'A-Maze-ing: generation, search and bit encoding'] },
    tags: ['Python', 'Pydantic', 'Algorithms'],
  },
  {
    id: 'collaboration-delivery',
    title: { ja: '共同開発・品質確保・公開', en: 'Collaboration, quality & delivery' },
    experience: {
      ja: [
        '入出力契約を先に合意し、生成エンジンと可視化を分担。Gitの小さなブランチを継続的に統合',
        '実装行をなぞるテストではなく、外部挙動、異常系、構造的な不変条件をUnit/Integration Testで検証',
        'コアロジックのPythonパッケージ化、静的ビルド、GitHub ActionsからGitHub Pagesへの自動デプロイを経験',
      ],
      en: [
        'Agree on I/O contracts, split generator and visualizer ownership, and integrate small Git branches frequently',
        'Test observable behavior, error cases and structural invariants with unit and integration tests',
        'Package reusable Python logic and automate static deployment from GitHub Actions to GitHub Pages',
      ],
    },
    evidence: { ja: ['A-Maze-ing：2名の共同開発', '42 Tokyoの各リポジトリ / このサイト'], en: ['A-Maze-ing: two-person collaboration', '42 Tokyo repositories / this site'] },
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
          ? '技術名の羅列ではなく、業務と公開コードで説明できる設計・実装・検証の経験を整理しています。件数付きの技術を選ぶと、根拠となるプロジェクトを確認できます。'
          : 'This section connects engineering experience to evidence from professional work and public code. Select a technology with a project count to inspect the supporting projects.'}
      </p>

      <div className="overflow-hidden rounded border border-[var(--color-splitter)]">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(12rem,0.9fr)_minmax(14rem,1fr)] gap-6 border-b border-[var(--color-splitter)] bg-[var(--color-cli-bg)] px-5 py-3 text-xs font-bold uppercase tracking-wider opacity-65 lg:grid">
          <span>{language === 'ja' ? '設計・実装・検証の経験' : 'Engineering experience'}</span>
          <span>{language === 'ja' ? '実績・根拠' : 'Evidence'}</span>
          <span>{language === 'ja' ? '技術' : 'Technologies'}</span>
        </div>

        {SKILL_AREAS.map((area) => (
          <article key={area.id} className="grid gap-5 border-b border-[var(--color-splitter)] px-5 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.6fr)_minmax(12rem,0.9fr)_minmax(14rem,1fr)] lg:gap-6">
            <div>
              <h3 className="font-bold">{area.title[language]}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 opacity-75">
                {area.experience[language].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div>
              <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-wider opacity-50 lg:hidden">{language === 'ja' ? '実績・根拠' : 'Evidence'}</p>
              <ul className="space-y-2 text-sm leading-6 opacity-75">
                {area.evidence[language].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider opacity-50 lg:hidden">{language === 'ja' ? '技術' : 'Technologies'}</p>
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
