// src/lib/problem-utils.ts

import { QnaItem, Question, Choice, SubjectGroup } from "@/types/ProblemViewer";

// 여기에 프로젝트에 정의된 타입들을 가져오거나 정의합니다.
// 예시:
// export interface QnaItem { ... }
// export interface Question { ... }
// ...

// ProblemViewer와 ExamViewer에서 가져온 데이터 변환 함수
export const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
  if (!qnas || qnas.length === 0) return [];

  const subjectMap = new Map<string, Question[]>();
  const imageCodeRegex = /(@pic[\w_-]+)/;

  const findImagePath = (code: string, paths: string[]): string | undefined => {
    const key = code.replace("@", "").trim().toLowerCase();
    return paths.find((p) => p.includes(key));
  };

  qnas.forEach((item) => {
    let questionStr = item.questionstr;
    let questionImagePath: string | undefined;

    const questionImageMatch = item.questionstr.match(imageCodeRegex);

    if (questionImageMatch && item.imgPaths) {
      const code = questionImageMatch[0];
      const foundPath = findImagePath(code, item.imgPaths);
      if (foundPath) {
        questionImagePath = foundPath;
        questionStr = questionStr.replace(code, "").trim();
      }
    }

    // ExamViewer의 수정 사항을 반영하여 '다', '라'로 통일
    const choices: Choice[] = [
      { label: "가", text: item.ex1str },
      { label: "나", text: item.ex2str },
      { label: "다", text: item.ex3str },
      { label: "라", text: item.ex4str },
    ].map((choice) => {
      const choiceImageMatch = choice.text.match(imageCodeRegex);
      let choiceText = choice.text;
      let choiceImagePath: string | undefined;

      if (choiceImageMatch && item.imgPaths) {
        const code = choiceImageMatch[0];
        const foundPath = findImagePath(code, item.imgPaths);
        if (foundPath) {
          choiceImagePath = foundPath;
          choiceText = ""; // 이미지 선택지는 텍스트를 비움
        }
      }
      const isImg = !!choiceImagePath;
      return {
        ...choice,
        isImage: isImg,
        text: choiceText,
        imageUrl: choiceImagePath
          ? `/api/solve/img/${choiceImagePath}`
          : undefined,
      };
    });

    const question: Question = {
      id: item.id,
      num: item.qnum,
      questionStr,
      choices,
      answer: item.answer,
      explanation: item.explanation,
      subjectName: item.subject,
      isImageQuestion: !!item.imgPaths,
      imageUrl: questionImagePath
        ? `/api/solve/img/${questionImagePath}`
        : undefined,
    };

    if (!subjectMap.has(item.subject)) {
      subjectMap.set(item.subject, []);
    }
    subjectMap.get(item.subject)!.push(question);
  });

  return Array.from(subjectMap.entries()).map(([subjectName, questions]) => ({
    subjectName,
    questions,
  }));
};