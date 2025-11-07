import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { keyword } = await req.json();

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { message: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json(
        { message: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // Anthropic Claude API 호출
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `다음 키워드와 관련된 한국의 관광지를 추천해주세요: "${keyword}"

다음 형식의 JSON 배열로 응답해주세요:
[
  {
    "name": "관광지 이름",
    "description": "간단한 설명",
    "location": "지역명 (예: 서울, 제주도, 부산 등)",
    "keywords": ["키워드1", "키워드2"],
    "contentTypeId": "관광지 타입 ID (12:관광지, 14:문화시설, 15:축제공연행사, 25:여행코스, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점)"
  }
]

관광지는 최대 20개까지 추천하고, 각 관광지의 이름은 한국관광공사 TourAPI에서 검색 가능한 정확한 이름이어야 합니다.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API 오류:", errorText);
      return NextResponse.json(
        { message: "챗봇 응답 생성 실패", error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { message: "챗봇 응답이 비어있습니다." },
        { status: 500 }
      );
    }

    // JSON 파싱 시도
    let recommendations;
    try {
      // JSON 코드 블록이 있는 경우 추출
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      recommendations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      // JSON 파싱 실패 시 텍스트에서 정보 추출 시도
      return NextResponse.json(
        { 
          message: "응답 파싱 실패",
          rawContent: content,
          error: parseError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recommendations: Array.isArray(recommendations) ? recommendations : [],
      rawContent: content,
    });
  } catch (error) {
    console.error("챗봇 API 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다.", error: error.message },
      { status: 500 }
    );
  }
}

