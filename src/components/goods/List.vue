<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="3">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
        <el-col :span="7">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList" />
          </el-input></el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="goodsList"
        :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        border
        stripe
      >
        <el-table-column type="index" align="center" />
        <el-table-column label="商品名称" prop="goods_name" />
        <el-table-column label="单价 (元)" prop="goods_price" width="120px" />
        <el-table-column label="重量" prop="goods_weight" width="120px" />
        <el-table-column label="库存" prop="goods_number" width="120px" />
        <el-table-column label="创建时间" prop="add_time" width="200px">
          <template slot-scope="scope">
            {{ scope.row.add_time * 1000 | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="small" circle @click="editGoods(scope.row)" />
            <el-tooltip class="item" effect="dark" content="商品详情" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-document" size="small" circle @click="openDrawer(scope.row)" />
            </el-tooltip>
            <el-button type="danger" icon="el-icon-delete" size="small" circle @click="removeGoods(scope.row.goods_id)" />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    <!-- 商品详情抽屉 -->
    <el-drawer
      title="商品详情"
      :visible.sync="drawer"
      :direction="direction"
    >
      <el-form
        label-position="left"
        class="drawer"
        label-width="110px"
      >
        <el-carousel v-if="details.picNums > 0" :interval="5000" arrow="always">
          <el-carousel-item v-for="item in details.pics" :key="item.pics_id">
            <img class="goods_img" :src="item.pics_sma_url">
          </el-carousel-item>
        </el-carousel>
        <el-form-item label="商品名称：">
          <span>{{ details.goods_name }}</span>
        </el-form-item>
        <el-form-item label="商品分类：">
          <el-tag size="mini">{{ cate_names[0] }}</el-tag>
          <el-tag size="mini" type="success">{{ cate_names[1] }}</el-tag>
          <el-tag size="mini" type="warning">{{ cate_names[2] }}</el-tag>
        </el-form-item>
        <el-form-item label="单价 (元)：">
          <span>{{ details.goods_price + '.00' }}</span>
        </el-form-item>
        <el-form-item label="库存：">
          <span>{{ details.goods_number }}</span>
        </el-form-item>
        <el-form-item label="重量：">
          <span>{{ details.goods_weight }}</span>
        </el-form-item>
        <el-form-item label="是否是热销品：">
          <i v-if="details.is_promote" style="color:green;font-size:18px;" class="el-icon-success" />
          <i v-else style="color:#F08889;font-size:18px;" class="el-icon-error" />
        </el-form-item>
        <el-form-item label="热销品数量：">
          <span>{{ details.hot_mumber }}</span>
        </el-form-item>
        <el-form-item label="商品状态：">
          <!-- <el-tag v-if="details.goods_state == 0" type="warning">未通过</el-tag> -->
          <!-- <el-tag v-if="details.goods_state == 1">审核中</el-tag> -->
          <el-tag size="mini">审核中</el-tag>
          <!-- <el-tag v-if="details.goods_state == 2" type="success">已审核</el-tag> -->
        </el-form-item>
        <el-form-item label="添加时间：">
          <span>{{ details.add_time * 1000 | dateFormat }}</span>
        </el-form-item>
        <el-form-item label="更新时间：">
          <span>{{ details.upd_time * 1000 | dateFormat }}</span>
        </el-form-item>
        <el-form-item v-if="details.attrs" label="参数列表：" />
        <el-table
          class="goods_table"
          :data="details.attrs"
          :header-cell-style="{background:'#eef1f6',color:'#606266'}"
          border
          stripe
        >
          <el-table-column label="参数名称" prop="attr_name" />
          <el-table-column label="参数值" prop="attr_value" />
        </el-table>
        <el-form-item v-if="details.goods_introduce" label="商品简介：" />
        <span class="detail" v-html="details.goods_introduce" />
      </el-form>
      <!-- <pre>{{ details }}</pre> -->
    </el-drawer>
    <!-- 编辑商品对话框 -->
    <el-dialog title="编辑商品信息" :visible.sync="editGoodsDialogVisible" width="40%" @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name" />
        </el-form-item>
        <el-form-item label="单价 (元)" prop="goods_price">
          <el-input v-model="editForm.goods_price" />
        </el-form-item>
        <el-form-item label="库存" prop="goods_number">
          <el-input v-model="editForm.goods_number" />
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 保存商品列表信息
      goodsList: [],
      // 总数据条数
      total: 0,
      // 抽屉面板显示与隐藏
      drawer: false,
      // 抽屉展开方向
      direction: 'rtl',
      // 详情信息
      details: {},
      // 控制编辑商品对话框是否显示
      editGoodsDialogVisible: false,
      // 正在编辑状态下的商品数据
      editForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: ''
      },
      // 编辑对话框的表单验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入库存', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      },
      // 分类详情的类别标签
      cate_names: []
    }
  },
  computed: {

  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      //   根据分页获取对应的商品列表
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      // console.log(res.data)
      // this.$message.success('获取商品列表成功')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      // 当页号发生改变时，更改pagesize，重新请求
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      // 当页码发生改变时，更改pagesize，重新请求
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 根据id删除对应的参数或属性
    async removeGoods(goods_id) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '请问是否要删除该商品',
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
      const { data: res } = await this.$http.delete(`goods/${goods_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 显示商品详情抽屉
    async openDrawer(details) {
      const { data: res } = await this.$http.get('goods/' + details.goods_id)
      // 查询数据失败
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: res.meta.msg,
          duration: 1500
        })
      }
      // this.editForm = res.data
      this.details = res.data
      this.details.picNums = res.data.pics.length
      this.drawer = true
      this.cate_names = []
      // console.log(this.details.goods_cat)
      this.details.goods_cate = this.details.goods_cat.split(',')
      this.details.goods_cates = []
      this.details.goods_cate.forEach(item => {
        item = item * 1
        this.getCateById(item)
      })
      console.log(this.details)
    },
    // 点击编辑商品按钮
    async editGoods(goodsInfo) {
      const { data: res } = await this.$http.get('goods/' + goodsInfo.goods_id)
      // 查询数据失败
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: res.meta.msg,
          duration: 1500
        })
      }
      this.editForm = res.data
      // console.log(res.data)
      this.editGoodsDialogVisible = true
    },
    // 编辑对话框关闭
    editDialogClose() {
      // this.$refs.editFormRef.resetFields()
    },
    // 确定编辑商品信息
    editGoodsInfo() {
      this.$refs.editFormRef.validate(async(valid, options) => {
        // 表单验证未通过
        if (!valid) {
          const arr = Object.keys(options)
          return this.$message.error({
            message: options[arr[0]][0].message,
            duration: 1500
          })
        }
        // console.log(this.editForm)
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm)
        // 修改失败
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: res.meta.msg,
            duration: 1500
          })
        }
        this.$message.success({
          message: '修改成功！',
          duration: 1500
        })
        this.getGoodsList()
        this.editGoodsDialogVisible = false
      })
    },
    // 添加商品
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 根据id查询分类名称
    async getCateById(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      // 判断如果添加失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
      // console.log(res.data.cat_name)
      this.cate_names.push(res.data.cat_name)
      // console.log(this.cate_names)
    }
  }
}
</script>

<style lang="less" scoped>
.drawer{
  color: #606266;
  margin: 0 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
 .el-form-item {
    margin: 0;
 }
 .el-tag {
   margin-right: 10px;
 }
 .goods_img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .el-carousel, .goods_table  {
    margin-bottom: 15px;
  }
  .detail {
    margin-top: 15px;
    width: 100%;
  }
}
</style>
