export type Question = {
  num: string;
  questionsStr: string;
  ex1Str: string;
  ex2Str: string;
  ex3Str: string;
  ex4Str: string;
  answer: string;
  image?: string;
  explanation?: string;
};

export interface Subject {
  string: string;
  questions: Question[];
}

export type ProblemType = {
  string: string;
  questions: Question[];
};

export type ProblemData = {
  subject: {
    name: string;
    year: string;
    inning: string;
    type: ProblemType[];
  };
};