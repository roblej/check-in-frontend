'use client';

import { useEffect, useRef } from 'react';

export default function ConfirmCancelModal({ isOpen, onClose, onConfirm }) {
  const confirmModalRef = useRef(null);
  const confirmPrimaryRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !confirmModalRef.current) return;

    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const container = confirmModalRef.current;

    if (confirmPrimaryRef.current) {
      confirmPrimaryRef.current.focus();
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = Array.from(container.querySelectorAll(focusableSelectors))
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

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={confirmModalRef}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-cancel-title"
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h4 id="confirm-cancel-title" className="text-base font-bold text-gray-900">변경 내용 취소</h4>
        </div>
        <div className="px-6 py-5 text-center">
          <p id="confirm-cancel-desc" className="text-sm text-gray-800">수정한 내용이 저장되지 않습니다. 정말 취소하시겠습니까?</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            아니오
          </button>
          <button
            ref={confirmPrimaryRef}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
}

