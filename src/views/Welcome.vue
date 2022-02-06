<template>
  <div>
    <h2>
      欢迎！
    </h2>
    <el-card>
      <el-calendar v-model="value" />
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: new Date()
    }
  },
  created() {},
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
