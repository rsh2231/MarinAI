export function getCode(license: string, year: string, round: string, level: string) {
  const levelStr = license === "소형선박조종사" ? "" : level.replace("급", "");
  const roundNum = round.replace("회", "").padStart(2, "0");

  if (license === "소형선박조종사") {
    return `S1_${year}_${roundNum}`;
  }

  const codePrefix = {
    기관사: "E",
    항해사: "D",
  }[license];

  return `${codePrefix}${levelStr}_${year}_${roundNum}`;
}