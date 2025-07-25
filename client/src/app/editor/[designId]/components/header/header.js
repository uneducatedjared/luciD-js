import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useDesignStore from '@/app/stores/designStore';
import useUserStore from '@/app/stores/userStore';

const Header = () => {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const {
    designName,
    setDesignName,
    saveDesign,
    isSaved,
    isLoading
  } = useDesignStore();

  const { user } = useUserStore();

  // 开始编辑设计名称
  const startEditingName = () => {
    setTempName(designName);
    setIsEditingName(true);
  };

  // 保存设计名称
  const saveDesignName = () => {
    if (tempName.trim()) {
      setDesignName(tempName.trim());
    }
    setIsEditingName(false);
  };

  // 取消编辑
  const cancelEditingName = () => {
    setTempName('');
    setIsEditingName(false);
  };

  // 处理回车键
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveDesignName();
    } else if (e.key === 'Escape') {
      cancelEditingName();
    }
  };

  // 返回首页
  const goHome = () => {
    if (!isSaved) {
      const confirmLeave = window.confirm('设计尚未保存，确定要离开吗？');
      if (!confirmLeave) return;
    }
    router.push('/');
  };

  // 查看我的订单
  const viewOrders = () => {
    router.push('/order');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左侧：Logo 和设计名称 */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <button
            onClick={goHome}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DIY</span>
            </div>
            <span className="font-semibold text-lg">T恤定制</span>
          </button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* 设计名称 */}
          <div className="flex items-center space-x-2">
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveDesignName}
                  className="px-2 py-1 border border-blue-300 rounded text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入设计名称"
                  autoFocus
                />
                <button
                  onClick={saveDesignName}
                  className="text-green-600 hover:text-green-700"
                  title="保存"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={cancelEditingName}
                  className="text-red-600 hover:text-red-700"
                  title="取消"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-medium text-gray-800">{designName}</h1>
                <button
                  onClick={startEditingName}
                  className="text-gray-400 hover:text-gray-600"
                  title="编辑名称"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {/* 保存状态指示器 */}
            <div className="flex items-center space-x-1">
              {isLoading ? (
                <div className="flex items-center space-x-1 text-blue-600">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">保存中...</span>
                </div>
              ) : isSaved ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">已保存</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-amber-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm">未保存</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 中间：工具栏 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={saveDesign}
            disabled={isLoading || isSaved}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading || isSaved
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '保存中...' : '保存设计'}
          </button>

          <button
            onClick={() => router.push('/editor')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            新建设计
          </button>
        </div>

        {/* 右侧：用户信息和菜单 */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={viewOrders}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                我的订单
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="relative">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* 这里可以添加下拉菜单 */}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/user/login')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                登录
              </button>
              <button
                onClick={() => router.push('/user/register')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                注册
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;