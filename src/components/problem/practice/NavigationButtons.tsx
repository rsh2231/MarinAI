import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
  subjectNames: string[];
  selectedIndex: number;
  onSelect: (subject: string) => void;
}

export default function NavigationButtons({
  subjectNames,
  selectedIndex,
  onSelect,
}: NavigationButtonsProps) {
  return (
    <>
      <Button
        variant="neutral"
        onClick={() => onSelect(subjectNames[selectedIndex - 1])}
        disabled={selectedIndex <= 0}
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> 이전 과목
      </Button>
      <Button
        onClick={() => onSelect(subjectNames[selectedIndex + 1])}
        disabled={selectedIndex >= subjectNames.length - 1}
        className="w-full sm:w-auto"
      >
        다음 과목 <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </>
  );
} 