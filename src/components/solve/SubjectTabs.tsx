"use client";

interface Props {
  subjects: string[];
  selected: string | null;
  setSelected: (v: string) => void;
}

export default function SubjectTabs({
  subjects,
  selected,
  setSelected,
}: Props) {
  return (
    <div className="flex justify-center items-center border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
      {subjects.map((subj) => (
        <button
          key={subj}
          onClick={() => setSelected(subj)}
          className={`py-2 px-4 whitespace-nowrap border-b-2 font-medium transition-all duration-150 text-sm
            ${
              subj === selected
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-blue-300"
            }`}
        >
          {subj}
        </button>
      ))}
    </div>
  );
}