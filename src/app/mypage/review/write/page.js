'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, Upload, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mypageAPI } from '@/lib/api/mypage';

function WriteReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 예약 데이터 로드
  useEffect(() => {
    const loadReservationData = async () => {
      if (!reservationId) {
        alert('예약 정보가 없습니다.');
        router.push('/mypage');
        return;
      }

      try {
        // TODO: mypageAPI import 필요
        const data = await mypageAPI.getReservationDetail(reservationId);
        
        // status가 4 (이용완료)인지 확인
        if (data.statusCode !== 4) {
          alert('이용 완료된 예약만 리뷰를 작성할 수 있습니다.');
          router.push('/mypage');
          return;
        }
        
        // TODO: 이미 리뷰를 작성했는지 확인 (백엔드 구현 필요)
        
        setReservation(data);
        setLoading(false);
      } catch (error) {
        console.error('예약 정보 로드 실패:', error);
        alert('예약 정보를 불러올 수 없습니다.');
        router.push('/mypage');
      }
    };
    
    loadReservationData();
  }, [reservationId, router]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('이미지는 최대 5장까지 업로드 가능합니다.');
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    if (content.trim().length < 10) {
      alert('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 리뷰 작성 API 호출
      const result = await mypageAPI.createReview({
        reservationIdx: reservation.id,
        roomIdx: reservation.roomIdx,
        contentId: reservation.contentId,
        rating: rating,
        content: content
      });
      
      alert(`리뷰가 등록되었습니다! 포인트 ${result.points || 1000}P가 적립되었습니다.`);
      // 마이페이지로 이동 후 데이터 새로고침
      router.push('/mypage');
      // 페이지 새로고침 트리거
      router.refresh();
      
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert(error.response?.data?.message || '리뷰 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">예약 정보를 불러오는 중...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // 데이터 없음
  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">예약 정보를 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push('/mypage')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              마이페이지로 돌아가기
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button 
            onClick={() => router.back()}
            className="text-3xl font-bold text-gray-900 cursor-pointer">리뷰 작성
          </button>
        </div>

        {/* 호텔 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{reservation.hotelName}</h2>
          <p className="text-gray-500">{reservation.location} · 체크아웃: {reservation.checkOut}</p>
        </div>

        {/* 별점 선택 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">만족도를 평가해주세요</h2>
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-gray-600 mt-2">
              {rating === 5 && '최고예요!'}
              {rating === 4 && '좋아요!'}
              {rating === 3 && '괜찮아요'}
              {rating === 2 && '별로예요'}
              {rating === 1 && '최악이에요'}
            </p>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">리뷰를 작성해주세요</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="호텔 이용 경험을 자세히 작성해주세요. (최소 10자 이상)&#10;&#10;예시:&#10;- 객실은 어땠나요?&#10;- 직원 서비스는 만족스러웠나요?&#10;- 조식은 맛있었나요?&#10;- 위치는 편리했나요?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="8"
          />
          <p className="text-sm text-gray-500 mt-2">
            {content.length} / 500자 (최소 10자)
          </p>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            사진 추가 (선택사항)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            최대 5장까지 업로드 가능합니다.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">사진 추가</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* 포인트 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-900 font-medium">
            🎁 리뷰 작성 시 1,000 포인트를 드립니다!
          </p>
          <p className="text-sm text-blue-700 mt-1">
            작성하신 리뷰는 다른 고객들에게 큰 도움이 됩니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <WriteReviewPageContent />
    </Suspense>
  );
}
