<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="https://img-blog.csdnimg.cn/8e03df4fea024a66956fa6f51028cd39.png">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" label-width="70px" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            placeholder="请输入密码"
            type="password"
          />
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button
            type="primary"
            round
            @click="login"
          >登 录</el-button>
          <el-button
            type="info"
            round
            @click="resetLoginForm"
          >重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单域绑定的数据对象
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证规则对象
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置表单
    resetLoginForm() {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 表单预验证
      this.$refs.loginFormRef.validate(async valid => {
        // 如果valid参数为true则验证通过
        if (!valid) return
        // 发送请求进行登录，解构data属性并重命名为res对象
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败:' + res.meta.msg) // console.log("登录失败:"+res.meta.msg)
        }
        this.$message.success('登录成功')
        console.log(res)
        // 登录成功之后，需要将后台返回的token保存到sessionStorage中而不选择localStorage
        window.sessionStorage.setItem('token', res.data.token)
        window.sessionStorage.setItem('activePath', '/welcome')
        window.sessionStorage.setItem('username', res.data.username)
        // 导航至/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  // background-color: #2b5b6b;
  background: url(https://img-blog.csdnimg.cn/f3b6906d79384db4a33a66e0c11b67fb.jpg);
  background-size: cover;
  background-position: center;
  height: 100%;
  position: relative;
}
.login_box {
  width: 450px;
  height: 300px;
  box-shadow: 0 0.3px 0.7px rgba(0, 0, 0, 0.126),
    0 0.9px 1.7px rgba(0, 0, 0, 0.179), 0 1.8px 3.5px rgba(0, 0, 0, 0.224),
    0 3.7px 7.3px rgba(0, 0, 0, 0.227), 0 10px 20px rgba(0, 0, 0, 0.4);
  // background: #fff;
  backdrop-filter: saturate(120%) blur(15px);
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 10px;
  position: absolute;
  // 居中
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 5px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
}
.btns{
  display: flex;
  justify-content: flex-end;
}
.login_form{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

</style>
