<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255,255,255,.6)"
        :data="roleList"
        :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        border
        stripe
      >
        <el-table-column type="index" align="center" />
        <el-table-column label="权限" type="expand" width="50px">
          <template v-slot="scope">
            <div v-if="scope.row.children.length===0" class="hcenter"> 暂无权限内容 </div>
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbottom','vcenter',i1===0?'bdtop':'']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right" />
              </el-col>
              <!-- 渲染二，三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限  -->
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="['vcenter',i2===0?'':'bdtop' ]">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row,item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改v-slot="scope" -->
            <el-button type="primary" icon="el-icon-edit" size="small" circle @click="showEditDialog(scope.row.id)" />
            <!-- 分配角色 -->
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="small" circle @click="showSetRightDialog(scope.row)" />
            </el-tooltip>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="small" circle @click="removeRoleById(scope.row.id)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框组件 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" />
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框组件 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc" />
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
      <!-- 树形组件    show-checkbox:显示复选框    node-key:设置选中节点对应的值    default-expand-all:是否默认展开所有节点    :default-checked-keys 设置默认选中项的数组    ref:设置引用 -->
      <el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表格加载动画
      loading: true,
      roleList: [],
      // 是否显示添加角色弹出窗
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色的表单数据
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称在2~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 32,
            message: '角色名在2~32个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 修改表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称在2~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 32,
            message: '角色名在2~32个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 控制分配权限对话框的显示
      setRightDialogVisible: false,
      // 权限树数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        // 通过label设置树形节点文本展示authName
        label: 'authName',
        // 设置通过children属性展示子节点信息
        children: 'children'
      },
      // 设置树形控件中默认选中的内容
      defKeys: [],
      // 保存正在操作的角色id
      roleId: ''
    }
  }, created() {
    this.getRoleList()
  }, methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) { return this.$message.error('获取角色列表失败') }
      // 如果返回状态正常，将请求的数据保存在data中
      this.roleList = res.data
      // console.log(this.roleList)
      // 停止加载动画
      this.loading = false
    },
    // 监听对话框关闭
    addDialogClosed() {
      // 对话框关闭之后，重置表达
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加新角色
    addRole() {
      // 调用validate进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整角色信息')
        // 发送请求完成添加角色的操作
        const { data: res } = await this.$http.post('roles', this.addForm)
        // console.log(res)
        // 判断如果添加失败，就做提示
        if (res.meta.status !== 201) { return this.$message.error('添加角色失败 ' + res.meta.msg) }
        // 添加成功的提示
        this.$message.success('添加角色成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 重新请求最新的数据
        this.getRoleList()
      })
    },
    // 展示编辑角色的对话框
    async showEditDialog(id) {
    // 发送请求根据id获取角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      // 判断如果添加失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      // 将获取到的数据保存到数据editForm中
      this.editForm = res.data
      console.log(this.editForm)
      // 显示弹出窗
      this.editDialogVisible = true
    },
    // 监听对话框关闭
    editDialogClosed() {
    // 对话框关闭之后，重置表单
      // this.$refs.editFormRef.resetFields()
    },
    // 修改角色信息
    editRole() {
    // 角色点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整角色信息')
        // 发送请求完成修改角色的操作
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          this.editForm
        )
        console.log(this.editForm.roleId)
        // 判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        // 修改成功的提示
        this.$message.success('修改角色成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 重新请求最新的数据
        this.getRoleList()
      })
    },
    // 删除角色信息
    async removeRoleById(id) {
    // 弹出确定取消框，是否删除角色
      const confirmResult = await this.$confirm('请问是否要永久删除该角色', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果角色点击确认，则confirmResult 为'confirm'
      // 如果角色点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('roles/' + id)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      // 修改成功的提示
      this.$message.success('删除角色成功')
      // 重新请求最新的数据
      this.getRoleList()
    },
    // 删除权限
    async removeRightById(role, rightId) {
    // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm('请问是否要删除该权限', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      // 用户点击了确定表示真的要删除
      // 当发送delete请求之后，返回的数据就是最新的角色权限信息
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) { return this.$message.error('删除角色权限失败') }

      // 无需再重新加载所有权限
      // 只需要对现有的角色权限进行更新即可
      role.children = res.data
      // this.getRoleList();
    },
    // 显示分配权限对话框
    async showSetRightDialog(role) {
      // 将role.id保存起来以供保存权限时使用
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) return this.$message.error('获取权限树失败')
      // 如果返回状态正常，将请求的数据保存在data中
      this.rightsList = res.data
      // 调用getLeafKeys进行递归，将三级权限添加到数组中
      this.getLeafKeys(role, this.defKeys)
      // 当点击分配权限按钮时，展示对应的对话框
      this.setRightDialogVisible = true
      console.log(this.defKeys)
    },
    // 通过递归的形式，获取角色下三级权限的id，用于展示默认选中的权限
    getLeafKeys(node, arr) {
      // 该函数会获取到当前角色的所有三级权限id并添加到defKeys中
      // 如果当前节点不包含children属性，则表示node为三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归调用
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭分配权限对话框
    setRightDialogClose() {
      // 当用户关闭树形权限对话框的时候，清除掉所有选中状态
      this.defKeys = []
    },
    // 分配权限
    async allotRights() {
      // 当用户在树形权限对话框中点击确定，将用户选择的
      // 权限发送请求进行更新
      // 获取所有选中及半选的内容
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组转换为 , 拼接的字符串
      const idStr = keys.join(',')
      // 发送请求完成更新
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) { return this.$message.error('分配权限失败') }
      this.$message.success('分配权限成功')
      this.getRoleList()
      // 关闭对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.hcenter {
  display: flex;
  justify-content: center;
}
</style>
