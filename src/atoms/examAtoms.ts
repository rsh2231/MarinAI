import { atom } from "jotai";
import { QuestionWithSubject } from "@/types/ProblemViwer";

export const examLoadingAtom = atom<boolean>(true); // 로딩 상태 atom
export const examErrorAtom = atom<string | null>(null); // 에러 메시지 atom

export const groupedQuestionsAtom = atom<
  { subjectName: string; questions: QuestionWithSubject[] }[]
>([]);
export const allQuestionsAtom = atom<QuestionWithSubject[]>((get) =>
  get(groupedQuestionsAtom).flatMap((group) => group.questions)
);
export const currentQuestionIndexAtom = atom(0);
export const answersAtom = atom<Record<string, string>>({});
export const showResultAtom = atom(false);
export const timeLeftAtom = atom(0);
export const isOmrVisibleAtom = atom(false);
