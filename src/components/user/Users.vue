<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="3">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
        <el-col :span="7">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList" />
          </el-input>
        </el-col>
      </el-row>
      <!-- 用户列表(表格)区域 -->
      <el-table
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255,255,255,.6)"
        :data="userList"
        :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        border
        stripe
      >
        <el-table-column type="index" align="center" />
        <el-table-column label="用户名" prop="username" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="电话" prop="mobile" />
        <el-table-column label="角色" prop="role_name" />
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="small" circle @click="showEditDialog(scope.row.id)" />
            <!-- 分配角色 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="small" circle @click="showSetRoleDialog(scope.row)" />
            </el-tooltip>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="small" circle @click="removeUserById(scope.row.id)" />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页导航区域 -->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <!-- 添加用户对话框组件 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框组件 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleDialogClosed">
      <div>
        <el-form label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" disabled />
          </el-form-item>
          <el-form-item label="当前角色">
            <el-input v-model="userInfo.role_name" disabled />
          </el-form-item>
          <el-form-item label="分配新角色" required>
            <el-select v-model="selectedRoleId" placeholder="请选择角色">
              <!-- :label 显示文本，:value 选中值 -->
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      // 表格加载动画
      loading: true,
      // 获取查询用户信息的参数
      queryInfo: {
      // 查询的条件
        query: '',
        // 当前的页数，即页码
        pagenum: 1,
        // 每页显示的数据条数
        pagesize: 5
      },
      // 保存请求回来的用户列表数据
      userList: [],
      total: 0,
      // 是否显示添加用户弹出窗
      addDialogVisible: false,
      editDialogVisible: false,
      // 控制显示分配角色对话框
      setRoleDialogVisible: false,
      // 保存正在操作的那个用户信息
      userInfo: {},
      // 保存所有的角色信息
      rolesList: [],
      // 保存用户选中的角色id
      selectedRoleId: '',
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      },
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // 发送请求获取用户列表数据
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) { return this.$message.error('获取用户列表失败') }
      // 如果返回状态正常，将请求的数据保存在data中
      this.userList = res.data.users
      this.total = res.data.total
      // 停止加载动画
      this.loading = false
      // console.log(res)
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      // pagesize改变时触发，当pagesize发生改变的时候，我们应该
      // 以最新的pagesize来请求数据并展示数据
      this.queryInfo.pagesize = newSize
      // 重新按照pagesize发送请求，请求最新的数据
      this.getUserList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(current) {
      // 页码发生改变时触发当current发生改变的时候，我们应该
      // 以最新的current页码来请求数据并展示数据
      this.queryInfo.pagenum = current
      // 重新按照pagenum发送请求，请求最新的数据
      this.getUserList()
    },
    // 监听用户状态改变
    async userStateChanged(row) {
      // 发送请求进行状态修改
      const { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      )
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        row.mg_state = !row.mg_state
        return this.$message.error('修改状态失败')
      }
      this.$message.success('更新状态成功')
    },
    // 监听对话框关闭
    addDialogClosed() {
      // 对话框关闭之后，重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加新用户
    addUser() {
      // 调用validate进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成添加用户的操作
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        // 判断如果添加失败，就做提示
        if (res.meta.status !== 201) { return this.$message.error(res.meta.msg ? res.meta.msg : '添加用户失败') }
        // 添加成功的提示
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 重新请求最新的数据
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
    // 发送请求根据id获取用户信息
      const { data: res } = await this.$http.get('users/' + id)
      // 判断如果添加失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('获取用户信息失败')
      // 将获取到的数据保存到数据editForm中
      this.editForm = res.data
      // console.log(this.editForm)
      // 显示弹出窗
      this.editDialogVisible = true
    },
    // 监听对话框关闭
    editDialogClosed() {
    // 对话框关闭之后，重置表单
      // this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息
    editUser() {
    // 用户点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成修改用户的操作
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          this.editForm
        )
        console.log(this.editForm.id)
        // 判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 修改成功的提示
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 重新请求最新的数据
        this.getUserList()
      })
    },
    // 删除用户信息
    async removeUserById(id) {
    // 弹出确定取消框，是否删除用户
      const confirmResult = await this.$confirm('请问是否要永久删除该用户', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('users/' + id)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 修改成功的提示
      this.$message.success('删除用户成功')
      // 重新请求最新的数据
      this.getUserList()
    },
    // 展示分配角色对话框
    async showSetRoleDialog(userInfo) {
      // 保存起来以供后续使用
      this.userInfo = userInfo
      // 获取所有的角色信息，以备下拉列表使用
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.get('roles')
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
      // 展示分配角色对话框
      this.setRoleDialogVisible = true
    },
    // 分配角色
    async saveRoleInfo() {
      // 当用户点击确定按钮之后
      // 判断用户是否选择了需要分配的角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择需要分配的角色')
      }
      // 发送请求完成分配角色的操作
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      console.log(res)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) { return this.$message.error(res.meta.msg ? res.meta.msg : '分配角色失败') }
      this.$message.success('分配角色成功')
      this.getUserList()
      // 关闭对话框
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      // 当关闭对话框的时候，重置下拉框中的内容
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

</style>
