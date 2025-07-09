import { NextRequest, NextResponse } from 'next/server';

// [..slug]는 /api/img/ 뒤에 오는 모든 경로를 배열로 받습니다.
// 예: /api/img/기관사/E1_2022_01/pic.png -> params.slug는 ['기관사', 'E1_2022_01', 'pic.png']가 됨
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;

  if (!baseUrl) {
    console.error("Error: EXTERNAL_API_BASE_URL is not set in .env.local");
    return new NextResponse('Server configuration error', { status: 500 });
  }

  // 1. slug 배열을 '/'로 합쳐서 외부 API가 요구하는 경로 문자열로 만듭니다.
  // ['기관사', 'E1_2022_01', 'pic.png'] -> "기관사/E1_2022_01/pic.png"
  const imagePath = params.slug.map(segment => encodeURIComponent(segment)).join('/');

  // 2. 외부 이미지 API의 전체 URL을 조립합니다.
  const targetUrl = `${baseUrl}/api/solve/img/${imagePath}`;
  
  console.log('Requesting external image from (encoded):', targetUrl);
  
  try {
    // 3. 외부 API로 이미지 데이터를 요청합니다.
    const imageResponse = await fetch(targetUrl, {
      method: 'GET',
      cache: 'force-cache', // 이미지는 자주 바뀌지 않으므로 캐싱 전략을 사용할 수 있습니다.
    });

    // 외부 API에서 이미지를 찾지 못했거나 다른 오류가 발생한 경우
    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: imageResponse.status });
    }

    // 4. 응답 헤더를 설정합니다. 이미지의 Content-Type을 그대로 전달하는 것이 중요합니다.
    const headers = new Headers();
    headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/png');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 브라우저 캐싱 강화

    // 5. 외부 API로부터 받은 이미지 데이터(ReadableStream)를 그대로 클라이언트로 전달합니다.
    return new NextResponse(imageResponse.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Image Proxy Error:', error);
    return new NextResponse('Error fetching image', { status: 502 });
  }
}