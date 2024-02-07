<template>
  <div class="key-generator">
    <h5>生成Key</h5>
    <div class="table-responsive-sm">
      <table class="table" style="table-layout: fixed; word-break: break-all">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th style="min-width: 12rem" scope="col">githubKey</th>
            <th scope="col">占用</th>
            <th scope="col">描述</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="k in githubKeys"
            :class="{ 'table-primary': k.githubKey == selectedKey }"
          >
            <th scope="row">
              {{ k.id }}

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="selectKey"
                  id="selectKey"
                  :value="k.githubKey"
                  v-model="selectedKey"
                />
              </div>
            </th>
            <td style="min-width: 12rem">{{ k.githubKey }}</td>
            <td v-if="!loading">{{ k.currentBindings + " / " + k.limits }}</td>
            <td v-else>
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
            <td>{{ k.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="add-info" v-show="selectedKey">
      <div class="mb-3 form-floating">
        <input
          readonly
          placeholder="a placeholder"
          type="text"
          class="form-control form-control-plaintext"
          id="uuid"
          v-model="uuid"
        />

        <label for="uuid" class="form-label">UUID</label>
      </div>
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
          id="hours"
          v-model="hours"
        />
        <label for="hours" class="form-label">Hours</label>
      </div>
      <div class="mb-3 form-floating">
        <input
          placeholder="a placeholder"
          type="number"
          class="form-control"
          id="minutes"
          v-model="minutes"
        />
        <label for="minutes" class="form-label">Minutes</label>
      </div>

      <button
        class="btn"
        :class="{
          'btn-warning': isFormChanged,
          'btn-primary': !isFormChanged,
        }"
        @click="generate"
      >
        <div
          v-show="loading"
          class="spinner-border-sm spinner-border text-dark"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        Generate Key
      </button>
      <div class="card cp">
        <div class="card-header">Generated Key</div>
        <div class="wb" style="padding: 0.8rem">
          {{ key }}
        </div>
        <button v-if="key" class="btn btn-primary" @click="copy(key)">
          复制
        </button>
      </div>
    </div>

    <div class="card cp">
      <div class="card-header">Decrypted Key</div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">
          <div>
            <input
              type="text"
              class="form-control col-sm-auto"
              id="customKey"
              v-model="customKey"
              placeholder="可自定义Key用于解密"
            />
          </div>
        </li>
        <li class="list-group-item">
          <div class="wb" style="margin-bottom: 0.4rem">
            {{ decryptKeyData }}
          </div>
          <div>
            <button
              v-if="decryptKeyData"
              class="btn btn-primary"
              @click="copy(decryptKeyData)"
            >
              复制
            </button>
            <button
              class="btn btn-danger"
              @click="deleteUser"
              v-if="decryptKeyData"
              style="float: right"
            >
              删除用户
            </button>
          </div>
        </li>
        <li class="list-group-item">
          <div class="wb">自定义Key是否过期: {{ isKeyExpired }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
let count = 0;
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { generateDateFromMidnight } from "@/utils.js/time";
export default {
  data() {
    return {
      uuid: "",
      days: 25,
      hours: 0,
      minutes: 0,
      githubKey: "",
      key: "",
      customKey: "",
      githubKeyRequired: false,
      showMessage: "",
      formJson: "{}",
      githubKeys: [],
      selectedKey: null,
      loading: false,
      userId: null,
    };
  },
  created() {
    this.getGithubKeys();
  },
  methods: {
    async generate() {
      this.uuid = uuidv4();
      this.loading = true;
      this.key = await this.generateKey({
        uuid: this.uuid,
        days: this.days,
        hours: this.hours,
        minutes: this.minutes,
        githubKey: this.selectedKey,
      });

      this.formJson = this.getFormJson();

      this.customKey = this.key;
      await this.refreshGithubKeys();
      this.loading = false;
    },
    encrypt(message, secretKey) {
      return CryptoJS.AES.encrypt(message, secretKey).toString();
    },
    async generateKey({ uuid, days, hours, minutes, githubKey }) {
      const expireDate = generateDateFromMidnight(days, hours, minutes);

      try {
        const res = await this.addUser({
          username: this.uuid,
          githubKey: this.selectedKey,
          expires: expireDate,
        });
        this.$notify(res.data.message);
        this.userId = res.data.user.id;
      } catch (error) {
        console.log(error);
        this.$notify("添加用户失败");
      }

      const data = JSON.stringify({
        id: this.userId,
        uuid: uuid,
        expires: expireDate,
        githubKey,
      });

      const secretKey = "WTX";
      const encrypted = this.encrypt(data, secretKey);
      const result = `KEY:${encrypted}:END`;

      return result;
    },
    decryptKey(ciphertext, secretKey = "WTX") {
      const originCiphertext = ciphertext.slice(4, -4);
      let bytes = CryptoJS.AES.decrypt(originCiphertext, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    },
    copy(str) {
      navigator.clipboard
        .writeText(str.trim())
        .then(() => {
          this.$notify("复制成功");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
          this.$notify("复制失败");
        });
    },
    getFormJson() {
      return JSON.stringify({
        uuid: this.uuid,
        days: this.days,
        hours: this.hours,
        minutes: this.minutes,
        githubKey: this.githubKey,
      });
    },
    async deleteUser() {
      try {
        const { id } = JSON.parse(this.decryptKeyData);

        const res = await axios.post(
          "https://www.zyqj.online/api/deleteUser?key=zyqj",
          { id },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        this.$notify(res.data.message);
        await this.refreshGithubKeys();
      } catch (error) {
        console.log(error);
      }
    },
    async getGithubKeys() {
      try {
        const res = await axios.get(
          "https://www.zyqj.online/api/getGithubKeys?key=zyqj"
        );
        this.githubKeys = res.data;
      } catch (error) {
        console.log(error);
      }
    },
    async addUser(user) {
      return axios.post(
        "https://www.zyqj.online/api/addAndBindUser?key=zyqj",
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    },
    async refreshGithubKeys() {
      this.loading = true;

      try {
        const res = await axios.get(
          "https://www.zyqj.online/api/getGithubKeys?key=zyqj"
        );
        this.githubKeys = res.data;
        this.$notify("刷新GithubKeys成功");
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
    },
  },
  computed: {
    isKeyExpired() {
      const now = new Date();
      try {
        const user = JSON.parse(this.decryptKeyData);
        const expires = new Date(user.expires);
        return now > expires;
      } catch (error) {}
      return true;
    },
    decryptKeyData() {
      return this.decryptKey(this.customKey);
    },
    isFormChanged() {
      const currentForm = JSON.parse(this.getFormJson());
      const lastFormJSON = this.formJson;
      count++;
      return JSON.stringify(currentForm) !== lastFormJSON;
    },
  },
};
</script>

<style scoped>
.key-generator {
  margin: 0 auto;
}

.cp {
  margin-top: 1.8rem;
}
</style>
