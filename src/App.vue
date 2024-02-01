<template>
  <div id="app">
    <div id="container">
      <h1>copilot-admin</h1>
      <GenerateKey />
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
