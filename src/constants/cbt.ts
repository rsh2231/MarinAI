import { LicenseType } from "@/types/common";

export const LICENSE_LEVELS: Record<LicenseType, string[]> = {
  항해사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  기관사: ["1급", "2급", "3급", "4급", "5급", "6급"],
  소형선박조종사: [],
};

export const LICENSE_OPTIONS: LicenseType[] = ["항해사", "기관사", "소형선박조종사"];

export const CBT_STEPS = {
  LICENSE: 1,
  LEVEL: 2,
  SUBJECT: 3,
} as const; 