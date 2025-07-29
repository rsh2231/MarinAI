import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for CBT results
    const mockResults = [
      {
        id: 1,
        title: "기관사 1급 CBT 모의고사 1회차",
        date: "2025-07-18",
        score: "91점",
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
        title: "기관사 1급 CBT 모의고사 2회차",
        date: "2025-07-12",
        score: "85점",
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
        title: "기관사 1급 CBT 모의고사 3회차",
        date: "2024-07-18",
        score: "89점",
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
    console.error('Error fetching CBT results:', error);
    return NextResponse.json({ error: 'Failed to fetch CBT results' }, { status: 500 });
  }
} 