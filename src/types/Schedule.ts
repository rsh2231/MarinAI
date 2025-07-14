export interface Schedule {
  section: "정기시험" | "상시시험(면접)" | "상시시험(필기)";
  round: string;
  reception: string;
  writtenDate?: string;
  objectionPeriod?: string;
  interviewDate?: string;
  announcement: {
    written?: string;
    final: string;
  };
}

/**
 * 테이블 컬럼 정의를 위한 인터페이스
 */
export interface ColumnDefinition {
  key: keyof Schedule | string; // 'announcement.final' 같은 중첩 키를 위해 string 허용
  label: string;
}

// 각 시험별 테이블 컬럼 정의
export const REGULAR_COLUMNS: ColumnDefinition[] = [
  { key: 'round', label: '회차' },
  { key: 'reception', label: '접수기간' },
  { key: 'writtenDate', label: '필기시험일' },
  { key: 'objectionPeriod', label: '이의신청' },
  { key: 'announcement.written', label: '필기발표' },
  { key: 'interviewDate', label: '면접시험일' },
  { key: 'announcement.final', label: '최종발표' },
];

export const INTERVIEW_COLUMNS: ColumnDefinition[] = [
  { key: 'round', label: '회차' },
  { key: 'reception', label: '접수기간' },
  { key: 'interviewDate', label: '면접시험일' },
  { key: 'announcement.final', label: '합격발표' },
];

export const WRITTEN_COLUMNS: ColumnDefinition[] = [
  { key: 'round', label: '회차' },
  { key: 'reception', label: '접수기간' },
  { key: 'writtenDate', label: '필기시험일' },
  { key: 'announcement.final', label: '합격발표' },
];