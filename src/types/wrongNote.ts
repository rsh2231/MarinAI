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
};

export type WrongNote = {
  id: number;
  choice: string;
  gichul_qna: GichulQna;
};

export type WrongNoteSet = {
  id: number;
  examtype: string;
  created_date: string;
  odaps: WrongNote[];
};