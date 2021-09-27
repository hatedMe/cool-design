import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import MeganUI from "../package/index";
// import "../package/style/base.scss";
Vue.use(MeganUI);

new Vue({
  render: h => h(App)
}).$mount('#app')
