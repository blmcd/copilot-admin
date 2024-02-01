<template>
  <div id="app">
    <div id="container">
      <template v-if="auth">
        <h1>copilot-admin</h1>
        <GenerateKey />
      </template>
      <template v-else>
        <h1>Ops!</h1>
      </template>
    </div>
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  </div>
</template>

<script>
import GenerateKey from "./components/GenerateKey.vue";

export default {
  name: "App",
  components: {
    GenerateKey,
  },
  data() {
    return {
      auth: false,
    };
  },
  methods: {
  },
  created() {
    const rightPwd = "18380880977";
    var path = window.location.pathname; // 这将返回"/18380880977"
    var parts = path.split("/"); // 这将把路径分割成多个部分
    const validateWord = parts[1];
    if (validateWord == rightPwd) {
      this.auth = true;
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#container {
  padding: 1.4rem;
}
.wb {
  word-wrap: break-word;
}
</style>
