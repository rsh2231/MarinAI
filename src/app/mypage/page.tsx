import MyPageLayout from "@/components/mypage/MyPageLayout";
import SidebarMenu from "@/components/mypage/SidebarMenu";
import WrongNoteView from "@/components/mypage/WrongNoteView";
import ExamResultView from "@/components/mypage/ExamResultView";
import CbtResultView from "@/components/mypage/CbtResultView";
import PerformanceRadarChart from "@/components/mypage/PerformanceRadarChart";

export default function MyPage() {
  return (
    <MyPageLayout sidebar={<SidebarMenu />}>
      <WrongNoteView />
      <ExamResultView />
      <CbtResultView />
      <PerformanceRadarChart />
    </MyPageLayout>
  );
}
