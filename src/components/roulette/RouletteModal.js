"use client";

import { useState } from "react";
import RouletteWheel from "./RouletteWheel";

const RouletteModal = ({ isOpen, onClose, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalAngle, setFinalAngle] = useState(null);
  const [prizeIndex, setPrizeIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [hasSpun, setHasSpun] = useState(false); // 룰렛을 돌렸는지 여부

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
        
        // 룰렛을 돌렸다고 표시
        setHasSpun(true);
        
        // 부모 컴포넌트에 룰렛을 돌렸음을 알림
        if (onSpinComplete) {
          onSpinComplete();
        }
      } else {
        throw new Error(data.message || "룰렛 게임 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("룰렛 오류:", err);
      setError(err.message || "룰렛 게임 중 오류가 발생했습니다.");
      setIsSpinning(false);
    }
  };

  const handleSpinComplete = async (prize, prizeIndex) => {
    setIsSpinning(false);
    
    // 당첨 금액을 포인트로 지급
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"}/api/roulette/add-point`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prize: prize,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("포인트 지급에 실패했습니다.");
      }

      const data = await response.json();
      if (data.success) {
        console.log("포인트 지급 완료:", prize, "포인트");
      }
    } catch (err) {
      console.error("포인트 지급 오류:", err);
      setError("포인트 지급 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => {
    if (!isSpinning) {
      // 상태 초기화
      setHasSpun(false);
      setResult(null);
      setError("");
      setFinalAngle(null);
      setPrizeIndex(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 h-[90vh] flex flex-col overflow-hidden">
        {/* 모달 헤더 - 높이 10% */}
        <div className="flex items-center justify-center h-[10vh] border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">포인트 뽑기</h2>
        </div>

        {/* 룰렛 영역 - 높이 65% */}
        <div className="h-[65vh] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
          {/* 당첨 메시지 - 룰렛 위에 표시 */}
          {result && !isSpinning && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-green-100 border border-green-400 text-green-800 rounded-lg shadow-lg">
              <div className="text-xl font-bold">{result.prize.toLocaleString()}원 당첨!</div>
            </div>
          )}
          
          {/* 오류 메시지 - 당첨 메시지 아래 또는 상단에 표시 */}
          {error && (
            <div className={`absolute left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm shadow-lg ${
              result && !isSpinning ? 'top-20' : 'top-4'
            }`}>
              {error}
            </div>
          )}
          
          <div className="w-full h-full max-w-sm aspect-square flex items-center justify-center">
            <RouletteWheel
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              finalAngle={finalAngle}
              prizeIndex={prizeIndex}
            />
          </div>
        </div>

        {/* 결과 및 버튼 영역 - 높이 15% */}
        <div className="h-[15vh] flex flex-col justify-center px-4 pb-4 text-center flex-shrink-0 overflow-hidden">

          {!hasSpun ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-2.5 px-6 rounded-lg font-semibold text-white transition-colors text-sm ${
                isSpinning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSpinning ? "돌리는 중..." : "룰렛 돌리기"}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-2.5 px-6 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed text-sm"
              >
                뽑기 완료
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2.5 px-6 rounded-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-colors text-sm"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouletteModal;

