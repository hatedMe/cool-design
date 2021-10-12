import Vue from 'vue'
import App from './App.vue'
import router from "./router";
Vue.config.productionTip = false
import CoolDesign from "../package/index";
import "./style/github-markdown.css";
Vue.use(CoolDesign);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
