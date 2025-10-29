"use client";

import { useState, useEffect, useRef } from "react";

const PRIZES = [100, 200, 500, 1000, 5000];
const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

const RouletteWheel = ({ onSpinComplete, isSpinning, finalAngle, prizeIndex }) => {
  const canvasRef = useRef(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 룰렛 그리기
    const drawWheel = (rotation = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const anglePerPrize = (2 * Math.PI) / PRIZES.length;

      // 각 구간 그리기
      PRIZES.forEach((prize, index) => {
        const startAngle =
          index * anglePerPrize - Math.PI / 2 + rotation;
        const endAngle = (index + 1) * anglePerPrize - Math.PI / 2 + rotation;

        // 구간 채우기
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[index];
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 텍스트 그리기
        const textAngle = (startAngle + endAngle) / 2;
        const textRadius = radius * 0.7;
        ctx.save();
        ctx.translate(
          centerX + Math.cos(textAngle) * textRadius,
          centerY + Math.sin(textAngle) * textRadius
        );
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${prize}원`, 0, 0);
        ctx.restore();
      });

      // 중심 고정 원
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 포인터 (12시 방향) - 거꾸로, 길이 절반
      const pointerOuterRadius = radius; // 바깥쪽 끝 (원판 경계)
      const pointerInnerRadius = radius - (radius * 0.5); // 안쪽 끝 (길이 절반)
      const pointerWidth = 20; // 포인터 폭 (바깥쪽, 넓은 부분)
      
      ctx.beginPath();
      // 거꾸로 된 삼각형 포인터 (안쪽이 뾰족, 바깥쪽이 넓음)
      ctx.moveTo(centerX, centerY - pointerInnerRadius); // 뾰족한 끝 (안쪽)
      ctx.lineTo(centerX - pointerWidth / 2, centerY - pointerOuterRadius); // 왼쪽 밑 (바깥쪽)
      ctx.lineTo(centerX + pointerWidth / 2, centerY - pointerOuterRadius); // 오른쪽 밑 (바깥쪽)
      ctx.closePath();
      
      // 그라데이션 효과
      const pointerGradient = ctx.createLinearGradient(
        centerX - pointerWidth / 2,
        centerY - pointerOuterRadius,
        centerX,
        centerY - pointerInnerRadius
      );
      pointerGradient.addColorStop(0, "#1a1a1a");
      pointerGradient.addColorStop(0.5, "#333");
      pointerGradient.addColorStop(1, "#000");
      
      ctx.fillStyle = pointerGradient;
      ctx.fill();
    };

    drawWheel(currentRotation);
  }, [currentRotation]);

  // 애니메이션 처리
  useEffect(() => {
    if (!isSpinning || finalAngle === null || finalAngle === undefined || prizeIndex === null || prizeIndex === undefined) return;

    setIsAnimating(true);
    
    // 백엔드에서 받은 최종 회전 각도 사용
    const targetRotation = finalAngle;

    // 부드러운 감속 애니메이션 (ease-out)
    let startTime = null;
    const duration = 3000; // 3초

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // ease-out cubic (부드러운 감속)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // 목표 회전량까지 부드럽게 이동
      const currentRot = targetRotation * easeProgress;

      setCurrentRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 최종 위치 정확히 설정
        setCurrentRotation(targetRotation);
        setIsAnimating(false);
        if (onSpinComplete) {
          onSpinComplete(PRIZES[prizeIndex], prizeIndex);
        }
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, finalAngle, prizeIndex]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded-full shadow-lg"
      />
      <div className="mt-4 text-center">
        {isAnimating && (
          <div className="text-lg font-semibold text-gray-700">
            돌리는 중...
          </div>
        )}
      </div>
    </div>
  );
};

export default RouletteWheel;

