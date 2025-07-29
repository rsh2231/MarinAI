"use client";

import WrongNoteView from "@/components/mypage/reports/WrongNote/WrongNoteView";
import ExamResultView from "@/components/mypage/reports/ExamResultView";
import CbtResultView from "@/components/mypage/reports/CbtResultView";
import { motion } from "framer-motion";
import { sectionVariants } from "./MyPageClient";

export default function MyPageReports({ setWrongNotes, setExamResults }: { setWrongNotes: (notes: any) => void, setExamResults: (results: any) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={0.0}
      >
        <WrongNoteView setWrongNotes={setWrongNotes} />
      </motion.div>
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={0.1}
      >
        <ExamResultView setExamResults={setExamResults} />
      </motion.div>
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={0.2}
      >
        <CbtResultView />
      </motion.div>
    </div>
  );
}