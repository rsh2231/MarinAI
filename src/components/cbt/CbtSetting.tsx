"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Lottie from "lottie-react";

import { SUBJECTS_BY_LICENSE } from "@/types/Subjects";
import Button from "@/components/ui/Button";
import SelectBox from "@/components/ui/SelectBox";
import suffle from "@/assets/animations/suffle.json";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

const LICENSE_LEVELS: Record<LicenseType, string[]> = {
  항해사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  기관사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  소형선박조종사: [],
};

// 과목 선택 버튼
const SubjectButton = React.memo(function SubjectButton({
  subject,
  isSelected,
  onToggle,
}: {
  subject: string;
  isSelected: boolean;
  onToggle: (subject: string) => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onToggle(subject)}
      className={`px-3 py-1 rounded-xl text-sm font-medium border transition-colors duration-200
        ${isSelected
          ? "bg-blue-600 text-white border-blue-500"
          : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
        }`}
      whileTap={{ scale: 0.95 }}
    >
      {subject}
    </motion.button>
  );
});

interface CbtSettingsProps {
  onStartCbt: (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => void;
  isLoading: boolean;
  error: string;
}

export function CbtSettings({ onStartCbt, isLoading, error }: CbtSettingsProps) {
  const [license, setLicense] = useState<LicenseType | "">("");
  const [level, setLevel] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const isSmallShip = license === "소형선박조종사";
  const subjects = license ? SUBJECTS_BY_LICENSE[license] ?? [] : [];

  useEffect(() => {
    setLevel("");
    setSelectedSubjects([]);
  }, [license]);

  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }, []);

  const handleStartClick = () => {
    if (!license || (!isSmallShip && !level) || selectedSubjects.length === 0) {
      alert("모든 항목을 선택해주세요.");
      return;
    }
    onStartCbt({
      license,
      level: isSmallShip ? "일반" : level,
      subjects: selectedSubjects,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-md"
      >
        {/* 헤더 및 안내문 */}
        <div className="flex flex-col justify-center items-center mb-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-32 h-32 sm:w-40 sm:h-40"
          >
            <Lottie animationData={suffle} loop autoplay />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight">
            CBT 시험 설정
          </h2>

          <p className="text-sm sm:text-base text-gray-400 text-center leading-relaxed">
            선택한 자격증과 급수에 따라 <br className="sm:hidden" />
            기출문제 중 무작위로 문제가 출제됩니다. <br />
            하나 이상의 과목을 선택해주세요. <br />
            <span className="text-blue-400 font-semibold">시험 시작 후에는 설정을 변경할 수 없습니다.</span>
          </p>
        </div>

        {/* 설정 영역 */}
        <motion.div layout className="space-y-6 text-sm text-gray-300">
          {/* 자격증 선택 */}
          <motion.div layout className="space-y-2">
            <SelectBox
              id="license-select"
              label="자격증 선택"
              value={license}
              onChange={(e) => setLicense(e.target.value as LicenseType)}
              options={["", "항해사", "기관사", "소형선박조종사"]}
            />
          </motion.div>

          {/* 급수 선택 */}
          <AnimatePresence>
            {!isSmallShip && license && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <SelectBox
                  id="level-select"
                  label="급수 선택"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  options={["", ...LICENSE_LEVELS[license]]}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 과목 선택 */}
          <AnimatePresence>
            {license && (isSmallShip || level) && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-200">
                  과목 선택 <span className="text-xs text-gray-400">(다중 선택 가능)</span>
                </label>

                {subjects.length === 0 ? (
                  <p className="text-gray-400 text-xs">과목 정보가 없습니다.</p>
                ) : (
                  <>
                    <motion.div
                      layout
                      className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1"
                    >
                      {subjects.map((subject) => (
                        <SubjectButton
                          key={subject}
                          subject={subject}
                          isSelected={selectedSubjects.includes(subject)}
                          onToggle={toggleSubject}
                        />
                      ))}
                    </motion.div>
                    <p className="text-xs text-gray-400 mt-4">
                      선택된 과목 수:{" "}
                      <span className="text-blue-400 font-semibold">{selectedSubjects.length}</span>
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 시작 버튼 */}
        <motion.div layout className="mt-10">
          <Button
            onClick={handleStartClick}
            disabled={
              !license || (!isSmallShip && !level) || selectedSubjects.length === 0 || isLoading
            }
            className="w-full text-lg py-3 tracking-wide"
            variant="primary"
          >
            {isLoading ? "불러오는 중..." : "시험 시작하기"}
          </Button>
        </motion.div>

        {/* 오류 메시지 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
