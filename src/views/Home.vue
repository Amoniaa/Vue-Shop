<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <!-- 顶部标题 -->
      <router-link to="/welcome"><span class="header-title">电商后台管理系统 V 1.0</span></router-link>
      <div class="login-container">
        <!-- logo -->
        <div class="avatar_box">
          <img src="https://img-blog.csdnimg.cn/8e03df4fea024a66956fa6f51028cd39.png">
        </div>
        <span class="header-tips">管理员 {{ username }}，您好！</span>
        <el-button type="primary" round size="small" @click="logout"> 退 出 </el-button>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'220px'">
        <div class="toggle" @click="toggleCollapse">
          <div :class="{'toggle-button-active': isCollapse}">|||</div>
        </div>
        <!-- 侧边栏菜单 -->
        <el-menu
          ref="elMenuRef"
          background-color="#3F76FD"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-menu-item index="/welcome">
            <i class="el-icon-s-data" />
            <span slot="title">数据概览</span>
          </el-menu-item>
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.id+''">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]" />
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级子菜单 -->
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/'+subItem.path">
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu" />
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体结构 -->
      <el-main :class="isCollapse ? 'left64':'left220'">
        <!-- 路由占位符 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: null,
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 菜单是否折叠
      isCollapse: false,
      // 当前激活的路由
      activePath: '',
      // 需要关闭的左侧菜单id
      menusId: [],
      // 管理员用户名
      username: ''
    }
  },
  watch: {
    // 监听路由的变化
    $route: {
      handler(val, oldVal) {
        if (val.path !== '/goods/add') {
          this.activePath = val.path
          console.log(val.path)
          window.sessionStorage.setItem('activePath', val.path)
        }
        this.menusId.forEach(item => {
          // 关闭所有左侧菜单
          this.$refs.elMenuRef.closeMenu(item + '')
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  created() {
    // 在created阶段请求左侧菜单数据
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
    this.username = window.sessionStorage.getItem('username')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      // 发送请求获取左侧菜单数据
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(res.data)
      this.menuList = res.data
      // 过滤掉数据统计模块
      // this.menuList = this.menuList.filter(item => {
      //   // 把每个菜单的id保存到一个数组中，切换的时候要用到
      //   this.menusId.push(item.id)
      //   return item.authName !== '数据统计'
      // })
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: calc(100% - 60px);
  margin-top: 60px;
}
.el-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  min-width: 1366px;
  background-color:#2F57D1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  .header-title {
    font-size: 22px;
  }
  .header-tips {
    font-size: 16px;
  }
  .login-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    .avatar_box {
      height: 30px;
      width: 30px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 2px;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }
}
.el-aside {
  position: absolute;
  height: calc(100% - 60px);
  background-color:#3762F6;
  .el-menu {
    position: sticky;
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
    border-right: 0px;
  }
}
.el-main {
  background-color:#eaedf1;
}
.left220 {
  margin-left: 220px;
}
.left64 {
  margin-left: 64px;
}
.iconfont, .el-icon-menu, .el-icon-s-data {
  margin-right: 8px;
  color: #fff;
}
// 导航栏箭头调试
/deep/.el-submenu__icon-arrow {
  color: white;
}
.toggle {
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
  line-height: 30px;
  background-color: #409EFF;
  color: white;
  cursor: pointer;
  letter-spacing: .2rem;
  font-size: 10px;
  text-align: center;
}
.toggle-button-active {
  transform: translateY(2px) rotate(90deg);
}
.el-submenu__title > i {
  margin: 4px;
}
.el-submenu__title > span {
  margin: 4px;
}

</style>
