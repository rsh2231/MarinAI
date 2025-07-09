export interface QnaItem {
  id: number;
  questionstr: string;
  ex1str: string;
  ex2str: string;
  ex3str: string;
  ex4str: string;
  answer: string;
  explanation: string | null;
  subject: string;
  qnum: number;
  gichulset_id: number;
  imgPaths?: string[]; // 이미지가 있을 때만 존재하는 선택적 필드
}

// 프론트엔드 UI에서 사용할 정제된 데이터 타입
export interface Choice {
  label: string;      // "가", "나", "사", "아"
  text: string;       // 보기 텍스트 (이미지 보기의 경우 빈 문자열)
  isImage: boolean;
  imageUrl?: string; // 완성된 전체 이미지 URL (e.g., /data/...)
}

export interface Question {
  id: number;
  num: number;
  questionStr: string; // 이미지 코드가 제거된 순수 텍스트
  choices: Choice[];
  answer: string;
  explanation: string | null;
  subjectName: string;
  isImageQuestion: boolean;
  imageUrl?: string; // 문제 이미지의 완성된 전체 URL
}

export interface SubjectGroup {
  subjectName: string;
  questions: Question[];
}