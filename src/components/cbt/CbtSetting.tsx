"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { SUBJECTS_BY_LICENSE } from "@/lib/constants";
import Button from "@/components/ui/Button";
import SelectBox from "@/components/ui/SelectBox";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

const LICENSE_LEVELS: Record<string, string[]> = {
  항해사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  기관사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  소형선박조종사: ["일반"],
};

interface ExamSettingsProps {
  onStartExam: (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => void;
  isLoading: boolean;
  error: string;
}

export function CbtSettings({ onStartExam, isLoading, error }: ExamSettingsProps) {
  const [license, setLicense] = useState<LicenseType | "">("");
  const [level, setLevel] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (license) {
      setLevel("");
      setSelectedSubjects([]);
    }
  }, [license]);

  const handleStartClick = () => {
    if (selectedSubjects.length === 0) {
      alert("과목을 선택해주세요.");
      return;
    }
    if (license) {
      onStartExam({ license, level, subjects: selectedSubjects });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          CBT 시험 설정
        </h2>
        <div className="space-y-6">
          <motion.div layout>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              1. 자격증 선택
            </label>
            <SelectBox
              id="license-select"
              label="자격증"
              value={license}
              onChange={(e) => setLicense(e.target.value as LicenseType)}
              options={["", ...Object.keys(LICENSE_LEVELS)]}
            />
          </motion.div>
          <AnimatePresence>
            {license && (
              <motion.div layout initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}>
                <label className="block text-sm font-medium text-neutral-300 mb-2">2. 급수 선택</label>
                <SelectBox id="level" label="급수" value={level} onChange={(e) => setLevel(e.target.value)} options={["", ...LICENSE_LEVELS[license]]} />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {license && level && (
              <motion.div layout initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="pt-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">3. 과목 선택 (다중 선택 가능)</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS_BY_LICENSE[license]?.map((subject) => (
                    <Button key={subject} onClick={() => setSelectedSubjects((prev) => prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject])} variant={selectedSubjects.includes(subject) ? "primary" : "neutral"} className="w-full text-xs sm:text-sm flex items-center justify-center gap-2">
                      {selectedSubjects.includes(subject) && <Check size={16} />}
                      {subject}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-8">
          <Button onClick={handleStartClick} disabled={!license || !level || selectedSubjects.length === 0 || isLoading} className="w-full text-lg py-3 transition-all disabled:opacity-50" variant="primary">
            {isLoading ? "불러오는 중..." : "시험 시작"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-center mt-4">⚠️ {error}</p>}
      </motion.div>
    </div>
  );
}