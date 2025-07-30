"use client";

import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SUBJECTS_BY_LICENSE_AND_LEVEL } from "@/types/Subjects";
import SelectBox from "@/components/ui/SelectBox";

import { CbtSettingsHeader } from "./CbtSettingsHeader";
import { SettingsStep } from "./SettingsStep";
import { SubjectSelector } from "./SubjectSelector";
import { CbtStartAction } from "./CbtStartAction";

type LicenseType = "기관사" | "항해사" | "소형선박조종사";

const LICENSE_LEVELS: Record<LicenseType, string[]> = {
  항해사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  기관사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  소형선박조종사: [],
};

interface CbtSettingsProps {
  onStartCbt: (settings: {
    license: LicenseType;
    level: string;
    subjects: string[];
  }) => void;
  isLoading: boolean;
  error: string;
}

export function CbtSettings({
  onStartCbt,
  isLoading,
  error,
}: CbtSettingsProps) {
  const [license, setLicense] = useState<LicenseType | "">("");
  const [level, setLevel] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const subjectStepRef = useRef<HTMLDivElement>(null);

  const isSmallShip = license === "소형선박조종사";
  
  // 급수에 따라 과목을 다르게 설정
  const getAvailableSubjects = useCallback(() => {
    if (!license) return [];
    
    if (isSmallShip) {
      return SUBJECTS_BY_LICENSE_AND_LEVEL[license]?.["0"] ?? [];
    }
    
    if (level) {
      return SUBJECTS_BY_LICENSE_AND_LEVEL[license]?.[level] ?? [];
    }
    
    // 급수가 선택되지 않은 경우 기본 과목 반환 (1급으로 설정)
    return SUBJECTS_BY_LICENSE_AND_LEVEL[license]?.["1급"] ?? [];
  }, [license, level, isSmallShip]);
  
  const availableSubjects = getAvailableSubjects();

  useEffect(() => {
    setLevel("");
    setSelectedSubjects([]);
  }, [license]);

  // 급수가 변경될 때마다 과목 재설정
  useEffect(() => {
    if (license && (level || isSmallShip)) {
      const subjects = getAvailableSubjects();
      setSelectedSubjects(subjects);
    }
  }, [license, level, isSmallShip, getAvailableSubjects]);

  const isLicenseStepComplete = license !== "";
  const isLevelStepRequired = isLicenseStepComplete && !isSmallShip;
  const isLevelStepComplete = level !== "" || isSmallShip;

  const isSubjectStepActive = isLicenseStepComplete && isLevelStepComplete;

  const isReadyToStart =
    isLicenseStepComplete && isLevelStepComplete && selectedSubjects.length > 0;

  useEffect(() => {
    if (isSubjectStepActive && subjectStepRef.current) {
      setTimeout(() => {
        subjectStepRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  }, [isSubjectStepActive]);

  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }, []);

  const handleSelectAllSubjects = useCallback(() => {
    setSelectedSubjects(availableSubjects);
  }, [availableSubjects]);

  const handleDeselectAllSubjects = useCallback(() => {
    setSelectedSubjects([]);
  }, []);

  const handleStartClick = () => {
    if (!license || (!isSmallShip && !level) || selectedSubjects.length === 0) {
      alert("모든 항목을 선택해주세요.");
      return;
    }
    onStartCbt({
      license,
      level: isSmallShip ? "0" : level,
      subjects: selectedSubjects,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 font-sans break-keep">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 border border-gray-700 pt-10 px-6 pb-6 rounded-2xl shadow-md overflow-hidden relative"
      >
        <CbtSettingsHeader />

        <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
          <div className="space-y-8">
            <SettingsStep
              stepNumber={1}
              title="자격증 선택"
              isComplete={isLicenseStepComplete}
              isActive={true}
            >
              <SelectBox
                id="license-select"
                value={license}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setLicense(e.target.value as LicenseType)
                }
                options={["항해사", "기관사", "소형선박조종사"]}
              />
            </SettingsStep>

            <AnimatePresence initial={false}>
              {isLevelStepRequired && (
                <SettingsStep
                  stepNumber={2}
                  title="급수 선택"
                  isComplete={level !== ""}
                  isActive={isLicenseStepComplete}
                >
                  <SelectBox
                    id="level-select"
                    value={level}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setLevel(e.target.value)
                    }
                    options={[
                      ...LICENSE_LEVELS[
                      license as Exclude<LicenseType, "소형선박조종사">
                      ],
                    ]}
                  />
                </SettingsStep>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isSubjectStepActive && (
                <div ref={subjectStepRef}>
                  <SettingsStep
                    stepNumber={isLevelStepRequired ? 3 : 2}
                    title="과목 선택"
                    isComplete={selectedSubjects.length > 0}
                    isActive={isSubjectStepActive}
                  >
                    <SubjectSelector
                      subjects={availableSubjects}
                      selectedSubjects={selectedSubjects}
                      onToggleSubject={toggleSubject}
                      onSelectAll={handleSelectAllSubjects}
                      onDeselectAll={handleDeselectAllSubjects}
                    />
                  </SettingsStep>
                </div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isReadyToStart && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mt-8 origin-top"
              >
                <CbtStartAction
                  onStartClick={handleStartClick}
                  isReady={isReadyToStart}
                  isLoading={isLoading}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}