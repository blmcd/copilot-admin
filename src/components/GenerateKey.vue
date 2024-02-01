<template>
  <div class="key-generator">
    <div class="mb-3 form-floating">
      <input
        placeholder="a placeholder"
        type="text"
        class="form-control"
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

    <button class="btn btn-primary" @click="generate">Generate Key</button>

    <div class="card cp" @click="copy(key)">
      <div class="card-header">Generated Key</div>
      <div class="wb" style="padding: 0.8rem">
        {{ key }}
      </div>
    </div>

    <div class="card cp" @click="copy(decryptKeyData)">
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
          <div class="wb">
            {{ decryptKeyData }}
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
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

export default {
  data() {
    return {
      uuid: uuidv4(),
      days: 0,
      hours: 0,
      minutes: 0,
      githubKey: "",
      offline: false,
      key: "",
      decryptedKey: "",
      customKey: "",
      githubKeyRequired: false,
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
      this.key = this.generateKey({
        uuid: this.uuid,
        days: this.days,
        hours: this.hours,
        minutes: this.minutes,
        githubKey: this.githubKey,
        offline: this.offline,
      });
      this.customKey = this.key;
      //   this.isKeyExpired = this.isKeyExpired(this.key);
    },
    encrypt(message, secretKey) {
      return CryptoJS.AES.encrypt(message, secretKey).toString();
    },
    generateKey({ uuid, days, hours, minutes, githubKey, offline }) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + days);
      expireDate.setHours(expireDate.getHours() + hours);
      expireDate.setMinutes(expireDate.getMinutes() + minutes);
      const data = JSON.stringify({
        uuid: uuid,
        expires: expireDate.toISOString(),
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
      console.log("originCiphertext", originCiphertext);
      let bytes = CryptoJS.AES.decrypt(originCiphertext, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    },
    copy(str) {
      // 复制文本
      navigator.clipboard
        .writeText(str.trim())
        .then(() => {})
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    },
  },
  computed: {
    isKeyExpired() {
      const now = new Date();
      try {
        const user = JSON.parse(this.decryptedKey);
        const expires = new Date(user.expires);
        console.log("this.decryptedKey.expires", this.decryptedKey.expires);
        return now > expires;
      } catch (error) {}
      return true;
    },
    decryptKeyData() {
      return this.decryptKey(this.customKey);
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
