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
        placeholder="a placeholder"
        type="number"
        class="form-control"
        id="limits"
        v-model="limits"
      />
      <label for="limits" class="form-label">limits</label>
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
    </div>
    <div class="mb-3 form-floating">
      <input
        placeholder=""
        type="text"
        class="form-control"
        id="description"
        v-model="description"
      />
      <label for="description" class="form-label">description</label>
    </div>
    <div class="mb-3 form-floating">
      <input
        placeholder=""
        type="text"
        class="form-control"
        id="tokenProxy"
        v-model="tokenProxy"
      />
      <label for="tokenProxy" class="form-label">tokenProxy</label>
    </div>
    <button
      @click="add({ githubKey, limits, description, tokenProxy })"
      class="btn btn-primary"
    >
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
      limits: 0,
      description: "",
      tokenProxy: "",
    };
  },
  methods: {
    async add({ githubKey, limits, description, tokenProxy }) {
      const expires = generateDateFromMidnight(this.days);
      const res = await axios.post(
        "https://www.zyqj.online/api/addGithubKey?key=zyqj",
        { githubKey, expires, limits, description, tokenProxy },
        {
          headers: {
            "Content-Type": "application/json", // 或者其他您需要的类型
          },
        }
      );
      this.$notify(res.data.message);
    },
  },
};
</script>
