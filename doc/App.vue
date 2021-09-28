<template>
  <div id="app">
    <i-button>我是按钮</i-button>

    <i-icon type="icon-add" />
    <i-switch :value="checkSwitch" @change="change" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkSwitch: false,
    };
  },
  methods:{
    change(){
      this.checkSwitch = !this.checkSwitch
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
