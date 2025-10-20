"use client";

import { useSearchParams, useRouter } from "next/navigation";

const FailPage = () => {
  const search = useSearchParams();
  const router = useRouter();
  const code = search.get("code");
  const message = search.get("message");

  return (
    <div className="max-w-[720px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4 text-red-600">결제 실패</h1>
      <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
        <div className="font-semibold">{code}</div>
        <div className="text-sm text-red-700">{message}</div>
      </div>
      <button
        onClick={() => router.push("/checkout")}
        className="border px-4 py-2 rounded"
      >
        다시 시도
      </button>
    </div>
  );
};

export default FailPage;
