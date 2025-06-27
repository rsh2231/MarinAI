export function extractImageCode(text: string): {
  textWithoutImage: string;
  imageCode: string | null;
} {
  const regex = /@pic(\d+)/;
  const match = text.match(regex);
  if (match) {
    return {
      textWithoutImage: text.replace(regex, "").trim(),
      imageCode: `pic${match[1]}`,
    };
  }
  return { textWithoutImage: text, imageCode: null };
}

export function getAnswerLabel(text: string): string {
  const validLabels = ["가", "나", "사", "아"];
  return validLabels.includes(text) ? text : "";
}
