'use client';

import { MessageSquare, ChevronRight } from 'lucide-react';

export default function InquirySection({ inquiries, onCreateInquiry }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          1:1 문의 내역
        </h2>
        <button
          onClick={onCreateInquiry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          새 문의하기
        </button>
      </div>

      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-900">{inquiry.title}</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    {inquiry.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{inquiry.date}</p>
                {inquiry.answer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-600">답변:</span> {inquiry.answer}
                    </p>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

