import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for CBT results
    const mockResults = [
      {
        id: 1,
        title: "CBT 모의고사 1회차",
        date: "2023-12-01",
        score: "88점",
        subjectScores: [
          { subject: "국어", score: 88 },
          { subject: "수학", score: 85 },
          { subject: "영어", score: 92 },
          { subject: "과학", score: 87 },
          { subject: "사회", score: 90 }
        ]
      },
      {
        id: 2,
        title: "CBT 모의고사 2회차",
        date: "2023-11-25",
        score: "82점",
        subjectScores: [
          { subject: "국어", score: 82 },
          { subject: "수학", score: 78 },
          { subject: "영어", score: 85 },
          { subject: "과학", score: 80 },
          { subject: "사회", score: 83 }
        ]
      },
      {
        id: 3,
        title: "CBT 모의고사 3회차",
        date: "2023-11-18",
        score: "95점",
        subjectScores: [
          { subject: "국어", score: 95 },
          { subject: "수학", score: 92 },
          { subject: "영어", score: 98 },
          { subject: "과학", score: 94 },
          { subject: "사회", score: 96 }
        ]
      }
    ];

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Error fetching CBT results:', error);
    return NextResponse.json({ error: 'Failed to fetch CBT results' }, { status: 500 });
  }
} 