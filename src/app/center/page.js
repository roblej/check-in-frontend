import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CenterContent from "@/components/center/CenterContent";
import { centerAPI } from "@/lib/api/center";

const TAB_SLUG_MAP = {
  FAQ: "faq",
  문의: "inquiry",
  신고: "report",
  약관: "terms",
};

const SLUG_TAB_MAP = Object.entries(TAB_SLUG_MAP).reduce(
  (accumulator, [label, slug]) => {
    accumulator[slug] = label;
    return accumulator;
  },
  {}
);

const DEFAULT_TAB = "FAQ";

const resolveTab = (value) => {
  if (typeof value !== "string") {
    return { tab: DEFAULT_TAB, slug: TAB_SLUG_MAP[DEFAULT_TAB] };
  }

  const lowerValue = value.toLowerCase();
  if (SLUG_TAB_MAP[lowerValue]) {
    return { tab: SLUG_TAB_MAP[lowerValue], slug: lowerValue };
  }

  if (TAB_SLUG_MAP[value]) {
    return { tab: value, slug: TAB_SLUG_MAP[value] };
  }

  return { tab: DEFAULT_TAB, slug: TAB_SLUG_MAP[DEFAULT_TAB] };
};

const normalizePage = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
};

const normalizeQuery = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value;
};

// SSR을 위한 초기 데이터 가져오기
async function getInitialData({ tab, page, query }) {
  if (tab !== "FAQ") {
    return { faqs: [] };
  }

  try {
    const faqData = await centerAPI.getFAQs({
      mainCategory: "FAQ",
      subCategory: null,
      title: query || null,
      page: page - 1,
      size: 5,
    });

    const faqs = (faqData.content || []).map((item) => ({
      id: item.centerIdx,
      category: item.subCategory || "기타",
      question: item.title,
      answer: item.content,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toLocaleString("ko-KR")
        : "",
    }));

    return { faqs };
  } catch (error) {
    console.error("초기 데이터 로드 실패:", error);
  }

  return { faqs: [] };
}

const CenterPage = async ({ searchParams }) => {
  const { tab, slug: tabSlug } = resolveTab(searchParams?.tab);
  const page = normalizePage(searchParams?.page);
  const query = normalizeQuery(searchParams?.query);

  const initialData = await getInitialData({ tab, page, query });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">고객센터</h1>
          <p className="text-gray-600">
            궁금한 점이 있으시면 FAQ를 확인하거나 1대1 문의를 이용해주세요
          </p>
        </div>

        <CenterContent
          initialFaqs={initialData.faqs}
          initialInquiries={[]}
          initialSearchParams={{ tab: tabSlug, page, query }}
        />
      </div>

      <Footer />
    </div>
  );
};

export default CenterPage;
