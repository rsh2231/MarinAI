「해기사 시험 대비 지능형 QA 튜터 서비스 구축」

2025.07.08.
● 메인 페이지
- gemini 2.5 flash api 연동
- 이미지, 텍스트를 입력하여 chat 페이지로 전달

● 기출문제풀이
- 연습 모드 / 실전 모드 UI/UX 개선

● 마린소프트 김대만 차장 통화
- 프로젝트 진행 상황 전달
- LLM 모델 및 데이터 구조 질의
- AI를 활용한 개인별 맞춤형 기능 확장 고려(ex. 진로 로드맵, 데일리 문제 생성, 강의 영상 생성 등)
- 추후 시연 동영상을 통한 중간 점검 예정

2025.07.14.
● ChatPage
- 타이핑 효과, 스크롤 등 UI/UX 개선

● CBT
- UI/UX 개선
- 백엔드 코드 연동
- 코드 분리 및 리팩토링

● 시험일정
- iframe 활용
- https://lems.seaman.or.kr/Lems/LAExamSchedule/selectLAExamScheduleView.do 연동 개선 필요


2025.07.15.
● 기출문제풀이
- ScrollToTop 버튼 에러 및 UX 개선
- 해설 API 개선
- Omr시트 연동 개선
- 유리보수를 위한 코드 리팩토링

2025.07.16.
● 기출문제풀이
- scroll 이슈 해결

● CBT
- CBTSetting UI/UX 개선
- 이미지 안나오는 문제 개선


2025.07.17.
● 메인 페이지
- 회원가입 백엔드 연동(username, indivname password)
- 회원 정보 가져오는 로직 필요
- ExamViewer U/UX 개선(타이머, omr 등)

● 기출문제풀이
- Exam, CBT UI/UX 개선

2025.07.18.
● 마이페이지
MyPage (최상위 페이지 컴포넌트)
├─ WrongNoteView (해기사 시험 오답노트 리스트 & 요약)
├─ PracticeResultView (기출문제 실전모드 결과 요약 및 상세)
├─ CbtResultView (CBT 모의시험 결과 리스트 및 통계)
├─ PerformanceRadarChart (과목별 성과를 시각화하는 레이더 차트)
├─ UserProfile (사용자 기본정보, 닉네임, 이메일 등)


● 기출문제풀이, CBT
- 이미지 데이터에 \n@PIC1113와 형식이 있어서 렌더링 안되는 문제 해결


2025.07.21.
● 로그인
- OAuth2 연동(백엔드 로직 개선중)

● 마이페이지
- 백엔드 연동(오답노트, 기출문제 및 CBT 풀이 결과)
- UI/UX 개선(레이아웃 변경, 슬라이딩 스클롤 방식으로 변경)
- 오답노트 개선

2025.07.22.
● 로그인
- OAuth2 연동(구글 로그인 백엔드 연동 개선)

● Cbt
- OmrSheet 연동 오류 개선
- ResultView 스크롤 문제 해결

● 기출문제풀이
- modesection 등장 시 플리커링 개선

● 오답노트
- Practice / Exam / CBT 오답노트 저장 로직 백엔드 연동
- 미답도 오답으로 간주로하는 로직 백엔드와 논의 필요

2025.07.22.
- LoadingSpinner 분리 및 재사용
- CbtSetting 튀는 현상 개선

● 로그인
- next/image 사용으로 CORS 해결하여 외부 이미지 가져오기
- next.config 도메인 추가

● 시험일정
- ScrollToTop 오류 개선

● Chat
- ChaInput 복사/붙여넣기 로직 추가
- 유지보수를 위한 코드 분리 및 리펙터링

● ResultView
- 다시 풀기 로직 개선 필요

2025.07.24.
● 시험일정
- 테이블 형에서 카드형으로 디자인 변경
- 마감, 예정 등 일정에 따른 배지 생성
- 안내 문구 추가

● ResultView
- 다시 풀기 로직 개선 완료
- Exam, Cbt에서 rerty관련 함수를 ResultView로 props로 전달

● 마이페이지
- AI 학습진단 UI 추가
- 오답노트 UI QuestionResultCard와 통일
- 해설 보기 클릭 시 튐 현상 개선