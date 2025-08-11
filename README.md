# MarinAI - AI 기반 학습 및 CBT 플랫폼

## 📖 프로젝트 소개

**MarinAI**는 AI 기술을 활용하여 사용자 맞춤형 학습 경험을 제공하는 차세대 CBT(Computer-Based Testing) 플랫폼입니다. 사용자들은 AI 챗봇과 대화하며 문제를 해결하고, 실제 시험과 유사한 환경에서 모의고사를 치르며, AI 기반의 오답 분석 및 학습 스케줄 관리를 통해 학습 효율을 극대화할 수 있습니다.

## ✨ 주요 기능

- **🤖 AI 문제 풀이 챗봇**: AI와 대화하며 문제를 질문하고 해결하는 대화형 학습 인터페이스를 제공합니다.
- **📝 CBT 모의고사**: 실제 시험 환경과 유사한 UI/UX에서 모의고사를 응시하고 결과를 즉시 확인할 수 있습니다.
- **📊 AI 오답 노트 및 분석**: AI가 틀린 문제를 분석하고, 관련 개념과 유사 문제를 추천하여 체계적인 학습을 돕습니다.
- **📈 마이페이지 대시보드**: CBT 및 모의고사 결과, 정답률 추이 등을 시각적인 차트로 제공하여 학습 성과를 한눈에 파악할 수 있습니다.
- **📅 학습 스케줄 관리**: 캘린더를 통해 학습 계획, 시험 일정 등을 손쉽게 관리할 수 있습니다.
- **💻 다양한 문제 풀이 모드**: 일반 풀이 모드와 연습 모드를 선택하여 유연하게 학습을 진행할 수 있습니다.
- **🔐 사용자 인증**: 이메일/패스워드 및 소셜 로그인(OAuth) 기능을 통해 안전하게 접속할 수 있습니다.

## 🛠️ 기술 스택

- **프레임워크**: Next.js (v15)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Jotai
- **인증**: NextAuth.js
- **AI**: Google Gemini, OpenAI
- **차트**: Recharts, Chart.js
- **UI/UX**: Framer Motion, Lottie for animations

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-repository/MarinAI.git
cd MarinAI
```

### 2. 의존성 설치

이 프로젝트는 `npm`을 사용합니다.

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📜 사용 가능한 스크립트

- `npm run dev`: 개발 모드로 애플리케이션을 실행합니다. (Turbopack 사용)
- `npm run build`: 프로덕션용으로 애플리케이션을 빌드합니다.
- `npm run start`: 빌드된 프로덕션 서버를 시작합니다.
- `npm run lint`: ESLint를 사용하여 코드 스타일을 검사합니다.

## 📂 프로젝트 구조

```
c:/work/MarinAI/
├── public/              # 정적 에셋 (이미지, 폰트 등)
├── src/
│   ├── app/             # Next.js App Router: 페이지 및 API 라우트
│   │   ├── api/         # 백엔드 API 엔드포인트
│   │   ├── (pages)/     # 사용자에게 보여지는 페이지
│   │   └── layout.tsx   # 전역 레이아웃
│   ├── assets/          # Lottie 애니메이션 등 에셋
│   ├── atoms/           # Jotai 상태 관리 아톰
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── constants/       # 전역 상수
│   ├── hooks/           # 커스텀 React 훅
│   ├── lib/             # 공통 유틸리티, API 클라이언트, 스키마
│   ├── styles/          # 전역 스타일
│   └── types/           # TypeScript 타입 정의
├── .env.example         # 환경 변수 예시 파일
├── next.config.ts       # Next.js 설정
├── package.json         # 프로젝트 의존성 및 스크립트
└── tsconfig.json        # TypeScript 설정
```

## 🌐 API 엔드포인트

주요 API 엔드포인트는 `src/app/api` 디렉토리 내에 정의되어 있습니다.

- `/api/auth/*`: 회원가입, 로그인, 로그아웃 등 사용자 인증 관련 API
- `/api/cbt`: CBT 시험 데이터 처리 API
- `/api/chat`: AI 챗봇 응답 생성 API
- `/api/diagnosis`: 문제 진단 및 분석 API
- `/api/mypage/*`: 마이페이지 데이터 조회 API
- `/api/schedule`: 학습 스케줄 관리 API
- `/api/solve`: 문제 풀이 관련 로직 처리 API
- `/api/upload`: 이미지 등 파일 업로드 API
