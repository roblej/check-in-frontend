import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CenterContent from '@/components/center/CenterContent';
import { centerAPI } from '@/lib/api/center';

// SSR을 위한 초기 데이터 가져오기
async function getInitialData() {
  try {
    const faqData = await centerAPI.getFAQs({
      mainCategory: 'FAQ',
      subCategory: null,
      title: null,
      page: 0,
      size: 5
    });

    const faqs = (faqData.content || []).map(item => ({
      id: item.centerIdx,
      category: item.subCategory || '기타',
      question: item.title,
      answer: item.content,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
    }));

    return { faqs };
  } catch (error) {
    console.error('초기 데이터 로드 실패:', error);
  }

  return { faqs: [] };
}

const CenterPage = async () => {
  const initialData = await getInitialData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">고객센터</h1>
          <p className="text-gray-600">궁금한 점이 있으시면 FAQ를 확인하거나 1대1 문의를 이용해주세요</p>
        </div>

        <CenterContent 
          initialFaqs={initialData.faqs}
          initialInquiries={[]}
          initialSearchParams={{}}
        />
      </div>

      <Footer />
    </div>
  );
};

export default CenterPage;
