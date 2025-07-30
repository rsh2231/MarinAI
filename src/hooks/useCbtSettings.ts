import { useState, useEffect, useCallback } from "react";
import { SUBJECTS_BY_LICENSE_AND_LEVEL } from "@/types/Subjects";
import { LicenseType } from "@/types/common";
import { 
  CbtSettingsState, 
  CbtSettingsActions, 
  CbtSettingsComputed 
} from "@/types/cbt";

export function useCbtSettings(): CbtSettingsState & CbtSettingsActions & CbtSettingsComputed {
  const [license, setLicense] = useState<LicenseType | "">("");
  const [level, setLevel] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

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

  // 라이센스가 변경될 때 급수와 과목 초기화
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

  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }, []);

  const selectAllSubjects = useCallback(() => {
    setSelectedSubjects(availableSubjects);
  }, [availableSubjects]);

  const deselectAllSubjects = useCallback(() => {
    setSelectedSubjects([]);
  }, []);

  const resetSettings = useCallback(() => {
    setLicense("");
    setLevel("");
    setSelectedSubjects([]);
  }, []);

  // 계산된 값들
  const isLicenseStepComplete = license !== "";
  const isLevelStepRequired = isLicenseStepComplete && !isSmallShip;
  const isLevelStepComplete = level !== "" || isSmallShip;
  const isSubjectStepActive = isLicenseStepComplete && isLevelStepComplete;
  const isReadyToStart = isLicenseStepComplete && isLevelStepComplete && selectedSubjects.length > 0;
  const currentStepNumber = isLevelStepRequired ? 3 : 2;

  return {
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
    resetSettings,
    
    // 계산된 값들
    isSmallShip,
    availableSubjects,
    isLicenseStepComplete,
    isLevelStepRequired,
    isLevelStepComplete,
    isSubjectStepActive,
    isReadyToStart,
    currentStepNumber,
  };
} 