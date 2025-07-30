import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import {
  showResultAtom,
} from "@/atoms/examAtoms";
import { SUBJECTS_BY_LICENSE_AND_LEVEL } from "@/types/Subjects";

export type LicenseType = "항해사" | "기관사" | "소형선박조종사" | null;

export function useSolveLogic() {
  const [year, setYear] = useState("");
  const [license, setLicense] = useState<LicenseType>(null);
  const [level, setLevel] = useState("");
  const [round, setRound] = useState("");
  const [mode, setMode] = useState<"practice" | "exam" | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const setShowResult = useSetAtom(showResultAtom);

  const searchParams = useSearchParams();

  // URL 파라미터로 초기 상태 설정
  useEffect(() => {
    const yearParam = searchParams.get("year");
    const roundParam = searchParams.get("round");
    const licenseParam = searchParams.get("license");
    const levelParam = searchParams.get("level");

    if (yearParam && roundParam && licenseParam && (licenseParam === "소형선박조종사" || levelParam)) {
      setYear(yearParam);
      setRound(roundParam);
      setLicense(licenseParam as LicenseType);
      setLevel(levelParam || "");
      setMode("exam");
      setShowResult(false);
    }
  }, [searchParams, setShowResult]);

  // 필터 변경 시 모드 및 결과 상태 초기화
  useEffect(() => {
    setMode(null);
    setShowResult(false);
  }, [year, license, level, round, setShowResult]);
  
  // 자격증과 급수 변경 시 기본 과목 설정
  useEffect(() => {
    if (license) {
      let defaultSubjects: string[] = [];
      
      if (license === "소형선박조종사") {
        defaultSubjects = SUBJECTS_BY_LICENSE_AND_LEVEL[license]?.["0"] || [];
      } else if (level) {
        defaultSubjects = SUBJECTS_BY_LICENSE_AND_LEVEL[license]?.[level] || [];
      } else {
        // 급수가 선택되지 않은 경우 기본 과목 반환 (1급으로 설정)
        defaultSubjects = SUBJECTS_BY_LICENSE_AND_LEVEL[license]?.["1급"] || [];
      }
      
      setSelectedSubjects(defaultSubjects);
    } else {
      setSelectedSubjects([]);
    }
  }, [license, level]);

  const handleModeSelect = (selectedMode: "practice" | "exam") => {
    setMode(selectedMode);
    setShowResult(false);
  };

  const isFilterReady = !!(year && license && round && (license === "소형선박조종사" || level));

  return {
    // 상태
    year, license, level, round, mode, selectedSubjects,
    // 파생된 상태
    isFilterReady,
    // 상태 설정 및 핸들러
    filterState: {
      year, setYear,
      license, setLicense,
      level, setLevel,
      round, setRound,
      selectedSubjects, setSelectedSubjects
    },
    handleModeSelect,
  };
}