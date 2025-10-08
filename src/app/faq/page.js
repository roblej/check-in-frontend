'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What's the best thing about Switzerland?",
      answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
    },
    {
      question: "How do you make holy water?",
      answer: "You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
    },
    {
      question: "What do you call someone with no body and no nose?",
      answer: "Nobody knows. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
    },
    {
      question: "Why do you never see elephants hiding in trees?",
      answer: "Because they're so good at it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
    },
    {
      question: "Why can't you hear a pterodactyl go to the bathroom?",
      answer: "Because the pee is silent. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
    },
    {
      question: "Why did the invisible man turn down the job offer?",
      answer: "He couldn't see himself doing it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#1a202c]">
      <Header />
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* 타이틀 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-16">
          Frequently asked questions
        </h1>
        <Button variant="primary" size="lg" className="w-full">
          검색
        </Button>
        {/* FAQ 아코디언 */}
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-700"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-6 flex justify-between items-center text-left hover:bg-gray-800/30 transition-colors px-4 -mx-4"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg md:text-xl font-medium text-white pr-8">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 text-2xl text-white">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {/* 답변 영역 */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100 mb-6'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 -mx-4 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;
