import WrongNoteView from "@/components/mypage/reports/WrongNoteView";
import ExamResultView from "@/components/mypage/reports/ExamResultView";
import CbtResultView from "@/components/mypage/reports/CbtResultView";

export default function MyPageReports() {
  return (
    <>
      <WrongNoteView />
      <ExamResultView />
      <CbtResultView />
    </>
  );
}