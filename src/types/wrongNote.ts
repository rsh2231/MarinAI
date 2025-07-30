export type GichulQna = {
  id: number;
  subject: string;
  qnum: number;
  questionstr: string;
  ex1str: string;
  ex2str: string;
  ex3str: string;
  ex4str: string;
  answer: string;
  explanation: string | null;
  imgPaths?: string[]; // 이미지 경로 추가
  gichulset?: {
    year?: number;
    type: string;
    grade: string;
    inning?: string;
  };
};

export type WrongNote = {
  id: number;
  choice: string;
  gichul_qna?: GichulQna;
  attempt_count?: number;
};

export type WrongNoteSet = {
  id: number;
  examtype: string;
  created_date: string;
  results: WrongNote[];
};