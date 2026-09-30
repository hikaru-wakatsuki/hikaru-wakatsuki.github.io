import { Fragment, useRef, useCallback, useEffect, useId, useState } from 'react';
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
        "cues": []
      },
      "en": {
        "cues": []
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
        "caseStudies": [
          {
            "title": "mutexの取得順序を統一して循環待ちを防止",
            "challenge": "Coderごとに異なる順序で2つのmutexを取得すると、各スレッドが1つ目を保持したまま2つ目を待ち、循環待ちが発生する可能性がある。",
            "solution": "各Coderが使用する2台のDongleをID順に並べ、必ず小さいIDから大きいIDの順にmutexを取得。すべてのCoderでロック方向を統一し、mutex同士の循環待ちを防止。",
            "challengeDiagram": "codexion-circular-wait",
            "solutionDiagram": "codexion-lock-order"
          },
          {
            "title": "片方だけの占有を防ぎ、不要なタイムアウトを抑制",
            "challenge": "1台だけを確保したまま、もう1台が空くまで待つと、そのDongleを必要とするほかのCoderもコンパイルできない。処理できるはずのCoderまで待たされ、制限時間を超える可能性がある。",
            "solution": "2台のmutexを取得して利用条件を確認し、両方を利用できる場合だけ2台を同じCoderへ割り当て。どちらかを利用できない場合は1台も割り当てず、両mutexを解放して再試行。片方だけを占有する状態を作らず、ほかのCoderが取得を試せる状態に戻す。",
            "challengeDiagram": "codexion-partial-ownership",
            "solutionDiagram": "codexion-atomic-pair"
          },
          {
            "title": "FIFO・EDFの優先順序をmin-heapで再現",
            "challenge": "複数のCoderが同じDongleを要求したとき、FIFOでは到着順、EDFでは期限の近さに従って、次にDongleを割り当てるCoderを決める必要がある。",
            "solution": "各Dongleに、待機中のCoderを管理するmin-heapを実装。各要求が持つ到着順と期限のうち、FIFOでは到着順、EDFでは期限を比較し、優先度の高いCoderが先頭になるように並べ替える。同順位の場合は、到着順とCoder IDで順序を確定。",
            "solutionDiagram": "codexion-priority-heap"
          },
          {
            "title": "共有状態ごとにmutexの責務を分離",
            "challenge": "コンパイル回数や終了状態などの共有データを複数のスレッドが同時に更新すると競合が発生する。ログも複数箇所から同時に出力されるため、内容が混ざって実行の流れを追えなくなる可能性がある。",
            "solution": "Dongleの所有状態、Coderの進捗、停止状態、完了人数を、それぞれ専用のmutexで保護。ログ出力にはlog_mutexを設け、1件の出力が完了してから次のスレッドが出力するように直列化。共有データごとにmutexの責務を分け、安全な更新と読み取れるログを両立。",
            "challengeDiagram": "codexion-log-interleaving",
            "solutionDiagram": "codexion-log-mutex"
          },
          {
            "title": "完了とタイムアウトを監視スレッドで判定",
            "challenge": "各Coderは個別に処理を進めるため、全員が目標回数を完了したか、一定時間コンパイルできずタイムアウトしたCoderがいないかを、シミュレーション全体で継続的に判定する必要がある。タイムアウト後のログ出力には時間制限があるため、検知の遅れも抑える必要がある。",
            "solution": "Coderとは別に監視専用スレッドを実装。全員の完了数と、各Coderの最終コンパイル開始時刻を約1ms間隔で繰り返し確認する。タイムアウトを検知すると、停止フラグを更新してburned outをログへ出力。監視中の状態参照と停止処理も、それぞれのmutexで保護。",
            "solutionDiagram": "codexion-monitor-loop"
          }
        ],
        "verification": [],
        "limitations": []
      },
      "en": {
        "caseStudies": [
          {
            "title": "Prevent circular wait with one mutex order",
            "challenge": "If coder threads lock their two mutexes in different orders, each thread can hold its first lock while waiting for the second and form a circular wait.",
            "solution": "Each coder sorts its two adjacent dongles by ID and always locks the lower ID before the higher ID. A single lock direction across all coder threads removes the circular-wait condition.",
            "challengeDiagram": "codexion-circular-wait",
            "solutionDiagram": "codexion-lock-order"
          },
          {
            "title": "Avoid partial ownership and unnecessary timeouts",
            "challenge": "If a coder holds one dongle while waiting for the other, coders that need the held resource cannot compile. Even a coder that could otherwise proceed may wait long enough to exceed its time limit.",
            "solution": "The implementation locks both mutexes and checks the pair. It assigns both dongles to the same coder only when both are eligible. If either is unavailable, it assigns neither, unlocks both mutexes and retries so another coder can attempt acquisition.",
            "challengeDiagram": "codexion-partial-ownership",
            "solutionDiagram": "codexion-atomic-pair"
          },
          {
            "title": "Reproduce FIFO and EDF priority with a min-heap",
            "challenge": "When multiple coders request the same dongle, the next coder must be selected by arrival order under FIFO and by the nearest deadline under EDF.",
            "solution": "Each dongle has a min-heap for waiting coders. Every request carries both arrival order and a deadline; FIFO compares arrival order while EDF compares the deadline, keeping the highest-priority coder at the front. Arrival order and coder ID resolve ties.",
            "solutionDiagram": "codexion-priority-heap"
          },
          {
            "title": "Separate mutex responsibility by shared state",
            "challenge": "Shared values such as compile progress and stop state can race when several threads update them. Log output emitted concurrently from different paths can also become mixed and make execution difficult to follow.",
            "solution": "Dedicated mutexes protect dongle ownership, coder progress, stop state and completion count. A separate log_mutex serializes output so one line finishes before another thread prints. Assigning one responsibility to each mutex keeps updates safe and logs readable.",
            "challengeDiagram": "codexion-log-interleaving",
            "solutionDiagram": "codexion-log-mutex"
          },
          {
            "title": "Detect completion and timeout in a monitor thread",
            "challenge": "Coder threads run independently, so the simulation must continuously determine whether every coder has reached its target or whether any coder has gone too long without compiling. Timeout detection must also avoid unnecessary delay before logging the event.",
            "solution": "A dedicated monitor thread checks the completion count and every coder's last compile start time at roughly 1 ms intervals. On timeout it updates the stop flag and emits the burned out log. Mutexes protect the state reads and stop transition.",
            "solutionDiagram": "codexion-monitor-loop"
          }
        ],
        "verification": [],
        "limitations": []
      }
    }
  },
  {
    "id": "Fly-in",
    "title": "Fly-in",
    "description": {
      "ja": "複数のドローンが、地点と通路の利用上限を守りながら目的地へ移動する様子を可視化したシミュレーター。各ターンの移動、待機、通路の使用状況、全機の到着を画面で確認できる。",
      "en": "A simulator that visualizes multiple drones moving to their destination while respecting usage limits for zones and connections. The screen shows movement, waiting, connection usage and arrivals for each turn."
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
        "cues": [
          "Turn：現在 / 全ターン、Arrived：到着 / 全機、Moving：移動中、Waiting：待機中",
          "Zoneの「1 / 2」：現在いるドローン数 / そのZoneに入れる上限",
          "通路の「cap 2」：同時に移動できる上限。使用中は「1 / 2」で現在の移動数 / 上限を表示",
          "緑の線：ドローンがその通路を移動中 / 黒い線：移動中のドローンなし",
          "Priority（黄）：同コスト時に優先 / Restricted（薄赤）：進入に2ターン / Blocked（赤×）：通行不可"
        ]
      },
      "en": {
        "cues": [
          "Turn: current / total; Arrived: at Goal / total; Moving: in transit; Waiting: in a zone",
          "Zone 1 / 2: drones currently present / zone limit",
          "Link cap 2: simultaneous limit; while active, 1 / 2 means moving drones / limit",
          "Green line: drones are moving on the link; dark line: no drone is moving on it",
          "Priority (yellow): tie-break preference; Restricted (light red): two-turn entry; Blocked (red with X): unavailable"
        ]
      }
    },
    "technicalDetails": {
      "ja": {
        "caseStudies": [
          {
            "title": "不正な地図をシミュレーション開始前に検出",
            "challenge": "テキストで入力される地図には、書式や型の誤りだけでなく、Zone名・座標の重複、存在しないZoneへの接続など、地図全体を見なければ分からない矛盾も含まれる。形式上は正しくても、Blocked Zoneを除くとStartからGoalへ到達できない場合があり、移動処理の途中で発覚すると原因を特定しにくい。",
            "solution": "入力をモデル化して段階的に検証し、実際に移動可能な地図だけを後続処理へ渡す構成にした。",
            "solutionSteps": [
              {
                "title": "入力を型付きモデルへ変換して検証",
                "text": "入力文字列をZone、Connection、地図全体を表すDronesNetworkへ変換。Zoneの種類はZoneTypeで管理し、座標・容量の型、メタデータ、必須項目の不足や重複を解析時に検証。失敗した行と原因をエラーメッセージへ含め、不正な値を後続処理へ渡さない構成にした。"
              },
              {
                "title": "地図全体の矛盾を検出",
                "text": "個別の入力行だけでは判定できない、Zone名・座標の重複、存在しないZoneへの接続、向きを入れ替えただけの重複通路、Blockedに設定されたStart・GoalをDronesNetworkで検出。問題の種類と対象をエラーメッセージへ含めた。"
              },
              {
                "title": "実際に移動できる地図か確認",
                "text": "検証済みの地図から双方向の隣接リストを構築し、Blocked Zoneにつながる通路を除外。その状態でDFSを使ってStartからGoalへの到達可能性を確認し、到達できる場合だけシミュレーションを開始した。"
              }
            ]
          },
          {
            "title": "地点の特性と容量を考慮して初期経路を選択",
            "challenge": "移動回数だけで経路を選ぶと、進入に時間がかかるRestricted Zoneや、容量が小さく混雑しやすいZoneを通る経路が選ばれる。複数の経路がある地図で、距離だけでなく各Zoneの条件も含めて比較する必要があった。",
            "solution": "地図を隣接リストで表し、Dijkstra法を使ってStartからGoalまでの初期経路を探索。1回の移動を基本コストとし、Restricted Zoneや容量の小さいZoneには追加コストを設定。Startから各Zoneまでの累積コストを更新し、最も小さいZoneから順に経路を確定した。同じコストの場合はPriority Zoneを優先。",
            "solutionDiagram": "flyin-weighted-route"
          },
          {
            "title": "現在の占有と移動予約を分けて容量超過を防止",
            "challenge": "複数のDroneを同じターン内で移動させる場合、現在のZone占有数だけでは、すでに確定した移動や次ターンに到着するDroneを容量判定へ反映できない。特にRestricted Zoneへの移動は2ターンかかるため、移動中のConnection使用と到着先の予約を、現在位置とは別に管理する必要があった。",
            "solution": "Zone占有数、Connection使用数、Restricted Zoneへの次ターン予約数を分け、移動時間に応じて各状態を更新する構成にした。",
            "solutionSteps": [
              {
                "title": "現在の利用数と移動予定を分けて管理",
                "text": "各Zoneに現在いるDrone、Connectionを使用しているDrone、Restricted Zoneへ次のターンに到着するDroneを別々に管理。移動前に、到着先の現在数と予約数の合計、Connectionの使用数を確認し、どちらも上限を超えない場合だけ移動させた。"
              },
              {
                "title": "1ターン移動と2ターン移動を分けて管理",
                "text": "Normal Zoneへの移動は、そのターン内に完了する移動として占有数を更新。Restricted Zoneへの移動は「移動中」として扱い、Connectionの使用と到着先の予約を次のターンまで保持した。到着時に予約を解放し、Zoneの占有数へ反映する2段階の処理とした。"
              }
            ],
            "challengeDiagram": "flyin-unreserved-arrivals",
            "solutionDiagram": "flyin-capacity-state"
          },
          {
            "title": "進めない経路を待たず、現在地から迂回路を再探索",
            "challenge": "開始時に選んだ経路でも、ほかのDroneの移動によって、次のZoneが満員になったりConnectionに空きがなくなったりする場合がある。最初の経路だけを使い続けると、通行可能な迂回路があってもその場で待機し続けてしまう。",
            "solution": "予定した次の移動ができない場合、使用中のConnectionと占有中のZoneにペナルティを加え、Droneの現在地からGoalまでの経路をDijkstra法で再探索。再計算した経路へ切り替え、最初の移動先についてもう一度容量を確認した。移動できる場合は新しい経路を進み、利用できない場合はそのターンだけ待機する構成とした。",
            "challengeDiagram": "flyin-blocked-route",
            "solutionDiagram": "flyin-reroute"
          }
        ],
        "verification": [],
        "limitations": []
      },
      "en": {
        "caseStudies": [
          {
            "title": "Detect invalid maps before simulation",
            "challenge": "A text map can contain format and type errors as well as contradictions that only appear across the full map, such as duplicate zone names or coordinates and connections to unknown zones. A syntactically valid map may also become unreachable after blocked zones are removed, and discovering that during movement makes the cause difficult to trace.",
            "solution": "The input is modelled and validated in stages so only an executable map reaches scheduling.",
            "solutionSteps": [
              {
                "title": "Convert input into typed models and validate it",
                "text": "The parser converts input text into Zone, Connection and the full DronesNetwork. ZoneType represents each category, while coordinate and capacity types, metadata, and missing or duplicate required fields are checked before invalid values can reach later processing. Errors include the failing line and cause when available."
              },
              {
                "title": "Detect whole-map contradictions",
                "text": "DronesNetwork catches conflicts that cannot be judged from one line alone: duplicate zone names or coordinates, connections to unknown zones, reversed duplicate links, and blocked Start or Goal zones. Error messages identify the problem type and affected value."
              },
              {
                "title": "Confirm that drones can actually reach Goal",
                "text": "The program builds an undirected adjacency list, removes connections touching Blocked zones, and uses DFS to confirm a route from Start to Goal. Simulation starts only when that check succeeds."
              }
            ]
          },
          {
            "title": "Choose an initial route using zone behavior and capacity",
            "challenge": "A route chosen only by hop count can pass through Restricted Zones or low-capacity Zones that are slower or more likely to become congested. Maps with several possible routes therefore need a comparison that includes each Zone's conditions as well as distance.",
            "solution": "The map is represented as an adjacency list and searched with Dijkstra's algorithm. Each move has a base cost, with additional costs for Restricted and low-capacity Zones. The search updates the accumulated cost from Start to each Zone and confirms the lowest-cost Zone first. Priority Zones win when accumulated costs are equal.",
            "solutionDiagram": "flyin-weighted-route"
          },
          {
            "title": "Separate current occupancy from movement reservations to prevent capacity overflow",
            "challenge": "When several drones move in the same turn, current Zone occupancy alone cannot represent moves already committed or drones arriving on the next turn. Restricted movement takes two turns, so Connection usage and the destination reservation must be tracked separately from the drone's current position.",
            "solution": "Zone occupancy, Connection usage and next-turn Restricted reservations are stored separately and updated according to the movement duration.",
            "solutionSteps": [
              {
                "title": "Track current usage separately from planned arrivals",
                "text": "The scheduler separately tracks drones currently in each Zone, drones using each Connection and drones due to reach a Restricted Zone on the next turn. A move is allowed only when the destination's current count plus reservations and the Connection usage both remain within their limits."
              },
              {
                "title": "Handle one-turn and two-turn movement separately",
                "text": "A move to a Normal Zone completes within the same turn and updates occupancy immediately. A move to a Restricted Zone remains in transit, keeping the Connection in use and the destination reserved until the next turn. On arrival, the reservation is released and the destination occupancy is updated."
              }
            ],
            "challengeDiagram": "flyin-unreserved-arrivals",
            "solutionDiagram": "flyin-capacity-state"
          },
          {
            "title": "Search for a detour from the current position instead of waiting on a blocked route",
            "challenge": "A route selected at startup can become unavailable when another drone fills the next Zone or Connection. If the scheduler keeps only the original route, the drone continues waiting even when another route to Goal remains open.",
            "solution": "When the planned next move is unavailable, the scheduler adds penalties to occupied Connections and Zones and reruns Dijkstra's algorithm from the drone's current position to Goal. It replaces the route with that result and applies the same capacity check to its first move. The drone follows the new route when possible or waits for that turn when it is still blocked.",
            "challengeDiagram": "flyin-blocked-route",
            "solutionDiagram": "flyin-reroute"
          }
        ],
        "verification": [],
        "limitations": []
      }
    }
  },
  {
    "id": "souaoao/A-Maze-ing",
    "title": "A-Maze-ing",
    "description": {
      "ja": "設定ファイルを検証し、DFSまたはBFSで迷路を生成・可視化するPythonアプリケーション。外周や保護領域などの制約を守りながら通路を作り、生成後にStartからGoalまでの最短経路を探索する。",
      "en": "A Python application that validates a configuration file, generates and visualizes a maze with DFS or BFS, preserves constraints such as outer walls and protected regions, and finds a shortest route from Start to Goal."
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
    "responsibilities": {
      "ja": [
        "迷路を自動生成する中核ロジックの設計・実装",
        "完全迷路・不完全迷路の切り替えと、指定された制約を守る判定処理の実装"
      ],
      "en": [
        "Designed and implemented the core maze-generation logic",
        "Implemented perfect/imperfect maze modes and checks that enforce the specified constraints"
      ]
    },
    "demoGuide": {
      "ja": {
        "cues": []
      },
      "en": {
        "cues": []
      }
    },
    "technicalDetails": {
      "ja": {
        "caseStudies": [
          {
            "title": "隣接セルの壁を常に一致させる",
            "challenge": "通路を一つ開く操作は、現在のセルと隣のセルの両方に影響する。片側だけを更新すると、同じ境界に壁があるセルとないセルが生まれ、迷路データが壊れる。",
            "solution": "北・東・南・西の壁を1・2・4・8の4ビットで保持。通路を開く処理を一か所にまとめ、現在のセルの壁と隣接セルの反対側の壁を同時に解除することで、すべての境界を一致させた。",
            "solutionDiagram": "a-maze-wall-bits"
          },
          {
            "title": "深さ優先と幅優先、2種類の迷路生成を実装",
            "challenge": "一つの生成方法だけでなく、探索する順序が異なる2種類の迷路生成アルゴリズムを実装する必要があった。深く進んでから戻る方法と、開始地点の周囲から段階的に広げる方法を、それぞれ独立した生成処理として構成した。",
            "solution": "壁を開けられる条件と隣接する2セルの壁を同時に更新する処理は共通化。どちらの方式でもSeedを使って方向の選択順を並べ替え、同じSeedから同じ迷路を生成できる構成とした。",
            "solutionSteps": [
              {
                "title": "DFS（深さ優先探索）：一つの経路を深く掘る",
                "text": "未訪問の隣接セルを一つ選んで壁を開き、再帰的に次のセルへ移動。進めるセルがなくなった場合は一つ前のセルへ戻り、別の方向から生成を再開するバックトラック方式で実装。",
                "diagram": "a-maze-dfs"
              },
              {
                "title": "BFS（幅優先探索）：開始地点の周囲から広げる",
                "text": "開始セルをキューへ追加し、先頭から取り出したセルの未訪問の隣接セルへ通路を作成。新しく接続したセルをキューの末尾へ追加し、開始地点から近いセルの順に生成範囲を広げる方式で実装。",
                "diagram": "a-maze-bfs"
              }
            ]
          },
          {
            "title": "循環のない完全迷路を生成",
            "challenge": "完全迷路では、通行可能なすべてのセルをつなぎながら、任意の2セル間の経路を一つだけにする必要があった。外周や中央の「42」保護領域を維持し、途中で経路の循環を作らない生成方法が必要だった。",
            "solution": "すべての壁を閉じた状態から生成を開始し、未訪問の隣接セルにだけ通路を接続。接続したセルを訪問済みにすることで、すでにつながっているセル間には新しい通路を作らず、循環を防止した。外壁、「42」保護領域、すでに開いている壁、3×3領域を完全開放する壁は、通路を作る前の判定で除外した。",
            "solutionDiagram": "a-maze-perfect-tree"
          },
          {
            "title": "制約を守りながら不完全迷路へ通路を追加",
            "challenge": "不完全迷路では、完成した完全迷路へ追加の通路を作り、複数の経路を持たせる必要があった。一方で、外壁と中央の「42」を維持し、3×3領域を完全に開放しないことが生成時の要件となる。さらに、確率判定だけでは通路が一つも追加されず、完全迷路のまま残る可能性もあった。",
            "solution": "完全迷路の生成後、閉じている壁を候補として走査。外壁、「42」保護領域、既存の通路、3×3完全開放の条件を確認し、通行可能な候補だけを5%の確率で開いた。確率判定で一つも開かなかった場合は候補を再走査し、条件を満たす最初の壁を開くことで、候補が存在する場合は最低一つの追加通路を確保した。",
            "solutionDiagram": "a-maze-imperfect-extra"
          },
          {
            "title": "生成方式から独立して最短経路を求める",
            "challenge": "DFSやBFSによる迷路の生成順序は、完成した迷路上の最短経路とは一致しない。生成アルゴリズムを切り替えても同じ方法で解ける仕組みが必要になる。",
            "solution": "生成処理とは別に、完成した迷路を対象とするBFSを実装。Startから通行可能なセルを順に探索し、各セルに「どのセルから到達したか」を記録した。Goalに到達した後、その記録をGoalから一つずつStartまで逆にたどり、順序を反転して最短経路を復元。N・E・S・Wの列として出力した。",
            "solutionDiagram": "a-maze-shortest-path"
          },
          {
            "title": "GitとPull Requestを使った2名での共同開発",
            "challenge": "2人が同じコードベースを並行して変更するため、作業内容が重なると変更の衝突や意図しない上書きが起こる可能性があった。統合前に、互いの実装内容と変更意図を確認できる進め方も必要だった。",
            "solution": "作業単位でGitブランチを分け、変更内容をPull Requestとして提出。互いにコードと変更意図を確認し、必要な修正やコンフリクトの解消を行ってからメインブランチへ統合した。"
          }
        ],
        "verification": [],
        "limitations": []
      },
      "en": {
        "caseStudies": [
          {
            "title": "Keep both sides of every wall consistent",
            "challenge": "Opening one passage changes two adjacent cells. Updating only one side would produce contradictory maze data.",
            "solution": "North, east, south and west use the 1, 2, 4 and 8 bits. A single wall-opening operation clears both the current wall and the opposite wall of its neighbor.",
            "solutionDiagram": "a-maze-wall-bits"
          },
          {
            "title": "Implement two maze generators: depth-first and breadth-first",
            "challenge": "The project required two maze-generation algorithms with different traversal orders: one that digs deeply and backtracks, and another that expands outward from the start in stages. Each was implemented as an independent generation process.",
            "solution": "Both algorithms share passage checks and the operation that updates both sides of a wall. A seed-scoped Random instance shuffles direction order so the same seed reproduces the same maze.",
            "solutionSteps": [
              {
                "title": "DFS: dig one branch deeply",
                "text": "Choose an unvisited neighbor, open the wall and recurse into that cell. When no unvisited neighbor remains, return to the previous cell and continue from another direction.",
                "diagram": "a-maze-dfs"
              },
              {
                "title": "BFS: expand outward from the start",
                "text": "Queue the start cell, remove cells from the front and open passages to unvisited neighbors. Append each connected cell to the back so generation expands in distance order.",
                "diagram": "a-maze-bfs"
              }
            ]
          },
          {
            "title": "Generate a cycle-free Perfect Maze",
            "challenge": "A Perfect Maze must connect every traversable cell while keeping exactly one route between any two cells. Generation must avoid cycles while preserving the outer boundary and the protected 42 region.",
            "solution": "Generation starts with every wall closed and opens passages only to unvisited neighbors. Each connected cell is marked visited, so already-connected cells are never joined again. Candidate checks reject outer walls, the protected 42 region, existing passages and changes that would fully open a 3x3 area.",
            "solutionDiagram": "a-maze-perfect-tree"
          },
          {
            "title": "Add passages for an Imperfect Maze without breaking constraints",
            "challenge": "An Imperfect Maze needs extra passages and multiple routes, but those passages must not break the outer boundary or protected 42 region, or fully open a 3x3 area. Pure random selection may add no passage and leave the maze perfect.",
            "solution": "After the Perfect Maze is complete, east and south walls are scanned as candidates. Eligible walls pass all structural checks and open with a 5% probability. If none opens, the candidates are scanned again and the first eligible wall is opened, ensuring at least one extra passage whenever a valid candidate exists.",
            "solutionDiagram": "a-maze-imperfect-extra"
          },
          {
            "title": "Solve the shortest route independently of generation",
            "challenge": "The order used to generate a maze is not necessarily its shortest solution and must not tie solving to DFS or BFS generation.",
            "solution": "A separate BFS explores traversable cells from Start and records which previous cell led to each one. After reaching Goal, it follows those records backward one cell at a time to Start, reverses the sequence and outputs the shortest route as N, E, S and W directions.",
            "solutionDiagram": "a-maze-shortest-path"
          },
          {
            "title": "Collaborate as a two-person team with Git and pull requests",
            "challenge": "Two contributors worked on the same codebase in parallel, so overlapping changes could conflict or overwrite one another. The team also needed a way to review each implementation and its intent before integration.",
            "solution": "Work was separated into Git branches and submitted through pull requests. Both contributors reviewed the code and intent, made required revisions, resolved conflicts and then merged the changes into the main branch."
          }
        ],
        "verification": [],
        "limitations": []
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
          {project.id === 'Call_Me_Maybe' ? (
            <div className="grid gap-3 text-xs leading-5">
              <section className="overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
                <h4 className="border-b border-[var(--color-splitter)] px-3 py-2 font-mono text-[11px] font-bold text-[var(--color-cli-text)]">
                  Available functions｜{language === 'ja' ? '登録済みの関数' : 'Registered functions'}
                </h4>
                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  {[
                    ['fn_add_numbers', 'a, b'],
                    ['fn_greet', 'name'],
                    ['fn_reverse_string', 's'],
                    ['fn_create_user', 'name, age'],
                  ].map(([name, parameters]) => (
                    <div key={name} className="flex min-w-0 items-center gap-1.5 rounded border border-[var(--color-splitter)] px-3 py-2 font-mono">
                      <strong className="break-all text-[var(--color-cli-text)]">{name}</strong>
                      <span className="shrink-0 opacity-55">({parameters})</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3">
                <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wide opacity-55">Current request｜{language === 'ja' ? 'ユーザーの依頼' : 'User request'}</p>
                <p className="font-mono text-[var(--color-text)]">What is the sum of 2 and 3?</p>
                {language === 'ja' && <p className="mt-1 text-[var(--color-text-muted)]">「2と3を足して」という自然言語の依頼</p>}
              </section>

              <div className="grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <section className="rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-55">Function selected</p>
                  <p className="mt-2 font-mono font-bold text-[#4f8f67]">✓ fn_add_numbers</p>
                  <p className="mt-1 text-[var(--color-text-muted)]">{language === 'ja' ? '依頼に合う登録済み関数を選択' : 'Select the registered function that matches the request'}</p>
                </section>
                <span aria-hidden="true" className="hidden self-center text-base font-bold text-[var(--color-accent-secondary)] md:block">→</span>
                <section className="rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-55">Generated arguments</p>
                  <code className="mt-2 block font-mono font-bold text-[#d5a94e]">{`{"a": 2, "b": 3}`}</code>
                  <p className="mt-1 text-[var(--color-text-muted)]">{language === 'ja' ? '関数に渡す値をJSON形式で生成' : 'Generate the values passed to the function as JSON'}</p>
                </section>
                <span aria-hidden="true" className="hidden self-center text-base font-bold text-[var(--color-accent-secondary)] md:block">→</span>
                <section className="rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-55">Schema validation</p>
                  <p className="mt-2 font-mono font-bold text-[#4f8f67]">✓ PASSED</p>
                  <p className="mt-1 text-[var(--color-text-muted)]">{language === 'ja' ? 'JSON形式・引数名・値の型を関数定義と照合' : 'Check JSON syntax, argument names, and value types against the function definition'}</p>
                </section>
              </div>
            </div>
          ) : project.id === 'souaoao/A-Maze-ing' ? (
            <div className="grid gap-3 text-xs leading-5">
              <div className="grid gap-2 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-[#0b1118] bg-[#34d399]" aria-hidden="true" />
                  <span><strong className="text-[#34d399]">Start</strong>：{language === 'ja' ? '探索の開始点' : 'search origin'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-[#0b1118] bg-[#fb7185]" aria-hidden="true" />
                  <span><strong className="text-[#fb7185]">Goal</strong>：{language === 'ja' ? '探索の終了点' : 'search destination'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-1 w-8 shrink-0 rounded bg-[#3b82f6]" aria-hidden="true" />
                  <span><strong className="text-[#3b82f6]">Shortest path</strong>：{language === 'ja' ? 'BFSで求めた最短経路' : 'shortest route found by BFS'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#22d3ee]" aria-hidden="true" />
                  <span><strong className="text-[#22d3ee]">Visited</strong>：{language === 'ja' ? '最短経路探索で確認したセル' : 'cells examined by the solver'}</span>
                </div>
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <span className="grid h-6 w-10 shrink-0 place-items-center rounded bg-[#a78bfa] font-mono text-[10px] font-black text-white" aria-hidden="true">42</span>
                  <span><strong className="text-[#a78bfa]">42</strong>：{language === 'ja' ? '全方向の壁を閉じた18セルの保護領域' : '18 protected cells with all four walls closed'}</span>
                </div>
              </div>
            </div>
          ) : project.id === 'Fly-in' ? (
            <div className="grid gap-3 text-xs leading-5">
              <div className="grid gap-3 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded border border-[var(--color-splitter)] px-3 py-2 text-[var(--color-text-muted)]">
                  <span><strong className="font-mono text-[#4f8f67]">Turn</strong> {language === 'ja' ? '現在 / 全ターン' : 'current / total'}</span>
                  <span><strong className="font-mono text-[#4f8f67]">Arrived</strong> {language === 'ja' ? '到着 / 全機' : 'at Goal / total'}</span>
                  <span><strong className="font-mono text-[#4f8f67]">Moving</strong> {language === 'ja' ? '移動中' : 'in transit'}</span>
                  <span><strong className="font-mono text-[#4f8f67]">Waiting</strong> {language === 'ja' ? '待機中' : 'in a zone'}</span>
                </div>
                <div className="grid gap-2 border-t border-[var(--color-splitter)] pt-3 sm:grid-cols-2">
                  <div className="rounded border border-[var(--color-splitter)] px-3 py-2">
                    <strong className="font-mono text-[#9faab8]">Zone　1 / 2</strong>
                    <p className="mt-0.5 text-[var(--color-text-muted)]">{language === 'ja' ? '現在いるドローン数 / そのZoneに入れる上限' : 'Drones present / zone limit'}</p>
                  </div>
                  <div className="rounded border border-[var(--color-splitter)] px-3 py-2">
                    <strong className="font-mono text-[#9faab8]">cap 2　→　1 / 2</strong>
                    <p className="mt-0.5 text-[var(--color-text-muted)]">{language === 'ja' ? '通路の上限。使用中は現在の移動数 / 上限' : 'Link limit; while active, moving drones / limit'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--color-splitter)] pt-3 text-[var(--color-text-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1 w-8 rounded bg-[#4f8f67]" aria-hidden="true" />
                    {language === 'ja' ? 'その通路をドローンが移動中' : 'Drones are moving on this link'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-0.5 w-8 rounded bg-[#414954]" aria-hidden="true" />
                    {language === 'ja' ? 'その通路を移動中のドローンなし' : 'No drone is moving on this link'}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-white bg-[#4f8f67]" aria-hidden="true" />
                  <span><strong className="text-[#4f8f67]">Start</strong>：{language === 'ja' ? '出発地点' : 'origin'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0 rounded-full border-[3px] border-white bg-[#3b82f6] ring-1 ring-[#3b82f6]" aria-hidden="true" />
                  <span><strong className="text-[#3b82f6]">Goal</strong>：{language === 'ja' ? '到着地点' : 'destination'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0 rounded bg-[#6b7280]" aria-hidden="true" />
                  <span><strong className="text-[#9ca3af]">Normal</strong>：{language === 'ja' ? '通常のZone' : 'standard zone'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 shrink-0 rotate-45 bg-[#facc15]" aria-hidden="true" />
                  <span><strong className="text-[#facc15]">Priority</strong>：{language === 'ja' ? '同コスト時に優先' : 'wins equal-cost ties'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-0 w-0 shrink-0 border-x-[8px] border-b-[14px] border-x-transparent border-b-[#f87171]" aria-hidden="true" />
                  <span><strong className="text-[#f87171]">Restricted</strong>：{language === 'ja' ? '進入に2ターン' : 'two-turn entry'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#dc2626] text-[10px] font-bold text-white" aria-hidden="true">×</span>
                  <span><strong className="text-[#dc2626]">Blocked</strong>：{language === 'ja' ? '通行不可' : 'unavailable'}</span>
                </div>
              </div>

            </div>
          ) : project.id === 'Codexion' ? (
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
                      <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[var(--color-splitter)] pt-3 text-center">
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
    { label: 'D1', x: 124, y: 76 },
    { label: 'D2', x: 236, y: 76 },
    { label: 'D3', x: 271, y: 179 },
    { label: 'D4', x: 180, y: 242 },
    { label: 'D5', x: 89, y: 179 },
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
          ? 'Coderとドングルを交互に円形配置。C1が左右のD1とD2を取得してコンパイルしている例'
          : 'Coders and dongles alternate around a ring. C1 is shown compiling while holding adjacent dongles D1 and D2.'}
      </desc>
      <polyline
        points={ring}
        fill="none"
        stroke="var(--color-splitter)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <line x1="180" y1="54" x2="124" y2="76" stroke="#4f8f67" strokeWidth="4" strokeLinecap="round" />
      <line x1="180" y1="54" x2="236" y2="76" stroke="#4f8f67" strokeWidth="4" strokeLinecap="round" />
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
        const isHeld = dongle.label === 'D1' || dongle.label === 'D2';
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

function CodexionDeadlockDiagram({
  mode,
  language,
}: {
  mode: 'circular-wait' | 'lock-order';
  language: 'ja' | 'en';
}) {
  const coders = [
    { label: 'C1', x: 180, y: 45 },
    { label: 'C2', x: 276, y: 115 },
    { label: 'C3', x: 239, y: 225 },
    { label: 'C4', x: 121, y: 225 },
    { label: 'C5', x: 84, y: 115 },
  ];
  const dongles = [
    { label: 'D1', x: 121, y: 69 },
    { label: 'D2', x: 239, y: 69 },
    { label: 'D3', x: 276, y: 178 },
    { label: 'D4', x: 180, y: 245 },
    { label: 'D5', x: 84, y: 178 },
  ];
  const heldPairs = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]];
  const waitingPairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
  const isLockOrder = mode === 'lock-order';
  const stopBeforeDongle = (coderIndex: number, dongleIndex: number) => {
    const coder = coders[coderIndex];
    const dongle = dongles[dongleIndex];
    const dx = dongle.x - coder.x;
    const dy = dongle.y - coder.y;
    const distance = Math.hypot(dx, dy);
    const endOffset = 18;
    return {
      x: dongle.x - (dx / distance) * endOffset,
      y: dongle.y - (dy / distance) * endOffset,
    };
  };

  if (isLockOrder) {
    const nodes = [...coders, ...dongles];
    const lockEdges = [
      { coder: 'C1', dongle: 'D1' },
      { coder: 'C2', dongle: 'D2' },
      { coder: 'C3', dongle: 'D3' },
      { coder: 'C4', dongle: 'D4' },
      { coder: 'C5', dongle: 'D1' },
    ];
    return (
      <svg
        role="img"
        aria-label={language === 'ja'
          ? '円形配置された全Coderが小さいDongle IDから大きいDongle IDへmutexを取得する図'
          : 'Circular layout showing every coder locking the lower dongle ID before the higher dongle ID'}
        viewBox="0 0 360 286"
        className="mx-auto mt-4 h-auto w-full max-w-[22rem]"
      >
        <title>{language === 'ja' ? '全Coder共通のmutex取得方向' : 'One mutex acquisition direction for every coder'}</title>
        <defs>
          <marker id="arrow-lock-first" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#4f8f67" />
          </marker>
        </defs>

        {lockEdges.map(({ coder, dongle }) => {
          const from = nodes.find((node) => node.label === coder)!;
          const to = nodes.find((node) => node.label === dongle)!;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const distance = Math.hypot(dx, dy);
          const endX = to.x - (dx / distance) * 18;
          const endY = to.y - (dy / distance) * 18;
          return (
            <line
              key={`${coder}-${dongle}`}
              x1={from.x}
              y1={from.y}
              x2={endX}
              y2={endY}
              stroke="#4f8f67"
              strokeWidth="2.75"
              strokeLinecap="round"
              markerEnd="url(#arrow-lock-first)"
            />
          );
        })}

        {coders.map((coder) => (
          <g key={coder.label}>
            <circle cx={coder.x} cy={coder.y} r="20" fill="#1f2937" stroke={coder.label === 'C5' ? 'var(--color-cli-text)' : 'var(--color-text-muted)'} strokeWidth={coder.label === 'C5' ? 3 : 2} />
            <text x={coder.x} y={coder.y + 4} textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">{coder.label}</text>
          </g>
        ))}
        {dongles.map((dongle) => (
          <g key={dongle.label}>
            <rect x={dongle.x - 14} y={dongle.y - 10} width="28" height="20" rx="4" fill="#facc15" stroke="#854d0e" strokeWidth="2" />
            <text x={dongle.x} y={dongle.y + 4} textAnchor="middle" fill="#422006" fontSize="9" fontWeight="800" fontFamily="ui-monospace, monospace">{dongle.label}</text>
          </g>
        ))}

        <text x="180" y="142" textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="800">
          {language === 'ja' ? '全Coder：小さいIDから取得' : 'Every coder: lower ID first'}
        </text>
        <text x="180" y="162" textAnchor="middle" fill="var(--color-cli-text)" fontSize="12" fontWeight="800" fontFamily="ui-monospace, monospace">
          C5：D1 → D5
        </text>
        <g transform="translate(91 270)">
          <line x1="0" y1="0" x2="24" y2="0" stroke="#4f8f67" strokeWidth="2.75" markerEnd="url(#arrow-lock-first)" />
          <text x="34" y="3" fill="var(--color-text-muted)" fontSize="9">{language === 'ja' ? '先に取得する小さいID' : 'lower ID acquired first'}</text>
        </g>
      </svg>
    );
  }

  return (
    <svg
      role="img"
      aria-label={isLockOrder
        ? (language === 'ja' ? 'C1が小さいIDのD1から大きいIDのD2の順に取得する図' : 'C1 acquires lower-ID D1 before higher-ID D2')
        : (language === 'ja' ? '各Coderが片方のドングルを保持してもう片方を待つ循環待ちの図' : 'Circular wait where each coder holds one dongle and waits for another')}
      viewBox="0 0 360 286"
      className="mx-auto mt-4 h-auto w-full max-w-[22rem]"
    >
      <title>{isLockOrder ? (language === 'ja' ? 'ID順で取得' : 'Acquire by ID order') : (language === 'ja' ? '循環待ち' : 'Circular wait')}</title>
      <defs>
        <marker id={`arrow-${mode}`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill={isLockOrder ? '#4f8f67' : '#ef6b73'} />
        </marker>
      </defs>

      {isLockOrder ? (
        <>
          <line x1="180" y1="45" x2="138" y2="62" stroke="#4f8f67" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow-lock-order)" />
          <line x1="180" y1="45" x2="222" y2="62" stroke="#4f8f67" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow-lock-order)" />
          <circle cx="151" cy="47" r="8" fill="#4f8f67" />
          <text x="151" y="50.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800">1</text>
          <circle cx="209" cy="47" r="8" fill="#4f8f67" />
          <text x="209" y="50.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800">2</text>
        </>
      ) : (
        <>
          {heldPairs.map(([coderIndex, dongleIndex]) => (
            <line
              key={`held-${coderIndex}`}
              x1={coders[coderIndex].x}
              y1={coders[coderIndex].y}
              x2={dongles[dongleIndex].x}
              y2={dongles[dongleIndex].y}
              stroke="#4f8f67"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          {waitingPairs.map(([coderIndex, dongleIndex]) => (
            (() => {
              const end = stopBeforeDongle(coderIndex, dongleIndex);
              return (
                <line
                  key={`waiting-${coderIndex}`}
                  x1={coders[coderIndex].x}
                  y1={coders[coderIndex].y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#ef6b73"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-circular-wait)"
                />
              );
            })()
          ))}
        </>
      )}

      {coders.map((coder) => {
        const active = !isLockOrder || coder.label === 'C1';
        return (
          <g key={coder.label} opacity={active ? 1 : 0.38}>
            <circle cx={coder.x} cy={coder.y} r="20" fill={active ? '#1f2937' : 'var(--color-bg)'} stroke="var(--color-cli-text)" strokeWidth="2" />
            <text x={coder.x} y={coder.y + 4} textAnchor="middle" fill={active ? '#f8fafc' : 'var(--color-text-muted)'} fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">{coder.label}</text>
          </g>
        );
      })}
      {dongles.map((dongle) => {
        const active = !isLockOrder || dongle.label === 'D1' || dongle.label === 'D2';
        return (
          <g key={dongle.label} opacity={active ? 1 : 0.38}>
            <rect x={dongle.x - 14} y={dongle.y - 10} width="28" height="20" rx="4" fill={active ? '#facc15' : 'var(--color-bg)'} stroke={active ? '#854d0e' : 'var(--color-text-muted)'} strokeWidth="2" />
            <text x={dongle.x} y={dongle.y + 4} textAnchor="middle" fill={active ? '#422006' : 'var(--color-text-muted)'} fontSize="9" fontWeight="800" fontFamily="ui-monospace, monospace">{dongle.label}</text>
          </g>
        );
      })}

      {isLockOrder ? (
        <g>
          <rect x="94" y="145" width="172" height="47" rx="8" fill="var(--color-accent-soft)" stroke="var(--color-accent-border)" />
          <text x="180" y="163" textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontWeight="700">
            {language === 'ja' ? '各Coderが左右2台をID順に取得' : 'Each coder locks its pair by ID'}
          </text>
          <text x="180" y="182" textAnchor="middle" fill="var(--color-text)" fontSize="13" fontWeight="800" fontFamily="ui-monospace, monospace">D1 → D2</text>
        </g>
      ) : (
        <g>
          <text x="180" y="139" textAnchor="middle" fill="#ef6b73" fontSize="12" fontWeight="800">{language === 'ja' ? '循環待ち' : 'CIRCULAR WAIT'}</text>
          <text x="180" y="158" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9.5">{language === 'ja' ? '全スレッドが次のmutexを待機' : 'every thread waits for the next mutex'}</text>
        </g>
      )}

      <g transform="translate(92 270)" fontSize="9">
        <line x1="0" y1="0" x2="22" y2="0" stroke="#4f8f67" strokeWidth="3" strokeLinecap="round" />
        <text x="29" y="3" fill="var(--color-text-muted)">{language === 'ja' ? 'mutexを保持' : 'mutex held'}</text>
        {!isLockOrder && <>
          <line x1="105" y1="0" x2="127" y2="0" stroke="#ef6b73" strokeWidth="2.5" />
          <text x="134" y="3" fill="var(--color-text-muted)">{language === 'ja' ? 'mutexを待機' : 'mutex waiting'}</text>
        </>}
      </g>
    </svg>
  );
}

function CodexionPartialOwnershipDiagram({ language }: { language: 'ja' | 'en' }) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
      <svg
        role="img"
        aria-label={language === 'ja' ? 'C1がD1を保有してD2を待つため、C5がD1を取得できずタイムアウトする例' : 'C1 holds D1 while waiting for D2, preventing C5 from acquiring D1 before its timeout'}
        viewBox="0 0 360 270"
        className="h-auto w-full"
      >
        <defs>
          <marker id="arrow-partial-wait" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#ef6b73" />
          </marker>
        </defs>

        <path d="M60 150 Q100 112 145 88 Q185 50 230 55 Q282 70 320 108" fill="none" stroke="var(--color-splitter)" strokeWidth="2" />

        <line x1="230" y1="55" x2="160" y2="82" stroke="#4f8f67" strokeWidth="4" strokeLinecap="round" />
        <line x1="230" y1="55" x2="302" y2="98" stroke="#ef6b73" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrow-partial-wait)" />
        <line x1="60" y1="150" x2="127" y2="98" stroke="#ef6b73" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrow-partial-wait)" />

        <circle cx="230" cy="55" r="21" fill="#1f2937" stroke="var(--color-text-muted)" strokeWidth="2" />
        <text x="230" y="59" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">C1</text>
        <circle cx="60" cy="150" r="21" fill="#1f2937" stroke="#ef6b73" strokeWidth="3" />
        <text x="60" y="154" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">C5</text>

        <rect x="128" y="77" width="34" height="23" rx="4" fill="#4f8f67" stroke="#2f6b4a" strokeWidth="2" />
        <text x="145" y="93" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace">D1</text>
        <rect x="303" y="97" width="34" height="23" rx="4" fill="#ef6b73" stroke="#991b1b" strokeWidth="2" />
        <text x="320" y="113" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace">D2</text>
        <text x="320" y="137" textAnchor="middle" fill="#ef6b73" fontSize="9" fontWeight="700">{language === 'ja' ? '利用不可' : 'unavailable'}</text>

        <text x="230" y="14" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9.5" fontWeight="700">
          {language === 'ja' ? 'D1を保有したまま' : 'holds D1 while'}
        </text>
        <text x="230" y="28" textAnchor="middle" fill="#ef6b73" fontSize="9.5" fontWeight="800">
          {language === 'ja' ? 'D2を待機中…' : 'waiting for D2…'}
        </text>
        <text x="60" y="190" textAnchor="middle" fill="#ef6b73" fontSize="9.5" fontWeight="800">
          {language === 'ja' ? 'タイムアウトが近い' : 'earlier timeout'}
        </text>
        <g transform="translate(90 219)">
          <line x1="0" y1="0" x2="22" y2="0" stroke="#4f8f67" strokeWidth="4" strokeLinecap="round" />
          <text x="30" y="3" fill="var(--color-text-muted)" fontSize="9">{language === 'ja' ? '所有' : 'owned'}</text>
          <line x1="104" y1="0" x2="126" y2="0" stroke="#ef6b73" strokeWidth="2.5" markerEnd="url(#arrow-partial-wait)" />
          <text x="135" y="3" fill="var(--color-text-muted)" fontSize="9">{language === 'ja' ? '取得待ち' : 'waiting'}</text>
        </g>
        <text x="180" y="255" textAnchor="middle" fill="#ef6b73" fontSize="10" fontWeight="800">
          {language === 'ja' ? 'C5はコンパイルできず、制限時間を超過' : 'C5 cannot compile before its deadline'}
        </text>
      </svg>
    </div>
  );
}

function CodexionAtomicPairDiagram({ language }: { language: 'ja' | 'en' }) {
  return (
    <div
      role="img"
      aria-label={language === 'ja' ? 'C1の隣接するD1とD2を確認し、片方が利用できなければ割り当てず、両方利用できる場合だけ2台を一括割り当てする図' : 'C1 assigns neither adjacent dongle when one is unavailable and assigns both only when D1 and D2 are available'}
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <section className="overflow-hidden rounded-md border border-[#ef6b73] bg-[var(--color-cli-bg)]">
        <h5 className="border-b border-[#ef6b73]/50 px-3 py-2 text-center text-[11px] font-bold text-[#ef6b73]">
          {language === 'ja' ? 'どちらかを利用できない' : 'Either dongle unavailable'}
        </h5>
        <svg viewBox="0 0 220 145" className="h-auto w-full" aria-hidden="true">
          <line x1="110" y1="35" x2="55" y2="102" stroke="var(--color-splitter)" strokeWidth="2" />
          <line x1="110" y1="35" x2="165" y2="102" stroke="var(--color-splitter)" strokeWidth="2" />
          <circle cx="110" cy="35" r="22" fill="#1f2937" stroke="var(--color-cli-text)" strokeWidth="2" />
          <text x="110" y="39" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="800" fontFamily="ui-monospace, monospace">C1</text>
          <rect x="39" y="92" width="32" height="22" rx="4" fill="#facc15" stroke="#854d0e" strokeWidth="2" />
          <text x="55" y="107" textAnchor="middle" fill="#422006" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace">D1</text>
          <text x="55" y="130" textAnchor="middle" fill="#4f8f67" fontSize="9" fontWeight="700">{language === 'ja' ? '利用可' : 'available'}</text>
          <rect x="149" y="92" width="32" height="22" rx="4" fill="#ef6b73" stroke="#991b1b" strokeWidth="2" />
          <text x="165" y="107" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace">D2</text>
          <text x="165" y="130" textAnchor="middle" fill="#ef6b73" fontSize="9" fontWeight="700">{language === 'ja' ? '利用不可' : 'unavailable'}</text>
          <circle cx="110" cy="82" r="13" fill="var(--color-bg)" stroke="#ef6b73" strokeWidth="2" />
          <path d="M104 76 L116 88 M116 76 L104 88" stroke="#ef6b73" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="border-t border-[var(--color-splitter)] px-3 py-3 text-center text-[11px] leading-5">
          <strong className="block text-[#ef6b73]">{language === 'ja' ? '1台も割り当てない' : 'Assign neither'}</strong>
          <span className="text-[var(--color-text-muted)]">{language === 'ja' ? '両mutexを解放して再試行' : 'Unlock both mutexes and retry'}</span>
        </div>
        </section>

      <section className="overflow-hidden rounded-md border border-[#4f8f67] bg-[var(--color-cli-bg)]">
        <h5 className="border-b border-[#4f8f67]/50 px-3 py-2 text-center text-[11px] font-bold text-[#4f8f67]">
          {language === 'ja' ? '2台とも利用できる' : 'Both dongles available'}
        </h5>
        <svg viewBox="0 0 220 145" className="h-auto w-full" aria-hidden="true">
          <line x1="110" y1="35" x2="55" y2="102" stroke="#4f8f67" strokeWidth="5" strokeLinecap="round" />
          <line x1="110" y1="35" x2="165" y2="102" stroke="#4f8f67" strokeWidth="5" strokeLinecap="round" />
          <circle cx="110" cy="35" r="22" fill="#4f8f67" stroke="#2f6b4a" strokeWidth="2" />
          <text x="110" y="39" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="800" fontFamily="ui-monospace, monospace">C1</text>
          <rect x="39" y="92" width="32" height="22" rx="4" fill="#4f8f67" stroke="#2f6b4a" strokeWidth="2" />
          <text x="55" y="107" textAnchor="middle" fill="#f0fdf4" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace">D1</text>
          <rect x="149" y="92" width="32" height="22" rx="4" fill="#4f8f67" stroke="#2f6b4a" strokeWidth="2" />
          <text x="165" y="107" textAnchor="middle" fill="#f0fdf4" fontSize="10" fontWeight="800" fontFamily="ui-monospace, monospace">D2</text>
          <text x="110" y="132" textAnchor="middle" fill="#4f8f67" fontSize="9" fontWeight="800">{language === 'ja' ? '2台を同じCoderへ割り当て' : 'pair assigned to one coder'}</text>
        </svg>
        <div className="border-t border-[var(--color-splitter)] px-3 py-3 text-center text-[11px] leading-5">
          <strong className="block text-[#4f8f67]">{language === 'ja' ? 'D1・D2をC1へ一括割り当て' : 'Assign D1 and D2 to C1'}</strong>
          <span className="text-[var(--color-text-muted)]">{language === 'ja' ? 'mutexを解放してコンパイルへ' : 'Unlock mutexes, then compile'}</span>
        </div>
        </section>
    </div>
  );
}

function CodexionPriorityHeapDiagram({ language }: { language: 'ja' | 'en' }) {
  const PriorityFlow = ({ mode }: { mode: 'fifo' | 'edf' }) => {
    const isFifo = mode === 'fifo';
    const selectedCoder = isFifo ? 'C1' : 'C2';
    return (
      <section className="overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
        <h5 className="border-b border-[var(--color-splitter)] px-3 py-2 text-center text-[11px] font-bold">
          {mode.toUpperCase()}：{isFifo ? (language === 'ja' ? '到着順で比較' : 'compare arrival') : (language === 'ja' ? '期限で比較' : 'compare deadline')}
        </h5>
        <svg viewBox="0 0 420 142" className="h-auto w-full" aria-hidden="true">
          <defs>
            <marker id={`arrow-priority-${mode}`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--color-cli-text)" />
            </marker>
          </defs>
          <circle cx="32" cy="38" r="19" fill="#1f2937" stroke="var(--color-cli-text)" strokeWidth="2" />
          <text x="32" y="42" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">C1</text>
          <text x="62" y="33" fill="var(--color-text)" fontSize="10" fontWeight={isFifo ? '800' : '600'}>{language === 'ja' ? '到着：1' : 'Arrival: 1'}</text>
          <text x="62" y="49" fill="var(--color-text-muted)" fontSize="10" fontWeight={!isFifo ? '800' : '600'}>{language === 'ja' ? '期限：800 ms' : 'Deadline: 800 ms'}</text>

          <circle cx="32" cy="103" r="19" fill="#1f2937" stroke="var(--color-cli-text)" strokeWidth="2" />
          <text x="32" y="107" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">C2</text>
          <text x="62" y="98" fill="var(--color-text)" fontSize="10" fontWeight={isFifo ? '800' : '600'}>{language === 'ja' ? '到着：2' : 'Arrival: 2'}</text>
          <text x="62" y="114" fill="var(--color-text-muted)" fontSize="10" fontWeight={!isFifo ? '800' : '600'}>{language === 'ja' ? '期限：500 ms' : 'Deadline: 500 ms'}</text>

          <line x1="151" y1="38" x2="188" y2="61" stroke="var(--color-splitter)" strokeWidth="2" />
          <line x1="151" y1="103" x2="188" y2="80" stroke="var(--color-splitter)" strokeWidth="2" />
          <rect x="188" y="49" width="104" height="44" rx="9" fill="var(--color-accent-soft)" stroke="var(--color-accent-border)" strokeWidth="2" />
          <text x="240" y="66" textAnchor="middle" fill="var(--color-cli-text)" fontSize="11" fontWeight="800">min-heap</text>
          <text x="240" y="82" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9.5" fontWeight="700">
            {isFifo ? (language === 'ja' ? '到着順に並べ替え' : 'order by arrival') : (language === 'ja' ? '期限順に並べ替え' : 'order by deadline')}
          </text>
          <line x1="292" y1="71" x2="346" y2="71" stroke="var(--color-cli-text)" strokeWidth="2.5" markerEnd={`url(#arrow-priority-${mode})`} />
          <circle cx="377" cy="71" r="21" fill="var(--color-accent-soft)" stroke="var(--color-cli-text)" strokeWidth="2.5" />
          <text x="377" y="75" textAnchor="middle" fill="var(--color-cli-text)" fontSize="12" fontWeight="800" fontFamily="ui-monospace, monospace">{selectedCoder}</text>
          <text x="377" y="106" textAnchor="middle" fill="var(--color-cli-text)" fontSize="9.5" fontWeight="800">
            {language === 'ja' ? '先に選択' : 'selected first'}
          </text>
        </svg>
      </section>
    );
  };

  return (
    <div
      role="img"
      aria-label={language === 'ja' ? '同じ待機要求をFIFOでは到着順、EDFでは期限順に並べるバイナリmin-heapの比較' : 'Binary min-heaps ordering the same requests by arrival for FIFO and deadline for EDF'}
      className="mt-4 grid gap-3"
    >
      <div className="grid gap-3">
        <PriorityFlow mode="fifo" />
        <PriorityFlow mode="edf" />
      </div>
    </div>
  );
}

function CodexionLogDiagram({ mode, language }: { mode: 'interleaving' | 'mutex'; language: 'ja' | 'en' }) {
  const protectedOutput = mode === 'mutex';
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
      <svg
        role="img"
        aria-label={protectedOutput
          ? (language === 'ja' ? '複数スレッドのログをlog_mutexで1行ずつ出力する図' : 'log_mutex serializes log lines from multiple threads')
          : (language === 'ja' ? '複数スレッドが同時に出力してログ内容が混ざる図' : 'Concurrent threads produce mixed log output')}
        viewBox="0 0 360 205"
        className="h-auto w-full"
      >
        <defs>
          <marker id={`arrow-log-${mode}`} markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill={protectedOutput ? '#4f8f67' : '#ef6b73'} />
          </marker>
        </defs>
        <circle cx="40" cy="58" r="21" fill="#1f2937" stroke="var(--color-cli-text)" strokeWidth="2" />
        <text x="40" y="62" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">C1</text>
        <circle cx="40" cy="144" r="21" fill="#1f2937" stroke="var(--color-cli-text)" strokeWidth="2" />
        <text x="40" y="148" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="ui-monospace, monospace">C2</text>

        {protectedOutput ? (
          <>
            <line x1="62" y1="58" x2="133" y2="88" stroke="#4f8f67" strokeWidth="2.5" markerEnd="url(#arrow-log-mutex)" />
            <line x1="62" y1="144" x2="133" y2="113" stroke="#4f8f67" strokeWidth="2.5" markerEnd="url(#arrow-log-mutex)" />
            <rect x="136" y="77" width="86" height="49" rx="8" fill="var(--color-accent-soft)" stroke="#4f8f67" strokeWidth="2" />
            <text x="179" y="98" textAnchor="middle" fill="#4f8f67" fontSize="10.5" fontWeight="800" fontFamily="ui-monospace, monospace">log_mutex</text>
            <text x="179" y="114" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9">{language === 'ja' ? '1件ずつ通す' : 'one at a time'}</text>
            <line x1="222" y1="101" x2="257" y2="101" stroke="#4f8f67" strokeWidth="2.5" markerEnd="url(#arrow-log-mutex)" />
            <rect x="264" y="48" width="82" height="106" rx="7" fill="var(--color-bg)" stroke="#4f8f67" strokeWidth="2" />
            <text x="305" y="72" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="700">LOG</text>
            <text x="276" y="96" fill="var(--color-text)" fontSize="8.5" fontFamily="ui-monospace, monospace">12 1 compiling</text>
            <text x="276" y="116" fill="var(--color-text)" fontSize="8.5" fontFamily="ui-monospace, monospace">13 2 debugging</text>
            <text x="276" y="136" fill="#4f8f67" fontSize="8.5" fontWeight="800">{language === 'ja' ? '行単位で出力' : 'complete lines'}</text>
          </>
        ) : (
          <>
            <line x1="62" y1="58" x2="143" y2="92" stroke="#ef6b73" strokeWidth="2.5" markerEnd="url(#arrow-log-interleaving)" />
            <line x1="62" y1="144" x2="143" y2="110" stroke="#ef6b73" strokeWidth="2.5" markerEnd="url(#arrow-log-interleaving)" />
            <rect x="151" y="64" width="195" height="76" rx="7" fill="var(--color-bg)" stroke="#ef6b73" strokeWidth="2" />
            <text x="248" y="85" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="700">LOG</text>
            <text x="248" y="108" textAnchor="middle" fill="#ef6b73" fontSize="8.5" fontFamily="ui-monospace, monospace">13 2 deb12 1 compuggingiling</text>
            <text x="248" y="128" textAnchor="middle" fill="#ef6b73" fontSize="9" fontWeight="800">{language === 'ja' ? '2つの出力内容が混在' : 'two messages become mixed'}</text>
          </>
        )}
        <text x="180" y="187" textAnchor="middle" fill={protectedOutput ? '#4f8f67' : '#ef6b73'} fontSize="10" fontWeight="800">
          {protectedOutput
            ? (language === 'ja' ? '1行の出力完了後に、次のスレッドへ' : 'The next thread prints after the current line finishes')
            : (language === 'ja' ? 'ログの整合性を保てない' : 'Log integrity cannot be maintained')}
        </text>
      </svg>
    </div>
  );
}

function CodexionMonitorDiagram({ language }: { language: 'ja' | 'en' }) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)]">
      <svg
        role="img"
        aria-label={language === 'ja' ? '監視専用スレッドが完了とタイムアウトを約1ms間隔で繰り返し判定する図' : 'A monitor thread repeatedly checks completion and timeout at roughly 1 ms intervals'}
        viewBox="0 0 360 250"
        className="h-auto w-full"
      >
        <defs>
          <marker id="arrow-monitor" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--color-cli-text)" />
          </marker>
          <marker id="arrow-monitor-stop" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#ef6b73" />
          </marker>
        </defs>

        <rect x="111" y="15" width="138" height="34" rx="17" fill="var(--color-accent-soft)" stroke="var(--color-cli-text)" strokeWidth="2" />
        <text x="180" y="36" textAnchor="middle" fill="var(--color-cli-text)" fontSize="10.5" fontWeight="800">
          {language === 'ja' ? '監視専用スレッド' : 'Monitor thread'}
        </text>
        <text x="180" y="68" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="700">
          {language === 'ja' ? '約1ms間隔で確認' : 'check about every 1 ms'}
        </text>
        <path d="M111 32 H18 V111 H29" fill="none" stroke="var(--color-cli-text)" strokeWidth="2" markerEnd="url(#arrow-monitor)" />

        <rect x="35" y="90" width="132" height="42" rx="8" fill="var(--color-bg)" stroke="var(--color-splitter)" strokeWidth="2" />
        <text x="101" y="108" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="800">
          {language === 'ja' ? '全員が目標回数を完了？' : 'Everyone reached target?'}
        </text>
        <text x="101" y="123" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8.5">finish_mutex</text>

        <line x1="167" y1="111" x2="194" y2="111" stroke="var(--color-cli-text)" strokeWidth="2" markerEnd="url(#arrow-monitor)" />
        <text x="180" y="104" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8" fontWeight="800">NO</text>
        <rect x="200" y="90" width="126" height="42" rx="8" fill="var(--color-bg)" stroke="var(--color-splitter)" strokeWidth="2" />
        <text x="263" y="108" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="800">
          {language === 'ja' ? '期限を超過したCoder？' : 'Any coder timed out?'}
        </text>
        <text x="263" y="123" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8.5">state_mutex</text>

        <path d="M326 111 H344 V32 H255" fill="none" stroke="var(--color-cli-text)" strokeWidth="2" markerEnd="url(#arrow-monitor)" />
        <text x="336" y="104" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8" fontWeight="800">NO</text>

        <line x1="101" y1="132" x2="101" y2="169" stroke="#4f8f67" strokeWidth="2.5" markerEnd="url(#arrow-monitor)" />
        <text x="109" y="153" fill="#4f8f67" fontSize="8" fontWeight="800">YES</text>
        <rect x="38" y="175" width="126" height="36" rx="8" fill="var(--color-accent-soft)" stroke="#4f8f67" strokeWidth="2" />
        <text x="101" y="197" textAnchor="middle" fill="#4f8f67" fontSize="10" fontWeight="800">
          {language === 'ja' ? '正常終了' : 'Complete'}
        </text>

        <line x1="263" y1="132" x2="263" y2="169" stroke="#ef6b73" strokeWidth="2.5" markerEnd="url(#arrow-monitor-stop)" />
        <text x="271" y="153" fill="#ef6b73" fontSize="8" fontWeight="800">YES</text>
        <rect x="200" y="175" width="126" height="49" rx="8" fill="var(--color-bg)" stroke="#ef6b73" strokeWidth="2" />
        <text x="263" y="194" textAnchor="middle" fill="#ef6b73" fontSize="9.5" fontWeight="800">
          {language === 'ja' ? '停止フラグを更新' : 'Set stop flag'}
        </text>
        <text x="263" y="211" textAnchor="middle" fill="#ef6b73" fontSize="9" fontWeight="800">burned out</text>
      </svg>
    </div>
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

function FlyInDecisionDiagram({ kind, language }: { kind: string; language: 'ja' | 'en' }) {
  type DiagramNode = { label: string; detail?: string; tone?: 'danger' | 'warning' | 'accent' | 'muted' };
  type DiagramConfig = { nodes: DiagramNode[]; code?: string; note?: string };
  const ja = language === 'ja';

  if (kind === 'flyin-unreserved-arrivals') {
    return (
      <div
        role="img"
        aria-label={ja
          ? '予約がないとD1とD2がどちらも空のRestricted Zoneへ移動し、次のターンに容量1のZoneへ2台が到着する'
          : 'Without reservations, D1 and D2 both move toward an empty Restricted Zone and two drones arrive at a capacity-one Zone on the next turn'}
        className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
      >
        <p className="font-mono text-[10px] font-bold text-[var(--color-text)]">
          {ja ? '予約を数えない場合' : 'Without destination reservations'}
        </p>
        <div className="mt-2 grid items-stretch gap-2 sm:grid-cols-[minmax(0,1.35fr)_auto_minmax(0,0.65fr)] sm:items-center">
          <section className="rounded-md border border-[#d6a84f] bg-[#d6a84f]/5 p-2.5">
            <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Turn N</p>
            <div className="mt-2 grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-splitter)] bg-[var(--color-bg)] font-mono text-[9px] font-bold">D1</span>
              <span aria-hidden="true" className="font-bold text-[#d6a84f]">→</span>
              <div className="row-span-2 flex min-h-16 flex-col items-center justify-center rounded-md border border-[#d6a84f] bg-[#d6a84f]/10 px-2 py-1.5 text-center">
                <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Restricted Zone</p>
                <p className="mt-1 font-mono text-[11px] font-bold text-[var(--color-text)]">0 / 1</p>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-splitter)] bg-[var(--color-bg)] font-mono text-[9px] font-bold">D2</span>
              <span aria-hidden="true" className="font-bold text-[#d6a84f]">→</span>
            </div>
            <p className="mt-2 text-center text-[9px] leading-4 text-[var(--color-text-muted)]">
              {ja ? 'どちらも「現在0台」を見て移動可能と判定' : 'both see zero current drones and are allowed to move'}
            </p>
          </section>

          <span aria-hidden="true" className="self-center text-center font-bold text-[#ef6b73] sm:rotate-0 rotate-90">→</span>

          <section className="flex flex-col items-center justify-center rounded-md border border-[#ef6b73] bg-[#ef6b73]/10 p-2.5 text-center">
            <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Turn N + 1</p>
            <p className="mt-2 font-mono text-[9px] font-bold text-[var(--color-text)]">Restricted Zone</p>
            <p className="mt-1 font-mono text-lg font-bold text-[#ef6b73]">2 / 1</p>
            <p className="mt-1 text-[9px] font-bold text-[#ef6b73]">{ja ? '容量超過' : 'over capacity'}</p>
          </section>
        </div>
      </div>
    );
  }

  if (kind === 'flyin-blocked-route' || kind === 'flyin-reroute') {
    const implementation = kind === 'flyin-reroute';
    return (
      <div
        role="img"
        aria-label={ja
          ? implementation
            ? '現在地D1から、満員のRestricted Zoneにペナルティを加えて再探索し、Normal Zoneを通る迂回路へ切り替える'
            : '現在地D1からGoalへの初期経路は満員のRestricted Zoneで進めないが、Normal Zoneを通る迂回路は空いている'
          : implementation
            ? 'From the single current position D1, add a penalty to the full Restricted Zone and switch to the detour through Normal Zones'
            : 'From the single current position D1, the initial route is blocked by a full Restricted Zone while the detour through Normal Zones is open'}
        className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
      >
        <div className="grid grid-cols-[3.75rem_2rem_minmax(0,1fr)_2rem_minmax(0,1fr)_2rem_3.75rem] grid-rows-2 items-center gap-x-1 gap-y-2">
          <div className="row-span-2 row-start-1 flex min-h-20 flex-col items-center justify-center rounded-md border border-[var(--color-splitter)] bg-[var(--color-bg)] px-1.5 py-2 text-center">
            <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">{ja ? '現在地' : 'Current'}</p>
            <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-cli-text)] font-mono text-[9px] font-bold text-[var(--color-cli-text)]">D1</span>
          </div>
          <span aria-hidden="true" className={[
            'col-start-2 row-start-1 text-center font-bold text-[#ef6b73]',
            implementation ? 'opacity-45' : '',
          ].join(' ')}>↗</span>
          <div className={[
            'col-span-3 col-start-3 row-start-1 rounded-md border border-[#ef6b73] bg-[#ef6b73]/10 px-2 py-2 text-center',
            implementation ? 'opacity-60' : '',
          ].join(' ')}>
            <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Restricted</p>
            <p className="mt-1 text-[9px] font-bold text-[#ef6b73]">
              {implementation ? (ja ? '満員 · Penalty +' : 'full · penalty +') : `1 / 1 · ${ja ? '満員' : 'full'}`}
            </p>
            <p className="mt-1 text-[8px] text-[#ef6b73]">
              {implementation ? (ja ? '旧経路' : 'previous route') : (ja ? '現在の経路' : 'current route')}
            </p>
          </div>
          <span aria-hidden="true" className={[
            'col-start-6 row-start-1 text-center font-bold text-[#ef6b73]',
            implementation ? 'opacity-45' : '',
          ].join(' ')}>↘</span>
          <div className="col-start-7 row-span-2 row-start-1 flex min-h-20 items-center justify-center rounded-md border border-[var(--color-splitter)] bg-[var(--color-bg)] px-1.5 py-2 text-center">
            <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Goal</p>
          </div>
          <span aria-hidden="true" className={[
            'col-start-2 row-start-2 text-center font-bold',
            implementation ? 'text-[#4f8f67]' : 'text-[var(--color-text-muted)]',
          ].join(' ')}>↘</span>
          <div className={[
            'col-start-3 row-start-2 min-w-0 rounded-md border px-1.5 py-2 text-center',
            implementation
              ? 'border-[#4f8f67] bg-[#4f8f67]/10'
              : 'border-dashed border-[var(--color-text-muted)] bg-[var(--color-bg)]',
          ].join(' ')}>
            <p className="truncate font-mono text-[9px] font-bold text-[var(--color-text)]">Normal A</p>
            <p className="mt-1 text-[8px] text-[var(--color-text-muted)]">0 / 2</p>
            <p className={[
              'mt-1 text-[8px] font-bold',
              implementation ? 'text-[var(--color-cli-text)]' : 'text-[var(--color-text-muted)]',
            ].join(' ')}>
              {implementation ? (ja ? '再探索で選択' : 'selected by rerouting') : (ja ? '未選択の迂回路' : 'unselected detour')}
            </p>
          </div>
          <span aria-hidden="true" className={[
            'col-start-4 row-start-2 text-center font-bold',
            implementation ? 'text-[#4f8f67]' : 'text-[var(--color-text-muted)]',
          ].join(' ')}>→</span>
          <div className={[
            'col-start-5 row-start-2 min-w-0 rounded-md border px-1.5 py-2 text-center',
            implementation
              ? 'border-[#4f8f67] bg-[#4f8f67]/10'
              : 'border-dashed border-[var(--color-text-muted)] bg-[var(--color-bg)]',
          ].join(' ')}>
            <p className="truncate font-mono text-[9px] font-bold text-[var(--color-text)]">Normal B</p>
            <p className="mt-1 text-[8px] text-[var(--color-text-muted)]">0 / 2</p>
          </div>
          <span aria-hidden="true" className={[
            'col-start-6 row-start-2 text-center font-bold',
            implementation ? 'text-[#4f8f67]' : 'text-[var(--color-text-muted)]',
          ].join(' ')}>↗</span>
        </div>

        {!implementation && (
          <p className="mt-3 rounded-md border border-[#ef6b73] bg-[#ef6b73]/10 px-2.5 py-2 text-center text-[9px] font-bold text-[#ef6b73]">
            {ja ? '迂回路があっても、進めない初期経路を待ち続ける' : 'The drone keeps waiting on the blocked initial route despite the open detour'}
          </p>
        )}
      </div>
    );
  }

  if (kind === 'flyin-weighted-route') {
    const routeNodeClass = 'rounded-md border px-2.5 py-2 text-center font-mono';
    return (
      <div
        role="img"
        aria-label={ja
          ? 'Startから各Zoneまでの累積コストを比較し、コストが小さい通常Zoneの経路を先に確定するDijkstra探索'
          : 'Dijkstra search compares accumulated costs from Start and confirms the lower-cost route through normal Zones first'}
        className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-splitter)] pb-2.5">
          <p className="font-mono text-[10px] font-bold text-[var(--color-text)]">
            {ja ? 'Dijkstra法による累積コストの比較' : 'Accumulated-cost comparison with Dijkstra'}
          </p>
          <p className="font-mono text-[9px] text-[var(--color-text-muted)]">
            {ja ? '基本 +1 / Restricted +1 / 容量1 +5 / 容量2 +2' : 'base +1 / Restricted +1 / capacity 1 +5 / capacity 2 +2'}
          </p>
        </div>

        <div className="grid gap-2.5">
          <div>
            <p className="mb-1.5 font-mono text-[9px] font-bold text-[var(--color-text-muted)]">{ja ? '候補 A' : 'Route A'}</p>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <div className={`${routeNodeClass} w-16 shrink-0 border-[var(--color-splitter)] bg-[var(--color-bg)] text-[var(--color-text)]`}>
                <p className="text-[10px] font-bold">Start</p>
                <p className="mt-0.5 text-[9px] opacity-65">0</p>
              </div>
              <span aria-hidden="true" className="shrink-0 text-center font-bold text-[var(--color-text-muted)]">→</span>
              <div className={`${routeNodeClass} min-w-0 flex-1 border-[#d6a84f] bg-[#d6a84f]/10 text-[var(--color-text)]`}>
                <p className="text-[10px] font-bold">Restricted</p>
                <p className="mt-0.5 text-[9px] opacity-65">+7</p>
              </div>
              <span aria-hidden="true" className="shrink-0 text-center font-bold text-[var(--color-text-muted)]">→</span>
              <div className={`${routeNodeClass} min-w-0 flex-1 border-[var(--color-splitter)] bg-[var(--color-bg)] text-[var(--color-text)]`}>
                <p className="text-[10px] font-bold">Goal</p>
                <p className="mt-0.5 text-[9px] opacity-65">+1</p>
              </div>
              <span className="w-16 shrink-0 rounded-md border border-[#d6a84f] bg-[#d6a84f]/10 px-1.5 py-1 text-center font-mono text-[9px] text-[var(--color-text)]">
                <strong className="block">{ja ? '合計 8' : 'total 8'}</strong>
                <span className="opacity-65">{ja ? '保留' : 'hold'}</span>
              </span>
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[9px] font-bold text-[var(--color-cli-text)]">{ja ? '候補 B' : 'Route B'}</p>
            <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              {[
                ['Start', '0'],
                ['Normal', '+1'],
                ['Normal', '+1'],
                ['Goal', '+1'],
              ].map(([label, cost], routeIndex) => (
                <Fragment key={`${label}-${cost}`}>
                  <div className={`${routeNodeClass} min-w-0 flex-1 ${routeIndex === 0 ? 'border-[var(--color-splitter)] bg-[var(--color-bg)]' : 'border-[#4f8f67] bg-[#4f8f67]/10'} text-[var(--color-text)]`}>
                    <p className="truncate text-[10px] font-bold">{label}</p>
                    <p className="mt-0.5 text-[9px] opacity-65">{cost}</p>
                  </div>
                  {routeIndex < 3 && (
                    <span aria-hidden="true" className="shrink-0 text-center font-bold text-[var(--color-cli-text)]">→</span>
                  )}
                </Fragment>
              ))}
              <span className="w-16 shrink-0 rounded-md border border-[#4f8f67] bg-[#4f8f67]/10 px-1.5 py-1 text-center font-mono text-[9px] text-[var(--color-text)]">
                <strong className="block text-[var(--color-cli-text)]">{ja ? '合計 3' : 'total 3'}</strong>
                <span className="opacity-65">{ja ? '選択' : 'select'}</span>
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 border-t border-[var(--color-splitter)] pt-2.5 text-center text-[10px] leading-5 text-[var(--color-text-muted)]">
          {ja
            ? '各Zoneのコストを加算し、合計が小さい経路を初期経路として選択'
            : 'Add each Zone cost and choose the route with the lower total as the initial route'}
        </p>
      </div>
    );
  }

  if (kind === 'flyin-capacity-state') {
    return (
      <div
        role="img"
        aria-label={ja
          ? '移動前に容量を確認し、Normal Zoneは同じターン、Restricted Zoneは次のターンに到着する処理'
          : 'Check capacity before movement; Normal movement completes in the same turn and Restricted movement completes on the next turn'}
        className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
      >
        <div className="rounded-md border border-[#4f8f67] bg-[#4f8f67]/10 px-3 py-2.5 text-center">
          <p className="font-mono text-[10px] font-bold text-[var(--color-cli-text)]">
            {ja ? '移動前に容量を確認' : 'Check capacity before movement'}
          </p>
          <p className="mt-1 text-[10px] leading-5 text-[var(--color-text-muted)]">
            {ja
              ? '到着先の現在数＋予約数と、Connectionの使用数を確認'
              : 'Check destination occupancy plus reservations and current Connection usage'}
          </p>
          <span className="mt-1.5 inline-flex rounded-full border border-[#4f8f67] bg-[var(--color-bg)] px-2.5 py-1 font-mono text-[9px] font-bold text-[var(--color-cli-text)]">
            {ja ? 'どちらも上限内 → 移動可能' : 'both within limits → move allowed'}
          </span>
        </div>

        <div aria-hidden="true" className="py-1.5 text-center font-bold text-[var(--color-cli-text)]">↓</div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <section className="rounded-md border border-[var(--color-splitter)] bg-[var(--color-bg)] p-2.5">
            <p className="font-mono text-[10px] font-bold text-[var(--color-text)]">Normal Zone</p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="min-w-0 flex-1 rounded border border-[var(--color-splitter)] px-2 py-2 text-center">
                <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Turn N</p>
                <p className="mt-1 text-[9px] text-[var(--color-text-muted)]">{ja ? '出発' : 'depart'}</p>
              </div>
              <span aria-hidden="true" className="font-bold text-[var(--color-cli-text)]">→</span>
              <div className="min-w-0 flex-1 rounded border border-[#4f8f67] bg-[#4f8f67]/10 px-2 py-2 text-center">
                <p className="font-mono text-[9px] font-bold text-[var(--color-text)]">Turn N</p>
                <p className="mt-1 text-[9px] text-[var(--color-text-muted)]">{ja ? '到着・移動完了' : 'arrive and complete'}</p>
              </div>
            </div>
            <p className="mt-2 text-center text-[9px] text-[var(--color-text-muted)]">
              {ja ? '同じターン内で完了' : 'completed within the same turn'}
            </p>
          </section>

          <section className="rounded-md border border-[#d6a84f] bg-[#d6a84f]/5 p-2.5">
            <p className="font-mono text-[10px] font-bold text-[var(--color-text)]">Restricted Zone</p>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <div className="rounded border border-[#d6a84f] bg-[#d6a84f]/10 px-2 py-2 text-center">
                <p className="font-mono font-bold text-[var(--color-text)]">Turn N</p>
                <p className="mt-1 text-[9px] leading-4 text-[var(--color-text-muted)]">
                  {ja ? '出発 → 移動中' : 'depart → in transit'}
                </p>
                <p className="mt-1 text-[8px] leading-4 text-[var(--color-text-muted)]">
                  {ja ? 'Connectionを使用・到着先を予約' : 'use Connection and reserve destination'}
                </p>
              </div>
              <span aria-hidden="true" className="self-center font-bold text-[var(--color-text-muted)]">→</span>
              <div className="rounded border border-[#4f8f67] bg-[#4f8f67]/10 px-2 py-2 text-center">
                <p className="font-mono font-bold text-[var(--color-text)]">Turn N + 1</p>
                <p className="mt-1 text-[9px] leading-4 text-[var(--color-text-muted)]">
                  {ja ? '予約を解放 → 到着' : 'release reservation → arrive'}
                </p>
              </div>
            </div>
            <p className="mt-2 text-center text-[9px] text-[var(--color-text-muted)]">
              {ja ? '2ターンで完了' : 'completed over two turns'}
            </p>
          </section>
        </div>
      </div>
    );
  }

  const diagrams: Record<string, DiagramConfig> = {
  };
  const config = diagrams[kind];
  if (!config) return null;
  const toneClass: Record<NonNullable<DiagramNode['tone']>, string> = {
    danger: 'border-[#ef6b73] bg-[#ef6b73]/10 text-[#ef6b73]',
    warning: 'border-[#d6a84f] bg-[#d6a84f]/10 text-[var(--color-text)]',
    accent: 'border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-text)]',
    muted: 'border-[var(--color-splitter)] bg-[var(--color-bg)] text-[var(--color-text)]',
  };

  return (
    <div role="img" aria-label={config.nodes.map((node) => node.label).join(' → ')} className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {config.nodes.map((node, index) => (
          <Fragment key={`${kind}-${node.label}`}>
            <div className={`min-w-0 flex-1 rounded-md border px-2.5 py-2 text-center ${toneClass[node.tone ?? 'muted']}`}>
              <p className="font-mono text-[10px] font-bold leading-4">{node.label}</p>
              {node.detail && <p className="mt-1 text-[9px] leading-4 opacity-70">{node.detail}</p>}
            </div>
            {index < config.nodes.length - 1 && (
              <span aria-hidden="true" className="self-center font-bold text-[var(--color-text-muted)] sm:rotate-0 rotate-90">→</span>
            )}
          </Fragment>
        ))}
      </div>
      {config.code && (
        <div className="mt-3 border-t border-[var(--color-splitter)] pt-2.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{ja ? '参照コード' : 'Code reference'}</p>
          <code className="mt-1 block overflow-x-auto whitespace-nowrap font-mono text-[9px] leading-4 text-[var(--color-cli-text)]">{config.code}</code>
        </div>
      )}
    </div>
  );
}

function AMazeWallBitsDiagram({ language }: { language: 'ja' | 'en' }) {
  const ja = language === 'ja';

  return (
    <div
      role="img"
      aria-label={ja
        ? '北・東・南・西の壁を1・2・4・8の4ビットで管理し、1010では西と東の壁が閉じる例'
        : 'Four-bit wall model where north, east, south and west use values 1, 2, 4 and 8; 1010 closes west and east'}
      className="mt-4 overflow-hidden rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
    >
      <div className="grid items-center gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="relative mx-auto h-40 w-40 font-mono text-[9px] font-bold text-[var(--color-text)]">
          <span className="absolute left-1/2 top-0 -translate-x-1/2">N · 1</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2">E · 2</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2">S · 4</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2">W · 8</span>

          <div className="absolute inset-7 grid place-items-center bg-[var(--color-bg)] text-center">
            <span className="absolute inset-x-0 top-0 border-t-2 border-dashed border-[var(--color-text-muted)] opacity-45" />
            <span className="absolute inset-y-0 right-0 border-r-4 border-[#4f8f67]" />
            <span className="absolute inset-x-0 bottom-0 border-b-2 border-dashed border-[var(--color-text-muted)] opacity-45" />
            <span className="absolute inset-y-0 left-0 border-l-4 border-[#4f8f67]" />
            <div>
              <p className="text-[var(--color-text-muted)]">Cell</p>
              <p className="mt-1 text-xs text-[var(--color-cli-text)]">0b1010</p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] overflow-hidden rounded-md border border-[var(--color-splitter)] text-center font-mono text-[9px]">
            <span className="border-b border-r border-[var(--color-splitter)] bg-[var(--color-bg)] px-1 py-2 text-left text-[var(--color-text-muted)]">{ja ? '方向' : 'Direction'}</span>
            {['W', 'S', 'E', 'N'].map((direction) => (
              <span key={direction} className="border-b border-r border-[var(--color-splitter)] bg-[var(--color-bg)] px-1 py-2 font-bold last:border-r-0">{direction}</span>
            ))}
            <span className="border-b border-r border-[var(--color-splitter)] px-1 py-2 text-left text-[var(--color-text-muted)]">{ja ? '値' : 'Value'}</span>
            {[8, 4, 2, 1].map((value) => (
              <span key={value} className="border-b border-r border-[var(--color-splitter)] px-1 py-2 last:border-r-0">{value}</span>
            ))}
            <span className="border-r border-[var(--color-splitter)] bg-[#4f8f67]/5 px-1 py-2 text-left text-[var(--color-text-muted)]">0b1010</span>
            {[1, 0, 1, 0].map((bit, index) => (
              <span key={`${bit}-${index}`} className={[
                'border-r border-[var(--color-splitter)] px-1 py-2 font-bold last:border-r-0',
                bit === 1 ? 'bg-[#4f8f67]/10 text-[var(--color-cli-text)]' : 'text-[var(--color-text-muted)]',
              ].join(' ')}>{bit}</span>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px]">
            <span className="rounded-full border border-[#4f8f67] bg-[#4f8f67]/10 px-2 py-1 font-bold text-[var(--color-cli-text)]">
              1 = {ja ? '壁あり' : 'wall closed'}
            </span>
            <span className="rounded-full border border-[var(--color-splitter)] px-2 py-1 text-[var(--color-text-muted)]">
              0 = {ja ? '通路あり' : 'passage open'}
            </span>
            <code className="font-mono font-bold text-[var(--color-text)]">0b1010 = 8 + 2</code>
          </div>
          <p className="mt-2 text-[9px] leading-4 text-[var(--color-text-muted)]">
            {ja ? '西・東の壁が閉じ、北・南は通路として開いている状態' : 'West and east are closed; north and south are open passages.'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--color-splitter)] pt-3 text-center text-[9px]">
        <span className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] px-2 py-1.5">Cell A · E (2) = 0</span>
        <span aria-hidden="true" className="font-bold text-[var(--color-cli-text)]">↔</span>
        <span className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] px-2 py-1.5">Cell B · W (8) = 0</span>
        <span className="text-[var(--color-text-muted)]">{ja ? '通路を開くと両方を同時に更新' : 'opening a passage updates both cells'}</span>
      </div>
    </div>
  );
}

function AMazeGenerationStepDiagram({ mode, language }: { mode: 'dfs' | 'bfs'; language: 'ja' | 'en' }) {
  const ja = language === 'ja';
  const nodeClass = 'grid h-8 min-w-8 place-items-center rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] px-1 font-mono text-[9px] font-bold';

  if (mode === 'dfs') return (
    <div
      role="img"
      aria-label={ja ? 'DFSでStartから深く進み、4の行き止まりから3へ戻って5の方向へ生成を再開する' : 'DFS advances deeply from Start, backtracks from dead end 4 to 3, then continues toward 5'}
      className="mt-3 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
    >
      <div className="mx-auto grid w-fit grid-cols-[auto_1rem_auto_1rem_auto_1rem_auto_1rem_auto_1rem] grid-rows-[2rem_1.25rem_2rem_auto] items-center justify-items-center text-[9px] text-[var(--color-text-muted)]">
        <span className={`${nodeClass} col-start-1 row-start-1 border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-cli-text)]`}>Start</span>
        <span aria-hidden="true" className="col-start-2 row-start-1 font-bold">→</span>
        <span className={`${nodeClass} col-start-3 row-start-1`}>1</span>
        <span aria-hidden="true" className="col-start-4 row-start-1 font-bold">→</span>
        <span className={`${nodeClass} col-start-5 row-start-1`}>2</span>
        <span aria-hidden="true" className="col-start-6 row-start-1 font-bold">→</span>
        <span className={`${nodeClass} col-start-7 row-start-1`}>3</span>
        <span aria-hidden="true" className="col-start-8 row-start-1 font-bold">→</span>
        <span className={`${nodeClass} col-start-9 row-start-1 border-[#d6a84f] bg-[#d6a84f]/10`}>4</span>
        <span aria-hidden="true" className="col-start-10 row-start-1 h-9 border-l-4 border-[#d6a84f]" />

        <span aria-hidden="true" className="col-start-7 row-start-2 font-bold text-[var(--color-cli-text)]">↓</span>
        <span aria-hidden="true" className="col-start-8 row-start-2 font-mono text-sm font-bold text-[#d6a84f]">←···</span>
        <span className="col-span-2 col-start-9 row-start-2 whitespace-nowrap text-left text-[#d6a84f]">{ja ? '行き止まり' : 'dead end'}</span>

        <span className={`${nodeClass} col-start-7 row-start-3 border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-cli-text)]`}>5</span>
        <span className="col-span-4 col-start-7 row-start-4 mt-1 whitespace-nowrap text-center">{ja ? '3へ戻り、別の方向から生成を再開' : 'return to 3 and continue in another direction'}</span>
      </div>
    </div>
  );

  const placement: Array<{ value: string; row: number; col: number; tone: 'start' | 'one' | 'two' }> = [
    { value: '2', row: 1, col: 5, tone: 'two' },
    { value: '1', row: 3, col: 5, tone: 'one' },
    { value: '2', row: 5, col: 1, tone: 'two' },
    { value: '1', row: 5, col: 3, tone: 'one' },
    { value: 'Start', row: 5, col: 5, tone: 'start' },
    { value: '1', row: 5, col: 7, tone: 'one' },
    { value: '2', row: 5, col: 9, tone: 'two' },
    { value: '1', row: 7, col: 5, tone: 'one' },
    { value: '2', row: 9, col: 5, tone: 'two' },
  ];
  const arrows = [
    { value: '↑', row: 2, col: 5 }, { value: '↑', row: 4, col: 5 },
    { value: '←', row: 5, col: 2 }, { value: '←', row: 5, col: 4 },
    { value: '→', row: 5, col: 6 }, { value: '→', row: 5, col: 8 },
    { value: '↓', row: 6, col: 5 }, { value: '↓', row: 8, col: 5 },
  ];

  return (
    <div
      role="img"
      aria-label={ja ? 'BFSでStartの上下左右へ距離1、その外側へ距離2の順に迷路を広げる' : 'BFS expands from Start to distance-one cells in four directions, then to distance-two cells'}
      className="mt-3 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
    >
      <div className="mx-auto grid aspect-square max-w-56 grid-cols-[repeat(9,minmax(0,1fr))] grid-rows-[repeat(9,minmax(0,1fr))] items-center justify-items-center">
        {placement.map((node) => (
          <span
            key={`${node.row}-${node.col}`}
            style={{ gridRow: node.row, gridColumn: node.col }}
            className={[
              nodeClass,
              node.tone === 'start' ? 'border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-cli-text)]' : '',
              node.tone === 'one' ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]' : '',
              node.tone === 'two' ? 'text-[var(--color-text-muted)]' : '',
            ].join(' ')}
          >{node.value}</span>
        ))}
        {arrows.map((arrow) => (
          <span key={`${arrow.row}-${arrow.col}`} style={{ gridRow: arrow.row, gridColumn: arrow.col }} aria-hidden="true" className="font-bold text-[var(--color-text-muted)]">{arrow.value}</span>
        ))}
      </div>
    </div>
  );
}

function AMazePerfectMazeDiagram({ language }: { language: 'ja' | 'en' }) {
  const ja = language === 'ja';
  const cellClass = 'grid h-12 w-14 shrink-0 place-items-center rounded border bg-[var(--color-bg)] px-1 text-center font-mono text-[8px] font-bold leading-3';

  return (
    <div
      role="img"
      aria-label={ja ? '未訪問セルにだけ通路を掘り、訪問済みセルには掘らないことで循環を防ぐ' : 'Open passages only to unvisited cells and reject visited cells to prevent cycles'}
      className="mt-4 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
    >
      <div className="mx-auto grid w-fit max-w-full grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 text-[9px]">
        <div className="col-start-1 row-span-2 row-start-1 flex flex-col items-center">
          <span className={`${cellClass} border-[#4f8f67] text-[var(--color-cli-text)]`}>{ja ? '現在のセル' : 'current'}</span>
          <span aria-hidden="true" className="font-bold text-[#ef6b73]">↓</span>
          <span aria-hidden="true" className="relative my-1 flex h-2 w-10 items-center justify-center">
            <span className="w-10 border-t-4 border-[#d6a84f]" />
            <span className="absolute rounded bg-[var(--color-cli-bg)] px-0.5 text-base font-bold leading-none text-[#ef6b73]">×</span>
          </span>
          <span className={`${cellClass} border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]`}>{ja ? '訪問済みセル' : 'visited'}</span>
        </div>

        <div className="col-start-2 row-start-1 flex h-12 min-w-0 self-start items-center gap-1.5">
          <span aria-hidden="true" className="h-10 shrink-0 border-l-4 border-[#d6a84f]" />
          <span aria-hidden="true" className="font-bold text-[#4f8f67]">→</span>
          <span className="shrink-0 font-bold text-[#4f8f67]">{ja ? '壁を開く' : 'open wall'}</span>
          <span aria-hidden="true" className="font-bold text-[#4f8f67]">→</span>
          <span className={`${cellClass} border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-cli-text)]`}>{ja ? '未訪問セル' : 'unvisited'}</span>
        </div>

        <div className="col-start-2 row-start-2 self-center leading-4">
          <p className="font-bold text-[#ef6b73]">{ja ? '壁を開かない' : 'keep wall closed'}</p>
          <p className="text-[var(--color-text-muted)]">{ja ? 'すでにつながっているため循環を防止' : 'already connected; prevent a cycle'}</p>
        </div>
      </div>
    </div>
  );
}

function AMazeImperfectMazeDiagram({ language }: { language: 'ja' | 'en' }) {
  const ja = language === 'ja';
  const nodeClass = 'rounded border bg-[var(--color-bg)] px-2 py-2 text-center leading-4';
  return (
    <div
      role="img"
      aria-label={ja ? '完全迷路の候補壁を制約確認後に確率で開き、0本なら再走査して有効な壁を一つ開く' : 'Open eligible walls probabilistically after validation, and rescan to open one valid wall when none was added'}
      className="mt-4 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3"
    >
      <div className="overflow-x-auto pb-1">
        <div className="mx-auto grid min-w-[28rem] max-w-2xl grid-cols-[4rem_auto_6.25rem_auto_4.5rem_auto_6.5rem_auto_4rem] grid-rows-[auto_auto] items-center gap-x-1 gap-y-2 text-[8px]">
          <div className={`${nodeClass} row-span-2 border-[var(--color-splitter)]`}>
            <p className="font-bold text-[var(--color-text)]">{ja ? '完全迷路' : 'Perfect Maze'}</p>
            <pre className="mt-1 font-mono text-[10px] leading-3 text-[var(--color-text-muted)]">A─B─C{`\n`}  └─D</pre>
          </div>
          <span aria-hidden="true" className="row-span-2 font-bold text-[var(--color-cli-text)]">→</span>
          <div className={`${nodeClass} row-span-2 border-[#d6a84f] bg-[#d6a84f]/5`}>
            <p className="font-bold text-[var(--color-text)]">{ja ? '追加できる壁を抽出' : 'eligible walls'}</p>
            <p className="mt-1 text-[var(--color-text-muted)]">{ja ? '外壁・42・3×3を確認' : 'check constraints'}</p>
          </div>
          <span aria-hidden="true" className="row-span-2 font-bold text-[var(--color-cli-text)]">→</span>
          <div className={`${nodeClass} row-span-2 border-[var(--color-splitter)] font-bold text-[var(--color-text)]`}>
            {ja ? '有効な壁を5%で開く' : 'open at 5%'}
          </div>

          <span aria-hidden="true" className="col-start-6 row-start-1 font-bold text-[var(--color-cli-text)]">→</span>
          <div className={`${nodeClass} col-start-7 row-start-1 border-[#4f8f67] bg-[#4f8f67]/10 font-bold text-[var(--color-cli-text)]`}>
            {ja ? '1本以上開いた' : 'one or more opened'}
          </div>
          <span aria-hidden="true" className="col-start-8 row-start-1 font-bold text-[var(--color-cli-text)]">→</span>

          <span aria-hidden="true" className="col-start-6 row-start-2 font-bold text-[#ef6b73]">↘</span>
          <div className={`${nodeClass} col-start-7 row-start-2 border-[#d6a84f] bg-[#d6a84f]/5`}>
            <p className="text-[#ef6b73]">{ja ? '追加0本' : 'zero added'}</p>
            <p className="mt-0.5 font-bold text-[var(--color-text)]">{ja ? '再走査して有効壁を開く' : 'rescan and open one'}</p>
          </div>
          <span aria-hidden="true" className="col-start-8 row-start-2 font-bold text-[var(--color-cli-text)]">→</span>

          <div className={`${nodeClass} col-start-9 row-span-2 row-start-1 border-[#4f8f67] bg-[#4f8f67]/10`}>
            <p className="font-bold text-[var(--color-text)]">{ja ? '不完全迷路' : 'Imperfect Maze'}</p>
            <pre className="mt-1 font-mono text-[10px] leading-3 text-[var(--color-cli-text)]">A─B{`\n`}│ │{`\n`}D─C</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function AMazeShortestPathDiagram({ language }: { language: 'ja' | 'en' }) {
  const ja = language === 'ja';
  const cellClass = 'grid h-9 w-9 place-items-center rounded border bg-[var(--color-bg)] font-mono text-[8px] font-bold';

  return (
    <div
      role="img"
      aria-label={ja ? 'StartからBFSで範囲を広げ、Goal到達後に直前のセルを逆にたどって最短経路を復元する' : 'Expand from Start with BFS, then reconstruct the shortest path by following predecessors backward from Goal'}
      className="mt-4 grid gap-3 rounded-md border border-[var(--color-splitter)] bg-[var(--color-cli-bg)] p-3 text-[9px] sm:grid-cols-2"
    >
      <section className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] p-3">
        <p className="font-bold text-[var(--color-text)]">{ja ? '1. StartからBFSで探索' : '1. Explore from Start with BFS'}</p>
        <div className="mt-3 grid grid-cols-[auto_auto_auto_auto_auto] items-center justify-center gap-1">
          <span className={`${cellClass} border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-cli-text)]`}>Start</span>
          <span aria-hidden="true" className="text-[#3b82f6]">→</span>
          <span className={`${cellClass} border-[#3b82f6] text-[#3b82f6]`}>{ja ? '距離1' : 'd1'}</span>
          <span aria-hidden="true" className="text-[#3b82f6]">→</span>
          <span className={`${cellClass} border-[#3b82f6] text-[#3b82f6]`}>{ja ? '距離2' : 'd2'}</span>
          <span aria-hidden="true" className="col-start-3 text-center text-[#3b82f6]">↓</span>
          <span className={`${cellClass} col-start-3 border-[#3b82f6] text-[#3b82f6]`}>{ja ? '距離2' : 'd2'}</span>
          <span aria-hidden="true" className="text-[#3b82f6]">→</span>
          <span className={`${cellClass} border-[#ef6b73] bg-[#ef6b73]/10 text-[#ef6b73]`}>Goal</span>
        </div>
        <p className="mt-3 text-center text-[var(--color-text-muted)]">{ja ? '到達した各セルに直前のセルを記録' : 'record each cell’s predecessor'}</p>
      </section>

      <section className="rounded border border-[var(--color-splitter)] bg-[var(--color-bg)] p-3">
        <p className="font-bold text-[var(--color-text)]">{ja ? '2. Goalから経路を復元' : '2. Reconstruct from Goal'}</p>
        <div className="mt-5 flex items-center justify-center gap-1">
          <span className={`${cellClass} border-[#4f8f67] bg-[#4f8f67]/10 text-[var(--color-cli-text)]`}>Start</span>
          <span aria-hidden="true" className="font-bold text-[#3b82f6]">←</span>
          <span className={`${cellClass} border-[#3b82f6] text-[#3b82f6]`}>A</span>
          <span aria-hidden="true" className="font-bold text-[#3b82f6]">←</span>
          <span className={`${cellClass} border-[#3b82f6] text-[#3b82f6]`}>B</span>
          <span aria-hidden="true" className="font-bold text-[#3b82f6]">←</span>
          <span className={`${cellClass} border-[#ef6b73] bg-[#ef6b73]/10 text-[#ef6b73]`}>Goal</span>
        </div>
        <p className="mt-5 text-center text-[var(--color-text-muted)]">{ja ? '逆向きにたどった列を反転し、Startからの経路として出力' : 'reverse the chain and output the route from Start'}</p>
      </section>
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
                  <div className={[
                    'border-b border-[var(--color-splitter)] px-4 py-4 sm:px-5 lg:border-b-0 lg:border-r',
                    (project.id === 'Fly-in' || (project.id === 'Codexion' && (index === 0 || index === 3)))
                      ? 'lg:grid lg:grid-rows-[auto_1fr_auto]'
                      : '',
                  ].join(' ')}>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {language === 'ja' ? '課題' : 'Challenge'}
                    </p>
                    <p className="mt-2 leading-7 text-[var(--color-text-muted)]">{item.challenge}</p>
                    {item.challengeDiagram === 'codexion-circular-wait' && (
                      <CodexionDeadlockDiagram mode="circular-wait" language={language} />
                    )}
                    {item.challengeDiagram === 'codexion-partial-ownership' && (
                      <CodexionPartialOwnershipDiagram language={language} />
                    )}
                    {item.challengeDiagram === 'codexion-log-interleaving' && (
                      <CodexionLogDiagram mode="interleaving" language={language} />
                    )}
                    {item.challengeDiagram?.startsWith('flyin-') && (
                      <FlyInDecisionDiagram kind={item.challengeDiagram} language={language} />
                    )}
                  </div>
                  <div className={[
                    'px-4 py-4 sm:px-5',
                    (project.id === 'Fly-in' || (project.id === 'Codexion' && (index === 0 || index === 3)))
                      ? 'lg:grid lg:grid-rows-[auto_1fr_auto]'
                      : '',
                  ].join(' ')}>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-cli-text)]">
                      {language === 'ja' ? '実装上の工夫' : 'Implementation'}
                    </p>
                    {item.solutionSteps ? (
                      <ol className="mt-2 grid gap-3">
                        {item.solutionSteps.map((step, stepIndex, steps) => (
                          <Fragment key={step.title}>
                            <li className="grid grid-cols-[auto_1fr] gap-2.5">
                              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-cli-text)] font-mono text-[10px] font-bold text-[var(--color-cli-text)]">
                                {stepIndex + 1}
                              </span>
                              <div>
                                <p className="font-bold text-[var(--color-text)]">{step.title}</p>
                                <p className="mt-1 leading-7 text-[var(--color-text-muted)]">{step.text}</p>
                                {step.diagram === 'a-maze-dfs' && (
                                  <AMazeGenerationStepDiagram mode="dfs" language={language} />
                                )}
                                {step.diagram === 'a-maze-bfs' && (
                                  <AMazeGenerationStepDiagram mode="bfs" language={language} />
                                )}
                              </div>
                            </li>
                            {project.id === 'Fly-in' && index === 0 && stepIndex < steps.length - 1 && (
                              <li aria-hidden="true" className="ml-1.5 -my-1 font-mono text-base leading-none text-[var(--color-cli-text)]">
                                ↓
                              </li>
                            )}
                          </Fragment>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-2 leading-7 text-[var(--color-text-muted)]">{item.solution}</p>
                    )}
                    {item.solutionDiagram === 'codexion-lock-order' && (
                      <CodexionDeadlockDiagram mode="lock-order" language={language} />
                    )}
                    {item.solutionDiagram === 'codexion-atomic-pair' && (
                      <CodexionAtomicPairDiagram language={language} />
                    )}
                    {item.solutionDiagram === 'codexion-priority-heap' && (
                      <CodexionPriorityHeapDiagram language={language} />
                    )}
                    {item.solutionDiagram === 'codexion-log-mutex' && (
                      <CodexionLogDiagram mode="mutex" language={language} />
                    )}
                    {item.solutionDiagram === 'codexion-monitor-loop' && (
                      <CodexionMonitorDiagram language={language} />
                    )}
                    {item.solutionDiagram?.startsWith('flyin-') && (
                      <FlyInDecisionDiagram kind={item.solutionDiagram} language={language} />
                    )}
                    {item.solutionDiagram === 'a-maze-wall-bits' && (
                      <AMazeWallBitsDiagram language={language} />
                    )}
                    {item.solutionDiagram === 'a-maze-perfect-tree' && (
                      <AMazePerfectMazeDiagram language={language} />
                    )}
                    {item.solutionDiagram === 'a-maze-imperfect-extra' && (
                      <AMazeImperfectMazeDiagram language={language} />
                    )}
                    {item.solutionDiagram === 'a-maze-shortest-path' && (
                      <AMazeShortestPathDiagram language={language} />
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

        {details.verification.length > 0 && (
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
        )}

        {details.limitations && details.limitations.length > 0 && (
          <section className="overflow-hidden rounded-lg border border-[var(--color-splitter)] bg-[var(--color-bg)]">
            <h3 className="border-b border-[var(--color-splitter)] bg-[var(--color-accent-secondary-soft)] px-4 py-3 text-sm font-bold sm:px-5">
              {language === 'ja' ? '設計上の制約' : 'Design boundaries'}
            </h3>
            <ul className="px-4 py-2 text-[var(--color-text-muted)] sm:px-5">
              {details.limitations.map((item) => (
                <li key={item} className="border-b border-[var(--color-splitter)] py-3 last:border-b-0">
                  <span className="block border-l-2 border-[var(--color-accent-secondary)] pl-3 leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
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
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
              <div className="flex max-w-full flex-wrap justify-start gap-1.5">
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
            {project.projectType && (
              <p className="mt-2 font-mono text-xs uppercase tracking-wider opacity-60">
                {project.projectType[language]}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenDetails(project)}
            className="w-full shrink-0 rounded border border-[var(--color-cli-text)] bg-[var(--color-cli-text)] px-4 py-2 text-center font-mono text-xs font-bold text-[var(--color-cli-bg)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
          >
            {language === 'ja' ? '技術課題と実装の工夫を見る' : 'View engineering decisions'}
          </button>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 opacity-75">
          {project.description[language]}
        </p>
        {project.responsibilities && (
          <section className="mt-4 max-w-3xl">
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              {language === 'ja' ? '担当範囲' : 'My responsibilities'}
            </h4>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 opacity-75 marker:text-[var(--color-cli-text)]">
              {project.responsibilities[language].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
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
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-xl font-bold leading-snug sm:text-3xl">{project.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded border border-[var(--color-splitter)] px-2 py-0.5 font-mono text-xs opacity-70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
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

          {project.responsibilities && (
            <section className="max-w-5xl">
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                {language === 'ja' ? '担当範囲' : 'My responsibilities'}
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--color-text-muted)] marker:text-[var(--color-cli-text)]">
                {project.responsibilities[language].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

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

          <footer className="flex justify-end border-t border-[var(--color-splitter)] pt-5">
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
