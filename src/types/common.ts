// 공통으로 사용되는 라이센스 타입
export type LicenseType = "기관사" | "항해사" | "소형선박조종사";

// null을 허용하는 라이센스 타입 (필터 등에서 사용)
export type LicenseTypeNullable = LicenseType | null;

// CBT 설정 관련 타입
export interface CbtSettings {
  license: LicenseType;
  level: string;
  subjects: string[];
}

// 필터 상태 타입
export interface FilterState {
  year: string;
  license: LicenseTypeNullable;
  level: string;
  round: string;
  selectedSubjects: string[];
}

// 시험 결과 관련 타입
export interface SubjectResult {
  subjectName: string;
  score: number;
  isPass: boolean;
  correctCount: number;
  totalCount: number;
}

export interface ExamSummaryStats {
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  weakestSubject: SubjectResult | null;
} 