"use client";

import { ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SelectBox from "@/components/ui/SelectBox";
import { useCbtSettings } from "@/hooks/useCbtSettings";
import { useScrollToElement } from "@/hooks/useScrollToElement";
import { LICENSE_LEVELS, LICENSE_OPTIONS } from "@/constants/cbt";
import { LicenseType } from "@/types/common";

import { CbtSettingsHeader } from "./CbtSettingsHeader";
import { SettingsStep } from "./SettingsStep";
import { SubjectSelector } from "./SubjectSelector";
import { CbtStartAction } from "./CbtStartAction";

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
  const {
    // 상태
    license,
    level,
    selectedSubjects,
    
    // 액션
    setLicense,
    setLevel,
    toggleSubject,
    selectAllSubjects,
    deselectAllSubjects,
    
    // 계산된 값들
    isSmallShip,
    availableSubjects,
    isLicenseStepComplete,
    isLevelStepRequired,
    isSubjectStepActive,
    isReadyToStart,
    currentStepNumber,
  } = useCbtSettings();

  const subjectStepRef = useScrollToElement<HTMLDivElement>(isSubjectStepActive);

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
                options={LICENSE_OPTIONS}
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
                    stepNumber={currentStepNumber}
                    title="과목 선택"
                    isComplete={selectedSubjects.length > 0}
                    isActive={isSubjectStepActive}
                  >
                    <SubjectSelector
                      subjects={availableSubjects}
                      selectedSubjects={selectedSubjects}
                      onToggleSubject={toggleSubject}
                      onSelectAll={selectAllSubjects}
                      onDeselectAll={deselectAllSubjects}
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