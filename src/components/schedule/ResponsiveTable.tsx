import { useEffect } from "react";
import { Schedule, ColumnDefinition } from "@/types/Schedule"; // 경로에 맞게 수정해주세요.

interface Props {
  schedules: Schedule[];
  columns: ColumnDefinition[];
}

/**
 * 모바일 화면에서 테이블을 카드 뷰 형태로 보여주기 위한 스타일을 동적으로 주입합니다.
 */
const addMobileViewStyles = () => {
  const styleId = 'schedule-responsive-table-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    @media (max-width: 768px) {
      .schedule-responsive-table thead { display: none; }
      .schedule-responsive-table tbody, .schedule-responsive-table tr { display: block; }
      .schedule-responsive-table tr {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: transparent; /* 부모인 .bg-gray-800 색상을 사용 */
      }
      .schedule-responsive-table tr:not(:last-child) { margin-bottom: 1rem; }
      .schedule-responsive-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0.25rem;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* 구분선 */
      }
      .schedule-responsive-table tr td:last-child { border-bottom: none; }
      .schedule-responsive-table td::before {
        content: attr(data-label);
        font-weight: 600;
        color: var(--foreground);
        margin-right: 1rem;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * 시험 일정 데이터를 표시하는 반응형 테이블 컴포넌트
 */
export function ResponsiveTable({ schedules, columns }: Props) {
  useEffect(addMobileViewStyles, []);

  const getFieldValue = (item: Schedule, key: string): string => {
    if (key.startsWith('announcement.')) {
      const subKey = key.split('.')[1] as keyof Schedule['announcement'];
      return item.announcement[subKey] ?? '-';
    }
    return (item[key as keyof Schedule] as string) ?? '-';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left schedule-responsive-table text-sm md:text-base">
        <thead className="text-lg uppercase text-foreground/60 bg-white/5">
          <tr>
            {columns.map(({ label }) => (
              <th key={label} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule, index) => (
            <tr key={index} className="md:border-b md:border-white/10 md:hover:bg-white/5 transition-colors duration-200">
              {columns.map(({ key, label }) => (
                <td key={key.toString()} data-label={label} className="px-6 py-4">
                  <span className={key === 'announcement.final' ? 'font-bold text-primary' : 'text-foreground/90'}>
                    {getFieldValue(schedule, key.toString())}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}