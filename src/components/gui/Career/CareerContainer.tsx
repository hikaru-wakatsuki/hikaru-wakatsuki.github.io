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
          'Pythonで業務アプリケーションの処理設計・実装・評価を担当。LLMを利用した処理、JSON出力検証、API障害時の検索フォールバックを実装し、利用部門向けの環境へリリースしました。',
          'Pythonを用いた業務Webアプリをチームで開発・リリース。JSONと画面表示の連携、不具合調査、Docker環境整備を担当しました。',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: '2025年10月〜現在',
        points: [
          'Piscineを修了。C・Python、アルゴリズム、並行処理、Git・Peer Reviewを継続的に学習しています。',
          'ローカルLLMのFunction Callingで、関数選択、スキーマに従うJSON引数生成、生成引数の型照合、実モデルを使う統合テストを実装しました。2名の迷路開発では、生成・探索部分を担当し、Pythonパッケージに分離しました。',
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
          'Design, implementation and evaluation of Python business-application logic. Implemented LLM-assisted processing, JSON output validation and fallback search for API failures, then released the application to an internal user environment.',
          'Developed and released a Python business web application with a team. Owned JSON-to-display integration, debugging and Docker environment setup.',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: 'Oct 2025 — Present',
        points: [
          'Completed the Piscine. Continuing study of C, Python, algorithms, concurrency, Git and peer review.',
          'Implemented local LLM function calling with constrained function selection, schema-guided JSON argument generation, generated-argument type checks and real-model integration tests. In a two-person maze project, owned generation and search, then separated that logic into a reusable Python package.',
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
      points: [ja ? '約4年、通信基盤のLinux・Azure・DBの設計、構築、移行、障害・性能調査を担当。Azureクラウドリフト、OS更改、プライベートクラウド移行を経験しました。' : 'Around four years designing, building and migrating Linux, Azure and database infrastructure for telecom systems, including incident/performance investigations, Azure cloud lift, OS refresh and private cloud migration.'],
      links: [], badge: undefined, badgeTone: undefined,
    },
    {
      institution: nec.institution,
      period: ja ? '2026年4月〜現在' : 'Apr 2026 — Present',
      title: ja ? 'Pythonアプリケーション開発' : 'Python application development',
      points: nec.points.slice(0, 2), links: [],
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
      <h3 className="font-bold text-xl sm:text-2xl leading-relaxed mb-8">
        {ja ? '2022年にNEC入社。通信基盤開発を約4年経験し、2026年4月からPython業務アプリの設計・実装・評価・リリースを担当。' : 'Joined NEC in 2022, worked on telecom infrastructure for around four years, and moved into Python business-application design, implementation, evaluation and release in April 2026.'}
      </h3>
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
