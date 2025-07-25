import SubjectTabs from "../UI/SubjectTabs";

interface SubjectTabsSectionProps {
  subjects: string[];
  selected: string | null;
  onSelect: (subject: string) => void;
}

export default function SubjectTabsSection({
  subjects,
  selected,
  onSelect,
}: SubjectTabsSectionProps) {
  if (!subjects.length || !selected) return null;
  return (
    <div className="mb-6">
      <SubjectTabs
        subjects={subjects}
        selected={selected}
        setSelected={onSelect}
      />
    </div>
  );
} 