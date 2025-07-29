import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Package, CreditCard } from 'lucide-react';

const OrderConfirmationPage = ({ orderId, userId }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    recipient: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从后端获取订单数据或初始化新订单数据
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        if (orderId) {
          // 如果有orderId，则获取现有订单数据（这里需要实现获取单个订单的API）
          // const response = await fetch(`/api/orders/${orderId}`);
          // const order = await response.json();
          // setOrderData(order);
          console.log('获取现有订单数据:', orderId);
        } else {
          // 新订单，从路由参数、全局状态或props中获取商品数据
          // 这里应该从上一步的设计页面传递过来的数据
          console.log('初始化新订单，等待商品数据传入');
        }
      } catch (error) {
        console.error('获取订单数据失败:', error);
        setError('获取订单信息失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      
      // 构建完整的收货地址字符串
      const fullAddress = `${shippingAddress.recipient}, ${shippingAddress.phone}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.zipCode}`;
      
      // 准备订单数据
      const orderPayload = {
        user_id: userId,
        ...orderData,
        shipping_address: fullAddress,
        order_status: '未支付'
      };

      // 调用创建或更新订单API
      const url = orderId ? `/api/orders/${orderId}` : `/api/orders`;
      const method = orderId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error('创建订单失败');
      }

      const result = await response.json();
      console.log('订单创建成功:', result);
      
      // 提交成功后跳转到支付页面
      alert('订单创建成功，即将跳转到支付页面');
      // window.location.href = `/payment/${result.order_id}`;
      
    } catch (error) {
      console.error('创建订单失败:', error);
      setError('创建订单失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return orderData && 
           shippingAddress.recipient && 
           shippingAddress.phone && 
           shippingAddress.address && 
           shippingAddress.city && 
           shippingAddress.province && 
           shippingAddress.zipCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg">订单数据未找到</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 页面标题 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="w-7 h-7" />
              确认订单
            </h1>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：商品信息 */}
              <div className="space-y-6">
                {/* 商品预览 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    商品预览
                  </h3>
                  <div className="text-center">
                    <img 
                      src={orderData.img_url} 
                      alt="商品预览" 
                      className="w-64 h-64 object-cover rounded-lg mx-auto shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/256x256?text=暂无图片';
                      }}
                    />
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {orderData.design_data?.title || '自定义T恤'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {orderData.design_data?.description || '个性化设计'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 商品规格 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">商品规格</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">尺寸</label>
                      <div className="text-lg font-medium">{orderData.size}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">颜色</label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: orderData.tshirt_color }}
                        ></div>
                        <span className="text-lg font-medium">{orderData.tshirt_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">数量</label>
                      <div className="text-lg font-medium">{orderData.quantity} 件</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">单价</label>
                      <div className="text-lg font-medium text-red-600">
                        ¥{orderData.quantity > 0 ? (orderData.price / orderData.quantity).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：地址和支付 */}
              <div className="space-y-6">
                {/* 收货地址 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    收货地址
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          收货人
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.recipient}
                          onChange={(e) => handleAddressChange('recipient', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="请输入收货人姓名"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          联系电话
                        </label>
                        <input
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="请输入手机号码"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          省份
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.province}
                          onChange={(e) => handleAddressChange('province', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="请输入省份"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          城市
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="请输入城市"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        详细地址
                      </label>
                      <textarea
                        value={shippingAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入详细地址"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        邮政编码
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入邮政编码"
                      />
                    </div>
                  </div>
                </div>

                {/* 订单总价和支付 */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    订单总计
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>商品小计</span>
                      <span>¥{orderData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>运费</span>
                      <span>¥0.00</span>
                    </div>
                    <hr className="border-orange-200" />
                    <div className="flex justify-between text-xl font-bold text-red-600">
                      <span>总计</span>
                      <span>¥{orderData.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={!isFormValid() || isSubmitting}
                    className={`w-full mt-6 py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                      isFormValid() && !isSubmitting
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? '创建订单中...' : '确认订单并支付'}
                  </button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    点击支付即表示同意服务条款和隐私政策
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;