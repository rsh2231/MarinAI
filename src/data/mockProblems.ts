export type CBTProblem = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

export const mockProblems: CBTProblem[] = [
  {
    id: "q1",
    question: "다음 중 선박의 방향을 바꾸는 조작은?",
    choices: ["감속", "선회", "기관 정지", "항로 유지"],
    answerIndex: 1,
  },
  {
    id: "q2",
    question: "해사안전법의 주된 목적은?",
    choices: [
      "선원 복지 향상",
      "해양 오염 방지",
      "항해 안전 확보",
      "어업 규제 강화",
    ],
    answerIndex: 2,
  },
  // … 총 30~50개 이상 문제를 준비하는 게 좋아요
];
