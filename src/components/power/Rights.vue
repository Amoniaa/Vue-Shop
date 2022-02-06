<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255,255,255,.6)"
        :data="rightsList"
        :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        border
        stripe
      >
        <el-table-column type="index" align="center" />
        <el-table-column label="权限名称" prop="authName" />
        <el-table-column label="路径" prop="path" />
        <el-table-column label="权限等级">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level == 0">一级权限</el-tag>
            <el-tag v-if="scope.row.level == 1" type="success">二级权限</el-tag>
            <el-tag v-if="scope.row.level == 2" type="warning">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表格加载动画
      loading: true,
      // 列表形式的权限
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) { return this.$message.error('获取权限列表失败') }
      // 如果返回状态正常，将请求的数据保存在data中
      this.rightsList = res.data
      // 停止加载动画
      this.loading = false
    }
  }
}
</script>

<style lang="less" scoped>

</style>
