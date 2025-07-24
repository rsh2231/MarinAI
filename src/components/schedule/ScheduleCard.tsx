import { Calendar } from "lucide-react";
import { Schedule } from "@/types/Schedule";

/**
 * 'YYYY. M. D' 형식의 날짜 문자열을 Date 객체로 변환
 */
function parseKoreanDate(dateStr: string, position: 'start' | 'end' = 'start'): Date | null {
  if (!dateStr || dateStr === '-') return null;
  const cleanedStr = dateStr.replace(/\s*\([^)]+\)/g, '').trim();
  const parts = cleanedStr.split(/[.\s]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const [year, month, day] = parts.map(p => parseInt(p, 10));
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (position === 'end') return new Date(year, month - 1, day, 23, 59, 59, 999);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * 접수 기간에 따라 상태 배지 생성
 */
function StatusBadge({ reception }: { reception?: string }) {
  if (!reception || reception === '-') {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-600/20 text-gray-400">정보없음</span>;
  }
  const now = new Date();
  const [startStr, endStr = startStr] = reception.split("~").map(s => s.trim());
  const start = parseKoreanDate(startStr, 'start');
  const end = parseKoreanDate(endStr, 'end');
  if (!start || !end) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-600/20 text-gray-400">날짜오류</span>;
  }
  let status: string, color: string;
  if (now < start) {
    status = "예정";
    color = "bg-blue-600/20 text-blue-400";
  } else if (now >= start && now <= end) {
    status = "접수중";
    color = "bg-green-600/20 text-green-400";
  } else {
    status = "마감";
    color = "bg-red-600/20 text-red-400";
  }
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>;
}

export default function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className="bg-neutral-800 rounded-xl shadow-lg border border-neutral-700 p-5 flex flex-col gap-3 hover:border-blue-500 transition-colors h-full">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          {schedule.round}회
        </span>
        <StatusBadge reception={schedule.reception} />
      </div>
      <div className="flex flex-col gap-1 text-sm text-neutral-300 flex-grow">
        <div>
          <span className="font-semibold text-neutral-200 w-20 inline-block">접수기간:</span>
          <span>{schedule.reception || "-"}</span>
        </div>
      </div>
      <div className="border-t border-neutral-700 pt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-400">
        {schedule.writtenDate && (
          <div>
            <span className="font-semibold text-neutral-300 block">필기시험</span>
            <span>{schedule.writtenDate}</span>
          </div>
        )}
        {schedule.interviewDate && (
          <div>
            <span className="font-semibold text-neutral-300 block">면접시험</span>
            <span>{schedule.interviewDate}</span>
          </div>
        )}
        {schedule.announcement.final && (
          <div>
            <span className="font-semibold text-neutral-300 block">최종발표</span>
            <span>{schedule.announcement.final}</span>
          </div>
        )}
      </div>
    </div>
  );
}