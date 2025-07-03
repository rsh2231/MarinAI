import type { Dispatch, SetStateAction } from "react";

export type LicenseType = "항해사" | "기관사" | "소형선박조종사" | null;

export type FilterState = {
  year: string;
  setYear: Dispatch<SetStateAction<string>>;
  license: LicenseType;
  setLicense: Dispatch<SetStateAction<LicenseType>>;
  level: string;
  setLevel: Dispatch<SetStateAction<string>>;
  round: string;
  setRound: Dispatch<SetStateAction<string>>;
  selectedSubjects: string[];
  setSelectedSubjects: Dispatch<SetStateAction<string[]>>;
};
