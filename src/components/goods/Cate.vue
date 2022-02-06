<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格  -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text=""
        border
        :show-row-hover="false"
      >
        <!-- 是否有效区域， 设置对应的模板列： slot="isok"(与columns中设置的template一致) -->
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color:lightgreen" />
          <i v-else class="el-icon-error" style="color:#F08889" />
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- <pre>{{ scope.row }}</pre> -->
          <!-- 修改v-slot="scope" -->
          <el-button type="primary" icon="el-icon-edit" size="small" circle @click="showEditDialog(scope.row.cat_id)" />
          <!-- 删除 -->
          <el-button type="danger" icon="el-icon-delete" size="small" circle @click="removeCateById(scope.row.cat_id)" />
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination :current-page="queryInfo.pagenum" background :page-sizes="[2, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      <!-- 分页 -->
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="40%" @close="addCateDialogClosed">
      <!-- 添加分类表单 -->
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid">
          <el-cascader
            v-model="selectedKeys"
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            clearable
            change-on-select
            @change="parentCateChange"
          />
        </el-form-item></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="40%">
      <!-- 修改分类表单 -->
      <el-form ref="editCateFormRef" :model="editCateForm" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 查询分类数据的条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 保存总数据条数
      total: 0,
      // 表格指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        // type:'template'(将该列设置为模板列)，template:'isok'(设置该列模板的名称为isok)
        { label: '是否有效', prop: '', type: 'template', template: 'isok' },
        { label: '排序', prop: '', type: 'template', template: 'order' },
        { label: '操作', prop: '', type: 'template', template: 'opt' }
      ],
      // 用来显示或隐藏添加分类对话框
      addCateDialogVisible: false,
      editCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 添加分类的父级id，0则表示父级为0.添加一级分类
        cat_pid: 0,
        // 添加分类的等级，0则表示添加一级分类
        cat_level: 0
      },
      // 修改分类的表单数据对象
      editCateForm: {
        // 分类名称
        cat_name: ''
      },
      // 添加分类校验规则
      addCateFormRules: {
        // 验证规则
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 保存1,2级父级分类的列表
      parentCateList: [],
      // 配置级联菜单中数据如何展示
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 绑定用户选择的分类值
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      // 获取商品分类数据
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 将数据列表赋值给cateList
      this.cateList = res.data.result
      // 保存总数据条数
      this.total = res.data.total
      //   console.log(res.data);
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
    // 当pagesize发生改变时触发
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
    // 当pagenum发生改变时触发
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      // 调用getParentCateList获取父级分类列表
      this.getParentCateList()
      // 显示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败')
      }
      this.parentCateList = res.data
    },
    // 当关闭添加分类对话框时，重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 级联菜单中选择项发生变化时触发
    parentCateChange() {
      // console.log(this.selectedKeys)
      // 如果用户选择了父级分类
      if (this.selectedKeys.length > 0) {
      // 则将数组中的最后一项设置为父级分类
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // level也要跟着发生变化
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
        return
      }
    },
    // 点击确定，完成添加分类
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求完成添加分类
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 展示编辑分类的对话框
    async showEditDialog(id) {
    // 发送请求根据id获取分类信息
      console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      // 判断如果添加失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
      // 将获取到的数据保存到数据editCateForm中
      this.editCateForm = res.data
      // console.log(this.editCateForm)
      // 显示弹出窗
      this.editCateDialogVisible = true
    },
    // 修改分类信息
    editCate() {
    // 分类点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整分类信息')
        // 发送请求完成修改分类的操作
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          this.editCateForm
        )
        // 判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        // 修改成功的提示
        this.$message.success('修改分类成功')
        // 关闭对话框
        this.editCateDialogVisible = false
        // 重新请求最新的数据
        this.getCateList()
      })
    },
    async removeCateById(id) {
    // 弹出确定取消框，是否删除分类
      const confirmResult = await this.$confirm('请问是否要永久删除该分类', '删除提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果分类点击确认，则confirmResult 为'confirm'
      // 如果分类点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('categories/' + id)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      // 修改成功的提示
      this.$message.success('删除分类成功')
      // 重新请求最新的数据
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  font-size: 14px;
  margin-top: 15px;
  color: #606266;
}

</style>
