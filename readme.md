[role]你是一名熟知next.js和node.js的经验丰富的全栈工程师
[target]现在需要你帮我一个diyt恤的网站
[techstack] 这是一个前后端分离的项目，技术栈，前端用next.js，设计页面的制作用fabrics.js，后端用express.js，不要使用微服务架构。样式使用数据库用postgre。
[constrains] 在用户认证过程中，不要使用任何第三方认证协议。语法遵循es6+，不要使用commonjs规范。
[store] 我们将使用 Zustand 创建一个轻量级的集中式存储来管理全局应用程序状态。这包括当前T恤设计数据（由 Fabric.js 管理）、用户认证状态、购物车内容和产品信息。
[project] 我的整个项目分两个文件夹一个是client，存放所有跟前端有关的文件夹，一个是sever，存放所有和后端有关的文件夹。

## 前端文件规划
├── app/                      # Next.js 应用根目录
│   ├── editor/[designId]            # 编辑界面模块, designId 应该用uuidv4生成
│   │   ├── page.js           # 编辑器主页面 (对应 /editor 路由)
                              # 协调布局，渲染 FunctionPanel、CanvasArea 和 PropertiesPanel。
│   │   └── components/       # 编辑器内部组件
│   │       ├── sidebar/
│   │           └── FunctionPanel.js      # 左侧功能区组件,
                                          # 功能：用户拖拽/放置或点击选择图片。FunctionPanel.js 使用 useState 管理选定的文件、清除画布、保存设计。
                                          # 状态：使用useState管理文件选择和上传进度，调用zustand store方法添加图片到画布
│   │       ├── canvas/
│   │           └── CanvasArea.js         # 中间画布区组件 (Fabric.js 相关的逻辑和渲染)
                                          # 功能：初始化 Fabric.js 画布，渲染 T 恤模型和用户上传的图片。
                                          # 支持图片拖拽、缩小/放大、旋转。
                                          # 状态： useRef 获取 canvas 元素；useEffect 初始化 Fabric.js 实例并监听对象变化; 从 Zustand store 获取设计数据，并将画布状态更新回 Zustand
                                          #T恤预览：T恤基础图片路径示例：/images/tshirt_base_white.png（白）、/images/tshirt_base_black.png（黑）、/images/tshirt_base_darkred.png（暗红）CanvasArea.js 会根据 PropertiesPanel 中选择的颜色加载对应的T恤底图。
                                          Fabric.js 直接在画布上处理拖拽、缩放、旋转操作。CanvasArea.js 的 useEffect 监听 Fabric.js 事件（例如 object:modified、selection:updated）。当这些事件触发时，它会序列化当前画布状态（例如，为 JSON），并分派一个动作来更新 Zustand designStore
│   │       ├── properties/
│   │           └── PropertiesPanel.js    # 右侧属性区组件, 这是T恤颜色的属性区。
                                          # 功能：显示 T 恤颜色选项（黑色、白色、暗红色）。
                                          # 提供下单按钮
                                          # 状态：使用 useState 管理当前选中的 T 恤颜色，并将该颜色更新到 Zustand design store 中。
                                          CanvasArea.js 的 useEffect 监听 designStore.tshirtColor 的变化，并相应地更新加载的T恤底图。
                                          # 下单按钮点击后，触发导航到 /order/place-order 路由，（可能将 designId 或序列化的设计数据作为 URL 查询的一部分，或通过共享服务/状态传递）。设计数据此时可以保存到后端。
│   ├── order/                # 用户下单、支付、订单查看和物流模块
│   │   ├── page.js           # 用户的订单详情
│   │   ├── place-order/[orderId]      # 下单页面，这里应该能看到价格，填写物流信息。
│   │   │   └── page.js       # (对应 /order/place-order 路由)
│   │   ├── payment/[orderId]/   # 支付页面，这里可以对接微信或者支付宝的api
│   │   │   └── page.js       # (对应 /order/payment 路由)
│   │   ├── view-order/[orderId]/   # 查看具体订单详情 (动态路由)
│   │   │   └── page.js       # (对应 /order/view-order/[orderId] 路由)
│   │   └── components/       # 订单相关可复用组件 (如订单项卡片、支付表单)
│   ├── user/                 # 用户登录和注册模块
│   │   ├── login/            # 登录页面
│   │   │   └── page.js       # (对应 /user/login 路由)
│   │   ├── register/         # 注册页面
│   │   │   └── page.js       # (对应 /user/register 路由)
│   │   └── components/       # 用户认证相关可复用组件 (如登录/注册表单)
│   ├── manufacture/          # 供应商生产页面模块
│   │   ├── page.js           # 生产管理主页面 (对应 /manufacture 路由)
│   │   ├── [orderId]/   # 查看具体订单详情 (动态路由)
│   │   │   └── page.js       # (对应 /manufacture/[orderId] 路由) 可以下载orderId对应的设计
│   │   └── components/       # 生产相关可复用组件 (如生产队列列表、生产详情卡片)
│   ├── api/                  # Next.js 内部 API 路由 (可选，用于代理后端请求或纯前端逻辑)
│   │   ├── auth/
│   │   │   └── route.js      # 例如：/api/auth/login
│   │   └── editor/
│   │       └── route.js      # 保存设计用post，、加载、图片上传等 Next.js API 路由。
                              # 这些路由将作为前端和 Express 后端之间的代理。
│   ├── components/           # 全局或跨模块可复用组件 (Button等)
│   │   └── ...
│   ├── lib/                  # 客户端工具函数或常量
│   │   └── utils.js          # 通用工具函数
│   ├── stores/ #Zustand 存储目录
│   │   │   ├── designStore.js # 存储 Fabric.js 画布的设计状态、T恤颜色、当前活动对象等。
│   │   │   ├── userStore.js # 存储用户认证信息。
│   │   │   └── cartStore.js # 存储购物车和订单草稿信息。
│   ├── public/               # 静态资源 (图片、字体、favicon 等)
│   │   └── images/
│   │       └── logo.png
│   │       ├── tshirt_base_black.png # 黑色T恤底图
│   │       ├── tshirt_base_white.png # 白色T恤底图
│   │       └── tshirt_base_darkred.png # 暗红色T恤底图
│   ├── layout.js             # 根布局文件 (适用于所有路由)
│   ├── page.js               # 首页：欢迎语和连接到设计页面的按钮（例如：“开始设计你的T恤”）
│   ├── not-found.js          # 404 页面
│   ├── error.js              # 错误边界页面
│   └── globals.css           # 全局样式文件
├── next.config.js            # Next.js 配置文件
├── package.json              # 项目依赖管理
├── postcss.config.js         # PostCSS 配置文件 (如果使用 Tailwind CSS)
├── tailwind.config.js        # Tailwind CSS 配置文件
└── .env                      # 环境变量文件

## 数据库设计
[database] 我已经在后台创建好了对应的数据库，名称叫做diy
[tables] 以下是我已经创建好的tables
1. users
```
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
        CONSTRAINT comment_user_id COMMENT '用户唯一标识符，使用UUID生成',
    user_type VARCHAR(20) NOT NULL DEFAULT 'customer'
        CONSTRAINT comment_user_type COMMENT  '用户类型：customer（普通用户）、vendor（供应商）、admin（管理员）',
    username VARCHAR(50) UNIQUE NOT NULL
        CONSTRAINT comment_username COMMENT '用户登录名，需保持唯一性',
    email VARCHAR(255) UNIQUE NOT NULL
        CONSTRAINT comment_email COMMENT '用户邮箱，需保持唯一性，用于登录和通知',
    password_hash VARCHAR(255) NOT NULL
        CONSTRAINT comment_password_hash COMMENT '加密后的用户密码',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
        CONSTRAINT comment_is_active COMMENT '用户账户状态，TRUE表示活跃，FALSE表示禁用',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT comment_created_at COMMENT '用户账户创建时间，自动记录',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT comment_updated_at COMMENT '用户信息最后更新时间，自动记录'
) WITH (
    COMMENT = '存储平台用户的基本信息'
);
CREATE INDEX idx_users_email ON users (email);
COMMENT ON INDEX idx_users_email IS '加速通过邮箱查询用户的索引';
```
2. designs
```
CREATE TABLE designs (
    design_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
        CONSTRAINT comment_design_id COMMENT '设计图唯一标识符，使用UUID生成',
    user_id UUID NOT NULL
        CONSTRAINT comment_designs_user_id COMMENT '创建此设计图的用户ID，关联到users表',
    design_data JSONB NOT NULL
        CONSTRAINT comment_design_data COMMENT '设计图的详细数据，以JSONB格式存储',
    img_url VARCHAR(255) NOT NULL
        CONSTRAINT comment_img_url COMMENT '设计图的图片URL地址',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT comment_designs_created_at COMMENT '设计图创建时间，自动记录',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT comment_designs_updated_at COMMENT '设计图最后更新时间，自动记录'
) WITH (
    COMMENT = '存储用户创建的设计图信息'
);
CREATE INDEX idx_designs_user_id ON designs (user_id);
COMMENT ON INDEX idx_designs_user_id IS '加速查询特定用户设计图的索引';
```
3. orders
```
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
        CONSTRAINT comment_order_id COMMENT '订单唯一标识符，使用UUID生成',
    user_id UUID NOT NULL
        CONSTRAINT comment_orders_user_id COMMENT '创建订单的用户ID，关联到users表',
    original_design_id UUID NOT NULL
        CONSTRAINT comment_original_design_id COMMENT '订单对应的原始设计图ID，关联到designs表',
    design_data JSONB NOT NULL
        CONSTRAINT comment_orders_design_data COMMENT '订单使用的设计图数据，以JSONB格式存储',
    img_url VARCHAR(255) NOT NULL
        CONSTRAINT comment_orders_img_url COMMENT '订单相关图片的URL地址',
    size VARCHAR(50) NOT NULL
        CONSTRAINT comment_size COMMENT '商品尺寸规格',
    quantity INTEGER NOT NULL
        CONSTRAINT comment_quantity COMMENT '订购数量',
    shipping_address TEXT NOT NULL
        CONSTRAINT comment_shipping_address COMMENT '收货地址',
    tracking_number VARCHAR(100)
        CONSTRAINT comment_tracking_number COMMENT '物流跟踪号',
    estimated_delivery DATE
        CONSTRAINT comment_estimated_delivery COMMENT '预计送达日期',
    actual_delivery DATE
        CONSTRAINT comment_actual_delivery COMMENT '实际送达日期',
    order_status VARCHAR(50) NOT NULL
        CONSTRAINT comment_order_status COMMENT '订单状态，如pending、paid、shipped等',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
        CONSTRAINT comment_price COMMENT '订单总价，保留两位小数，必须非负',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT comment_orders_created_at COMMENT '订单创建时间，自动记录',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT comment_orders_updated_at COMMENT '订单最后更新时间，自动记录'
) WITH (
    COMMENT = '存储用户订单的详细信息'
);
CREATE INDEX idx_orders_user_id ON orders (user_id);
COMMENT ON INDEX idx_orders_user_id IS '加速查询特定用户订单的索引';
```


## 后端文件规划

sever/                      # 后端项目根目录
├── src/                    # 源代码目录
│   ├── app.js              # Express 应用入口文件
│   ├── config/             # 配置文件目录
│   │   ├── db-config.js    # 数据库连接配置
│   │   ├── env-config.js   # 环境变量配置
│   │   └── auth-config.js  # 认证配置（如 JWT 密钥）
│   ├── controllers/        # 控制器层，处理业务逻辑
│   │   ├── auth-controller.js    # 用户认证控制器
│   │   ├── design-controller.js  # 设计图控制器
│   │   ├── order-controller.js   # 订单控制器
│   │   └── user-controller.js    # 用户控制器
│   ├── middleware/         # 中间件目录
│   │   ├── auth-middleware.js    # 认证中间件
│   │   ├── error-middleware.js   # 错误处理中间件
│   │   └── upload-middleware.js  # 文件上传中间件
│   ├── models/             # 数据模型目录（与数据库表对应）
│   │   ├── user.js   # 用户模型
│   │   ├── design.js # 设计图模型
│   │   └── order.js  # 订单模型
│   ├── routes/             # 路由定义目录
│   │   ├── auth.js  # 认证路由
│   │   ├── design.js # 设计图路由
│   │   ├── order.js  # 订单路由
│   │   └── user.js   # 用户路由
│   ├── services/           # 服务层，处理复杂业务逻辑
│   │   ├── auth.js    # 认证服务
│   │   ├── design.js # 设计图服务
│   │   ├── order.js  # 订单服务
│   │   └── user.js   # 用户服务
│   ├── utils/              # 工具函数目录
│   │   ├── db.utils.js     # 数据库工具函数
│   │   ├── error.utils.js  # 错误处理工具
│   │   └── file.utils.js   # 文件处理工具
│   └── validators/         # 请求验证目录
│       ├── auth.js   # 认证请求验证
│       ├── design.js # 设计图请求验证
│       └── order.js  # 订单请求验证
├── public/                 # 静态资源目录
│   └── uploads/            # 上传文件存储目录
│       ├── designs/        # 设计图存储目录
│       └── orders/         # 订单图片存储目录
├── tests/                  # 测试目录
│   ├── unit/               # 单元测试
│   └── integration/        # 集成测试
├── .env                    # 环境变量文件
├── .gitignore              # Git 忽略文件
├── package.json            # 项目依赖
├── server.js               # 服务器启动文件
└── README.md               # 项目说明文档
