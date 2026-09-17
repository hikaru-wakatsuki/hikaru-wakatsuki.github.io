import { useAppState } from '../../../context/AppStateContext';

const PAPER_URL = 'https://www.jstage.jst.go.jp/article/electrochemistry/90/4/90_22-00006/_article/-char/ja';
const AWARD_URL = 'https://www.electrochem.jp/post_news/5137/';

const COPY = {
  ja: {
    sections: [
      {
        institution: '千葉大学大学院',
        period: '2020年4月〜2022年3月（修了）',
        points: [
          '融合理工学府 先進理化学専攻 物質科学コースで、銀ナノ粒子と酸化マンガンを用いた光学デバイスを研究。色の変化と無給電での色保持の両立に取り組みました。',
          '学術誌「Electrochemistry」に共著論文を発表（2022年）。同論文が2023年電気化学会論文賞を受賞しました。',
        ],
        education: {
          label: '千葉大学 工学部 画像科学科',
          period: '2016年4月〜2020年3月（卒業）',
        },
        links: [{ label: '共著論文（J-STAGE）', url: PAPER_URL }, { label: '表彰・受賞者一覧（電気化学会）', url: AWARD_URL }],
      },
      {
        institution: '日本電気株式会社', period: '2022年4月〜現在',
        points: [
          'Pythonで業務アプリケーションの処理設計・実装・評価を担当。自動化ツールの登録・検索・推薦機能に、3段階のLLM処理、JSON出力検証、API障害時の検索フォールバックを実装し、約100名向けの環境へリリースしました。',
          'Pythonを用いた議事録から担当者・期限・アクションを抽出するWebアプリを2名で開発・リリース。JSONと画面表示の連携、不具合調査、Docker環境整備を担当しました。',
          'それ以前は約4年、通信基盤のLinux・Azure・DBの設計、構築、移行、障害・性能調査を経験。運用まで考えたアプリ開発に活かしています。',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: '2025年10月〜現在',
        points: [
          'Piscine参加者の上位5%。C・Python、アルゴリズム、並行処理、Git・Peer Reviewを継続的に学習しています。',
          'ローカルLLMのFunction Callingで、関数選択・引数生成、制約付き生成、Pydantic検証・統合テストを実装。2名で迷路生成・可視化を開発し、再利用可能なPythonパッケージとして整理しました。',
          'CとPOSIX threadsで競合・デッドロック・公平性を検討し、mutexの取得順序やFIFO・EDFスケジューリングを実装しました。',
        ],
        links: [],
      },
    ],
    credentialsTitle: '資格',
    credentials: ['基本情報技術者（2022）', 'Azure Fundamentals / AZ-900（2023）', '応用情報技術者（2024）', 'Azure Administrator / AZ-104（2025）', 'AWS Cloud Practitioner（2025）'],
  },
  en: {
    sections: [
      {
        institution: 'Chiba University — Graduate School',
        period: 'Apr 2020 — Mar 2022 · Master’s completed',
        points: [
          'Studied optical devices using silver nanoparticles and manganese oxide in the Graduate School of Science and Engineering, exploring color changes and color retention without power.',
          'Co-authored a paper in Electrochemistry (2022), which received the 2023 Electrochemical Society of Japan Paper Award.',
        ],
        education: { label: 'Chiba University — B.Eng., Image Science', period: 'Apr 2016 — Mar 2020 · Graduated' },
        links: [{ label: 'Co-authored paper (J-STAGE)', url: PAPER_URL }, { label: 'Official award announcement', url: AWARD_URL }],
      },
      {
        institution: 'NEC Corporation', period: 'Apr 2022 — Present',
        points: [
          'Design, implementation and evaluation of Python business-application logic. Built a three-stage LLM pipeline, JSON output validation and fallback search for API failures in an automation-tool registration, search and recommendation application; released it to an environment for approximately 100 users.',
          'Developed and released a Python web application with one teammate to extract owners, deadlines and actions from meeting notes. Owned JSON-to-display integration, debugging and Docker environment setup.',
          'Previously spent around four years designing, building and migrating Linux, Azure and database infrastructure for telecom systems, including incident and performance investigations. This experience informs operationally aware application development.',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: 'Oct 2025 — Present',
        points: [
          'Top 5% of Piscine participants. Continuing study of C, Python, algorithms, concurrency, Git and peer review.',
          'Implemented local LLM function calling with separate function selection and argument generation, constrained generation, Pydantic validation and integration tests. Built maze generation and visualization in a two-person team and packaged reusable Python functionality.',
          'Explored contention, deadlocks and fairness using C and POSIX threads; implemented mutex lock ordering and FIFO/EDF scheduling.',
        ],
        links: [],
      },
    ],
    credentialsTitle: 'Certifications',
    credentials: ['Fundamental Information Technology Engineer (2022)', 'Azure Fundamentals / AZ-900 (2023)', 'Applied Information Technology Engineer (2024)', 'Azure Administrator / AZ-104 (2025)', 'AWS Cloud Practitioner (2025)'],
  },
};

export default function CareerContainer() {
  const { language } = useAppState();
  const copy = COPY[language];
  const ja = language === 'ja';
  const [graduate, nec, tokyo] = copy.sections;
  const bachelor = graduate.education!;
  const history = [
    {
      institution: ja ? '千葉大学' : 'Chiba University',
      period: bachelor.period,
      title: ja ? '工学部 画像科学科 · 学士' : 'B.Eng., Image Science',
      points: [], links: [], badge: undefined,
    },
    {
      institution: graduate.institution, period: graduate.period,
      title: ja ? '融合理工学府 先進理化学専攻 物質科学コース · 修士' : 'Graduate School of Science and Engineering · Master’s',
      points: graduate.points, links: graduate.links, badge: undefined,
    },
    {
      institution: nec.institution,
      period: ja ? '2022年4月〜2026年3月' : 'Apr 2022 — Mar 2026',
      title: ja ? 'インフラエンジニア' : 'Infrastructure Engineer',
      points: [ja ? '約4年、通信基盤のLinux・Azure・DBの設計、構築、移行、障害・性能調査を担当。Azureクラウドリフト、OS更改、プライベートクラウド移行を経験しました。' : 'Around four years designing, building and migrating Linux, Azure and database infrastructure for telecom systems, including incident/performance investigations, Azure cloud lift, OS refresh and private cloud migration.'],
      links: [], badge: undefined,
    },
    {
      institution: nec.institution,
      period: ja ? '2026年4月〜現在' : 'Apr 2026 — Present',
      title: ja ? 'バックエンドエンジニア' : 'Backend Engineer',
      points: nec.points.slice(0, 2), links: [],
      badge: ja ? '現在の担当' : 'Current role',
    },
    {
      institution: tokyo.institution, period: tokyo.period,
      title: ja ? 'C・Python・チーム開発' : 'C, Python & collaborative development',
      points: tokyo.points, links: [], badge: undefined,
    },
  ];

  return (
    <div className="p-5 sm:p-8">
      <h3 className="font-bold text-xl sm:text-2xl leading-relaxed mb-8">
        {ja ? 'Pythonで業務アプリを設計・実装・リリース。通信基盤で培った運用視点をバックエンドへ。' : 'Designing, implementing and releasing Python business applications, backed by an infrastructure operations perspective.'}
      </h3>
      <ol className="divide-y divide-[var(--color-splitter)]" aria-label={ja ? '学歴・職歴・学習歴' : 'Education, employment and learning history'}>
        {history.map((entry) => (
          <li key={`${entry.institution}-${entry.title}`} className="grid grid-cols-[minmax(5.5rem,30%)_minmax(0,1fr)] sm:grid-cols-[14rem_minmax(0,1fr)] gap-3 sm:gap-6 py-6 first:pt-0 last:pb-0">
            <p className="font-mono text-xs sm:text-sm font-bold leading-7">{entry.period}</p>
            <div className="min-w-0 border-l border-[var(--color-splitter)] pl-3 sm:pl-6">
              {entry.badge && (
                <span className="inline-block mb-2 rounded border border-[var(--color-cli-text)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--color-cli-text)]">
                  {entry.badge}
                </span>
              )}
              <h4 className="text-base sm:text-lg font-bold leading-7">{entry.institution}</h4>
              <p className="text-sm leading-6 opacity-75 mt-1">{entry.title}</p>
              {entry.points.length > 0 && (
                <ul className="list-disc pl-4 mt-3 space-y-2 text-sm leading-7 opacity-80">
                  {entry.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              )}
              {entry.links.length > 0 && (
                <div className="mt-4 space-y-3">
                  {entry.links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-sm underline underline-offset-4 hover:opacity-70">
                      <span>{link.label} ↗</span>
                      <span className="block mt-1 font-mono text-xs break-all opacity-65">{link.url}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 pt-6 border-t border-[var(--color-splitter)]">
        <h3 className="font-bold mb-3">{copy.credentialsTitle}</h3>
        <ul className="flex flex-wrap gap-2 text-xs leading-6">
          {copy.credentials.map((credential) => <li key={credential} className="rounded border border-[var(--color-splitter)] px-3 py-1">{credential}</li>)}
        </ul>
      </div>
    </div>
  );
}
