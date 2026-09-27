import { useRef, useCallback, useEffect, useState } from 'react';
import type { PortfolioProject } from '../../../types/portfolio';
import { useAppState } from '../../../context/AppStateContext';

const PROJECTS: PortfolioProject[] = [
  {
    "id": "Call_Me_Maybe",
    "title": "Call Me Maybe",
    "description": {
      "ja": "自然言語の依頼を、ローカルLLMで実行可能な関数名と型付きJSON引数へ変換するFunction Calling実装。関数候補とスキーマから、生成中にLLMが選べる次トークンを制約します。",
      "en": "A local-LLM function-calling implementation that converts natural-language requests into an executable function name and typed JSON arguments. Function candidates and schemas constrain which next tokens the model can select during generation."
    },
    "tags": [
      "Python",
      "JSON",
      "LLM",
      "Pydantic"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Call_Me_Maybe",
    "imageUrl": "/videos/call-me-maybe-demo-poster.png",
    "videoUrl": "/videos/call-me-maybe-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "Demo · 4 / 4 schema-valid outputs",
      "en": "Demo · 4 / 4 schema-valid outputs"
    },
    "demoGuide": {
      "ja": {
        "overview": "英語UIに表示される、入力から検証までのFunction Callingパイプラインを順に追えます。",
        "cues": [
          "AVAILABLE FUNCTIONS：LLMが選択できる関数名と引数型",
          "INPUT → FUNCTION → ARGUMENTS → VALIDATION：現在の処理段階",
          "FUNCTION SELECTED：自然言語から選ばれた関数",
          "GENERATED ARGUMENTS：スキーマに従って逐次生成されるJSON",
          "SCHEMA VALIDATION / Overall progress：型検証の結果と4件全体の進捗"
        ]
      },
      "en": {
        "overview": "Follow the complete function-calling pipeline from a natural-language request to validated output.",
        "cues": [
          "AVAILABLE FUNCTIONS: candidate names and typed signatures",
          "INPUT → FUNCTION → ARGUMENTS → VALIDATION: the active pipeline stage",
          "FUNCTION SELECTED: the function chosen from the request",
          "GENERATED ARGUMENTS: JSON streamed under schema constraints",
          "SCHEMA VALIDATION / Overall progress: type checks and progress across four requests"
        ]
      }
    },
    "technicalDetails": {
      "ja": {
        "challenge": "LLMの任意出力を許すと、存在しない関数名、壊れたJSON、スキーマと異なる引数型が生成されます。関数候補と型の制約を生成時点で適用する必要がありました。",
        "design": [
          "関数選択と引数生成を2段階に分離し、入力読み込み・スキーマ・選択・生成の責務をモジュール化",
          "関数名をトークン列の候補として保持し、候補を継続できる次トークンだけを許可。共通接頭を持つ関数名は改行で終端を判定",
          "オブジェクト・配列・文字列・数値・真偽値の再帰スキーマからJSONを組み立て、キーと区切り記号はプログラム側で確定",
          "カスタムトークナイザとlru_cache付きエンコーダを実装。Promptと関数定義はPydanticで入力検証し、生成JSONはjson.loadsと選択済みスキーマに対する型照合後にFunctionCallとして返却"
        ],
        "verification": [
          "Qwen3-0.6Bの実モデルを使い、数値・文字列・真偽値・ネストオブジェクト・配列の関数選択と引数生成をIntegration Test",
          "共通接頭の関数名、数値トークンフィルタ、再帰スキーマ、トークナイザ、不正入力を決定的なUnit Testで検証"
        ],
        "limitations": [
          "数値制約はJSON数値文法全体の状態機械ではなく、最終的なjson.loadsも構文確認に使用",
          "文字列の任意なエスケープやバッチ生成、任意の外部API実行は対象外"
        ]
      },
      "en": {
        "challenge": "Post-generation validation alone cannot prevent malformed JSON or schema-incompatible argument types during generation.",
        "design": [
          "Separated function selection from argument generation to keep responsibilities explicit",
          "Constrained token generation according to the selected function schema",
          "Validated prompt and function definitions with Pydantic, parsed generated JSON, and checked parameter names and types against the selected schema"
        ],
        "verification": ["Real-model integration tests cover strings, numbers, booleans, nested objects and arrays.", "Deterministic unit tests cover shared prefixes, numeric filtering, recursive schemas, tokenization and input errors."],
        "limitations": ["Numeric filtering is not a complete JSON-number state machine; json.loads performs the final syntax check.", "Arbitrary string escaping, batched generation and execution of external APIs are outside the scope."]
      }
    }
  },
  {
    "id": "Codexion",
    "title": "Codexion",
    "description": {
      "ja": "複数のコーダーをPOSIXスレッドで動かし、2台のUSBドングルが必要なコンパイルを共有資源の競合下で制御するシミュレータ。デッドロッ回避、FIFO/EDFの優先度制御、完了・タイムアウト監視をCで実装しています。",
      "en": "A C/POSIX-thread simulator in which multiple coders compete for two USB dongles required for each compile. It implements deadlock prevention, FIFO/EDF priority control, and completion or burnout monitoring under shared-resource contention."
    },
    "tags": [
      "C",
      "POSIX",
      "Algorithms",
      "Git"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Codexion",
    "imageUrl": "/videos/codexion-demo-poster.png",
    "videoUrl": "/videos/codexion-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "デモ · デッドロックなしで完了",
      "en": "Demo · completed without deadlock"
    },
    "demoGuide": {
      "ja": {
        "overview": "表の各1行が1人のCoderです。状態、保有中のドングル、現在のコンパイル数/目標数を見ると排他制御を追えます。",
        "cues": [
          "WAITING（白）：コンパイル可能で、ドングルを待つ状態",
          "COMPILING（緑）：2台のドングルを同時保有して処理中",
          "DEBUGGING（青）/ REFACTORING（シアン）：ドングルを解放し、次の実行に向けて処理中",
          "COMPLETE（マゼンタ）：目標コンパイル数へ到達。各Coderが別々のタイミングで完了",
          "Simulation欄：Coder数、ドングル数、1回に必要な2台、目標回数、EDFスケジューラ"
        ]
      },
      "en": {
        "overview": "Each row represents one coder. Follow the state, held dongles, and current/target compile count to see synchronization in action.",
        "cues": [
          "WAITING (white): ready to compile and waiting for dongles",
          "COMPILING (green): holds two dongles while compiling",
          "DEBUGGING (blue) / REFACTORING (cyan): dongles released; temporarily unable to compile",
          "COMPLETE (magenta): the coder reached the required compile count",
          "Simulation: coder and dongle counts, two dongles per compile, target count and EDF scheduler"
        ]
      }
    },
    "technicalDetails": {
      "ja": {
        "challenge": "各Coderは隣接する2台のドングルを同時に獲得できたときだけコンパイルできます。複数スレッドが個別に資源を待つと、循環待ち、飢餓、状態更新の競合が起きうるため、取得順序と優先度を一貫させる必要がありました。",
        "design": [
          "2つのドングルをindex順に並べ、必ず小さい側からmutexを取得するグローバルなロック順序で循環待ちを除去",
          "両方のmutexを保持した状態で、所有者・クールダウン・優先待ちを確認し、2台をペアでアトミックに割り当て",
          "各ドングルにバイナリmin-heapを持たせ、FIFOは到着順、EDFはバーンアウト期限→到着順→Coder IDで優先度を決定",
          "Coderの状態、停止フラグ、完了数、ログを別々のmutexで保護し、監視スレッドが全員完了とバーンアウトを判定"
        ],
        "verification": [
          "ブラックボックステストで、不正引数、1人時のバーンアウト、FIFO/EDFの完了数、1回のコンパイルごと2回の取得ログを検証",
          "ログのタイムスタンプが単調非減少であることと出力形式を確認。収録デモでは5人全員が目標4回へ段階的に到達",
          "-Wall -Wextra -Werror -pthreadでビルド"
        ],
        "limitations": [
          "FIFO/EDFは各ドングル内の優先度であり、あらゆるタイミング条件で飢餓を防ぐ形式的保証ではない",
          "待機と監視に短いpolling sleepを用い、時刻はgettimeofdayに依存するためOSスケジューリングの影響を受ける"
        ]
      },
      "en": {
        "challenge": "Allocate two shared dongles per compile fairly while avoiding deadlock and starvation across concurrent workers.",
        "design": [
          "Used a consistent mutex acquisition order to prevent circular wait",
          "Managed FIFO/EDF waiting order with a min-heap",
          "Modelled WAITING, COMPILING, DEBUGGING, REFACTORING and COMPLETE explicitly"
        ],
        "verification": ["Black-box tests cover invalid arguments, burnout, FIFO/EDF completion, two acquisitions per compile, and monotonic log timestamps.", "The recorded simulation shows five workers progressively reaching the target without deadlock."],
        "limitations": ["Per-dongle FIFO/EDF priority is not a formal starvation-freedom proof for every timing configuration.", "Polling and gettimeofday make timing dependent on the OS scheduler and timer resolution."]
      }
    }
  },
  {
    "id": "Fly-in",
    "title": "Fly-in",
    "description": {
      "ja": "地図入力を検証済みグラフへ変換し、複数ドローンを目的地までターン単位で配車するルーティングシミュレータ。ZoneとConnectionの容量、特殊Zone、現在の混雑をコストと移動可否に反映し、経路選択と再探索を行います。",
      "en": "A turn-based routing simulator that parses map input into a validated graph and schedules multiple drones to a destination. Zone and connection capacity, special zone behavior, and current congestion feed into movement checks, route selection and rerouting."
    },
    "tags": [
      "Python",
      "Algorithms",
      "pygame",
      "Git"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/Fly-in",
    "imageUrl": "/videos/fly-in-demo-poster.png",
    "videoUrl": "/videos/fly-in-demo.mp4",
    "projectType": {
      "ja": "個人開発",
      "en": "Individual project"
    },
    "resultBadge": {
      "ja": "デモ · 容量制約内で完了",
      "en": "Demo · completed within capacity constraints"
    },
    "demoGuide": {
      "ja": {
        "overview": "上部の進捗、Zoneの色と数値、Connectionの明るさを見ると、ドローンが容量制約を守って移動する過程を追えます。",
        "cues": [
          "Turn / Arrived / Moving / Waiting：ターン数と全ドローンの進捗",
          "Zoneの「現在数 / 容量」とConnectionの「使用数 / 容量」：同時利用の上限",
          "明るいConnection：現在移動に使用中。暗いConnection：空き状態",
          "Priority（黄）：同コスト時に優先 / Restricted（薄赤）：進入に2ターン / Blocked（赤×）：通行不可",
          "Simulation Complete：到着数、完了ターン、容量違反数の最終結果"
        ]
      },
      "en": {
        "overview": "Use the progress header, zone counts and link brightness to follow capacity-safe movement through the network.",
        "cues": [
          "Turn / Arrived / Moving / Waiting: overall progress",
          "Zone and connection badges: current occupancy or usage / capacity",
          "Bright links are active; dark links are currently idle",
          "Priority (yellow): tie-break preference; Restricted (light red): two-turn entry; Blocked (red with X): unavailable",
          "Simulation Complete: arrivals, elapsed turns and capacity-violation count"
        ]
      }
    },
    "technicalDetails": {
      "ja": {
        "challenge": "初期最短路が同じでも、複数ドローンが同時に動くとZoneとConnectionの容量が競合します。さらにRestrictedは進入に2ターン、Blockedは通行不可というドメインルールがあるため、経路探索と移動スケジューリングの分離が必要でした。",
        "design": [
          "PydanticモデルでZone・Connection・Networkを構造化し、重複名/座標、未知の接続先、不正容量、到達不可能なグラフを実行前に排除",
          "隣接リストとDijkstra型探索を使い、Restricted・容量の小さいZoneにコストを加算。同コスト時はPriority Zoneを優先",
          "ターンごとにZone占有数、Connection使用数、次ターンの予約を管理し、判定後に移動を確定。Restrictedへの移動はConnection占有とZone進入の2段階で表現",
          "予定した次の移動が塞がった場合、現在のConnection使用数とZone占有数をペナルティに反映し、現在位置から1度再探索"
        ],
        "verification": [
          "メタデータ解析と不正入力、Blocked除外、到達可能性、Zoneコスト、Priorityのタイブレーク、混雑ペナルティをUnit Test",
          "Restrictedの2ターン移動、複数ドローン時のZone/Connection容量の直列化を統合的に検証",
          "デモの完了画面で、全機到着とCapacity violations: 0を確認"
        ],
        "limitations": [
          "混雑回避は現時点の局所情報を使うヒューリスティックで、最小完了ターンやグローバル最適性は保証しない",
          "進捗不能時の最大ターン制限は未実装。実機の飛行制御、通信遅延、連続空間は対象外"
        ]
      },
      "en": {
        "challenge": "Account for zone and link capacity, congestion and simultaneous drone movement in addition to path length.",
        "design": [
          "Separated weighted graph search from turn-based movement scheduling",
          "Checked zone and connection capacity before committing movement",
          "Visualized current, moving, waiting and arrived states"
        ],
        "verification": ["Tests cover parsing, blocked and unreachable graphs, weighted costs, tie-breaking, congestion penalties and restricted transit.", "Integration-style tests serialize multiple drones within zone and link capacities; the demo completes with zero violations."],
        "limitations": ["The congestion response is a local heuristic and does not guarantee globally optimal throughput.", "There is no maximum-turn guard; physical flight control, continuous space and network latency are outside scope."]
      }
    }
  },
  {
    "id": "souaoao/A-Maze-ing",
    "title": "A-Maze-ing",
    "description": {
      "ja": "設定ファイルからDFS/BFSで迷路を生成し、構造的な制約を保ったまま最短経路と圧縮した16進壁データを出力する2名のPython共同開発。本人は生成・探索アルゴリズム、4ビット壁モデル、構造制約、パッケージ化を担当しました。",
      "en": "A two-person Python project that generates mazes with DFS or BFS, preserves structural constraints, finds a shortest route, and writes compact hexadecimal wall data. My contribution covered generation and search algorithms, the four-bit wall model, structural constraints, and reusable packaging."
    },
    "tags": [
      "Python",
      "Pydantic",
      "Algorithms",
      "Git"
    ],
    "githubUrl": "https://github.com/souaoao/A-Maze-ing",
    "imageUrl": "/videos/a-maze-ing-demo-poster.png",
    "videoUrl": "/videos/a-maze-ing-demo.mp4",
    "projectType": {
      "ja": "共同開発 · 2名",
      "en": "Team project · 2 developers"
    },
    "resultBadge": {
      "ja": "再利用可能なPythonパッケージ",
      "en": "Reusable Python package"
    },
    "demoGuide": {
      "ja": {
        "overview": "上部の実行条件と凡例を確認してから、生成された迷路と最短経路をご覧ください。",
        "cues": [
          "Algorithm / Size / Seed / Perfect Maze：生成条件。同じSeedで同じ結果を再現",
          "Start（緑の円）/ Goal（赤の円）：探索の開始点と終点",
          "Shortest path（青の線）：BFSが求めた最短経路 / Visited（シアンの点）：探索済みセル",
          "中央の「42」：全4方向の壁を閉じた18セルの保護領域",
          "Shortest path / Visited cells / Generation time：経路長、探索量、生成時間。青い経路はStartからGoalへ順に表示"
        ]
      },
      "en": {
        "overview": "Read the generation settings and legend first, then follow the generated structure and shortest route.",
        "cues": [
          "Algorithm / Size / Seed / Perfect Maze: generation conditions and reproducibility",
          "Start (green circle) / Goal (red circle): search endpoints",
          "Shortest path (blue line) / Visited (cyan dot): BFS result and explored cells",
          "Central 42: an 18-cell protected region whose four walls remain closed",
          "Shortest path / Visited cells / Generation time: route length, search effort and generation time"
        ]
      }
    },
    "collaboration": {
      "ja": [
        "2名で機能を分担し、Gitで変更を管理",
        "本人はDFS/BFS、最短経路、壁の4ビット表現、パッケージ化を担当"
      ],
      "en": [
        "Split features between two developers and managed changes with Git",
        "My contribution: DFS/BFS, shortest-path search, four-bit wall encoding and packaging"
      ]
    },
    "technicalDetails": {
      "ja": {
        "challenge": "各セルの上下左右の壁をコンパクトに表現しつつ、隣接セルとの壁の整合性、閉じた外周、保護領域、3×3の完全開放禁止を守る必要がありました。さらに生成アルゴリズムと解法を分け、どの生成方式でも最短経路を求められる設計が必要でした。",
        "design": [
          "北・東・南・西の壁を1/2/4/8の4ビットで保持。通路を開く際は対象セルと隣接セルの反対側の壁を同時に更新",
          "シード付きの方向シャッフルを共通化し、再帰DFSとキューを使うBFSの2種類の生成を実装。Perfect時は木構造、Imperfect時は制約内で追加の通路を生成",
          "生成と解法を分離し、解法側はBFSで先行セルを記録。Goalから逆順に復元してN/E/S/Wの最短経路を出力",
          "コア生成処理を可視化と分離し、MazeGeneratorを再利用可能なmazegenパッケージとしてwheel/source distributionにビルド"
        ],
        "verification": [
          "同一Seedの再現性、DFS/BFSの有効な経路、隣接壁の一致、閉じた外周、Perfect Mazeの木構造をテスト",
          "Imperfect時の追加辺と3×3完全開放の防止、18セルの「42」保護、16進出力形式、復元経路がExitへ到達することを検証",
          "設定パース、範囲外座標、重複キー、不正アルゴリズム、読み込み後のグリッド/経路データも検証"
        ],
        "limitations": [
          "DFSは再帰実装のため、非常に大きな迷路ではPythonの再帰上限の影響を受ける",
          "Imperfect Mazeの追加通路はヒューリスティックで、全迷路からの一様サンプリングではない。MLX可視化は互換環境が必要"
        ]
      },
      "en": {
        "challenge": "Represent four directional walls in four bits while keeping maze-generation constraints and shortest-path search consistent.",
        "design": [
          "My contribution implemented DFS maze generation and BFS shortest-path search",
          "Encoded walls in four bits and maintained consistency between adjacent cells",
          "Packaged the contributed functionality as reusable mazegen functionality"
        ],
        "verification": ["Tests cover deterministic seeds, DFS/BFS routes, wall symmetry, closed boundaries and the perfect-maze tree invariant.", "They also cover imperfect connections, 3x3 prevention, all 18 protected cells, hexadecimal output and loaded route validation."],
        "limitations": ["Recursive DFS can reach Python's recursion limit on very large mazes.", "Imperfect-mode passages are heuristic rather than uniformly sampled; MLX visualization requires a compatible environment."]
      }
    }
  },
  {
    "id": "this-portfolio",
    "title": "This Portfolio",
    "description": {
      "ja": "経歴と技術実績を日英で伝えるポートフォリオサイト。",
      "en": "A bilingual portfolio presenting career history and engineering evidence."
    },
    "tags": [
      "TypeScript",
      "React",
      "Astro",
      "Git"
    ],
    "githubUrl": "https://github.com/hikaru-wakatsuki/hikaru-wakatsuki.github.io",
    "projectType": {
      "ja": "個人開発 · Web",
      "en": "Individual project · Web"
    },
    "resultBadge": {
      "ja": "GitHub Pages · 自動デプロイ",
      "en": "GitHub Pages · Automated deploy"
    },
    "compact": true,
    "technicalDetails": {
      "ja": {
        "challenge": "経歴と技術情報を保ちながら、採用担当が短時間で主要実績へ移動できる構成にすること。",
        "design": [
          "Astroで静的生成し、操作が必要な部分をReact・TypeScriptで実装",
          "日英切り替え、テーマ変更、技術タグによる作品絞り込みを実装"
        ],
        "verification": ["Astroのビルドと型チェックを行い、GitHub ActionsからGitHub Pagesへ自動公開。"],
        "limitations": ["静的ポートフォリオであり、問い合わせ送信以外のサーバー機能は持ちません。"]
      },
      "en": {
        "challenge": "Preserve career and technical detail while helping recruiters reach the strongest evidence quickly.",
        "design": [
          "Used Astro for static generation and React with TypeScript for interactive behavior",
          "Implemented language and theme switching plus technology-based project filtering"
        ],
        "verification": ["Runs Astro build and type checks, then deploys to GitHub Pages through GitHub Actions."],
        "limitations": ["This is a static portfolio and has no server-side features beyond contact-form submission."]
      }
    }
  }
];

export const PROJECT_TAG_COUNTS: Readonly<Record<string, number>> = Object.freeze(
  PROJECTS.reduce<Record<string, number>>((counts, project) => {
    project.tags.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
    return counts;
  }, {}),
);

// ── PortfolioCard ─────────────────────────────────────────────────────────────

interface CardProps {
  project: PortfolioProject;
  language: 'ja' | 'en';
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  onOpenVideo: (project: PortfolioProject) => void;
}

function PortfolioCard({
  project,
  language,
  activeTag,
  onTagClick,
  onOpenVideo,
}: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    videoRef.current?.play().catch(() => {
      // Autoplay may be blocked by browser policy; silently ignore
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  return (
    <article
      className={[
        'rounded-lg overflow-hidden border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        project.compact ? 'max-w-4xl' : '',
      ].join(' ')}
      style={{
        borderColor: 'var(--color-splitter)',
        background: 'var(--color-cli-bg)',
        color: 'var(--color-text)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="grid items-start gap-4 border-b border-[var(--color-splitter)] p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6">
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-snug sm:text-2xl">{project.title}</h3>
          {project.projectType && (
            <p className="mt-2 font-mono text-xs uppercase tracking-wider opacity-60">
              {project.projectType[language]}
            </p>
          )}
          <p className="mt-3 max-w-3xl text-sm leading-6 opacity-75">
            {project.description[language]}
          </p>
        </div>
        {project.resultBadge && (
          <span
            className="w-fit rounded-full border px-3 py-1 font-mono text-xs font-bold sm:whitespace-nowrap"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            {project.resultBadge[language]}
          </span>
        )}
      </div>

      {/* ── Media area ── */}
      {project.demoGuide && (
        <section className="border-b border-[var(--color-splitter)] px-5 py-4 sm:px-6">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-[var(--color-cli-text)]">
            {language === 'ja' ? 'デモ画面ガイド' : 'Demo screen guide'}
          </h4>
          <p className="mt-2 text-sm leading-6 opacity-80">{project.demoGuide[language].overview}</p>
          <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-xs leading-5 opacity-70 xl:grid-cols-2">
            {project.demoGuide[language].cues.map((cue) => (
              <li key={cue} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--color-cli-text)]">•</span>
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div
        className="relative w-full overflow-hidden"
        style={project.videoUrl
          ? { aspectRatio: '16 / 9', background: '#050505' }
          : { height: '3rem', background: 'var(--color-splitter)' }}
      >
        {project.imageUrl && !project.videoUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : !project.videoUrl ? (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm opacity-30">
            {project.title}
          </div>
        ) : null}

        {project.videoUrl && (
          <>
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={project.imageUrl}
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={`${project.title} demo`}
              className="absolute inset-0 h-full w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onOpenVideo(project)}
              aria-label={language === 'ja' ? `${project.title}のデモを拡大` : `Expand ${project.title} demo`}
              className="absolute right-3 top-3 z-10 rounded border border-white/50 bg-black/80 px-3 py-2 font-mono text-xs font-bold text-white shadow-lg hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {language === 'ja' ? 'デモを拡大 ↗' : 'Expand demo ↗'}
            </button>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {project.technicalDetails && (() => {
          const details = project.technicalDetails[language];
          return (
            <div className="grid gap-4 text-sm leading-relaxed">
              <section
                className="overflow-hidden rounded-lg border"
                style={{
                  borderColor: 'var(--color-accent-border)',
                }}
              >
                <h4 className="border-b border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-bold sm:px-5">
                  {language === 'ja' ? '解決した技術課題' : 'Engineering problem'}
                </h4>
                <p className="px-4 py-4 leading-7 text-[var(--color-text-muted)] sm:px-5">
                  {details.challenge}
                </p>
              </section>

              <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
                <h4 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-secondary-soft)] px-4 py-3 text-sm font-bold sm:px-5">
                  {language === 'ja' ? '設計判断と実装' : 'Design decisions & implementation'}
                </h4>
                <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
                  {details.design.map((item) => (
                    <li
                      key={item}
                      className="border-b border-[var(--color-splitter)] py-3 last:border-b-0"
                    >
                      <span className="block border-l-2 border-[var(--color-accent-secondary)] pl-3 leading-7">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
                  <h4 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-bold sm:px-5">
                    {language === 'ja' ? '検証内容' : 'Validation'}
                  </h4>
                  <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
                    {details.verification.map((item) => (
                      <li
                        key={item}
                        className="border-b border-[var(--color-splitter)] py-3 last:border-b-0"
                      >
                        <span className="block border-l-2 border-[var(--color-cli-text)] pl-3 leading-7">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
                  <h4 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-secondary-soft)] px-4 py-3 text-sm font-bold sm:px-5">
                    {language === 'ja' ? '設計上の制約' : 'Design boundaries'}
                  </h4>
                  <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
                    {details.limitations.map((item) => (
                      <li
                        key={item}
                        className="border-b border-[var(--color-splitter)] py-3 last:border-b-0"
                      >
                        <span className="block border-l-2 border-[var(--color-accent-secondary)] pl-3 leading-7">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          );
        })()}

        {project.collaboration && (
          <div className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider">
              {language === 'ja' ? '共同開発・本人担当' : 'Team & my contribution'}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-7 opacity-75">
              {project.collaboration[language].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className={[
                    'px-2 py-0.5 rounded text-xs font-mono border transition-all duration-150',
                    'cursor-pointer',
                    isActive ? 'font-bold' : 'opacity-60 hover:opacity-100',
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
                  aria-label={language === 'ja' ? `${tag}でプロジェクトを絞り込む` : `Filter projects by ${tag}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* GitHub link */}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit font-mono text-xs opacity-70 transition-opacity hover:underline hover:opacity-100"
            style={{ color: 'var(--color-cli-text)' }}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </article>
  );
}

function VideoModal({ project, language, onClose }: {
  project: PortfolioProject;
  language: 'ja' | 'en';
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} demo`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col sm:max-h-[calc(100vh-4rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4 text-white">
          <div>
            <p className="text-lg font-bold sm:text-2xl">{project.title}</p>
            {project.resultBadge && (
              <p className="mt-1 font-mono text-xs opacity-70">{project.resultBadge[language]}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded border border-white/50 px-3 py-2 font-mono text-xs font-bold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={language === 'ja' ? '拡大動画を閉じる' : 'Close expanded video'}
          >
            {language === 'ja' ? '閉じる ✕' : 'Close ✕'}
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded border border-white/20 bg-black">
          <video
            src={project.videoUrl}
            poster={project.imageUrl}
            controls
            autoPlay
            muted
            playsInline
            className="max-h-[calc(100vh-6.5rem)] w-full object-contain sm:max-h-[calc(100vh-9rem)]"
          />
        </div>
      </div>
    </div>
  );
}

// ── PortfolioContainer ────────────────────────────────────────────────────────

interface PortfolioContainerProps {
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
}

export default function PortfolioContainer({
  activeTag,
  onSelectTag,
  onClearTag,
}: PortfolioContainerProps) {
  // [C-3] Use language from AppStateContext so EN/JP toggle updates card descriptions
  const { language } = useAppState();

  const [expandedProject, setExpandedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    if (!expandedProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpandedProject(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [expandedProject]);

  // ── Filtered view ─────────────────────────────────────────────────────────
  const displayed = activeTag
    ? PROJECTS.filter((p) => p.tags.includes(activeTag))
    : PROJECTS.filter((p) => !p.compact);

  // Keep card-tag filtering in the Projects section so the result remains in view.
  const handleCardTagClick = useCallback((tag: string) => {
    onSelectTag(tag);
  }, [onSelectTag]);

  const projectCountLabel = language === 'ja'
    ? `${displayed.length}件のプロジェクト`
    : `${displayed.length} ${displayed.length === 1 ? 'project' : 'projects'}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      className="w-full px-5 py-8 sm:px-8"
      style={{ color: 'var(--color-text)' }}
    >
      {/* Header */}
      <div
        id="portfolio-filter-status"
        tabIndex={-1}
        aria-live="polite"
        className="flex flex-wrap items-center gap-3 mb-6 focus:outline-none"
      >
        {activeTag && (
          <span
            className="text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            {language === 'ja' ? '選択中の技術' : 'Technology'}: {activeTag}
          </span>
        )}
        <span className="font-mono text-xs opacity-60">{projectCountLabel}</span>
        {activeTag && (
          <button
            type="button"
            onClick={onClearTag}
            className="text-xs underline opacity-50 hover:opacity-100 transition-opacity ml-auto"
          >
            {language === 'ja' ? '絞り込みを解除' : 'Clear filter'} ✕
          </button>
        )}
      </div>

      <p className="mb-6 max-w-4xl text-sm leading-7 opacity-65">{language === 'ja' ? 'PythonとCで実装した4作品です。入力検証、LLMの制約付き生成、スレッド間の排他制御、容量制約付き経路探索、DFS/BFSを扱っています。' : 'Four projects implemented in Python and C, covering input validation, constrained LLM generation, thread synchronization, capacity-aware routing and DFS/BFS.'}</p>
      {/* Cards grid */}
      {displayed.length === 0 ? (
        <div className="py-12 text-center font-mono text-sm opacity-60">
          <p>
            {language === 'ja'
              ? `「${activeTag}」に対応するプロジェクトが見つかりません。`
              : `No projects match “${activeTag}”.`}
          </p>
          <button type="button" onClick={onClearTag} className="mt-3 underline underline-offset-4">
            {language === 'ja' ? 'すべてのプロジェクトを表示' : 'Show all projects'}
          </button>
        </div>
      ) : (
        <div className="grid gap-8">
          {displayed.map((project) => (
            <PortfolioCard
              key={project.id}
              project={project}
              language={language}
              activeTag={activeTag}
              onTagClick={handleCardTagClick}
              onOpenVideo={setExpandedProject}
            />
          ))}
        </div>
      )}
      {!activeTag && (
        <div className="mt-8 pt-6 border-t border-[var(--color-splitter)]">
          <h3 className="font-bold mb-3">{language === 'ja' ? 'その他42課題' : 'Other 42 projects'}</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {['Push_swap', 'get_next_line', 'printf', 'Born2beroot', 'NetPractice'].map((name) => <a key={name} href={`https://github.com/hikaru-wakatsuki/${name}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{name} ↗</a>)}
          </div>
        </div>
      )}
      {expandedProject && (
        <VideoModal
          project={expandedProject}
          language={language}
          onClose={() => setExpandedProject(null)}
        />
      )}
    </section>
  );
}
