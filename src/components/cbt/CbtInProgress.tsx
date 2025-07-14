"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import {
  answersAtom,
  groupedQuestionsAtom,
  selectedSubjectAtom,
  allQuestionsAtom,
} from "@/atoms/examAtoms";

import Button from "@/components/ui/Button";
import QuestionCard from "@/components/solve/QuestionCard";
import { OmrSheet } from "@/components/exam/OmrSheet";
import { SubmitModal } from "@/components/exam/SubmitModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubjectTabs from "@/components/solve/SubjectTabs";
import { EmptyMessage } from "../ui/EmptyMessage";

interface CbtInProgressProps {
  onSubmit: () => void;
}

export function CbtInProgress({ onSubmit }: CbtInProgressProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useAtom(answersAtom);
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom);
  const groupedData = useAtomValue(groupedQuestionsAtom);
  const allQuestionsData = useAtomValue(allQuestionsAtom);

  const handleSelectAnswer = (questionId: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };
  
  const onSelectSubject = useCallback((subj: string) => {
    setSelectedSubject(subj);
  }, [setSelectedSubject]);

  const selectedBlock = groupedData.find((group) => group.subjectName === selectedSubject);
  const selectedIndex = groupedData.findIndex((s) => s.subjectName === selectedSubject);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  const handleConfirmSubmit = () => {
    setIsModalOpen(false);
    onSubmit();
  };
  
  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 pb-10 flex flex-col lg:flex-row gap-8">
      <div className="flex-grow">
          <div className="flex justify-center overflow-x-auto px-2 sm:px-6 no-scrollbar mb-4">
            <SubjectTabs subjects={groupedData.map((g) => g.subjectName)} selected={selectedSubject} setSelected={onSelectSubject} />
          </div>
          <AnimatePresence mode="wait">
            {selectedBlock ? (
              <motion.section key={selectedBlock.subjectName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="mt-6 sm:mt-8 space-y-5 sm:space-y-8">
                {selectedBlock.questions.map((q) => (
                  <QuestionCard key={q.id} question={q} selected={answers[q.id]} onSelect={(choice) => handleSelectAnswer(q.id, choice)} showAnswer={false} />
                ))}
                <div className="flex justify-center items-center gap-3 mt-8">
                  <Button variant="neutral" onClick={() => { if (selectedIndex > 0) { setSelectedSubject(groupedData[selectedIndex - 1].subjectName); scrollToTop(); }}} disabled={selectedIndex <= 0}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> 이전
                  </Button>
                  <Button onClick={() => { if (selectedIndex < groupedData.length - 1) { setSelectedSubject(groupedData[selectedIndex + 1].subjectName); scrollToTop(); }}} disabled={selectedIndex >= groupedData.length - 1}>
                    다음 <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.section>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <EmptyMessage />
              </div>
            )}
          </AnimatePresence>
      </div>

      <aside className="lg:w-80 lg:sticky top-24 self-start">
        <OmrSheet />
        <Button onClick={() => setIsModalOpen(true)} className="w-full mt-4">시험지 제출</Button>
      </aside>

      <AnimatePresence>
        {isModalOpen && (
          <SubmitModal onConfirm={handleConfirmSubmit} onCancel={() => setIsModalOpen(false)} totalCount={allQuestionsData.length} answeredCount={Object.keys(answers).length} />
        )}
      </AnimatePresence>
    </div>
  );
}