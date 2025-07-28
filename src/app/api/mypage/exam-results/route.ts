import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for exam results
    const mockResults = [
      {
        id: 1,
        title: "2023년 수능 모의고사",
        date: "2023-11-15",
        score: "85점",
        subjectScores: [
          { subject: "국어", score: 85 },
          { subject: "수학", score: 90 },
          { subject: "영어", score: 80 },
          { subject: "과학", score: 88 },
          { subject: "사회", score: 82 }
        ]
      },
      {
        id: 2,
        title: "2022년 수능 기출문제",
        date: "2023-10-20",
        score: "78점",
        subjectScores: [
          { subject: "국어", score: 78 },
          { subject: "수학", score: 75 },
          { subject: "영어", score: 82 },
          { subject: "과학", score: 76 },
          { subject: "사회", score: 79 }
        ]
      },
      {
        id: 3,
        title: "2021년 수능 모의고사",
        date: "2023-09-10",
        score: "92점",
        subjectScores: [
          { subject: "국어", score: 92 },
          { subject: "수학", score: 88 },
          { subject: "영어", score: 95 },
          { subject: "과학", score: 90 },
          { subject: "사회", score: 93 }
        ]
      }
    ];

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json({ error: 'Failed to fetch exam results' }, { status: 500 });
  }
} 