'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mypageAPI } from '@/lib/api/mypage';

function EditReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      if (!reviewId) {
        alert('리뷰 정보가 없습니다.');
        router.push('/mypage/reviews');
        return;
      }

      try {
        // 상세 API가 없다면 목록에서 찾아 채우기
        const data = await mypageAPI.getMyReviews();
        const found = (data.reviews || []).find(r => String(r.reviewIdx) === String(reviewId));
        if (!found) {
          alert('리뷰를 찾을 수 없습니다.');
          router.push('/mypage/reviews');
          return;
        }
        setReview(found);
        setContent(found.content || '');
      } catch (e) {
        console.error('리뷰 로드 실패:', e);
        alert('리뷰 정보를 불러올 수 없습니다.');
        router.push('/mypage/reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [reviewId, router]);

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
      await mypageAPI.updateReview(reviewId, { content });
      alert('리뷰가 수정되었습니다.');
      router.push('/mypage/reviews');
      router.refresh();
    } catch (e) {
      console.error('리뷰 수정 실패:', e);
      alert(e.response?.data?.message || '리뷰 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">리뷰를 불러오는 중...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">리뷰 정보를 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push('/mypage/reviews')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              목록으로 돌아가기
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
            className="text-3xl font-bold text-gray-900 cursor-pointer">리뷰 수정
          </button>
        </div>

        {/* 호텔 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{review.hotelName || review.hotelInfo?.title || '호텔 정보'}</h2>
          {(review.location || review.hotelInfo?.adress) && (
            <p className="text-gray-500">{review.location || review.hotelInfo?.adress}</p>
          )}
        </div>

        {/* 리뷰 내용 (별점 카드 제거) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">리뷰 내용을 수정해주세요</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="리뷰 내용을 수정해주세요. (최소 10자 이상)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="8"
            maxLength={300}
          />
          <p className="text-sm text-gray-500 mt-2">
            {content.length} / 300자 (최소 10자)
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

        {/* 포인트 안내 카드 제거 */}

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
            {isSubmitting ? '수정 중...' : '저장'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function EditReviewPage() {
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
      <EditReviewPageContent />
    </Suspense>
  );
}


