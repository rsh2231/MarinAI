'use client';

import { useState } from 'react'; // useState import
import CbtViewer from '@/components/cbt/CbtViewer';
import { OmrSheet } from '@/components/problem/exam/OmrSheet';
import { useAtomValue, useSetAtom } from 'jotai';
import { 
    isOmrVisibleAtom, 
    currentQuestionIndexAtom, 
    selectedSubjectAtom 
} from '@/atoms/examAtoms';
import { Question } from '@/types/ProblemViewer';

type ExamStatus = "not-started" | "in-progress" | "finished";

export default function CbtPage() {
    const [status, setStatus] = useState<ExamStatus>("not-started");
    const isOmrVisible = useAtomValue(isOmrVisibleAtom);
    const setCurrentIdx = useSetAtom(currentQuestionIndexAtom);
    const setSelectedSubject = useSetAtom(selectedSubjectAtom);

    const handleQuestionSelectFromOMR = (question: Question, index: number) => {
        setCurrentIdx(index);
        setSelectedSubject(question.subjectName);
    };

    return (
        <div className="w-full h-full">
            {status === 'in-progress' && (
                <OmrSheet onSelectQuestion={handleQuestionSelectFromOMR} />
            )}

            <main className={`bg-[#0f172a] h-full overflow-y-auto transition-all duration-300 ${
                isOmrVisible && status === 'in-progress' ? "lg:mr-72" : ""
            }`}>
                <CbtViewer status={status} setStatus={setStatus} />
            </main>
        </div>
    );
}