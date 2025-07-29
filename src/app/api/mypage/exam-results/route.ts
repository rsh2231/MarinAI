import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for exam results
    const mockResults = [
      {
        id: 1,
        title: "2024년 기관사 1급 2회 기출",
        date: "2025-07-16",
        score: "88점",
        subjectScores: [
          { subject: "기관1", score: 85 },
          { subject: "기관2", score: 90 },
          { subject: "기관3", score: 78 },
          { subject: "직무일반", score: 70 },
          { subject: "영어", score: 65 }
        ]
      },
      {
        id: 2,
        title: "2024년 기관사 1급 1회 기출",
        date: "2025-07-11",
        score: "82점",
        subjectScores: [
          { subject: "기관1", score: 80 },
          { subject: "기관2", score: 85 },
          { subject: "기관3", score: 72 },
          { subject: "직무일반", score: 68 },
          { subject: "영어", score: 60 }
        ]
      },
      {
        id: 3,
        title: "2023년 기관사 1급 2회 기출",
        date: "2024-07-16",
        score: "90점",
        subjectScores: [
          { subject: "기관1", score: 88 },
          { subject: "기관2", score: 92 },
          { subject: "기관3", score: 80 },
          { subject: "직무일반", score: 75 },
          { subject: "영어", score: 70 }
        ]
      }
    ];

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json({ error: 'Failed to fetch exam results' }, { status: 500 });
  }
} 