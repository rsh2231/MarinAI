import { QnaItem, Question, Choice, SubjectGroup } from "@/types/ProblemViewer";

export const transformData = (qnas: QnaItem[]): SubjectGroup[] => {
  if (!qnas || qnas.length === 0) return [];

  const subjectMap = new Map<string, Question[]>();
  const isImageCode = (str: string) => str.trim().startsWith("@pic");
  const findImagePath = (code: string, paths: string[]): string | undefined => {
    const key = code.replace("@", "").trim();
    return paths.find((p) => p.includes(key));
  };

  qnas.forEach((item) => {
    const questionImageCode = isImageCode(item.questionstr)
      ? item.questionstr
      : null;
    const questionImagePath =
      questionImageCode && item.imgPaths
        ? findImagePath(questionImageCode, item.imgPaths)
        : undefined;

    const choices: Choice[] = [
      { label: "가", text: item.ex1str },
      { label: "나", text: item.ex2str },
      { label: "사", text: item.ex3str },
      { label: "아", text: item.ex4str },
    ].map((choice) => {
      const isImg = isImageCode(choice.text);
      const imgPath =
        isImg && item.imgPaths
          ? findImagePath(choice.text, item.imgPaths)
          : undefined;
      return {
        ...choice,
        isImage: isImg,
        text: isImg ? "" : choice.text,
        imageUrl: imgPath ? `/api/solve/img/${imgPath}` : undefined,
      };
    });

    const question: Question = {
      id: item.id,
      num: item.qnum,
      questionStr: questionImageCode ? "" : item.questionstr,
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
    questions: questions.sort((a, b) => a.num - b.num),
  }));
};