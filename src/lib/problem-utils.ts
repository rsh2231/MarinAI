import { QnaItem, Question, Choice, SubjectGroup } from "@/types/ProblemViewer";

export const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
  if (!qnas || qnas.length === 0) return [];

  const subjectMap = new Map<string, Question[]>();
  
  // 이미지 코드와 앞뒤 공백/개행을 함께 찾는 정규식
  const imageCodeWithWhitespaceRegex = /\s*(@pic[\w_-]+)\s*/i;  

  const findImagePath = (code: string, paths: string[]): string | undefined => {
    const key = code.replace("@", "").trim().toLowerCase();
    return paths.find((p) => p.toLowerCase().includes(key));
  };

  qnas.forEach((item) => {
    let questionStr = item.questionstr;
    let questionImagePath: string | undefined;

    const questionImageMatch = item.questionstr.match(imageCodeWithWhitespaceRegex);

    if (questionImageMatch && item.imgPaths) {
      const matchedString = questionImageMatch[0]; // ex: "\n@PIC1113"
      const code = questionImageMatch[1];          // ex: "@PIC1113"

      const foundPath = findImagePath(code, item.imgPaths);
      if (foundPath) {
        questionImagePath = foundPath;
        questionStr = questionStr.replace(matchedString, "").trim();
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

      const choiceImageMatch = choice.text.match(imageCodeWithWhitespaceRegex);
      if (choiceImageMatch && item.imgPaths) {
        const matchedString = choiceImageMatch[0];
        const code = choiceImageMatch[1];
        
        const foundPath = findImagePath(code, item.imgPaths);
        if (foundPath) {
          choiceImagePath = foundPath;
          choiceText = choiceText.replace(matchedString, "").trim();
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
      isImageQuestion: !!questionImagePath,
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
    questions: questions.sort((a, b) => a.num - b.num),
  }));
};