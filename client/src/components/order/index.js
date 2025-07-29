import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, Copy } from 'lucide-react';

const UserOrdersPage = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userId) {
          throw new Error('用户ID不存在');
        }

        // 调用后端API获取用户订单
        const response = await fetch(`/api/orders/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('获取订单失败');
        }

        const ordersData = await response.json();
        setOrders(ordersData);
        
      } catch (error) {
        console.error('获取订单失败:', error);
        setError(error.message || '获取订单失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const getStatusColor = (status) => {
    const statusColors = {
      '未支付': 'bg-red-100 text-red-800',
      '待生产': 'bg-yellow-100 text-yellow-800',
      '待发货': 'bg-blue-100 text-blue-800',
      '已发货': 'bg-purple-100 text-purple-800',
      '已收货': 'bg-green-100 text-green-800',
      '已取消': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      '未支付': <XCircle className="w-4 h-4" />,
      '待生产': <Clock className="w-4 h-4" />,
      '待发货': <Package className="w-4 h-4" />,
      '已发货': <Truck className="w-4 h-4" />,
      '已收货': <CheckCircle className="w-4 h-4" />,
      '已取消': <XCircle className="w-4 h-4" />
    };
    return statusIcons[status] || <Clock className="w-4 h-4" />;
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === selectedStatus);

  const copyTrackingNumber = (trackingNumber) => {
    navigator.clipboard.writeText(trackingNumber);
    alert('物流单号已复制到剪贴板');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseAddress = (address) => {
    if (!address) return { recipient: '', phone: '', fullAddress: '' };
    const parts = address.split(', ');
    if (parts.length >= 3) {
      return {
        recipient: parts[0],
        phone: parts[1],
        fullAddress: parts.slice(2).join(', ')
      };
    }
    return { recipient: '', phone: '', fullAddress: address };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">加载订单中...</div>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 页面标题 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-7 h-7" />
              我的订单
            </h1>
          </div>

          {/* 状态筛选 */}
          <div className="px-8 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {['all', '未支付', '待生产', '待发货', '已发货', '已收货'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? '全部订单' : status}
                  {status !== 'all' && (
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                      {orders.filter(order => order.order_status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 订单列表 */}
          <div className="p-8">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
                <p className="text-gray-500">您还没有任何订单记录</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const addressInfo = parseAddress(order.shipping_address);
                  const isExpanded = expandedOrder === order.order_id;
                  
                  return (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                      {/* 订单头部 */}
                      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">订单号:</span>
                          <span className="font-mono text-sm font-medium">{order.order_id}</span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)}
                            {order.order_status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">下单时间: {formatDate(order.created_at)}</span>
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            {isExpanded ? '收起' : '详情'}
                          </button>
                        </div>
                      </div>

                      {/* 订单内容 */}
                      <div className="p-6">
                        <div className="flex gap-6">
                          {/* 商品图片 */}
                          <div className="flex-shrink-0">
                            <img 
                              src={order.img_url} 
                              alt="商品图片" 
                              className="w-24 h-24 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/96x96?text=暂无图片';
                              }}
                            />
                          </div>

                          {/* 商品信息 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {order.design_data?.title || '自定义T恤'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {order.design_data?.description || '个性化设计'}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span>尺寸: {order.size}</span>
                              <div className="flex items-center gap-1">
                                <span>颜色:</span>
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: order.tshirt_color }}
                                ></div>
                                <span>{order.tshirt_color}</span>
                              </div>
                              <span>数量: {order.quantity}</span>
                            </div>
                          </div>

                          {/* 价格和操作 */}
                          <div className="flex-shrink-0 text-right">
                            <div className="text-2xl font-bold text-red-600 mb-2">
                              ¥{parseFloat(order.price || 0).toFixed(2)}
                            </div>
                            {order.tracking_number && (
                              <button
                                onClick={() => copyTrackingNumber(order.tracking_number)}
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 ml-auto"
                              >
                                <Copy className="w-4 h-4" />
                                复制物流单号
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 展开的详细信息 */}
                        {isExpanded && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* 收货信息 */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">收货信息</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div>收货人: {addressInfo.recipient}</div>
                                  <div>联系电话: {addressInfo.phone}</div>
                                  <div>收货地址: {addressInfo.fullAddress}</div>
                                </div>
                              </div>

                              {/* 物流信息 */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">物流信息</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  {order.tracking_number && (
                                    <div className="flex items-center gap-2">
                                      <span>物流单号:</span>
                                      <span className="font-mono">{order.tracking_number}</span>
                                      <button
                                        onClick={() => copyTrackingNumber(order.tracking_number)}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                  {order.estimated_delivery && (
                                    <div>预计送达: {order.estimated_delivery}</div>
                                  )}
                                  {order.actual_delivery && (
                                    <div>实际送达: {order.actual_delivery}</div>
                                  )}
                                  <div>最后更新: {formatDate(order.updated_at)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;