'use client'
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'next/navigation';
import { DesignStore } from '@/stores/designStore';
import { userStore } from '@/stores/userStore';
import fabric from 'fabric';
import axios from 'axios';

export default function PlaceOrderPage() {
  const { useAuth } = userStore;
  const { orderId } = useParams();
  const designStore = DesignStore();
  const { user } = useAuth(); // 统一使用 useAuth 钩子
  const [orderNumber, setOrderNumber] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [formData, setFormData] = useState({
    size: '',
    quantity: 1,
    shippingAddress: '',
    city: '',
    zipCode: '',
    paymentMethod: 'wechat'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 生成订单号
  useEffect(() => {
    const generatedOrderNumber = uuidv4();
    setOrderNumber(generatedOrderNumber);
  }, []);

  // 生成图片预览
  const generatePreviewImage = useCallback(async () => {
    console.log('Generating preview with canvas data:', designStore.canvas);
    if (!designStore.canvas) {
      setError('设计数据为空，无法生成预览');
      return;
    }

    try {
      const canvas = new fabric.Canvas(null);
      // 使用Promise包装loadFromJSON确保异步处理完成
      await new Promise((resolve, reject) => {
        canvas.loadFromJSON(designStore.canvas, () => {
          resolve();
        }, (o, error) => {
          console.error('Error loading canvas JSON:', error);
          reject(error);
        });
      });
      canvas.renderAll();
      const dataUrl = canvas.toDataURL('image/png');
        console.log('Generated preview image:', dataUrl.substring(0, 50) + '...');
        setPreviewImage(dataUrl);
    } catch (err) {
      console.error('Failed to generate preview image:', err);
      setError(`生成预览图片失败: ${err.message}`);
    }
  }, [designStore.canvas]);

  // 提取设计数据并生成预览
  // 验证设计数据传输
  useEffect(() => {
    console.log('=== 设计数据检查 ===');
    console.log('设计存储完整数据:', designStore);
    console.log('Canvas数据类型:', typeof designStore.canvas);
    console.log('Canvas数据长度:', designStore.canvas ? JSON.stringify(designStore.canvas).length : 0);
    console.log('Canvas数据示例:', designStore.canvas ? JSON.stringify(designStore.canvas).substring(0, 200) : '无数据');

    if (designStore.canvas) {
      generatePreviewImage();
    } else {
      setError('设计数据为空，请返回编辑器保存设计');
    }
  }, [designStore, generatePreviewImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        order_id: orderNumber,
        user_id: user.id,
        original_design_id: orderId,
        design_data: designStore.canvas,
        img_url: previewImage,
        size: formData.size,
        quantity: formData.quantity,
        shipping_address: formData.shippingAddress,
        city: formData.city,
        zipCode: formData.zipCode,
        payment_method: formData.paymentMethod,
        order_status: 'pending'
      };

      // 验证API请求数据
      console.log('=== 订单数据提交 ===');
      console.log('API请求URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
      console.log('订单数据完整结构:', orderData);
      console.log('设计数据大小:', orderData.design_data ? JSON.stringify(orderData.design_data).length : 0);
      console.log('用户ID:', orderData.user_id);
      console.log('设计ID:', orderData.original_design_id);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, orderData)
        .then(response => {
          console.log('=== API响应成功 ===');
          console.log('响应状态:', response.status);
          console.log('响应数据:', response.data);
        })
        .catch(err => {
          console.error('=== API响应错误 ===');
          console.error('错误状态:', err.response?.status);
          console.error('错误数据:', err.response?.data);
          console.error('错误消息:', err.message);
          throw err;
        });
      // 跳转到支付页面或订单确认页
      window.location.href = `/order/confirmation/${orderNumber}`;
    } catch (err) {
      setError('创建订单失败，请检查信息后重试');
      console.error('Order creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">设计预览</h2>
        {previewImage ? (
          <img src={previewImage} alt="Design Preview" className="max-w-full h-64 object-contain border rounded" />
        ) : (
          <div className="w-full h-64 border border-dashed flex items-center justify-center">
            生成预览中...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">尺码</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">选择尺码</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">数量</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">收货地址</label>
          <textarea
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">城市</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">邮政编码</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">支付方式</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="wechat"
                checked={formData.paymentMethod === 'wechat'}
                onChange={handleInputChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2">微信支付</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="alipay"
                checked={formData.paymentMethod === 'alipay'}
                onChange={handleInputChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2">支付宝</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !previewImage}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '处理中...' : '提交订单'}
        </button>
      </form>
    </div>
  );
}


