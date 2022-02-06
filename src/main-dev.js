import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import 'assets/css/global.css'
// 导入字体图标
import 'assets/fonts/iconfont.css'
// 导入插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入vue-quill-editor（富文本编辑器）
import VueQuillEditor from 'vue-quill-editor'
// 导入vue-quill-editor的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入依赖 axios
import 'network/axios'
// 导入依赖 datefilter
import 'common/datefilter.js'

Vue.config.productionTip = false

// 全局注册组件
Vue.component('tree-table', TreeTable)

// 全局注册富文本组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
