import { atom } from "jotai";
import { Question, SubjectGroup } from "@/types/ProblemViewer";

/** 시험 데이터 로딩 상태 */
export const examLoadingAtom = atom<boolean>(true);

/** 시험 데이터 로드 중 발생한 에러 메시지 */
export const examErrorAtom = atom<string | null>(null);

export const groupedQuestionsAtom = atom<SubjectGroup[]>([]);

/** 모든 문제를 1차원 배열로 펼친 목록 (파생 atom) */
export const allQuestionsAtom = atom<Question[]>((get) =>
  get(groupedQuestionsAtom).flatMap((group) => group.questions)
);


// --- 사용자의 상호작용과 관련된 Atoms ---
/** 현재 사용자가 보고 있는 과목의 이름. 이 atom이 변경되면 화면의 과목 탭과 문제 목록이 업데이트됩니다. */
export const selectedSubjectAtom = atom<string | null>(null);

/** 현재 보고 있거나 마지막으로 상호작용한 문제의 전체 인덱스 (allQuestionsAtom 기준) */
export const currentQuestionIndexAtom = atom(0);

/** 사용자가 선택한 답안 목록. key는 '과목명-문제번호' 형식입니다. */
export const answersAtom = atom<Record<string, string>>({});


// --- 시험 UI 및 결과에 관한 Atoms ---
/** 시험 타이머의 남은 시간 (초 단위) */
export const timeLeftAtom = atom(0);

/** OMR 답안지 표시 여부 */
export const isOmrVisibleAtom = atom(false);

/** 시험 종료 후 결과 화면 표시 여부 */
export const showResultAtom = atom(false);

export const selectedQuestionFromOmrAtom = atom<number | null>(null);