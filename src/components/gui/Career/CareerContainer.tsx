import { useAppState } from '../../../context/AppStateContext';

const PAPER_URL = 'https://www.jstage.jst.go.jp/article/electrochemistry/90/4/90_22-00006/_article/-char/ja';
const AWARD_URL = 'https://www.electrochem.jp/post_news/5137/';

const COPY = {
  ja: {
    sections: [
      {
        institution: '千葉大学大学院',
        period: '2020年4月〜2022年3月（修了）',
        headline: '研究成果を論文にまとめ、電気化学会論文賞を受賞。',
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
        headline: 'Python・生成AIの業務アプリを、設計からリリースまで。',
        points: [
          '2026年4月から業務アプリ開発を担当。自動化ツールの登録・検索・推薦アプリを主担当として開発し、3段階のLLM処理、出力検証、API障害時の検索フォールバックを実装・検証。約100名を利用対象とする環境へリリースしました。',
          '2名で議事録から担当者・期限・アクションを抽出するWebアプリを開発・リリース。JSONと画面表示の連携、不具合調査、Docker環境整備を担当しました。',
          'それ以前は約4年、通信基盤のLinux・Azure・DBの設計、構築、移行、障害・性能調査を経験。運用まで考えたアプリ開発に活かしています。',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: '2025年10月〜現在',
        headline: 'C・Pythonで仕組みを理解し、チームで実装する。',
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
        headline: 'Published research recognized with an electrochemistry paper award.',
        points: [
          'Studied optical devices using silver nanoparticles and manganese oxide in the Graduate School of Science and Engineering, exploring color changes and color retention without power.',
          'Co-authored a paper in Electrochemistry (2022), which received the 2023 Electrochemical Society of Japan Paper Award.',
        ],
        education: { label: 'Chiba University — B.Eng., Image Science', period: 'Apr 2016 — Mar 2020 · Graduated' },
        links: [{ label: 'Co-authored paper (J-STAGE)', url: PAPER_URL }, { label: 'Official award announcement', url: AWARD_URL }],
      },
      {
        institution: 'NEC Corporation', period: 'Apr 2022 — Present',
        headline: 'Python and generative AI applications, from design to release.',
        points: [
          'Developing business applications since Apr 2026. Primary developer of automation-tool registration, search and recommendation software: implemented and verified a three-stage LLM pipeline, output validation and fallback search during API failures. Released to an environment intended for approximately 100 users.',
          'Developed and released a meeting action-extraction web app with a partner. Owned JSON-to-display integration, debugging and Docker environment setup.',
          'Previously spent around four years designing, building and migrating Linux, Azure and database infrastructure for telecom systems, including incident and performance investigations. This experience informs operationally aware application development.',
        ],
        links: [],
      },
      {
        institution: '42 Tokyo', period: 'Oct 2025 — Present',
        headline: 'Understand systems with C and Python; build collaboratively.',
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

  return (
    <div className="p-5 sm:p-8">
      <div className="space-y-6">
        {copy.sections.map((section) => (
          <article key={section.institution} className="rounded border border-[var(--color-splitter)] p-5 sm:p-6">
            <header className="mb-4">
              <h3 className="font-bold text-sm tracking-wide">{section.institution}</h3>
              <p className="font-mono text-xs opacity-65 mt-2">{section.period}</p>
              <h4 className="font-bold text-lg sm:text-xl leading-relaxed mt-4">{section.headline}</h4>
            </header>
            <ul className="list-disc pl-4 space-y-2 text-sm leading-7 opacity-80">
              {section.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            {'education' in section && section.education && (
              <div className="mt-4 pt-4 border-t border-[var(--color-splitter)] text-sm">
                <p className="font-bold">{section.education.label}</p>
                <p className="font-mono text-xs opacity-65 mt-2">{section.education.period}</p>
              </div>
            )}
            {section.links.length > 0 && (
              <div className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-sm underline underline-offset-4 hover:opacity-70">
                    <span>{link.label} ↗</span>
                    <span className="block mt-1 font-mono text-xs break-all opacity-65">{link.url}</span>
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-[var(--color-splitter)]">
        <h3 className="font-bold mb-3">{copy.credentialsTitle}</h3>
        <ul className="flex flex-wrap gap-2 text-xs leading-6">
          {copy.credentials.map((credential) => <li key={credential} className="rounded border border-[var(--color-splitter)] px-3 py-1">{credential}</li>)}
        </ul>
      </div>
    </div>
  );
}
