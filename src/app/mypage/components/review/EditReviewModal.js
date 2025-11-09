'use client';

import { useEffect, useRef } from 'react';

import { Star, X } from 'lucide-react';

export default function EditReviewModal({
  isOpen,
  editingReview,
  editContent,
  onChangeContent,
  onClose,
  onSave,
  onRequestCancel
}) {
  const editModalRef = useRef(null);
  const editContentRef = useRef(null);

  useEffect(() => {
    if (isOpen && editContentRef.current) {
      editContentRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key !== 'Tab') return;

      if (!editModalRef.current) return;
      const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusables = Array.from(editModalRef.current.querySelectorAll(focusableSelectors))
        .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const node = editModalRef.current;
    node?.addEventListener('keydown', onKeyDown);
    return () => node?.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={editModalRef}
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl border border-gray-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">리뷰 수정</h3>
          <button
            aria-label="닫기"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {editingReview && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">{editingReview.hotelName || editingReview.hotelInfo?.title}</p>
              <p className="text-xs text-gray-400">
                작성일: {editingReview.createdAt ? new Date(editingReview.createdAt).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          )}

          {editingReview && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < (Number(editingReview.star) || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mt-1">리뷰 내용</p>
            <textarea
              ref={editContentRef}
              value={editContent}
              onChange={(event) => onChangeContent(event.target.value)}
              placeholder="호텔 이용 경험을 자세히 작성해주세요. (최소 10자 이상)"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{editContent.length} / 300자</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onRequestCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

