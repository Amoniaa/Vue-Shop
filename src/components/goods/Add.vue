<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 步骤条组件 -->
      <!-- align-center(居中效果) -->
      <el-steps :space="200" :active="activeIndex - 0" align-center>
        <el-step title="基本信息" icon="el-icon-edit" />
        <el-step title="商品参数" icon="el-icon-document" />
        <el-step title="商品属性" icon="el-icon-document-copy" />
        <el-step title="商品图片" icon="el-icon-picture" />
        <el-step title="商品内容" icon="el-icon-reading" />
        <el-step title="完成" icon="el-icon-circle-check" />
      </el-steps>
      <!-- 表单：label-position="top"(设置label在文本框上方) -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" />
            </el-form-item>
            <el-form-item label="商品单价" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number" />
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number" />
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number" />
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader
                v-model="addForm.goods_cat"
                expand-trigger="hover"
                :options="cateList"
                :props="cateProps"
                clearable
                @change="handleChange"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的 item 项 -->
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(title,index) in item.attr_option" :key="index" border :label="title" size="small" />
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 循环生成静态属性 -->
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture-card" :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 富文本编辑器组件 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce" />
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-row class="bottom_button">
        <el-button type="primary" :disabled="isPreStepDisabled" icon="el-icon-arrow-left" @click="prestep">上一步</el-button>
        <el-button v-if="!showAddButton" type="primary" :disabled="isAStepDisabled" @click="astep">下一步<i class="el-icon-arrow-right el-icon--right" /></el-button>
        <el-button v-if="showAddButton" type="success" @click="addGoods">添加商品</el-button>
      </el-row>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="20%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import baseURL from 'network/axios'
export default {
  data() {
    return {
      // 保存步骤条激活项索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [],
        // 上传图片数组
        pics: [],
        // 商品的详情介绍
        goods_introduce: '',
        attrs: []
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: ['change', 'blur'] }
        ]
      },
      // 用来保存分类数据
      cateList: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 第一次切换商品参数
      firstSwitch1: true,
      // 第一次切换商品属性
      firstSwitch2: true,
      // 上传图片的url地址
      uploadURL: baseURL + 'upload',
      // 图片上传组件的headers请求头对象
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      // 保存预览图片的url地址
      previewPath: '',
      // 控制预览图片对话框的显示和隐藏
      previewVisible: false
    }
  },
  // 添加 计算属性获取三级分类
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
    // 添加计算属性用来获取按钮禁用与否
    isPreStepDisabled() {
      return this.activeIndex * 1 < 1
    },
    // 添加计算属性用来获取按钮禁用与否
    isAStepDisabled() {
      return this.activeIndex * 1 > 4
    },
    showAddButton() {
      return this.activeIndex * 1 === 4
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    handleChange() {
      // 如果用户选择的不是三级分类,该次选择无效，因为必须选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message('请选择第三级分类')
        return
      }
      this.firstSwitch1 = true
      this.firstSwitch2 = true
    },
    // 在tab栏切换之前触发，两个形参为切换前，后的tab栏name
    beforeTabLeave(activeName, oldActiveName) {
      // 需要校验的 数组 or 字符串
      const RulesArr = Object.keys(this.addFormRules)
      const arrErrorInfo = []

      //  校验通过errorInfo为空，校验不通过为指定的验证规则 message
      this.$refs.addFormRef.validateField(RulesArr, (errorInfo) => {
        if (errorInfo) {
          arrErrorInfo.push(errorInfo)
        }
      })
      if (oldActiveName === '0') {
      // 在第一个标签页的时候
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        } else if (this.addForm.goods_name.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.goods_price === null) {
          this.$message.error('请输入商品单价')
          return false
        } else if (this.addForm.goods_weight === null) {
          this.$message.error('请输入商品重量')
          return false
        } else if (this.addForm.goods_number === null) {
          this.$message.error('请输入商品数量')
          return false
        }
      }
    },
    prestep() {
      if (this.activeIndex === '0') {
      // 在第一个标签页的时候
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        }
      }
      this.activeIndex = (this.activeIndex * 1 - 1) + ''
      console.log(this.activeIndex)
      this.tabClicked()
    },
    astep() {
      if (this.activeIndex === '0') {
        // 需要校验的 数组 or 字符串
        const RulesArr = Object.keys(this.addFormRules)
        const arrErrorInfo = []

        //  校验通过errorInfo为空，校验不通过为指定的验证规则 message
        this.$refs.addFormRef.validateField(RulesArr, (errorInfo) => {
          if (errorInfo) {
            arrErrorInfo.push(errorInfo)
          }
        })
        // 在第一个标签页的时候
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        } else if (this.addForm.goods_name.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.goods_price === null) {
          this.$message.error('请输入商品单价')
          return false
        } else if (this.addForm.goods_weight === null) {
          this.$message.error('请输入商品重量')
          return false
        } else if (this.addForm.goods_number === null) {
          this.$message.error('请输入商品数量')
          return false
        }
      }
      this.activeIndex = (this.activeIndex * 1 + 1) + ''
      console.log(this.activeIndex)
      this.tabClicked()
    },
    // 当用户点击切换tab栏时触发
    async tabClicked() {
      // 访问商品参数面板
      if (this.activeIndex === '1' && this.firstSwitch1) {
        // 发送请求获取动态参数
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' }}
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 将attr_vals字符串转换为数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          item.attr_option = item.attr_vals
        })
        this.manyTableData = res.data
        this.firstSwitch1 = false
      } else if (this.activeIndex === '2' && this.firstSwitch2) {
        // 发送请求获取静态属性
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' }}
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败')
        }
        this.onlyTableData = res.data
        this.firstSwitch2 = false
      }
    },
    // 当用户点击图片进行预览时执行，处理图片预览
    handlePreview(file) {
    // 形参file就是用户预览的那个文件
      this.previewPath = file.response.data.url
      // 显示预览图片对话框
      this.previewVisible = true
    },
    // 删除图片
    handleRemove(file) {
    // 当用户点击X号删除时执行
    // 形参file就是用户点击删除的文件
    // 获取用户点击删除的那个图片的临时路径
      const filePath = file.response.data.tmp_path
      // 使用findIndex来查找符合条件的索引
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 移除索引对应的图片
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 当上传成功时触发执行
    handleSuccess(response) {
    // 形参response就是上传成功之后服务器返回的结果
    // 将服务器返回的临时路径保存到addForm表单的pics数组中
      this.addForm.pics.push({ pic: response.data.tmp_path })
      console.log(this.addForm)
    },
    // 添加商品
    addGoods() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')
        // 将addForm进行深拷贝，避免goods_cat数组转换字符串之后导致级联选择器报错
        const form = _.cloneDeep(this.addForm)
        // 将goods_cat从数组转换为"1,2,3"字符串形式
        form.goods_cat = form.goods_cat.join(',')
        // 处理attrs数组，数组中需要包含商品的动态参数和静态属性
        // 将manyTableData（动态参数）处理添加到attrs
        this.manyTableData.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') })
        })
        // 将onlyTableData（静态属性）处理添加到attrs
        this.onlyTableData.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
        })
        console.log(form)
        // 发送请求完成商品的添加,商品名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: res.meta.msg,
            duration: 1500
          })
        }
        this.$message.success('添加商品成功')
        // 编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tab-pane {
  margin-left: 15px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.bottom_button {
  margin-top: 15px;
  margin-left: 120px;
}

</style>
