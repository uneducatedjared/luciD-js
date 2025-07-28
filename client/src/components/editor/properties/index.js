'use client';
import { useState } from "react";
import { Truck, Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { designStore } from "@/stores/designStore";
import { userStore } from "@/stores/userStore";
import { exportImageUrl } from '@/fabric/fabric-utils'

function Properties() {
  const router = useRouter();
  const { canvas, designId, tshirtColor, name, setTshirtColor } = designStore();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('white');
  const [quantity, setQuantity] = useState(1);

  const [isLoading, setIsLoading] = useState(false); // 表示数据正在加载/订单正在提交，防止用户重复提交
  const [error, setError] = useState(null); //存储错误信息
  // 可选尺码
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  
  // 可选颜色
  const colors = [
    { name: 'black', label: '黑色', color: '#000000' },
    { name: 'white', label: '白色', color: '#FFFFFF' },
    { name: 'pink', label: '粉色', color: '#FF69B4' }
  ];

  // 检测颜色变化，更换背景图片
  useEffect(()=>{
    setTshirtColor(selectedColor);
  },[selectedColor])

  // 处理数量变化
  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // 处理下单，直接更改数据库，但在更新数据库之前需要验证用户是否登录，如果未登录，需要路由到登录页面
  const handleOrder = async () => {
    
    // 验证用户是否登录，这里登录逻辑有问题，不过后面再改
    const token = localStorage.getItem('token');
    if (!token) {
      // 保存当前路径，登录后可以返回
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/user/login');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      // 准备订单数据
      const orderData = {
        designId,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        userId: user.id, // 假设用户对象中有id
        createdAt: new Date().toISOString()
      };

      // 如果有画布，导出设计图片
      let designImageUrl = null;
      if (canvas) {
        designImageUrl = await exportImageUrl(canvas);
        orderData.designImageUrl = designImageUrl;
      }

      // 发送订单数据到服务器
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // 假设用户对象中有token
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('创建订单失败');
      }

      const result = await response.json();
      
      // 订单创建成功后的处理
      alert('订单创建成功！订单号：' + result.orderId);
      
      // 重置表单
      setSelectedSize('M');
      setSelectedColor('white');
      setQuantity(1);
      
      // 跳转到订单详情页或订单列表页
      router.push(`/orders/${result.orderId}`);
    } catch (err) {
      setError(err.message || '下单过程中发生错误');
      console.error('下单错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 属性选择区域 */}
      <div className="p-6 space-y-6">
        {/* 尺码选择 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">尺码:</h3>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 颜色选择 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            颜色: <span className="font-normal">{colors.find(c => c.name === selectedColor)?.label}</span>
          </h3>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  selectedColor === color.name
                    ? 'border-teal-600 ring-2 ring-teal-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {selectedColor === color.name && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full ${color.name === 'white' ? 'bg-teal-600' : 'bg-white'}`}></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 数量选择 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">数量:</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange('increase')}
                className="p-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 下单按钮 */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleOrder}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          下单
        </button>
      </div>
    </div>
  );
}

export default Properties;