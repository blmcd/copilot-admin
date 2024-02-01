<template>
  <div id="app">
    <div id="container">
      <template v-if="auth">
        <h1>copilot-admin</h1>
        <ul class="nav nav-tabs" style="margin-bottom: 0.8rem">
          <template v-for="t in tabs">
            <li class="nav-item" @click="activeTab = t.name">
              <a class="nav-link" :class="{ active: t.name == activeTab }">{{
                t.name
              }}</a>
            </li>
          </template>
        </ul>
        <GenerateKey v-if="activeTab == 'GenerateKey'" />
        <AddGithubKey v-if="activeTab == 'AddGithubKey'" />
        <AddAnnouncement v-if="activeTab == 'AddAnnouncement'" />
      </template>
      <template v-else>
        <h1>Ops!</h1>
      </template>
    </div>
    <div
      v-show="showMessage"
      style="
        position: fixed;
        top: 5.2rem;
        width: 100%;
        display: flex;
        justify-content: center;
      "
    >
      <div class="alert alert-primary" role="alert" v-show="showMessage">
        {{ showMessage }}
      </div>
    </div>
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  </div>
</template>

<script>
import Vue from "vue";

import GenerateKey from "./components/GenerateKey.vue";
import AddGithubKey from "./components/AddGithubKey.vue";
import AddAnnouncement from "@/components/AddAnnouncement";
export default {
  name: "App",
  components: {
    GenerateKey,
    AddGithubKey,
    AddAnnouncement,
  },
  data() {
    return {
      auth: false,
      activeTab: "GenerateKey",
      tabs: [
        { name: "GenerateKey" },
        { name: "AddGithubKey" },
        { name: "AddAnnouncement" },
      ],
      showMessage: "",
    };
  },
  methods: {},
  created() {
    const rightPwd = "18380880977";
    var path = window.location.pathname; // 这将返回"/18380880977"
    var parts = path.split("/"); // 这将把路径分割成多个部分
    const validateWord = parts[1];
    if (validateWord == rightPwd) {
      this.auth = true;
    }

    // 全局注册通知方法
    const appVue = this;
    Vue.prototype.$notify = function (message, interval = 3000) {
      appVue.showMessage = message;
      setTimeout(() => {
        appVue.showMessage = "";
      }, interval); // 3秒后自动关闭通知
    };
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
