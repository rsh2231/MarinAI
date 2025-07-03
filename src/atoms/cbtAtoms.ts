import { atom } from 'jotai';
import { Question } from '@/types/ProblemViwer';

export const cbtLoadingAtom = atom<boolean>(true); // 로딩 상태 atom
export const cbtErrorAtom = atom<string | null>(null); // 에러 메시지 atom

export const groupedQuestionsAtom = atom<{ subjectName: string; questions: Question[] }[]>([]);
export const allQuestionsAtom = atom<Question[]>((get) => get(groupedQuestionsAtom).flatMap(group => group.questions));
export const currentQuestionIndexAtom = atom(0);
export const answersAtom = atom<Record<string, string>>({});
export const showResultAtom = atom(false);
export const timeLeftAtom = atom(0);
export const isOmrVisibleAtom = atom(false);