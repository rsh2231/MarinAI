import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';

// 데이터 타입 정의
interface Schedule {
  round: string;
  reception: string;
  examDate: string;
  announcement: string;
}

// 개발/배포 환경에 맞는 브라우저 옵션을 반환하는 함수
const getBrowserOptions = async () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // 배포 환경에서는 @sparticuz/chromium 설정을 사용
  if (!isDev) {
    return {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    };
  }

  // 개발 환경에서는 로컬에 설치된 Chrome 경로를 사용
  // 자신의 환경에 맞게 경로를 확인하거나 수정해야 할 수 있습니다.
  const executablePath =
    process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'linux'
      ? '/usr/bin/google-chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  
  return {
    args: [],
    executablePath,
    headless: 'new',
  };
};

// API의 메인 로직
export async function GET() {
  const url = "https://lems.seaman.or.kr/Lems/LAExamSchedule/selectLAExamScheduleView.do";
  let browser = null;
  
  try {
    // 1. 브라우저 옵션을 가져와 Puppeteer 실행
    const options = await getBrowserOptions();
    browser = await puppeteer.launch(options);
    
    const page = await browser.newPage();
    // User-Agent 설정으로 기본적인 봇 차단 회피
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // 2. 페이지로 이동
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 3. 커스텀 드롭다운 메뉴 클릭하여 열기
    await page.click('#examYear a.on');
    await page.waitForSelector('#examYear ul li a', { visible: true });
    
    // 4. 현재 년도에 해당하는 옵션 클릭
    const currentYear = new Date().getFullYear().toString();
    const yearXPath = `//div[@id='examYear']//a[contains(text(), '${currentYear}')]`;
    const yearLink = await page.$x(yearXPath);

    if (yearLink.length > 0) {
      await yearLink[0].click();
    } else {
      throw new Error(`${currentYear}년도 옵션을 찾을 수 없습니다.`);
    }

    // 5. 데이터가 로드될 때까지 대기
    await page.waitForSelector('.table_wrap table.table_01 tbody tr', { timeout: 5000 });

    // 6. 최종 HTML을 가져와 Cheerio로 파싱
    const html = await page.content();
    const $ = cheerio.load(html);

    const schedules: Schedule[] = [];
    const tableRows = $('.table_wrap table.table_01 tbody tr');
    
    console.log("✅ 최종적으로 찾은 tr 개수:", tableRows.length);

    tableRows.each((index, element) => {
      const columns = $(element).find('td');
      if (columns.length === 0) return;
      
      const round = $(columns[0]).find('strong').text().trim();
      const reception = $(columns[1]).text().trim();
      const examDate = $(columns[2]).text().trim();
      const announcement = $(columns[3]).text().trim();

      if (round && reception && examDate && announcement) {
        schedules.push({ round, reception, examDate, announcement });
      }
    });

    return NextResponse.json(schedules);

  } catch (error) {
    console.error("❌ 스크래핑 오류:", error);
    return NextResponse.json(
      { message: "시험 일정을 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  } finally {
    // 7. 작업이 끝나면 항상 브라우저를 닫아 리소스 누수 방지
    if (browser) {
      await browser.close();
    }
  }
}