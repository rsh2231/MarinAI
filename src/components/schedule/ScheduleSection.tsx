import { Schedule } from "@/types/Schedule";
import ScheduleCard from "./ScheduleCard";

interface Props {
  title: string;
  schedules: Schedule[];
  description?: React.ReactNode;
}

export function ScheduleSection({ title, schedules, description }: Props) {
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {/* description prop이 있을 경우에만 렌더링 */}
        {Array.isArray(description) && description.length > 0 && (
          <ul className="mt-4 p-4 bg-neutral-800/50 text-neutral-400 text-sm rounded-r-lg list-disc list-outside pl-8 space-y-1 break-keep">
            {description.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schedules.map((schedule, index) => (
          <ScheduleCard
            key={`${schedule.section}-${index}`}
            schedule={schedule}
          />
        ))}
      </div>
    </section>
  );
}
