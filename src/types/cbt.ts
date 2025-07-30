import { LicenseType } from "@/types/common";

export interface CbtSettingsState {
  license: LicenseType | "";
  level: string;
  selectedSubjects: string[];
}

export interface CbtSettingsActions {
  setLicense: (license: LicenseType) => void;
  setLevel: (level: string) => void;
  toggleSubject: (subject: string) => void;
  selectAllSubjects: () => void;
  deselectAllSubjects: () => void;
  resetSettings: () => void;
}

export interface CbtSettingsComputed {
  isSmallShip: boolean;
  availableSubjects: string[];
  isLicenseStepComplete: boolean;
  isLevelStepRequired: boolean;
  isLevelStepComplete: boolean;
  isSubjectStepActive: boolean;
  isReadyToStart: boolean;
  currentStepNumber: number;
} 