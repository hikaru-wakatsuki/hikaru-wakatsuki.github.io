import { useAppState } from '../../../context/AppStateContext';

const COPY = {
  ja: {
    company: '日本電気株式会社（NEC）',
    tenure: '2022.04 — 現在',
    lead: '基盤の設計・移行から、Python・生成AIアプリの開発へ。',
    summary: '通信事業者向けの基幹システムで約4年、Linux・Azure・データベースの設計、構築、移行、障害・性能調査を経験。現在はPythonと生成AI APIを使った業務アプリケーションを開発し、処理設計から実装・評価・リリースまで担当しています。',
    strengthsTitle: '開発で活かせる強み',
    strengths: [
      { title: '設計からリリースまで進める', body: '曖昧な要件を処理フローとデータ構造に落とし込み、実装・評価・配布まで一貫して担当。' },
      { title: '失敗時の動作まで設計する', body: 'LLMの構造化出力を検証し、API障害時には既存検索へ切り替え。人が確認できる導線も実装。' },
      { title: '既存コードと基盤を読み解く', body: '依存関係を整理して共通モジュールを切り出し、運用・ネットワーク・DBの知見を開発に活用。' },
    ],
    experienceTitle: '主な業務・実績',
    jobs: [
      {
        date: '2026.04 — 現在', title: 'Python・生成AIによる業務アプリケーション開発',
        tags: ['Python', 'Generative AI', 'JSON', 'Docker', 'PowerShell'],
        points: [
          '自動化ツールの登録・検索・推薦アプリを主担当として開発。自然言語の要件整理 → 候補抽出 → ランキングの3段階LLMパイプラインを設計・実装。',
          'LLM通信を既存コードから独立させ、責務ごとにリファクタリング。JSON出力の検証、例外処理、操作ログ、API利用不可時の検索フォールバックを実装・検証。',
          '入力の具体性を変えて推薦結果を評価し、利用できる範囲と限界を確認。品質を確認した機能に絞り、約100名を利用対象とする環境へリリース。',
          '2名で議事録から担当者・期限・アクション・根拠を抽出するWebアプリを開発・リリース。JSONと画面表示の連携、不具合調査、Docker環境の整備を担当。',
        ],
      },
      {
        date: '2025.04 — 2026.04頃', title: 'プライベートクラウドへの移行',
        tags: ['Linux', 'KVM', 'PostgreSQL', 'Shell'],
        points: [
          'そのまま移行できない旧OSの互換性を、Rocky Linux上のKVM構成で維持。ネットワークとデータベースの移行を実施。',
          '転送・疎通確認をスクリプト化し、限られた週末の移行時間に対応。作業者との日程・進捗・課題管理と顧客報告を担当。',
        ],
      },
      {
        date: '2024.01 — 2025.03', title: 'OS更改・EOL対応の設計と移行',
        tags: ['RHEL', 'Middleware', 'Network'],
        points: [
          'RHELの世代更新に伴うミドルウェア・アプリケーションの互換性を調査。一律更新が難しい条件に対し、機能移設やProxy構成などの選択肢を比較。',
          '制約と運用要件を整理して顧客の判断を支援し、設計・構築・移行と課題管理を担当。',
        ],
      },
      {
        date: '2022.08頃 — 2023.12', title: '通信事業者向け基幹システムのAzureクラウドリフト',
        tags: ['Azure', 'Linux', 'Database', 'Shell'],
        points: [
          '料金・精算システムのオンプレミスからAzureへの移行に参画。約10名のチームで基本・詳細設計、構築・試験、Shell改修、切り替え、障害・性能調査を担当。',
          '既存の設定と運用要件を調査し、ネットワーク・ストレージ・バックアップ・DRを設計。NIC数の制約では代替構成を比較し、要件とコストを踏まえた判断を支援。',
        ],
      },
    ],
    learningTitle: '42Tokyoでのソフトウェア開発',
    learningDate: '2025.10 — 現在 · Piscine参加者の上位5%',
    learning: [
      'Python：ローカルLLMのFunction Callingで関数選択と引数生成を分離し、制約付き生成・Pydantic検証・統合テストを実装。',
      'チーム開発：2名で迷路生成・可視化を開発。入出力を合意して分担し、再利用可能なPythonパッケージとして整理。Gitで変更を統合。',
      'C：POSIX threadsで競合、デッドロック、飢餓、公平性を検討。mutexの取得順序やFIFO・EDFスケジューリングを実装。',
    ],
    credentialsTitle: '資格',
    credentials: ['基本情報技術者（2022）', 'Azure Fundamentals / AZ-900（2023）', '応用情報技術者（2024）', 'Azure Administrator / AZ-104（2025）', 'AWS Cloud Practitioner（2025）'],
    educationTitle: '学歴・研究',
    education: '千葉大学 工学部 画像科学科 卒業（2020）／千葉大学大学院 融合理工学府 修士課程 修了（2022）。電気化学会 論文賞（2023）。',
  },
  en: {
    company: 'NEC Corporation', tenure: 'Apr 2022 — Present',
    lead: 'From infrastructure design and migration to Python and generative AI applications.',
    summary: 'Around four years designing, building and migrating Linux, Azure and database infrastructure for mission-critical telecom systems, including incident and performance investigations. Now developing business applications with Python and generative AI APIs, from processing design and implementation through evaluation and release.',
    strengthsTitle: 'What I bring to development',
    strengths: [
      { title: 'Deliver from design to release', body: 'Translate broad requirements into processing flows and data structures, then implement, evaluate and distribute the application.' },
      { title: 'Design for failure', body: 'Validate structured LLM output, fall back to existing search during API failures, and include human review before registration.' },
      { title: 'Understand code and infrastructure', body: 'Untangle dependencies and extract reusable modules, informed by hands-on operations, networking and database experience.' },
    ],
    experienceTitle: 'Selected professional experience',
    jobs: [
      {
        date: 'Apr 2026 — Present', title: 'Python and generative AI business applications',
        tags: ['Python', 'Generative AI', 'JSON', 'Docker', 'PowerShell'],
        points: [
          'Primary developer of an automation-tool registration, search and recommendation application. Designed a three-stage LLM pipeline: requirement structuring, candidate selection and ranking.',
          'Extracted LLM communication into an independent module and refactored by responsibility. Implemented and verified JSON validation, exception handling, action logs and fallback search when the API is unavailable.',
          'Evaluated recommendations across different levels of input detail to establish their useful range and limitations. Released quality-verified features to an environment intended for approximately 100 users.',
          'Developed and released a meeting action-extraction web app in a two-person team. Owned JSON-to-display integration, debugging and Docker environment setup.',
        ],
      },
      {
        date: 'Apr 2025 — Around Apr 2026', title: 'Private cloud migration', tags: ['Linux', 'KVM', 'PostgreSQL', 'Shell'],
        points: [
          'Preserved legacy OS compatibility using KVM on Rocky Linux when direct migration was not possible. Implemented network and database migration.',
          'Scripted transfers and connectivity checks for a limited weekend migration window. Coordinated schedules, progress, issues and customer reporting with operators.',
        ],
      },
      {
        date: 'Jan 2024 — Mar 2025', title: 'OS refresh and end-of-life response', tags: ['RHEL', 'Middleware', 'Network'],
        points: [
          'Investigated middleware and application compatibility across RHEL versions. Compared function relocation and proxy configurations where a uniform upgrade was impractical.',
          'Clarified constraints and operational requirements to support customer decisions, then handled design, build, migration and issue management.',
        ],
      },
      {
        date: 'Around Aug 2022 — Dec 2023', title: 'Azure cloud lift for mission-critical telecom systems', tags: ['Azure', 'Linux', 'Database', 'Shell'],
        points: [
          'Migrated billing and settlement infrastructure from on-premises to Azure in a team of approximately 10. Handled design, build, testing, Shell changes, cutover and incident/performance investigations.',
          'Mapped existing settings and operational needs to network, storage, backup and DR designs. Compared alternatives for NIC constraints to support requirement and cost decisions.',
        ],
      },
    ],
    learningTitle: 'Software development at 42Tokyo',
    learningDate: 'Oct 2025 — Present · Top 5% of Piscine participants',
    learning: [
      'Python: separated function selection and argument generation for local LLM function calling; implemented constrained generation, Pydantic validation and integration tests.',
      'Team development: built maze generation and visualization with a partner, agreed input/output contracts, packaged reusable Python functionality and integrated changes with Git.',
      'C: explored contention, deadlocks, starvation and fairness using POSIX threads; implemented mutex lock ordering and FIFO/EDF scheduling.',
    ],
    credentialsTitle: 'Certifications',
    credentials: ['Fundamental Information Technology Engineer (2022)', 'Azure Fundamentals / AZ-900 (2023)', 'Applied Information Technology Engineer (2024)', 'Azure Administrator / AZ-104 (2025)', 'AWS Cloud Practitioner (2025)'],
    educationTitle: 'Education & research',
    education: 'B.Eng., Image Science, Chiba University (2020). Master’s degree, Graduate School of Science and Engineering, Chiba University (2022). Electrochemical Society of Japan Paper Award (2023).',
  },
};

export default function CareerContainer() {
  const { language } = useAppState();
  const copy = COPY[language];

  return (
    <div className="p-5 sm:p-8 space-y-9">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <p className="font-bold text-lg">{copy.company}</p>
          <p className="font-mono text-xs opacity-65">{copy.tenure}</p>
        </div>
        <p className="text-xl sm:text-2xl font-bold leading-relaxed max-w-3xl">{copy.lead}</p>
        <p className="mt-4 text-sm leading-7 opacity-80 max-w-4xl">{copy.summary}</p>
      </div>

      <div>
        <h3 className="font-bold mb-4">{copy.strengthsTitle}</h3>
        <div className="grid lg:grid-cols-3 gap-3">
          {copy.strengths.map((strength, index) => (
            <div key={strength.title} className="p-4 rounded border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
              <p className="font-mono text-xs opacity-50 mb-3">0{index + 1}</p>
              <h4 className="font-bold text-sm mb-2">{strength.title}</h4>
              <p className="text-sm leading-6 opacity-75">{strength.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-5">{copy.experienceTitle}</h3>
        <div className="space-y-7">
          {copy.jobs.map((job) => (
            <article key={job.title} className="border-l-2 border-[var(--color-splitter)] pl-4 sm:pl-6">
              <p className="font-mono text-xs opacity-65 mb-2">{job.date}</p>
              <h4 className="font-bold leading-7">{job.title}</h4>
              <div className="flex flex-wrap gap-2 my-3">
                {job.tags.map((tag) => <span key={tag} className="font-mono text-xs px-2 py-1 rounded border border-[var(--color-splitter)]">{tag}</span>)}
              </div>
              <ul className="list-disc pl-4 space-y-2 text-sm leading-7 opacity-80">
                {job.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-splitter)] pt-6">
        <h3 className="font-bold">{copy.learningTitle}</h3>
        <p className="font-mono text-xs opacity-65 mt-2 mb-4">{copy.learningDate}</p>
        <ul className="list-disc pl-4 space-y-2 text-sm leading-7 opacity-80">
          {copy.learning.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 border-t border-[var(--color-splitter)] pt-6">
        <div>
          <h3 className="font-bold mb-3">{copy.credentialsTitle}</h3>
          <ul className="space-y-2 text-sm leading-6 opacity-80">
            {copy.credentials.map((credential) => <li key={credential}>{credential}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">{copy.educationTitle}</h3>
          <p className="text-sm leading-7 opacity-80">{copy.education}</p>
        </div>
      </div>
    </div>
  );
}
