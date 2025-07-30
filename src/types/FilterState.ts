import type { Dispatch, SetStateAction } from "react";
import { LicenseTypeNullable } from "@/types/common";

export type FilterState = {
  year: string;
  setYear: Dispatch<SetStateAction<string>>;
  license: LicenseTypeNullable;
  setLicense: Dispatch<SetStateAction<LicenseTypeNullable>>;
  level: string;
  setLevel: Dispatch<SetStateAction<string>>;
  round: string;
  setRound: Dispatch<SetStateAction<string>>;
  selectedSubjects: string[];
  setSelectedSubjects: Dispatch<SetStateAction<string[]>>;
};
