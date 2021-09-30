<template>
  <div id="app">
    <i-button>我是按钮</i-button>

    <i-icon type="icon-add" />
    <i-select :data="data" @change="change">
    </i-select>
    <!-- <i-switch :value="checkSwitch" @change="change" :closeText="'关闭信息'" :disabled="false" :openText="'打开信息'" :width="40" /> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      data:[
        {
          label:'选择1',
          value:1,
          disabled:true
        },
        {
          label:'选择2',
          value:2
        },
        {
          label:'选择3',
          value:3
        },
      ],
      checkSwitch: false,
    };
  },
  methods:{
    change(e){
      console.log(e);
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
