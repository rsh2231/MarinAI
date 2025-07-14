import { Schedule, ColumnDefinition } from "@/types/Schedule"; // 경로에 맞게 수정해주세요.
import { ResponsiveTable } from "./ResponsiveTable";

interface Props {
  title: string;
  accentColor: 'primary' | 'success' | 'secondary';
  schedules: Schedule[];
  columns: ColumnDefinition[];
}

/**
 * 시험 종류별 섹션을 렌더링하는 컴포넌트. 제목과 테이블 컨테이너를 포함합니다.
 */
export function ScheduleSection({ title, accentColor, schedules, columns }: Props) {
  const borderColorClass = `border-${accentColor}`;

  return (
    <section>
      <h2 className={`text-2xl font-bold text-foreground mb-6 border-l-4 ${borderColorClass} pl-4`}>
        {title}
      </h2>
      <div className="rounded-lg shadow-card bg-gray-800 overflow-hidden">
        {schedules.length > 0 ? (
          <ResponsiveTable schedules={schedules} columns={columns} />
        ) : (
          <p className="py-12 text-center text-foreground/60">
            조회된 시험 일정이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}