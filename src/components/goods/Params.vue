<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 :closable="false"(是否展示“X”号) show-icon(显示图标) -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon />
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col :span="8">
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            expand-trigger="hover"
            :options="cateList"
            :props="cateProps"
            clearable
            @change="handleChange"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :disabled="isButtonDisabled" @click="addDialogVisible = true">添加参数</el-button>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 将标签页改为many -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe :header-cell-style="{background:'#eef1f6',color:'#606266'}">
            <!-- 索引列 -->
            <el-table-column type="index" align="center" />
            <!-- 展开行 -->
            <el-table-column label="标签" type="expand" width="50px">
              <template v-slot="scope">
                <!-- 循环生成的el-tag -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                <!-- 输入框 -->
                <el-input v-if="scope.row.inputVisible" ref="saveTagInput" v-model="scope.row.inputValue" class="input-new-tag" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" />
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新建标签</el-button>
              </template>
            </el-table-column>
            <el-table-column label="参数名称" prop="attr_name" />
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" circle @click="showEditDialog(scope.row.attr_id)" />
                <el-button type="danger" icon="el-icon-delete" size="small" circle @click="removeParams(scope.row.attr_id)" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 将标签页改为only -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe :header-cell-style="{background:'#eef1f6',color:'#606266'}">
            <!-- 索引列 -->
            <el-table-column type="index" align="center" />
            <!-- 展开行 -->
            <el-table-column label="标签" type="expand" width="50px">
              <template v-slot="scope">
                <!-- 循环生成的el-tag -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{ item }}</el-tag>
                <!-- 输入框 -->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 新建标签</el-button>
              </template>
            </el-table-column>
            <el-table-column label="属性名称" prop="attr_name" />
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" circle @click="showEditDialog(scope.row.attr_id)" />
                <el-button type="danger" icon="el-icon-delete" size="small" circle @click="removeParams(scope.row.attr_id)" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数或属性对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 添加表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数或属性对话框 -->
    <el-dialog :title="'编辑'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表
      cateList: [],
      // 用户在级联下拉菜单中选中的分类id
      selectedCateKeys: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // tab页签激活显示的页签项
      activeName: 'many',
      // 用来保存动态参数数据
      manyTableData: [],
      // 用来保存静态属性数据
      onlyTableData: [],
      // 控制添加参数.属性对话框的显示或隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 控制修改参数.属性对话框的显示或隐藏
      editDialogVisible: false,
      // 修改参数.属性对话框中的表单
      editForm: {
        attr_name: ''
      },
      // 修改表单的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 添加计算属性用来获取按钮禁用与否
    isButtonDisabled() {
      return this.selectedCateKeys.length !== 3
    },
    // 获取选中的三级分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1]
      }
      return null
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      // 获取所有的商品分类列表
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      // 将数据列表赋值给cateList
      this.cateList = res.data
    },
    // 监听层级选择器选择三级分类
    async handleChange() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$message('请选择第三级分类')
        return
      }
      // 发送请求，根据用户选择的三级分类和面板获取参数数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName }}
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表数据失败')
      }
      // 将获取到的数据中的attr_vals字符串转换为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加一个bool值控制文本框的显示或者隐藏
        item.inputVisible = false
        // 添加一个inputValue保存文本框值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        // 获取的是动态参数
        this.manyTableData = res.data
      } else if (this.activeName === 'only') {
        // 获取的是静态属性
        this.onlyTableData = res.data
      }
    },
    // 点击切换标签页
    handleTabClick() {
      console.log(this.activeName)
      this.handleChange()
    },
    // 当用户点击对话框中的确定时，校验表单
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        // 校验不通过，return
        if (!valid) return
        // 校验通过，发送请求完成添加参数或者属性
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加' + this.titleText + '数据失败')
        }
        this.$message.success('添加' + this.titleText + '数据成功')
        this.addDialogVisible = false
        this.handleChange()
      })
    },
    // 监听对话框关闭
    addDialogClosed() {
      // 对话框关闭之后，重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 发起请求获取需要修改的那个参数数据
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName }})
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数数据失败')
      }
      this.editForm = res.data
      // 显示修改参数.属性对话框
      this.editDialogVisible = true
    },
    // 当关闭修改参数.属性对话框时
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑参数
    editParams() {
      // 验证表单
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求完成修改
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数数据失败')
        }
        this.$message.success('修改' + this.titleText + '数据成功')
        this.editDialogVisible = false
        this.handleChange()
      })
    },
    // 根据id删除对应的参数或属性
    async removeParams(attrId) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '请问是否要删除该' + this.titleText,
        '删除提示',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 没有取消就是要删除，发送请求完成删除
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数数据失败')
      }
      this.$message.success('删除' + this.titleText + '数据成功')
      this.handleChange()
    },
    // 确认输入完成或取消输入
    handleInputConfirm(row) {
      // 当用户在文本框中按下enter键或者焦点离开时都会触发执行
      // 判断用户在文本框中输入的内容是否合法
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果用户输入了真实合法的数据，需要保存起来
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 删除对应索引的参数可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      // 调用函数，完成保存可选项的操作
      this.saveAttrVals(row)
    },
    // 封装函数，完成保存可选项的操作
    async saveAttrVals(row) {
      // 发起请求，保存参数细项
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        { attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 用户点击添加按钮时触发
    showInput(row) {
      row.inputVisible = true
      // $nextTick:在页面上元素被重新渲染之后，调用回调函数的代码
      this.$nextTick(_ => {
        // 让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin-right: 10px;
}

.input-new-tag, .button-new-tag {
  width: 90px;
}
</style>
