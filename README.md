# vue_shop：电商后台管理系统
## [在线演示地址](http://eshop.amoniaa.com)
## [项目 API 接口文档](https://gitee.com/Amoniaa/vue_shop/blob/master/API%20%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3.md)
### 一、项目简介
#### 1. 系统功能 
电商后台管理系统具有管理用户账号、商品分类、商品信息、订单、数据统计等业务功能。
![](https://img-blog.csdnimg.cn/e8f178ffb88b4f35bee3107074be69f7.jpg)

 #### 2. 开发模式(前后端分离)
电商后台管理系统整体采用前后端分离的开发模式，其中前端项目是基于 Vue 技术栈的 SPA 项目。
 #### 3. 技术选型

 - **前端项目技术栈**
   - Vue
   - Vue-router
   - Element-UI
   - Axios
   - Echarts
 - **后端项目技术栈**
   - Node.js
   - Express
   - Jwt
   - Mysql
   - Sequelize

### 二、界面展示
#### 1. 管理员登录

![](https://img-blog.csdnimg.cn/6622bee56ed74660939efd78e9b14801.png)
#### 2. 用户管理：用户列表
![](https://img-blog.csdnimg.cn/50953555d6bf4f38a1de712a4fa6f0ee.png)
#### 3. 权限管理：角色列表
![](https://img-blog.csdnimg.cn/e437995680cc4db28bc51a0cf55f3885.png)
#### 4. 权限管理：权限列表
![](https://img-blog.csdnimg.cn/0ecde178b94947fb89eec0da8c24deac.png)
#### 5. 商品管理：商品列表
![](https://img-blog.csdnimg.cn/6802e5555a36469aa6456a4ee0faf3c9.png)
#### 6. 商品管理：商品详情
![](https://img-blog.csdnimg.cn/ef93591c8713405297d61afb890a67b3.png)

#### 7. 商品管理：添加商品
![](https://img-blog.csdnimg.cn/f391254118c24db095f921d4286b763e.png)

#### 8. 商品管理：分类参数
![](https://img-blog.csdnimg.cn/0c1fdaa97b44426d9fdf2bba1c59237d.png)

#### 9. 商品管理：商品分类
![](https://img-blog.csdnimg.cn/2475af184a5a409ba9f251a9d9fdf1c0.png)
#### 10. 订单管理：订单列表
![](https://img-blog.csdnimg.cn/c68f8b44630e4dc7b1a455ca8c672831.png)
#### 11. 数据统计：数据报表
![](https://img-blog.csdnimg.cn/0078641ef6a746a486e4d262db262412.png)
### 三、功能简介
#### 1. 登录功能
##### 1. 业务流程
1 在登录页面输入用户名和密码
2 调用后台接口进行验证
3 通过验证之后，根据后台的响应状态跳转到项目主页
##### 2. 登录业务的相关技术点
1 http 是无状态的
2 通过 cookie 在客户端记录状态
3 通过 session 在服务器端记录状态
4 通过 token 方式维持状态
##### 3. token 原理分析
![](https://img-blog.csdnimg.cn/be4549f5da3b44cfbcae2f0173d1db5a.jpg)
#### 2. 用户管理
通过后台管理用户的账号信息，具体包括用户信息的展示、添加、修改、删除、角色分配、账号启用/注销等功能。
- 用户信息列表展示
- 添加用户
- 修改用户
- 删除用户
- 启用或禁用用户
- 用户角色分配
- 用户查询
#### 3. 权限管理
通过权限管理模块控制不同的用户可以进行哪些操作，具体可以通过角色的方式进行控制，即每个用户分配一个特定的角色，角色包括不同的功能权限。
- 角色信息列表展示
- 权限信息列表展示
- 添加角色
- 修改角色
- 删除角色
- 角色权限分配
- 角色权限删除
#### 4. 分类管理
商品分类用于在购物时，快速找到所要购买的商品，可以通过电商平台主页直观的看到。
- 商品分类树状列表展示
- 添加分类
- 修改分类
- 删除分类
#### 5. 参数管理
商品参数用于显示商品的固定的特征信息，可以通过电商平台商品详情页面直观的看到。
- 动态参数列表展示
- 静态属性列表展示
- 标签展示
- 标签删除
- 添加参数
- 修改参数
- 删除参数

#### 6. 商品管理
商品管理模块用于维护电商平台的商品信息，包括商品的类型、参数、图片、详情等信息。通过商品管理模块可以 实现商品的添加、修改、展示和删除等功能。
- 商品列表展示
- 商品详情面板
- 添加商品（商品信息、参数属性、图片和详情）
- 修改商品
- 删除商品
- 商品查询
#### 7. 订单管理
订单管理模块用于维护商品的订单信息，可以查看订单的商品信息、物流信息，并且可以根据实际的运营情况对订 单做适当的调整。
- 订单列表展示
- 修改收货地址
- 物流信息展示
#### 8. 数据统计
数据统计模块主要用于统计电商平台运营过程的中的各种统计数据，并通过直观的可视化方式展示出来，方便相关 运营和管理人员查看。
- 数据报表展示
### 四、项目优化：

#### 1. 生成打包报告，根据报告优化项目
根据VUE UI面板中的项目编译日志，优化项目
![](https://img-blog.csdnimg.cn/c5ab9ec322c041e9a0ad2ccc112984bc.png)
#### 2. 第三方库启用CDN
![](https://img-blog.csdnimg.cn/a540991fb69447f09e09715209ba18e6.png)
#### 3. Element-UI组件按需加载
#### 4. 路由懒加载
![](https://img-blog.csdnimg.cn/ab21f2c6fcf7422bb65e4a956963363e.png)
#### 5. 首页内容定制（页面标题，条件引入CDN）
![](https://img-blog.csdnimg.cn/c22c87e83ab5425c859c963798bb3357.png)

#### 6. 修改webpack配置，删除main.js，新建main-prod.js和main-dev.js，分别用于开发环境和发布环境
![](https://img-blog.csdnimg.cn/7725abf995904550bbca4c21cb759475.png)


#### 7. 页面加载时显示进度条
![](https://img-blog.csdnimg.cn/04575996a1744db9bb9f6ec2735d7fe4.png)

#### 8. alias别名配置
![](https://img-blog.csdnimg.cn/869d7ed55ddf4325a476d91923d004bd.png)
#### 9. vue_router改为history模式，服务器设置nginx转发：try_files ```$uri $uri/ /index.html;```
![](https://img-blog.csdnimg.cn/cb180833808d4f0aa2c059992631d954.png)
#### 10. 分包：network网络封装，工具类common，视图views
![](https://img-blog.csdnimg.cn/f04fd8ec59744876ab209a7fa35448a4.png)
