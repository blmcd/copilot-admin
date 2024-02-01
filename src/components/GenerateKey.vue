<template>
  <div class="key-generator">
    <h5>生成Key</h5>
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

    <div class="mb-3">
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckDefault"
          v-model="offline"
        />
        <label class="form-check-label" for="flexCheckDefault"> Offline </label>
      </div>
    </div>

    <div class="mb-3 form-floating" v-if="offline">
      <input
        placeholder=""
        type="text"
        class="form-control"
        id="githubKey"
        v-model="githubKey"
      />
      <label for="githubKey" class="form-label">Github Key</label>
      <div class="form-text" v-if="githubKeyRequired" style="color: red">
        离线秘钥必须要githubKey
      </div>
    </div>

    <button
      class="btn"
      :class="{
        'btn-warning': isFormChanged,
        'btn-primary': !isFormChanged,
      }"
      @click="generate"
    >
      Generate Key
    </button>

    <div
      class="alert alert-primary"
      role="alert"
      v-show="showMessage"
      style="margin: 1.4rem 0"
    >
      {{ showMessage }}
    </div>

    <div class="card cp">
      <div class="card-header">Generated Key</div>
      <div class="wb" style="padding: 0.8rem">
        {{ key }}
      </div>
      <button v-if="key" class="btn btn-primary" @click="copy(key)">
        复制
      </button>
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
              @click="addBlackList"
              v-if="decryptKeyData"
              style="float: right"
            >
              添加至黑名单
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
      offline: false,
      key: "",
      customKey: "",
      githubKeyRequired: false,
      showMessage: "",
      formJson: "{}",
    };
  },
  methods: {
    generate() {
      if (this.offline) {
        if (!this.githubKey.length) {
          this.githubKeyRequired = true;
          return;
        }
      }

      this.uuid = uuidv4();

      this.key = this.generateKey({
        uuid: this.uuid,
        days: this.days,
        hours: this.hours,
        minutes: this.minutes,
        githubKey: this.githubKey,
        offline: this.offline,
      });

      this.formJson = this.getFormJson();

      this.customKey = this.key;
    },
    encrypt(message, secretKey) {
      return CryptoJS.AES.encrypt(message, secretKey).toString();
    },
    generateKey({ uuid, days, hours, minutes, githubKey, offline }) {
      const expireDate = generateDateFromMidnight(days, hours, minutes);
      const data = JSON.stringify({
        uuid: uuid,
        expires: expireDate,
        githubKey,
        offline,
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
      //   alert("copy");
      // 复制文本
      navigator.clipboard
        .writeText(str.trim())
        .then(() => {
          this.$notify("复制成功");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
          this.showMessage = "复制失败";
          setTimeout(() => {
            this.showMessage = "";
          }, 2000);
        });
    },
    getFormJson() {
      return JSON.stringify({
        uuid: this.uuid,
        days: this.days,
        hours: this.hours,
        minutes: this.minutes,
        githubKey: this.githubKey,
        offline: this.offline,
      });
    },
    async addBlackList() {
      try {
        const { uuid, expires } = JSON.parse(this.decryptKeyData);

        const res = await axios.post(
          "https://www.zyqj.online/api/addBlackList?key=zyqj",
          { uuid, expires },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        this.$notify(res.data);
      } catch (error) {
        console.log(error);
      }
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
