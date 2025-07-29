import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function OrderDetail() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { order_id } = router.query;

  // 获取订单详情
  const fetchOrderDetail = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('订单不存在');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError('获取订单详情失败: ' + err.message);
      console.error('获取订单详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order_id) {
      fetchOrderDetail(order_id);
    }
  }, [order_id]);

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 格式化价格
  const formatPrice = (price) => {
    return `¥${parseFloat(price).toFixed(2)}`;
  };

  // 获取状态样式
  const getStatusStyle = (status) => {
    const styles = {
      '未支付': 'bg-red-100 text-red-800',
      '待生产': 'bg-yellow-100 text-yellow-800',
      '待发货': 'bg-blue-100 text-blue-800',
      '已发货': 'bg-green-100 text-green-800',
      '已收货': 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // 获取状态步骤
  const getStatusSteps = (currentStatus) => {
    const allSteps = [
      { key: '未支付', label: '未支付', description: '等待用户付款' },
      { key: '待生产', label: '待生产', description: '订单已付款，等待生产' },
      { key: '待发货', label: '待发货', description: '商品已生产完成，待发货' },
      { key: '已发货', label: '已发货', description: '商品已发出' },
      { key: '已收货', label: '已收货', description: '用户已确认收货' }
    ];

    const currentIndex = allSteps.findIndex(step => step.key === currentStatus);
    return allSteps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => fetchOrderDetail(order_id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              重新加载
            </button>
            <Link 
              href="/orders"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              返回列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusSteps = getStatusSteps(order.order_status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link 
            href="/orders"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回订单列表
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">订单详情</h1>
          <p className="mt-2 text-gray-600">订单号: {order.order_id}</p>
        </div>

        <div className="space-y-6">
          {/* 订单状态进度 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单状态</h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : step.status === 'current'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      step.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyle(order.order_status)}`}>
                当前状态: {order.order_status}
              </span>
            </div>
          </div>

          {/* 商品信息 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">商品信息</h2>
            <div className="flex items-start space-x-4">
              {order.img_url && (
                <div className="flex-shrink-0">
                  <img 
                    src={order.img_url} 
                    alt="商品图片" 
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">T恤颜色</label>
                    <p className="mt-1 text-sm text-gray-900">{order.tshirt_color}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">尺寸</label>
                    <p className="mt-1 text-sm text-gray-900">{order.size}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">数量</label>
                    <p className="mt-1 text-sm text-gray-900">{order.quantity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">单价</label>
                    <p className="mt-1 text-sm text-gray-900">{formatPrice(order.price / order.quantity)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 订单信息 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">订单信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">订单ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{order.order_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">用户ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{order.user_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">设计图ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{order.original_design_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">订单总价</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(order.price)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">创建时间</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(order.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">更新时间</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateTime(order.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* 物流信息 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">物流信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">收货地址</label>
                <p className="mt-1 text-sm text-gray-900">{order.shipping_address || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">物流跟踪号</label>
                <p className="mt-1 text-sm text-gray-900">{order.tracking_number || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">预计送达</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(order.estimated_delivery)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">实际送达</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(order.actual_delivery)}</p>
              </div>
            </div>
          </div>

          {/* 设计数据 */}
          {order.design_data && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">设计数据</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(order.design_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}