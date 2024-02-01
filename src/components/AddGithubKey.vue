<template>
  <div>
    <h5>添加githubKey</h5>
    <div class="mb-3 form-floating">
      <input
        placeholder="a placeholder"
        type="number"
        class="form-control"
        id="days"
        v-model="days"
      />
      <label for="days" class="form-label">Days</label>
    </div>
    <div class="mb-3 form-floating">
      <input
        placeholder=""
        type="text"
        class="form-control"
        id="githubKey"
        v-model="githubKey"
      />
      <label for="githubKey" class="form-label">Github Key</label>
      <!-- <div class="form-text" v-if="githubKeyRequired" style="color: red">
        离线秘钥必须要githubKey
      </div> -->
    </div>
    <button @click="add(githubKey)" class="btn btn-primary">
      添加githubKey
    </button>
  </div>
</template>
<script>
import axios from "axios";
import { generateDateFromMidnight } from "@/utils.js/time";
export default {
  data() {
    return {
      days: 25,
      githubKey: "",
    };
  },
  methods: {
    async add(githubKey) {
      const now = new Date();

      const expires = generateDateFromMidnight(this.days);
      const res = await axios.post(
        "https://www.zyqj.online/api/addGithubKey?key=zyqj",
        { githubKey, expires },
        {
          headers: {
            "Content-Type": "application/json", // 或者其他您需要的类型
          },
        }
      );
      this.$notify(res.data);
    },
  },
};
</script>
