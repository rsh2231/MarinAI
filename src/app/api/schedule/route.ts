// 파일 경로: app/api/schedule/route.ts

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { Schedule } from "@/types/Schedule";

type SectionName = Schedule['section'];

/**
 * 날짜 문자열을 'YYYY. M. D' 형식으로 표준화
 */
function normalizeDateString(dateStr: string, year: string): string {
  if (!dateStr || dateStr.trim() === '-') return dateStr;

  if (dateStr.trim().startsWith(year)) return dateStr;
  
  return dateStr.split('~')
    .map(part => part.trim())
    .map(part => {
      if (!part || /^\d{4}/.test(part)) return part;
      return `${year}. ${part}`;
    })
    .join(' ~ ');
}

export async function GET() {
  const url = "https://lems.seaman.or.kr/Lems/LAExamSchedule/selectLAExamScheduleView.do";
  
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`페이지 로딩 실패: ${res.status}`);
    
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: Schedule[] = [];
    const currentYear = new Date().getFullYear().toString();

    $("#TAB_1 h5").each((_, h5) => {
      const section = $(h5).text().trim() as SectionName;
      const table = $(h5).nextAll("div.tbl_type1").first().find("table");
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
              section, round,
              reception: normalizeDateString(reception, currentYear),
              writtenDate: normalizeDateString(writtenDate, currentYear),
              objectionPeriod: normalizeDateString(objectionPeriod, currentYear),
              interviewDate: normalizeDateString(interviewDate, currentYear),
              announcement: {
                written: normalizeDateString(annWritten, currentYear),
                final: normalizeDateString(annFinal, currentYear),
              },
            });
          } else if (section === "상시시험(면접)") {
            if (tds.length < 4) return;
            const [round, reception, interviewDate, annFinal] = tds;
            const yearMatch = round.match(/(\d{4})년/);
            const year = yearMatch ? yearMatch[1] : currentYear;
            results.push({
              section, round,
              reception: normalizeDateString(reception, year),
              interviewDate: normalizeDateString(interviewDate, year),
              announcement: { final: normalizeDateString(annFinal, year) },
            });
          } else if (section === "상시시험(필기)") {
            if (tds.length < 4) return;
            const [round, reception, writtenDate, annFinal] = tds;
            results.push({
              section, round,
              reception: normalizeDateString(reception, currentYear),
              writtenDate: normalizeDateString(writtenDate, currentYear),
              announcement: { final: normalizeDateString(annFinal, currentYear) },
            });
          }
        } catch (e) {
          console.error(`[파싱 에러] 섹션: "${section}", 데이터:`, tds, e);
        }
      });
    });

    return NextResponse.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 에러 발생";
    return NextResponse.json({ message: "시험 일정을 불러오는 데 실패했습니다.", error: errorMessage }, { status: 500 });
  }
}