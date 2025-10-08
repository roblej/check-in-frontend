'use client';

import { Header, Footer, Button } from '@/components';

const OrderHistoryPage = () => {
  const orders = [
    {
      orderNumber: "WU88191111",
      datePlaced: "Jul 6, 2021",
      totalAmount: "$160.00",
      items: [
        {
          id: 1,
          name: "Micro Backpack",
          price: "$70.00",
          image: "👜",
          description: "Are you a minimalist looking for a compact carry option? The Micro Backpack is the perfect size for your essential everyday carry items. Wear it like a backpack or carry it like a satchel for all-day use.",
          status: "Delivered on July 12, 2021",
          statusColor: "text-green-600"
        },
        {
          id: 2,
          name: "Nomad Shopping Tote",
          price: "$90.00",
          image: "🛍️",
          description: "This durable shopping tote is perfect for the world traveler. Its yellow canvas construction is water, fray, tear resistant. The matching handle, backpack straps, and shoulder loops provide multiple carry options for a day out on your next adventure.",
          status: "Delivered on July 12, 2021",
          statusColor: "text-green-600"
        }
      ]
    },
    {
      orderNumber: "AT48441546",
      datePlaced: "Dec 22, 2020",
      totalAmount: "$40.00",
      items: [
        {
          id: 3,
          name: "Double Stack Clothing Bag",
          price: "$40.00",
          image: "🎒",
          description: "Save space and protect your favorite clothes in this double-layer garment bag. Each compartment easily holds multiple pairs of jeans or tops, while keeping your items neatly folded throughout your trip.",
          status: "Delivered on January 5, 2021",
          statusColor: "text-green-600"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Order history
          </h1>
          <p className="text-lg text-gray-600">
            Check the status of recent orders, manage returns, and discover similar products.
          </p>
        </div>

        {/* 주문 목록 */}
        <div className="space-y-6">
          {orders.map((order, orderIndex) => (
            <div key={orderIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 주문 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      Order number: <span className="font-semibold">{order.orderNumber}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Date placed: {order.datePlaced}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total amount: <span className="font-semibold text-gray-900">{order.totalAmount}</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      View Order
                    </Button>
                    <Button variant="outline" size="sm">
                      View Invoice
                    </Button>
                  </div>
                </div>
              </div>

              {/* 주문 상품들 */}
              <div className="divide-y divide-gray-200">
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-6">
                    <div className="flex gap-4">
                      {/* 상품 이미지 */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                          {item.image}
                        </div>
                      </div>

                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                              {item.price}
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                              {item.description}
                            </p>
                            
                            {/* 배송 상태 */}
                            <div className="flex items-center gap-2 mb-4">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-sm font-medium ${item.statusColor}`}>
                                {item.status}
                              </span>
                            </div>

                            {/* 액션 버튼들 */}
                            <div className="flex gap-4">
                              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                View product
                              </button>
                              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Buy again
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 메시지 (주문이 없을 때) */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Button variant="primary">
              Start Shopping
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
