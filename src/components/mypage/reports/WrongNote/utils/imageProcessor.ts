import { WrongNote } from "@/types/wrongNote";

// 이미지 코드와 앞뒤 공백/개행을 함께 찾는 정규식
const imageCodeWithWhitespaceRegex = /\s*(@pic[\w_-]+)\s*/i;

const findImagePath = (code: string, paths: string[]): string | undefined => {
  const key = code.replace("@", "").trim().toLowerCase();
  return paths.find((p) => p.toLowerCase().includes(key));
};

export interface ProcessedContent {
  text: string;
  imageUrl?: string;
  isImage: boolean;
}

export const processImageContent = (text: string, imgPaths?: string[]): ProcessedContent => {
  if (!imgPaths) return { text, imageUrl: undefined, isImage: false };

  const imageMatch = text.match(imageCodeWithWhitespaceRegex);
  if (imageMatch) {
    const matchedString = imageMatch[0];
    const code = imageMatch[1];
    const foundPath = findImagePath(code, imgPaths);
    
    if (foundPath) {
      return {
        text: text.replace(matchedString, "").trim(),
        imageUrl: `/api/solve/img/${foundPath}`,
        isImage: true
      };
    }
  }
  
  return { text, imageUrl: undefined, isImage: false };
};

export const processChoices = (choices: Array<{ label: string; text: string }>, imgPaths?: string[]) => {
  return choices.map((choice) => {
    const processed = processImageContent(choice.text, imgPaths);
    return {
      ...choice,
      ...processed
    };
  });
}; 

export interface ProcessedWrongNote {
  id: number;
  questionStr: string;
  choices: Array<{
    label: string;
    text: string;
    imageUrl?: string;
    isImage: boolean;
  }>;
  answer: string;
  explanation: string;
  subjectName: string;
  isImageQuestion: boolean;
  imageUrl?: string;
  metadata: {
    year?: number;
    type?: string;
    grade?: string;
    inning?: string;
    qnum?: number;
  };
}

export const processWrongNote = (note: WrongNote): ProcessedWrongNote | null => {
  const q = note.gichul_qna;
  if (!q) return null;

  // 문제 본문 이미지 처리
  const questionContent = processImageContent(q.questionstr, q.imgPaths);

  // 선택지 이미지 처리
  const choices = processChoices([
    { label: "가", text: q.ex1str },
    { label: "나", text: q.ex2str },
    { label: "사", text: q.ex3str },
    { label: "아", text: q.ex4str },
  ], q.imgPaths);

  return {
    id: q.id || 0,
    questionStr: questionContent.text,
    choices,
    answer: q.answer || "",
    explanation: q.explanation || "",
    subjectName: q.subject || "",
    isImageQuestion: questionContent.isImage,
    imageUrl: questionContent.imageUrl,
    metadata: {
      year: q.gichulset?.year,
      type: q.gichulset?.type,
      grade: q.gichulset?.grade,
      inning: q.gichulset?.inning,
      qnum: q.qnum,
    }
  };
}; 