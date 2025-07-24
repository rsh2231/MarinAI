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