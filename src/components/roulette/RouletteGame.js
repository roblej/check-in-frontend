"use client";

import { useState } from "react";
import RouletteWheel from "./RouletteWheel";

const RouletteGame = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalAngle, setFinalAngle] = useState(null);
  const [prizeIndex, setPrizeIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setError("");
    setResult(null);
    setFinalAngle(null);
    setPrizeIndex(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"}/api/roulette/spin`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("룰렛 결과를 가져오는데 실패했습니다.");
      }

      const data = await response.json();

      if (data.success) {
        // 백엔드에서 받은 결과 저장
        setFinalAngle(data.finalAngle);
        setPrizeIndex(data.result.prizeIndex);
        setResult({
          prize: data.result.prize,
          prizeIndex: data.result.prizeIndex,
          message: data.result.message,
        });
      } else {
        throw new Error(data.message || "룰렛 게임 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("룰렛 오류:", err);
      setError(err.message || "룰렛 게임 중 오류가 발생했습니다.");
      setIsSpinning(false);
    }
  };

  const handleSpinComplete = (prize, prizeIndex) => {
    setIsSpinning(false);
    // 결과는 이미 설정되어 있음
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        룰렛 게임
      </h2>

      <RouletteWheel
        onSpinComplete={handleSpinComplete}
        isSpinning={isSpinning}
        finalAngle={finalAngle}
        prizeIndex={prizeIndex}
      />

      <div className="mt-6 text-center">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && !isSpinning && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            <div className="text-xl font-bold">{result.message}</div>
            <div className="text-sm mt-2">
              축하합니다! {result.prize.toLocaleString()}원을 받았습니다!
            </div>
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            isSpinning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSpinning ? "돌리는 중..." : "룰렛 돌리기"}
        </button>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">당첨 확률:</p>
          <ul className="space-y-1">
            <li>5000원: 1%</li>
            <li>1000원: 4%</li>
            <li>500원: 15%</li>
            <li>200원: 40%</li>
            <li>100원: 40%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;

