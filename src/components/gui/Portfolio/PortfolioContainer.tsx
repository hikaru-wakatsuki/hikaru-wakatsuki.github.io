import { useRef, useCallback, useEffect, useId, useState } from 'react';
import type { PortfolioProject, ProjectTechnicalCaseStudy } from '../../../types/portfolio';
import { useAppState } from '../../../context/AppStateContext';

const PROJECTS: PortfolioProject[] = [
  {
    "id": "Call_Me_Maybe",
    "title": "Call Me Maybe",
    "description": {
      "ja": "ローカルLLMを使い、自然言語で書かれた依頼から、呼び出す関数を選び、必要な引数をJSON形式で生成するFunction Callingツール。登録済みの関数と引数型に基づいて生成内容を制限し、未登録の関数や定義と異なる型の引数を抑止。",
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
    "demoGuide": {
      "ja": {
        "cues": [
          "Available functions：この実行でLLMが選択できる登録済み関数。関数定義を追加することで候補を拡張可能",
          "Current request：現在処理しているユーザーの自然言語による依頼と、全4件中の処理位置",
          "INPUT → FUNCTION → ARGUMENTS → VALIDATION：入力受付、関数選択、引数生成、検証のうち、現在進んでいる処理段階",
          "Function selected：依頼内容からLLMが選択した関数",
          "Generated arguments：選択した関数の定義に従って生成されるJSON引数",
          "Schema validation：生成したJSONの形式と、引数名・引数型の検証結果"
        ]
      },
      "en": {
        "cues": [
          "Available functions: registered functions the LLM can select; adding definitions extends the candidates",
          "Current request: the user's natural-language request being processed and its position among four requests",
          "INPUT → FUNCTION → ARGUMENTS → VALIDATION: the active input, selection, generation, or validation stage",
          "Function selected: the function the LLM chose from the request",
          "Generated arguments: JSON arguments generated from the selected function definition",
          "Schema validation: JSON syntax, argument-name, and argument-type checks"
        ]
      }
    },
    "technicalDetails": {
      "ja": {
        "caseStudies": [
          {
            "title": "登録済みの関数だけを確実に選択",
            "challenge": "LLMに関数名を自由に生成させると、登録されていない関数名や、途中までしか一致しない名前を返す可能性がある。",
            "solution": "登録済みの候補だけから、共通部分を持つ関数名も最後まで区別して選択する仕組み。",
            "solutionSteps": [
              {
                "title": "候補の制限",
                "text": "登録済みの関数名を、あらかじめトークンIDの列へ変換。生成済みのID列と一致する候補だけを残し、次に選択できるトークンを候補内に限定。"
              },
              {
                "title": "関数名の終端判定",
                "text": "各関数名の末尾に改行トークンを追加。途中まで同じ名前でも、改行で短い関数名を確定するか、後続トークンを選んで長い関数名を生成するかを区別。"
              }
            ],
            "diagram": "function-selection"
          },
          {
            "title": "関数定義に沿ったJSON引数の生成",
            "challenge": "JSON全体をLLMに自由生成させると、波括弧やカンマの欠落、存在しない引数名、想定と異なる型の値が含まれる可能性がある。",
            "solution": "波括弧、引数名、コロン、カンマ、文字列の引用符はプログラム側で組み立て、LLMが生成する範囲を値に限定。さらに、関数定義の型に応じて生成できるトークンを制限し、JSONの構文崩れや型に合わない値の生成を抑制。完成したJSONはjson.loadsで構文を確認。",
            "diagram": "json-generation"
          },
          {
            "title": "オブジェクトと配列の入れ子を再帰処理で生成",
            "challenge": "関数ごとに引数の構造が異なり、オブジェクトや配列が複数階層に入れ子になる。階層や構造を固定した処理では、新しい関数定義や異なる引数構造に共通して対応できない。",
            "solution": "オブジェクトや配列の中身に対して同じ生成処理を再帰的に実行。文字列や数値などの値に到達した時点で、型に応じた値を生成することで、深さの異なる入れ子構造を共通の仕組みで処理。",
            "diagram": "recursive-schema"
          },
          {
            "title": "繰り返し発生するトークン変換を省略",
            "challenge": "波括弧や引数名、関数名など、同じ文字列をリクエストごとにトークンIDへ変換すると、同一の処理が繰り返される。数値生成に使用できるトークンの抽出も、毎回実行する必要がない。",
            "solution": "関数名のトークン列と、数値生成に使用できるトークンIDを起動時に計算。波括弧や引数名などの固定文字列は、初回の変換結果をキャッシュし、次回以降に再利用。LLMの生成結果はキャッシュせず、入力ごとの推論は毎回実行する構成。",
            "diagram": "precomputation"
          }
        ],
        "verification": [
          "実モデルによる一連動作：Qwen3-0.6Bを使い、自然言語の入力から関数選択、JSON引数の生成までを検証。文字列、数値、真偽値、入れ子のオブジェクト、配列で期待する結果を確認。",
          "個別機能の検証：共通部分を持つ関数名の選択、改行による名前の確定、数値用トークンの絞り込み、再帰的な引数生成、独自トークナイザを個別に検証。",
          "異常系とコード品質：ファイル欠損、不正JSON、関数定義の不備、空のプロンプト、存在しないモデル名を検知。対象と原因をエラーメッセージに示し、不正な状態では終了コード1で停止。flake8とmypyも実行。"
        ]
      },
      "en": {
        "caseStudies": [
          {
            "title": "Prevent unregistered function names",
            "challenge": "Free-form generation can return an unregistered name or stop at a partial match.",
            "solution": "Registered names are encoded as newline-terminated token-ID sequences. After each generated token, only candidates matching the current prefix remain, and the model can choose only a next token that continues one of them.",
            "solutionSteps": [
              {
                "title": "Constrain candidates",
                "text": "Encode registered function names as token-ID sequences, keep only candidates matching the generated prefix, and allow only their next token IDs."
              },
              {
                "title": "Detect the name boundary",
                "text": "Append a newline token to every name so a short name can terminate even when another registered name continues from the same prefix."
              }
            ],
            "diagram": "function-selection"
          },
          {
            "title": "Keep JSON structure and value types valid",
            "challenge": "Generating an entire JSON object freely can omit delimiters, invent parameter names, or produce values of the wrong type.",
            "solution": "The program inserts braces, parameter names, colons, commas and string quotation marks, leaving only the values for the LLM to generate. Allowed tokens are constrained according to each parameter type to reduce malformed JSON and type-incompatible values. json.loads checks the completed syntax.",
            "diagram": "json-generation"
          },
          {
            "title": "Generate nested objects and arrays recursively",
            "challenge": "Each function can have a different argument structure, with objects and arrays nested to different depths. Logic tied to a fixed depth or shape cannot handle new definitions through the same path.",
            "solution": "The same generation routine recursively processes the contents of objects and arrays. When it reaches a primitive value such as a string or number, it generates the value according to its type, allowing different nesting depths to use one common mechanism.",
            "diagram": "recursive-schema"
          },
          {
            "title": "Avoid repeated token conversion",
            "challenge": "Converting the same braces, parameter names and function names into token IDs for every request repeats identical work. Numeric-compatible tokens also do not need to be extracted from the vocabulary each time.",
            "solution": "Function-name token sequences and numeric-compatible token IDs are computed at startup. Encoded fixed strings are cached after their first conversion and reused on later requests. Model output is not cached, so inference still runs for every input.",
            "diagram": "precomputation"
          }
        ],
        "verification": [
          "End-to-end behavior with a real model: Qwen3-0.6B is used to verify the complete path from natural-language input through function selection and JSON argument generation across strings, numbers, booleans, nested objects and arrays.",
          "Individual behavior: tests isolate function names with shared prefixes, newline termination, numeric-token filtering, recursive argument generation and the custom tokenizer.",
          "Errors and code quality: missing files, invalid JSON, invalid function definitions, empty prompts and unknown model names are detected. Messages identify the affected target and cause, and invalid states terminate with exit code 1. flake8 and mypy are also run."
        ]
      }
    }
  },
  {
    "id": "Codexion",
    "title": "Codexion",
    "description": {
      "ja": "複数のコーダーがUSBドングル（共有資源）を取り合いながら、規定回数のコンパイル完了を目指す並行処理シミュレータ。各コーダーをPOSIXスレッドとして動かし、デッドロックの回避、FIFO・EDFによる実行順序の制御、完了とタイムアウトの監視をCで実装。",
      "en": "A concurrent C simulator in which multiple coders compete for shared USB dongles while working toward a required compile count. Each coder runs as a POSIX thread, with deadlock prevention, FIFO/EDF execution ordering, and completion and timeout monitoring."
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
    "demoGuide": {
      "ja": {
        "overview": "各行が1人のCoder。Donglesは保有数、Progressは現在のコンパイル数／目標数を表示。",
        "cues": [
          "Coders（1人につき1スレッド）: 5人",
          "USB dongles（共有資源）: 5台",
          "Required per compile（1回に必要なドングル）: 左右の2台",
          "Goal per coder（1人あたりの目標）: コンパイル4回"
        ]
      },
      "en": {
        "overview": "Each row represents one coder. Dongles shows the number held; Progress shows the current and target compile counts.",
        "cues": [
          "Coders (one thread each): 5",
          "USB dongles: 5",
          "Required per compile: 2 adjacent dongles",
          "Goal per coder: 4 compiles"
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
          "ログのタイムスタンプが単調非減少であることと出力形式を確認。収録動画では5人全員が目標4回へ段階的に到達",
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
          "動画の完了画面で、全機到着とCapacity violations: 0を確認"
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
        "verification": ["Tests cover parsing, blocked and unreachable graphs, weighted costs, tie-breaking, congestion penalties and restricted transit.", "Integration-style tests serialize multiple drones within zone and link capacities; the recorded run completes with zero violations."],
        "limitations": ["The congestion response is a local heuristic and does not guarantee globally optimal throughput.", "There is no maximum-turn guard; physical flight control, continuous space and network latency are outside scope."]
      }
    }
  },
  {
    "id": "souaoao/A-Maze-ing",
    "title": "A-Maze-ing",
    "description": {
      "ja": "設定ファイルからDFS/BFSで迷路を生成し、構造的な制約を保ったまま最短経路と圧縮した16進壁データを出力する2名のPython共同開発。",
      "en": "A two-person Python project that generates mazes with DFS or BFS, preserves structural constraints, finds a shortest route, and writes compact hexadecimal wall data."
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
    "technicalDetails": {
      "ja": {
        "challenge": "各セルの上下左右の壁をコンパクトに表現しつつ、隣接セルとの壁の整合性、閉じた外周、保護領域、3×3の完全開放禁止を守る必要がありました。さらに生成アルゴリズムと解法を分け、どの生成方式でも最短経路を求められる設計が必要でした。",
        "design": [
          "2名で機能を分担し、Gitで変更を管理。本人は生成・探索アルゴリズム、壁の4ビット表現、構造制約、パッケージ化を担当",
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
          "Split features between two developers and managed changes with Git. My contribution covered generation and search algorithms, four-bit wall encoding, structural constraints and packaging",
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

function ProjectVideoGuide({ project, language }: {
  project: PortfolioProject;
  language: 'ja' | 'en';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  if (!project.demoGuide) return null;
  const guide = project.demoGuide[language];
  const statusStyle: Record<string, { background: string; color: string }> = {
    WAITING: { background: '#eeeeee', color: '#111827' },
    COMPILING: { background: '#4f8f67', color: '#f0fdf4' },
    DEBUGGING: { background: '#5fafff', color: '#082f49' },
    REFACTORING: { background: '#00ffff', color: '#083344' },
    COMPLETE: { background: '#ff87ff', color: '#4a044e' },
  };
  const status = (name: keyof typeof statusStyle) => (
    <span
      className="rounded px-2 py-1 font-mono text-[10px] font-bold tracking-wide shadow-sm"
      style={statusStyle[name]}
    >
      {name}
    </span>
  );

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--color-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] sm:px-6"
      >
        <span className="font-mono text-xs font-bold tracking-wide text-[var(--color-cli-text)]">
          {language === 'ja' ? '動画内の表示内容' : 'On-screen guide'}
        </span>
        <span className="shrink-0 font-mono text-xs opacity-70">
          {isOpen
            ? (language === 'ja' ? '非表示 −' : 'Hide −')
            : (language === 'ja' ? '表示 ＋' : 'Show +')}
        </span>
      </button>
      {isOpen && (
        <div id={contentId} className="border-t border-[var(--color-splitter)] px-5 py-4 sm:px-6">
          {project.id === 'Codexion' ? (
            <div className="grid gap-4">
              <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="grid content-start gap-3">
                  <section className="overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
                    <h4 className="border-b border-[var(--color-splitter)] px-3 py-2 font-mono text-[11px] font-bold text-[var(--color-cli-text)]">Simulation</h4>
                    <ul className="grid gap-1.5 p-3 font-mono text-[11px] leading-5 opacity-75">
                      {guide.cues.map((cue) => {
                        const [label, ...rest] = cue.split(':');
                        return (
                          <li key={cue} className="flex justify-between gap-3 border-b border-[var(--color-splitter)] pb-1.5 last:border-b-0 last:pb-0">
                            <span className="opacity-65">{label}</span>
                            <span className="text-right font-bold text-[var(--color-text)]">{rest.join(':').trim()}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section className="overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
                    <h4 className="border-b border-[var(--color-splitter)] px-3 py-2 font-mono text-[11px] font-bold text-[var(--color-cli-text)]">Status Guide</h4>
                    <div className="grid gap-3 p-3 text-[11px]">
                      <div className="mx-auto grid w-fit grid-cols-[auto_2rem_auto] items-center justify-items-center gap-y-2">
                        {status('WAITING')}
                        <span aria-hidden="true">→</span>
                        {status('COMPILING')}
                        <span aria-hidden="true">↑</span>
                        <span aria-hidden="true" />
                        <span aria-hidden="true">↓</span>
                        {status('REFACTORING')}
                        <span aria-hidden="true">←</span>
                        {status('DEBUGGING')}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--color-splitter)] pt-3">
                        {status('COMPILING')}
                        <span aria-hidden="true">→</span>
                        <span className="opacity-60">{language === 'ja' ? '目標回数に到達' : 'target reached'}</span>
                        <span aria-hidden="true">→</span>
                        {status('COMPLETE')}
                      </div>
                    </div>
                  </section>
                </div>

                <section className="flex flex-col overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
                  <h4 className="border-b border-[var(--color-splitter)] px-3 py-2 font-mono text-[11px] font-bold text-[var(--color-cli-text)]">
                    {language === 'ja' ? '共有資源の配置' : 'Shared resource layout'}
                  </h4>
                  <div className="flex flex-1 items-center justify-center p-2">
                    <CodexionResourceDiagram language={language} />
                  </div>
                </section>
              </div>
              {guide.overview && <p className="text-xs leading-5 opacity-70">{guide.overview}</p>}
            </div>
          ) : (
            <>
              {guide.overview && <p className="text-sm leading-6 opacity-80">{guide.overview}</p>}
              <ul className={`${guide.overview ? 'mt-3 ' : ''}grid gap-y-2 text-xs leading-5 opacity-70`}>
                {guide.cues.map((cue) => (
                  <li key={cue} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--color-cli-text)]">•</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function DiagramArrow() {
  return <span aria-hidden="true" className="shrink-0 text-base font-bold text-[var(--color-accent-secondary)]">→</span>;
}

function CodexionResourceDiagram({ language }: { language: 'ja' | 'en' }) {
  const coders = [
    { label: 'C1', x: 180, y: 54 },
    { label: 'C2', x: 271, y: 120 },
    { label: 'C3', x: 236, y: 228 },
    { label: 'C4', x: 124, y: 228 },
    { label: 'C5', x: 89, y: 120 },
  ];
  const dongles = [
    { label: 'D1', x: 236, y: 76 },
    { label: 'D2', x: 271, y: 179 },
    { label: 'D3', x: 180, y: 242 },
    { label: 'D4', x: 89, y: 179 },
    { label: 'D5', x: 124, y: 76 },
  ];
  const ring = [
    [180, 54], [236, 76], [271, 120], [271, 179], [236, 228],
    [180, 242], [124, 228], [89, 179], [89, 120], [124, 76], [180, 54],
  ].map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg
      role="img"
      aria-label={language === 'ja' ? '5人のCoderと5台のUSBドングルの円形配置' : 'Circular layout of five coders and five USB dongles'}
      viewBox="0 0 360 276"
      className="mx-auto h-auto w-full max-w-[23rem]"
    >
      <title>
        {language === 'ja' ? '5人のCoderと5台のUSBドングルの配置' : 'Layout of five coders and five USB dongles'}
      </title>
      <desc>
        {language === 'ja'
          ? 'Coderとドングルを交互に円形配置。C1が左右のD5とD1を取得してコンパイルしている例'
          : 'Coders and dongles alternate around a ring. C1 is shown compiling while holding adjacent dongles D5 and D1.'}
      </desc>
      <polyline
        points={ring}
        fill="none"
        stroke="var(--color-splitter)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line x1="180" y1="54" x2="236" y2="76" stroke="#4f8f67" strokeWidth="5" strokeLinecap="round" />
      <line x1="180" y1="54" x2="124" y2="76" stroke="#4f8f67" strokeWidth="5" strokeLinecap="round" />
      <text x="180" y="15" textAnchor="middle" fill="#4f8f67" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">
        C1: COMPILING
      </text>

      {coders.map((coder) => {
        const isCompiling = coder.label === 'C1';
        return (
          <g key={coder.label}>
            <circle
              cx={coder.x}
              cy={coder.y}
              r="22"
              fill={isCompiling ? '#4f8f67' : '#1f2937'}
              stroke={isCompiling ? '#2f6b4a' : 'var(--color-cli-text)'}
              strokeWidth="2"
            />
            <text
              x={coder.x}
              y={coder.y + 4}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="700"
              fontFamily="ui-monospace, monospace"
            >
              {coder.label}
            </text>
          </g>
        );
      })}

      {dongles.map((dongle) => {
        const isHeld = dongle.label === 'D1' || dongle.label === 'D5';
        return (
          <g key={dongle.label}>
            <rect
              x={dongle.x - 14}
              y={dongle.y - 10}
              width="28"
              height="20"
              rx="4"
              fill={isHeld ? '#4f8f67' : '#facc15'}
              stroke={isHeld ? '#2f6b4a' : '#854d0e'}
              strokeWidth="2"
            />
            <text
              x={dongle.x}
              y={dongle.y + 4}
              textAnchor="middle"
              fill={isHeld ? '#f0fdf4' : '#422006'}
              fontSize="9"
              fontWeight="800"
              fontFamily="ui-monospace, monospace"
            >
              {dongle.label}
            </text>
          </g>
        );
      })}

      <text x="180" y="137" textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontWeight="700">
        {language === 'ja' ? 'コンパイルには' : 'Compile requires'}
      </text>
      <text x="180" y="154" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="800">
        {language === 'ja' ? '左右のドングル2台が必要' : 'the 2 adjacent dongles'}
      </text>
      <g transform="translate(126 174)">
        <circle cx="7" cy="7" r="6" fill="#1f2937" stroke="var(--color-cli-text)" />
        <text x="18" y="10" fill="var(--color-text-muted)" fontSize="9">Coder</text>
        <rect x="61" y="1" width="14" height="12" rx="2" fill="#facc15" stroke="#854d0e" />
        <text x="81" y="10" fill="var(--color-text-muted)" fontSize="9">Dongle</text>
      </g>
    </svg>
  );
}

function TechnicalCaseDiagram({
  kind,
  language,
}: {
  kind: NonNullable<ProjectTechnicalCaseStudy['diagram']>;
  language: 'ja' | 'en';
}) {
  const fixedLabel = language === 'ja' ? 'プログラムが固定' : 'Program-defined';
  const generatedLabel = language === 'ja' ? 'LLMが生成' : 'LLM-generated';

  if (kind === 'function-selection') {
    return (
      <div role="img" aria-label={language === 'ja' ? '候補を登録済み関数へ制限し、改行トークンで共通部分を持つ関数名を区別する流れ' : 'Constrain candidates to registered functions and distinguish shared prefixes with a newline token'} className="grid gap-4">
        <section className="overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
          <header className="flex items-center gap-2 border-b border-[var(--color-splitter)] px-3 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-secondary)] font-mono text-[10px] font-bold text-[var(--color-cli-bg)]">1</span>
            <span className="text-xs font-bold">{language === 'ja' ? '候補の制限' : 'Constrain candidates'}</span>
          </header>
          <div className="grid gap-3 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] px-3 py-2.5">
              <span className="text-xs font-bold">{language === 'ja' ? '現在までに生成したID' : 'IDs generated so far'}</span>
              <span className="font-mono text-sm font-bold">[ 10 ][ 42 ]</span>
            </div>

            <div className="overflow-x-auto rounded border border-[var(--color-splitter)]">
              <table className="w-full min-w-[38rem] border-collapse text-left font-mono text-[11px] leading-5">
                <thead className="bg-[var(--color-accent-secondary-soft)] font-sans text-[11px]">
                  <tr>
                    <th className="px-3 py-2 font-bold">{language === 'ja' ? '登録済み候補' : 'Registered candidate'}</th>
                    <th className="px-3 py-2 font-bold">{language === 'ja' ? 'トークンID列' : 'Token-ID sequence'}</th>
                    <th className="px-3 py-2 font-bold">{language === 'ja' ? '前方一致' : 'Prefix match'}</th>
                    <th className="px-3 py-2 font-bold">{language === 'ja' ? '次に許可するID' : 'Allowed next ID'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--color-splitter)] opacity-50">
                    <td className="px-3 py-2">fn_greet</td>
                    <td className="px-3 py-2">[ 10 ][ 31 ][ {language === 'ja' ? '改行' : 'newline'} ]</td>
                    <td className="px-3 py-2">× {language === 'ja' ? '除外' : 'remove'}</td>
                    <td className="px-3 py-2">—</td>
                  </tr>
                  <tr className="border-t border-[var(--color-splitter)] text-[var(--color-cli-text)]">
                    <td className="px-3 py-2">fn_create</td>
                    <td className="px-3 py-2">[ 10 ][ 42 ][ {language === 'ja' ? '改行' : 'newline'} ]</td>
                    <td className="px-3 py-2">○ {language === 'ja' ? '残す' : 'keep'}</td>
                    <td className="px-3 py-2">[ {language === 'ja' ? '改行' : 'newline'} ]</td>
                  </tr>
                  <tr className="border-t border-[var(--color-splitter)] text-[var(--color-cli-text)]">
                    <td className="px-3 py-2">fn_create_user</td>
                    <td className="px-3 py-2">[ 10 ][ 42 ][ 58 ][ {language === 'ja' ? '改行' : 'newline'} ]</td>
                    <td className="px-3 py-2">○ {language === 'ja' ? '残す' : 'keep'}</td>
                    <td className="px-3 py-2">[ 58 ]</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 rounded border border-[var(--color-cli-text)] bg-[var(--color-cli-text)] px-3 py-3 text-center text-[var(--color-cli-bg)]">
              <span className="text-xs font-bold">{language === 'ja' ? '選択できるID' : 'Allowed IDs'}</span>
              <span className="font-mono text-xs">[ {language === 'ja' ? '改行' : 'newline'} ]</span>
              <span className="opacity-60">/</span>
              <span className="font-mono text-xs">[ 58 ]</span>
              <span aria-hidden="true">→</span>
              <span className="text-xs font-bold">LLM: [ 58 ] {language === 'ja' ? 'を選択' : 'selected'}</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)]">
          <header className="flex items-center gap-2 border-b border-[var(--color-accent-border)] px-3 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cli-text)] font-mono text-[10px] font-bold text-[var(--color-cli-bg)]">2</span>
            <span className="text-xs font-bold">{language === 'ja' ? '関数名の終端判定' : 'Detect the name boundary'}</span>
          </header>
          <div className="grid gap-3 p-3 md:grid-cols-[0.8fr_auto_1.5fr_auto_0.8fr] md:items-center">
            <div className="rounded border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3 text-center">
              <span className="block text-[11px] opacity-65">{language === 'ja' ? '生成済み' : 'Generated'}</span>
              <span className="mt-1 block font-mono text-xs font-bold">fn_create</span>
            </div>
            <div className="hidden md:block"><DiagramArrow /></div>
            <div className="grid gap-2 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-3 rounded border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] px-3 py-2">
                <span>[ {language === 'ja' ? '改行' : 'newline'} ]</span>
                <span className="text-right">→ fn_create {language === 'ja' ? 'で確定' : 'selected'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded border border-[var(--color-cli-text)] bg-[var(--color-bg)] px-3 py-2 font-bold text-[var(--color-cli-text)]">
                <span>[ 58 ]</span>
                <span className="text-right">→ fn_create_user → [ {language === 'ja' ? '改行' : 'newline'} ]</span>
              </div>
            </div>
            <div className="hidden md:block"><DiagramArrow /></div>
            <div className="rounded border border-[var(--color-cli-text)] bg-[var(--color-cli-text)] p-3 text-center text-[var(--color-cli-bg)]">
              <span className="block text-[11px] opacity-80">{language === 'ja' ? '選択結果' : 'Selected'}</span>
              <span className="mt-1 block font-mono text-xs font-bold">fn_create_user</span>
            </div>
          </div>
        </section>
        <p className="font-mono text-[10px] opacity-55">{language === 'ja' ? '※ 数値IDは模式例。[ 改行 ]も1つのトークンID' : '* Numeric IDs are schematic; [ newline ] is also one token ID.'}</p>
      </div>
    );
  }

  if (kind === 'json-generation') {
    return (
      <div role="img" aria-label={language === 'ja' ? 'JSONの構造をプログラムが固定し値をLLMが生成する例' : 'JSON structure fixed by the program with values generated by the LLM'} className="grid gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3 font-mono text-xs leading-6">
          <span className="rounded bg-[var(--color-accent-secondary-soft)] px-1.5 text-[var(--color-accent-secondary)]">&#123; &quot;name&quot;: &quot;</span>
          <span className="rounded bg-[var(--color-accent-soft)] px-1.5 font-bold text-[var(--color-cli-text)]">Hikaru</span>
          <span className="rounded bg-[var(--color-accent-secondary-soft)] px-1.5 text-[var(--color-accent-secondary)]">&quot;, &quot;age&quot;: </span>
          <span className="rounded bg-[var(--color-accent-soft)] px-1.5 font-bold text-[var(--color-cli-text)]">29</span>
          <span className="rounded bg-[var(--color-accent-secondary-soft)] px-1.5 text-[var(--color-accent-secondary)]">&#125;</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px]">
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent-secondary-soft)] ring-1 ring-[var(--color-accent-secondary)]" />{fixedLabel}</span>
          <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-cli-text)]" />{generatedLabel}</span>
        </div>
      </div>
    );
  }

  if (kind === 'recursive-schema') {
    return (
      <div role="img" aria-label={language === 'ja' ? '再帰スキーマで入れ子のオブジェクトと配列を生成する流れ' : 'Recursive schema generation for nested objects and arrays'} className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3 font-mono text-[11px] leading-5">
          <p className="font-bold text-[var(--color-text)]">user: object</p>
          <p className="pl-3">├─ name: string</p>
          <p className="pl-3">└─ tags: array</p>
          <p className="pl-6">└─ item: string</p>
        </div>
        <div className="hidden sm:block"><DiagramArrow /></div>
        <pre className="overflow-x-auto rounded-md border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] p-3 font-mono text-[11px] leading-5 text-[var(--color-text)]">{`{
  "user": {
    "name": "Hikaru",
    "tags": ["Python", "LLM"]
  }
}`}</pre>
      </div>
    );
  }

  return (
    <div role="img" aria-label={language === 'ja' ? '固定文字列を毎回変換する場合とキャッシュから再利用する場合の比較' : 'Comparison of repeated fixed-string conversion and cached reuse'} className="grid gap-3 md:grid-cols-2">
      <section className="overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
        <header className="border-b border-[var(--color-splitter)] px-3 py-2 text-xs font-bold opacity-70">
          {language === 'ja' ? 'キャッシュなし' : 'Without cache'}
        </header>
        <div className="grid gap-2 p-3 font-mono text-[11px]">
          {[1, 2, 3].map((request) => (
            <div key={request} className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-splitter)] px-3 py-2">
              <span>{language === 'ja' ? `リクエスト${request}` : `Request ${request}`}</span>
              <span aria-hidden="true">→</span>
              <span>{language === 'ja' ? 'トークン変換' : 'encode'}</span>
              <span aria-hidden="true">→</span>
              <span>token IDs</span>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)]">
        <header className="border-b border-[var(--color-accent-border)] px-3 py-2 text-xs font-bold">
          {language === 'ja' ? 'キャッシュあり' : 'With cache'}
        </header>
        <div className="grid gap-2 p-3 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-accent-border)] bg-[var(--color-cli-bg)] px-3 py-2">
            <span>{language === 'ja' ? '初回リクエスト' : 'First request'}</span>
            <span aria-hidden="true">→</span>
            <span>{language === 'ja' ? 'トークン変換' : 'encode'}</span>
            <span aria-hidden="true">→</span>
            <span>token IDs</span>
            <span aria-hidden="true">→</span>
            <span>{language === 'ja' ? '結果を保存' : 'save result'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-cli-text)] bg-[var(--color-cli-text)] px-3 py-2 font-bold text-[var(--color-cli-bg)]">
            <span>{language === 'ja' ? '次回以降' : 'Later requests'}</span>
            <span aria-hidden="true">→</span>
            <span>{language === 'ja' ? '保存済みのtoken IDsを再利用' : 'reuse saved token IDs'}</span>
          </div>
        </div>
      </section>
      <p className="text-[10px] opacity-55 md:col-span-2">
        {language === 'ja' ? '※ キャッシュ対象は固定文字列の変換結果。LLMの生成結果は毎回新しく取得' : '* Only fixed-string encodings are cached; model output is generated for every request.'}
      </p>
    </div>
  );
}

function ProjectTechnicalDetailsPanel({ project, language }: {
  project: PortfolioProject;
  language: 'ja' | 'en';
}) {
  if (!project.technicalDetails) return null;
  const details = project.technicalDetails[language];

  if (details.caseStudies) {
    return (
      <div className="grid gap-5 text-sm leading-relaxed">
        <section>
          <div className="mb-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-cli-text)]">
              {language === 'ja' ? 'Engineering decisions' : 'Engineering decisions'}
            </p>
            <h3 className="mt-1 text-lg font-bold">
              {language === 'ja' ? '技術課題と実装の工夫' : 'Challenges and implementation decisions'}
            </h3>
          </div>
          <div className="grid gap-4">
            {details.caseStudies.map((item, index) => (
              <article key={item.title} className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
                <header className="flex items-start gap-3 border-b border-[var(--color-splitter)] bg-[var(--color-accent-secondary-soft)] px-4 py-3 sm:px-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent-secondary)] font-mono text-xs font-bold text-[var(--color-accent-secondary)]">
                    {index + 1}
                  </span>
                  <h4 className="pt-0.5 text-sm font-bold sm:text-base">{item.title}</h4>
                </header>
                <div className="grid gap-0 lg:grid-cols-2">
                  <div className="border-b border-[var(--color-splitter)] px-4 py-4 sm:px-5 lg:border-b-0 lg:border-r">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {language === 'ja' ? '課題' : 'Challenge'}
                    </p>
                    <p className="mt-2 leading-7 text-[var(--color-text-muted)]">{item.challenge}</p>
                  </div>
                  <div className="px-4 py-4 sm:px-5">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-cli-text)]">
                      {language === 'ja' ? '実装上の工夫' : 'Implementation'}
                    </p>
                    {item.solutionSteps ? (
                      <ol className="mt-2 grid gap-3">
                        {item.solutionSteps.map((step, stepIndex) => (
                          <li key={step.title} className="grid grid-cols-[auto_1fr] gap-2.5">
                            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-cli-text)] font-mono text-[10px] font-bold text-[var(--color-cli-text)]">
                              {stepIndex + 1}
                            </span>
                            <div>
                              <p className="font-bold text-[var(--color-text)]">{step.title}</p>
                              <p className="mt-1 leading-7 text-[var(--color-text-muted)]">{step.text}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-2 leading-7 text-[var(--color-text-muted)]">{item.solution}</p>
                    )}
                  </div>
                </div>
                {item.diagram && (
                  <div className="border-t border-[var(--color-splitter)] bg-[var(--color-cli-bg)]/40 px-4 py-4 sm:px-5">
                    <TechnicalCaseDiagram kind={item.diagram} language={language} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-[var(--color-accent-border)] bg-[var(--color-bg)]">
          <h3 className="border-b border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-bold sm:px-5">
            {language === 'ja' ? 'テスト・検証' : 'Tests and validation'}
          </h3>
          <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
            {details.verification.map((item) => (
              <li key={item} className="border-b border-[var(--color-splitter)] py-3 last:border-b-0">
                <span className="block border-l-2 border-[var(--color-cli-text)] pl-3 leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-4 text-sm leading-relaxed">
      <section className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-accent-border)' }}>
        <h3 className="border-b border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-bold sm:px-5">
          {language === 'ja' ? '解決した技術課題' : 'Engineering problem'}
        </h3>
        <p className="px-4 py-4 leading-7 text-[var(--color-text-muted)] sm:px-5">{details.challenge}</p>
      </section>

      <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
        <h3 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-secondary-soft)] px-4 py-3 text-sm font-bold sm:px-5">
          {language === 'ja' ? '設計判断と実装' : 'Design decisions & implementation'}
        </h3>
        <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
          {details.design?.map((item) => (
            <li key={item} className="border-b border-[var(--color-splitter)] py-3 last:border-b-0">
              <span className="block border-l-2 border-[var(--color-accent-secondary)] pl-3 leading-7">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
          <h3 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-bold sm:px-5">
            {language === 'ja' ? '検証内容' : 'Validation'}
          </h3>
          <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
            {details.verification.map((item) => (
              <li key={item} className="border-b border-[var(--color-splitter)] py-3 last:border-b-0">
                <span className="block border-l-2 border-[var(--color-cli-text)] pl-3 leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
          <h3 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-secondary-soft)] px-4 py-3 text-sm font-bold sm:px-5">
            {language === 'ja' ? '設計上の制約' : 'Design boundaries'}
          </h3>
          <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
            {details.limitations?.map((item) => (
              <li key={item} className="border-b border-[var(--color-splitter)] py-3 last:border-b-0">
                <span className="block border-l-2 border-[var(--color-accent-secondary)] pl-3 leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

interface CardProps {
  project: PortfolioProject;
  language: 'ja' | 'en';
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  onOpenDetails: (project: PortfolioProject) => void;
}

function PortfolioCard({
  project,
  language,
  activeTag,
  onTagClick,
  onOpenDetails,
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
      <div className="border-b border-[var(--color-splitter)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold leading-snug sm:text-2xl">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-baseline gap-1.5 hover:text-[var(--color-cli-text)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label={language === 'ja' ? `${project.title}のGitHubを開く` : `Open ${project.title} on GitHub`}
              >
                {project.title}
                <span aria-hidden="true" className="font-mono text-xs opacity-60">↗</span>
              </a>
            </h3>
            {project.projectType && (
              <p className="mt-2 font-mono text-xs uppercase tracking-wider opacity-60">
                {project.projectType[language]}
              </p>
            )}
          </div>

          <div className="flex max-w-full flex-wrap justify-start gap-1.5 sm:justify-end">
            {project.tags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className={[
                    'rounded border px-2 py-0.5 font-mono text-xs transition-all duration-150',
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
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 opacity-75">
          {project.description[language]}
        </p>
      </div>

      {project.demoGuide && (
        <div className="border-b border-[var(--color-splitter)] p-4 sm:px-6">
          <ProjectVideoGuide project={project} language={language} />
        </div>
      )}

      {/* ── Media area ── */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div
          className="relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-lg border border-[var(--color-splitter)]"
          style={project.videoUrl
            ? { aspectRatio: '16 / 9', background: '#050505' }
            : { height: '3rem', background: 'var(--color-splitter)' }}
        >
          {project.imageUrl && !project.videoUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : !project.videoUrl ? (
            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm opacity-30">
              {project.title}
            </div>
          ) : null}

          {project.videoUrl && (
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={project.imageUrl}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${project.title} video`}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            />
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex justify-end">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenDetails(project)}
              className="rounded border border-[var(--color-cli-text)] bg-[var(--color-cli-text)] px-4 py-2 font-mono text-xs font-bold text-[var(--color-cli-bg)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {language === 'ja' ? '技術課題と実装の工夫を見る' : 'View engineering decisions'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── PortfolioContainer ────────────────────────────────────────────────────────

function ProjectDetailModal({ project, language, onClose }: {
  project: PortfolioProject;
  language: 'ja' | 'en';
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={language === 'ja' ? `${project.title}の詳細` : `${project.title} details`}
      onClick={onClose}
    >
      <article
        className="mx-auto w-full max-w-7xl overflow-hidden rounded-lg border border-white/20 bg-[var(--color-cli-bg)] text-[var(--color-text)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-[var(--color-splitter)] bg-[var(--color-cli-bg)]/95 p-5 backdrop-blur sm:p-6">
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-snug sm:text-3xl">{project.title}</h2>
            {project.projectType && (
              <p className="mt-2 font-mono text-xs uppercase tracking-wider opacity-60">{project.projectType[language]}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="shrink-0 rounded border border-[var(--color-splitter)] px-3 py-2 font-mono text-xs font-bold hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label={language === 'ja' ? 'プロジェクトの詳細を閉じる' : 'Close project details'}
          >
            {language === 'ja' ? '閉じる ✕' : 'Close ✕'}
          </button>
        </header>

        <div className="grid gap-5 p-5 sm:gap-6 sm:p-6 lg:p-8">
          <p className="max-w-5xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
            {project.description[language]}
          </p>

          <ProjectVideoGuide project={project} language={language} />

          {project.videoUrl ? (
            <div className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-black" style={{ aspectRatio: '16 / 9' }}>
              <video
                src={project.videoUrl}
                poster={project.imageUrl}
                controls
                playsInline
                preload="metadata"
                aria-label={`${project.title} video`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full rounded-lg border border-[var(--color-splitter)] object-contain"
            />
          ) : null}

          <ProjectTechnicalDetailsPanel project={project} language={language} />

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-splitter)] pt-5">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded border border-[var(--color-splitter)] px-2 py-0.5 font-mono text-xs opacity-70">
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold text-[var(--color-cli-text)] hover:underline"
            >
              {language === 'ja' ? 'GitHubでコードを見る ↗' : 'View code on GitHub ↗'}
            </a>
          </footer>
        </div>
      </article>
    </div>
  );
}

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

  const [detailProject, setDetailProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    if (!detailProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDetailProject(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [detailProject]);

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
      {/* Filter status */}
      {activeTag && (
        <div
          id="portfolio-filter-status"
          tabIndex={-1}
          aria-live="polite"
          className="mb-6 flex flex-wrap items-center gap-3 focus:outline-none"
        >
          <span
            className="text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{
              borderColor: 'var(--color-cli-text)',
              color: 'var(--color-cli-text)',
            }}
          >
            {language === 'ja' ? '選択中の技術' : 'Technology'}: {activeTag}
          </span>
          <span className="font-mono text-xs opacity-60">{projectCountLabel}</span>
          <button
            type="button"
            onClick={onClearTag}
            className="text-xs underline opacity-50 hover:opacity-100 transition-opacity ml-auto"
          >
            {language === 'ja' ? '絞り込みを解除' : 'Clear filter'} ✕
          </button>
        </div>
      )}

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
              onOpenDetails={setDetailProject}
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
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          language={language}
          onClose={() => setDetailProject(null)}
        />
      )}
    </section>
  );
}
