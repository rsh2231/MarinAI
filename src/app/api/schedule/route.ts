import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type SectionName = "정기시험" | "상시시험(면접)" | "상시시험(필기)";

interface Schedule {
  section: SectionName;
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

export async function GET() {
  const url = "https://lems.seaman.or.kr/Lems/LAExamSchedule/selectLAExamScheduleView.do";
  
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`페이지를 불러오는 데 실패했습니다: ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: Schedule[] = [];

    const container = $("#TAB_1");

    container.find("h5").each((_, h5) => {
      const section = $(h5).text().trim() as SectionName;
      const tableWrapper = $(h5).nextAll("div.tbl_type1").first();
      const table = tableWrapper.find("table");

      if (!table.length) return;

      table.find("tbody > tr").each((_, tr) => {
        if ($(tr).find("th").length > 0) return;
        const tds = $(tr).find("td").map((_, td) => $(td).text().trim().replace(/\s+/g, ' ')).get();
        if (tds.length === 0) return;

        try {
          if (section === "정기시험") {
            if (tds.length < 7) return;
            const [round, reception, writtenDate, objectionPeriod, annWritten, interviewDate, annFinal] = tds;
            results.push({
              section, round, reception, writtenDate, objectionPeriod, interviewDate,
              announcement: { written: annWritten, final: annFinal },
            });
          } else if (section === "상시시험(면접)") {
            if (tds.length < 4) return;
            const [round, reception, interviewDate, annFinal] = tds;
            results.push({
              section, round, reception, interviewDate,
              announcement: { final: annFinal },
            });
          } else if (section === "상시시험(필기)") {
            if (tds.length < 4) return;
            const [round, reception, writtenDate, annFinal] = tds;
            results.push({
              section, round, reception, writtenDate,
              announcement: { final: annFinal },
            });
          }
        } catch (e) {
          console.error(`[파싱 에러] 섹션: "${section}", 행 데이터:`, tds, e);
        }
      });
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("[API 에러] /api/schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 에러 발생";
    return NextResponse.json({ message: "시험 일정을 불러오는 데 실패했습니다.", error: errorMessage }, { status: 500 });
  }
}