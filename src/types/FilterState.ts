import type { Dispatch, SetStateAction } from "react";

export type FilterState = {
  year: string;
  setYear: Dispatch<SetStateAction<string>>;
  license: "항해사" | "기관사" | "소형선박조종사";
  setLicense: Dispatch<SetStateAction<"항해사" | "기관사" | "소형선박조종사">>;
  level: string;
  setLevel: Dispatch<SetStateAction<string>>;
  round: string;
  setRound: Dispatch<SetStateAction<string>>;
};
