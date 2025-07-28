// import { NextRequest, NextResponse } from "next/server";

// const baseUrl = process.env.EXTERNAL_API_BASE_URL

// export async function POST(req: NextRequest) {
//   try {
//     // 1. 클라이언트로부터 데이터와 인증 토큰 추출
//     const { wrongNotes, examResults } = await req.json();
//     const authToken = req.headers.get("Authorization");

//     if (!authToken) {
//       return new NextResponse(JSON.stringify({ message: "인증 토큰이 없습니다." }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // 2. FastAPI에 보낼 FormData 생성
//     const formData = new FormData();
//     formData.append("wrong", JSON.stringify(wrongNotes));
//     formData.append("examresults", JSON.stringify(examResults));

//     // 3. FastAPI로 스트리밍 요청
//     const res = await fetch(`${baseUrl}/modelcall/diag`, {
//       method: "POST",
//       headers: {
//         // 클라이언트로부터 받은 인증 토큰을 그대로 전달
//         Authorization: authToken,
//       },
//       body: formData,
//     });

//     // FastAPI에서 오류가 발생한 경우
//     if (!res.ok) {
//       const errorText = await res.text();
//       return new NextResponse(
//         JSON.stringify({ message: `백엔드 서버 오류: ${errorText}` }),
//         { status: res.status, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // 4. FastAPI의 스트림을 클라이언트로 전달하기 위한 새로운 ReadableStream 생성
//     const stream = new ReadableStream({
//       async start(controller) {
//         if (!res.body) {
//           controller.close();
//           return;
//         }
//         const reader = res.body.getReader();

//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) {
//             break;
//           }
//           // 받은 데이터 청크를 클라이언트로 그대로 보냄
//           controller.enqueue(value);
//         }
//         controller.close();
//       },
//     });

//     // 5. 스트림을 클라이언트로 응답
//     return new NextResponse(stream, {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//       },
//     });

//   } catch (error) {
//     console.error("Diagnosis API Route Error:", error);
//     return new NextResponse(
//       JSON.stringify({ message: "API 라우트 처리 중 오류 발생" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { indivname, wrongNotes, examResults } = await req.json();

  const prompt = `
  당신은 MarinAI의 학습 분석 엔진입니다. MarinAI는 해기사 국가자격시험을 준비하는 ${indivname}님을 위한 AI 기반 진단 보고서를 제공하는 스마트 학습 서비스입니다.
  
  아래는 ${indivname}님의 오답노트와 시험 결과 데이터입니다. 해당 데이터를 기반으로 아래 기준에 따라 공식 진단 보고서를 생성해 주세요.
  
  [오답노트]
  ${JSON.stringify(wrongNotes, null, 2)}
  
  [시험 결과]
  ${JSON.stringify(examResults, null, 2)}
  
  ---
  
  ## 작성 목적  
  - 사용자가 자신의 취약 영역을 파악하고, 학습 전략을 재정비할 수 있도록 명확한 피드백을 제공합니다.
  
  ## 작성 지침  
  - **전문성**: 해기사 교육 및 실무 경험이 반영된 조언을 제공하세요.  
  - **문체**: 공식 보고서 스타일의 객관적이고 신뢰감 있는 문장 사용.  
  - **형식**: Markdown으로 작성 (섹션 제목은 ##, 목록은 - 사용).  
  - **분량**: 각 항목당 3~5줄 이내로 간결하게 정리.  
  - **어투**: MarinAI가 분석 결과를 제공하는 형태로 작성 (ex. "MarinAI는 다음과 같이 분석합니다.")  
  - **도입부/결론**: 교관이 아닌 시스템(MarinAI) 이름으로 시작하고 마무리할 것.
  
  ## 출력 예시
    
  ## 1. 자주 틀리는 개념 또는 문제 유형  
  - 항해법 중 선박 통항 우선순위 관련 문항에서 반복적인 실수가 있음  
  - 기관기기의 구조 및 원리 개념 이해 부족이 다수 확인됨
  
  ## 2. 전반적인 학습 상태 진단  
  - 기본 개념은 숙지했으나, 실전 적용 능력이 부족한 편  
  - 일부 과목에서 과도한 시간 분배로 인해 전체 점수에 영향 발생
  
  ## 3. 보완이 필요한 영역 및 학습 전략 제안  
  - 자주 실수하는 개념은 플래시카드나 짧은 반복 학습으로 보완할 것  
  - 실전 모의고사를 통해 시간 관리 능력을 점검할 것  
  - 특히 법규 과목은 판례와 사례 중심 학습을 병행하면 효과적임

   ---
  
  
  이 형식과 내용을 기준으로 ${indivname}님에게 최적화된 진단 보고서를 작성해 주세요.
  `;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "서버에 Gemini API 키가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API Error:", errorBody);
    return NextResponse.json(
      { message: "Gemini API 호출에 실패했습니다." },
      { status: response.status }
    );
  }

  const data = await response.json();
  let aiMessage =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "AI 진단을 생성할 수 없습니다.";
  if (indivname) {
    aiMessage = aiMessage.replace(/수험생/g, `${indivname}님`);
  }
  return NextResponse.json({ message: aiMessage });
}