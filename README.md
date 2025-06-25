├── app
│   ├── layout.tsx              // 전체 레이아웃 (Header 등 공통 UI)
│   ├── page.tsx                // 홈 페이지
│   ├── chat
│   │   └── page.tsx           // GPT 질의응답 페이지
│   ├── solve
│   │   └── page.tsx           // 문제풀이 페이지
│   ├── exam
│   │   └── page.tsx           // CBT 모의고사 페이지
│   ├── note
│   │   └── page.tsx           // 오답노트 페이지
│   └── mypage
│       └── page.tsx           // 마이페이지 (설정 등)

├── components
│   ├── ui
│   │   ├── ChatBox.tsx        // 챗 UI 구성
│   │   ├── QuestionCard.tsx   // 문제/선택지 표시
│   │   ├── SubjectSelect.tsx  // 과목 선택
│   │   ├── AnswerToggle.tsx   // 초급/고급 전환 버튼
│   │   ├── LoadingIndicator.tsx // 로딩 표시
│   │   └── ErrorAlert.tsx     // 에러 표시
│   └── layout
│       ├── Header.tsx         // 상단 메뉴바
│       └── Sidebar.tsx        // 사이드 필터 메뉴

├── hooks
│   ├── useAskLLM.ts           // GPT 질의 API 훅
│   └── useSolveProblem.ts     // 문제 풀이 API 훅

├── lib
│   ├── constants.ts           // 과목, 모드 등 상수
│   └── utils.ts               // 공통 유틸 함수

├── public
│   └── logo.png               // 로고 등 정적 파일

├── styles
│   └── globals.css            // 전역 CSS (Tailwind 포함)

├── app/api
│   ├── ask/route.ts           // GPT 질문 API 핸들러
│   └── solve/route.ts         // 문제풀이 요청 핸들러

├── tailwind.config.ts         // Tailwind 설정
├── tsconfig.json              // TypeScript 설정
├── next.config.js             // Next.js 설정
└── package.json               // 패키지 목록 및 스크립트