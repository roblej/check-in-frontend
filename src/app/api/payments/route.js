import { NextResponse } from "next/server";

/**
 * 결제 처리 API 라우트
 * 백엔드로 결제 검증 요청을 전달합니다.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount, type } = body;

    // 백엔드 API로 결제 검증 요청
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
          type,
        }),
      }
    );

    if (!backendResponse.ok) {
      throw new Error("백엔드 결제 검증 실패");
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("결제 처리 오류:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
