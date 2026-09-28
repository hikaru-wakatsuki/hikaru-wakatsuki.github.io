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
          'RPA・自動化ツールの登録・検索・推薦アプリを担当。大枠の機能要件と画面案から、処理フロー、JSONデータ項目、LLM処理を設計し、実装、評価、リリースまでを主担当として実施。',
          '検索・推薦処理を、利用者の要求整理、候補抽出、順位付けの3段階に分割。LLM通信の共通化、生成AI API障害時のフォールバック、想定外のJSON出力に対する例外処理を実装。',
          '会議記録からAction情報を抽出するWebアプリを2名で開発。データ構造とJSONインターフェースの検討、Pythonクラスと画面表示の連携、JavaScriptの不具合修正、Docker環境整備を担当。',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: '2025年10月〜現在',
        points: [
          '入学選考Piscineでは、合格者の中で上位成績。',
          '入学後の各課題では、必須要件と発展的なBonus要件をすべて実装。Peer Reviewも減点なく通過し、設計意図と実装内容を自分の言葉で説明できる状態で課題を完了。',
          'C・Pythonを用いた課題を通じて、アルゴリズム、並行処理、グラフ探索、ローカルLLM、Git・GitHubによる共同開発を継続して実践。',
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
          'Owned an RPA and automation-tool registration, search and recommendation application. Starting from high-level functional requirements and screen designs, defined the processing flow, JSON data fields and LLM processing, then led implementation, evaluation and release.',
          'Split search and recommendation into three stages: user-requirement structuring, candidate extraction and ranking. Implemented shared LLM communication, fallback behavior for generative-AI API failures and exception handling for unexpected JSON output.',
          'Co-developed a web application that extracts action items from meeting records. Owned data-structure and JSON-interface design, Python-to-UI integration, JavaScript bug fixes and Docker environment setup.',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: 'Oct 2025 — Present',
        points: [
          'Placed among the top successful candidates in the admissions Piscine.',
          'Since admission, implemented every required and advanced Bonus requirement. Passed peer reviews without deductions and completed each project able to explain its design decisions and implementation in my own words.',
          'Continued hands-on practice in algorithms, concurrency, graph search, local LLMs and collaborative development with Git and GitHub through projects in C and Python.',
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
      points: [], links: [], badge: undefined, badgeTone: undefined,
    },
    {
      institution: graduate.institution, period: graduate.period,
      title: ja ? '融合理工学府 先進理化学専攻 物質科学コース · 修士' : 'Graduate School of Science and Engineering · Master’s',
      points: graduate.points, links: graduate.links, badge: undefined, badgeTone: undefined,
    },
    {
      institution: nec.institution,
      period: ja ? '2022年4月〜2026年3月' : 'Apr 2022 — Mar 2026',
      title: ja ? 'インフラエンジニア' : 'Infrastructure Engineer',
      points: ja ? [
        'Azureクラウドリフト、RHEL 6から8へのOS・ミドルウェア更改、プライベートクラウド移行を担当。基本・詳細設計、構築、試験、移行、障害・性能調査を経験。',
        'Azureの外向き通信方式変更では、複数案を比較してNAT Gatewayを提案。RHEL 6・8の検証環境を構築し、PoCから本番導入まで主担当として実施。',
        'プライベートクラウド移行では、KVM上に既存のRHEL 6環境を維持。PostgreSQLの移行方法を検証し、限られた作業時間に収めるためのスクリプトと移行手順を作成。',
      ] : [
        'Owned an Azure cloud lift, a RHEL 6-to-8 OS and middleware upgrade, and a private-cloud migration. Worked across basic and detailed design, build, testing, migration, and incident and performance investigation.',
        'For an Azure outbound-connectivity change, compared multiple approaches and proposed NAT Gateway. Built RHEL 6 and 8 test environments and led the work from PoC through production deployment.',
        'For a private-cloud migration, preserved the existing RHEL 6 environment on KVM. Validated the PostgreSQL migration method and created scripts and procedures to complete the work within a limited migration window.',
      ],
      links: [], badge: undefined, badgeTone: undefined,
    },
    {
      institution: nec.institution,
      period: ja ? '2026年4月〜現在' : 'Apr 2026 — Present',
      title: ja ? 'Python・生成AIを用いた業務アプリケーション開発' : 'Business application development with Python and generative AI',
      points: nec.points, links: [],
      badge: ja ? '現在の担当' : 'Current role',
      badgeTone: 'current',
    },
    {
      institution: tokyo.institution, period: tokyo.period,
      title: ja ? 'C・Python・チーム開発（NEC在籍中に受講）' : 'C, Python & team development alongside NEC',
      points: tokyo.points, links: [],
      badge: ja ? 'NEC在籍中の並行学習' : 'Alongside full-time role at NEC',
      badgeTone: 'parallel',
    },
  ];

  return (
    <div className="p-5 sm:p-8">
      <ol className="divide-y divide-[var(--color-splitter)]" aria-label={ja ? '学歴・職歴・学習歴' : 'Education, employment and learning history'}>
        {history.map((entry) => (
          <li key={`${entry.institution}-${entry.title}`} className="grid gap-3 py-6 first:pt-0 last:pb-0 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6">
            <p className="font-mono text-xs font-bold leading-6 lg:whitespace-nowrap lg:text-sm lg:leading-7">{entry.period}</p>
            <div className="min-w-0 border-l border-[var(--color-splitter)] pl-4 sm:pl-6">
              {entry.badge && (
                <span
                  className="mb-2 inline-block rounded border px-2 py-0.5 text-[0.65rem] font-bold tracking-wide"
                  style={entry.badgeTone === 'parallel'
                    ? { borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)', background: 'var(--color-accent-secondary-soft)' }
                    : { borderColor: 'var(--color-cli-text)', color: 'var(--color-cli-text)', background: 'var(--color-accent-soft)' }}
                >
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
