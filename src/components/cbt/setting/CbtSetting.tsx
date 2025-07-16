"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SUBJECTS_BY_LICENSE } from "@/types/Subjects";
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

  const isSmallShip = license === "소형선박조종사";
  const availableSubjects = license ? SUBJECTS_BY_LICENSE[license] ?? [] : [];

  useEffect(() => {
    setLevel("");
    setSelectedSubjects(SUBJECTS_BY_LICENSE[license] ?? []);
  }, [license]);

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
      level: isSmallShip ? "일반" : level,
      subjects: selectedSubjects,
    });
  };

  const isLicenseStepComplete = license !== "";
  const isLevelStepRequired = isLicenseStepComplete && !isSmallShip;
  const isLevelStepComplete = level !== "" || isSmallShip;
  const isSubjectStepActive = isLicenseStepComplete && isLevelStepComplete;
  const isReadyToStart =
    isLicenseStepComplete && isLevelStepComplete && selectedSubjects.length > 0;

  return (
    <div className="w-full max-w-xl mx-auto p-4 font-sans break-keep">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 border border-gray-700 pt-4 px-6 pb-6 rounded-2xl shadow-md overflow-hidden"
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
                options={["", "항해사", "기관사", "소형선박조종사"]}
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
                      "",
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
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isReadyToStart && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="mt-8"
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
