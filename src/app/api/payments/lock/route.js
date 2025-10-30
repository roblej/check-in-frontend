import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

    const res = await fetch(`${apiBase}/api/payments/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Important: don't forward cookies/credentials to backend unless needed
    });

    const text = await res.text();
    const tryJson = () => {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    };

    return NextResponse.json(tryJson(), { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { message: e?.message || "proxy error" },
      { status: 500 }
    );
  }
}
