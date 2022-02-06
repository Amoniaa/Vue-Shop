<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索栏 -->
      <!-- <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList" />
          </el-input>
        </el-col>
      </el-row> -->
      <!-- 订单表格 -->
      <el-table
        :data="orderList"
        border
        stripe
        :header-cell-style="{background:'#eef1f6',color:'#606266'}"
      >
        <el-table-column type="index" align="center" />
        <el-table-column label="订单编号" prop="order_number" />
        <el-table-column label="订单价格" prop="order_price" />
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" />
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time * 1000 | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="125px">
          <template slot-scope="scope">
            <el-button size="small" type="primary" circle icon="el-icon-edit" @click="showEditAddress(scope.row)" />
            <el-button size="small" type="success" circle icon="el-icon-location" @click="showProgress(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改收货地址" :visible.sync="addressVisible" width="40%" @close="addressDialogClosed">
      <!-- 添加表单 -->
      <el-form ref="editFormRef" :model="addressForm" :rules="addressFormRules" label-width="100px">
        <el-form-item label="省市区县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线组件  -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from 'common/citydata.js'
import progressInfo from 'common/progressInfo.json'
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      orderList: [],
      // 数据总条数
      total: 0,
      // 控制修改地址对话框的显示和隐藏
      addressVisible: false,
      // 修改收货地址的表单
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: ['change', 'blur'] }]
      },
      // 将导入的cityData数据保存起来
      cityData,
      // 控制物流进度对话框的显示和隐藏
      progressVisible: false,
      // 保存物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      // console.log(this.queryInfo)
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败!')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showEditAddress(row) {
      // 当用户点击修改收货地址按钮时触发
      this.addressVisible = true
    },
    addressDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editAddress() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整地址信息')
        this.$message.success('修改成功')
        this.addressVisible = false
      })
    },
    showProgress(row) {
      // 发送请求获取物流数据
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')

      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流进度失败!')
      // }
      // this.progressInfo = res.data
      this.progressInfo = progressInfo.data
      // 显示对话框
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
</style>
