import { QnaItem, Question, Choice, SubjectGroup } from "@/types/ProblemViewer";

export const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
  if (!qnas || qnas.length === 0) return [];

  const subjectMap = new Map<string, Question[]>();
  
  // 1. 첫 번째 함수의 유연한 정규식을 사용합니다.
  const imageCodeRegex = /(@pic[\w_-]+)/; 

  const findImagePath = (code: string, paths: string[]): string | undefined => {
    // toLowerCase()를 추가하여 대소문자 구분 없이 매칭되도록 안정성을 높입니다.
    const key = code.replace("@", "").trim().toLowerCase();
    return paths.find((p) => p.toLowerCase().includes(key));
  };

  qnas.forEach((item) => {
    let questionStr = item.questionstr;
    let questionImagePath: string | undefined;

    // 2. 첫 번째 함수의 정확한 텍스트 처리 방식을 사용합니다.
    const questionImageMatch = item.questionstr.match(imageCodeRegex);

    if (questionImageMatch && item.imgPaths) {
      const code = questionImageMatch[0];
      const foundPath = findImagePath(code, item.imgPaths);
      if (foundPath) {
        questionImagePath = foundPath;
        // 이미지 코드만 제거하고 나머지 텍스트는 유지합니다.
        questionStr = questionStr.replace(code, "").trim();
      }
    }

    const choices: Choice[] = [
      { label: "가", text: item.ex1str },
      { label: "나", text: item.ex2str },
      { label: "사", text: item.ex3str },
      { label: "아", text: item.ex4str },
    ].map((choice) => {
      let choiceText = choice.text;
      let choiceImagePath: string | undefined;

      const choiceImageMatch = choice.text.match(imageCodeRegex);
      if (choiceImageMatch && item.imgPaths) {
        const code = choiceImageMatch[0];
        const foundPath = findImagePath(code, item.imgPaths);
        if (foundPath) {
          choiceImagePath = foundPath;
          // 선택지에서도 이미지 코드만 제거합니다.
          // 이미지가 선택지의 전부라면 텍스트는 비워집니다.
          choiceText = choiceText.replace(code, "").trim();
        }
      }
      
      return {
        ...choice,
        isImage: !!choiceImagePath,
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
      isImageQuestion: !!questionImagePath, // questionImagePath 유무로 판단하는 것이 더 정확합니다.
      imageUrl: questionImagePath
        ? `/api/solve/img/${questionImagePath}`
        : undefined,
    };

    if (!subjectMap.has(item.subject)) {
      subjectMap.set(item.subject, []);
    }
    subjectMap.get(item.subject)!.push(question);
  });
  
  // 3. 두 번째 함수의 필수적인 문제 정렬 기능을 추가합니다.
  return Array.from(subjectMap.entries()).map(([subjectName, questions]) => ({
    subjectName,
    questions: questions.sort((a, b) => a.num - b.num),
  }));
};