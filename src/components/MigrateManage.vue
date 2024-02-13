<template>
  <div>
    <h5>管理迁移</h5>
    <div class="mb-3 form-floating">
      <input
        placeholder="a placeholder"
        type="datetime-local"
        class="form-control"
        id="time"
        v-model="time"
      />
      <label for="time" class="form-label">时间</label>
    </div>
    <button class="btn btn-primary" @click="getData">获取迁移计划</button>
    <table class="table" style="table-layout: fixed; word-break: break-all">
      <thead>
        <tr>
          <th style="width: 2rem" scope="col">#</th>
          <th style="width: 5rem" scope="col">用户名</th>
          <th style="min-width: 10rem" scope="col">新绑定的Key</th>
          <th scope="col">过期时间</th>
          <th style="width: 5rem" scope="col">描述</th>
          <th style="width: 7rem" scope="col">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in unableToMigrate">
          <th scope="row">{{ +index + 1 }}</th>
          <td>{{ user.username }}</td>
          <td>{{ user.githubKey }}</td>
          <!-- <td>{{ user.expires }}</td> -->
          <td>{{ new Date(user.expires).toLocaleString() }}</td>
          <td>{{ user.description }}</td>
          <td>
            <button class="btn btn-link" @click="bindUser(user)">绑定</button>
            <button
              class="btn btn-link"
              @click="updateMigratePlan(user.userId, '', true)"
            >
              取消绑定
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button
      v-if="unableToMigrate.length"
      class="btn btn-primary"
      @click="bindUserToKey(unableToMigrate)"
    >
      提交绑定计划
    </button>

    <div v-if="showModal" class="modal" tabindex="-1" style="display: block">
      <div
        class="modal-dialog"
        style="max-width: 90%; box-shadow: rgb(154, 154, 154) 0px 0px 20px 9px"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedUser.username }}</h5>
            <button
              @click="showModal = false"
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <table
              class="table"
              style="table-layout: fixed; word-break: break-all"
            >
              <thead>
                <tr>
                  <th scope="col">githubKey</th>
                  <th scope="col">过期时间</th>
                  <th scope="col">占用</th>
                  <th scope="col">描述</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="key in githubKeysPreview">
                  <td>{{ key.githubKey }}</td>
                  <td>{{ key.expires }}</td>
                  <td>{{ key.currentBindings + " / " + key.limits }}</td>

                  <td>{{ key.description }}</td>
                  <td>
                    <button
                      class="btn btn-link"
                      @click="
                        updateMigratePlan(selectedUser.userId, key.githubKey)
                      "
                    >
                      绑定至此key
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="showModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      githubKeys: [],
      unableToMigrate: [],
      time: "",
      showModal: false,
      selectedUser: {},
    };
  },

  created() {
    this.time = this.getLocalMidnightTime();
    console.log(this.time);
  },
  methods: {
    async getMigrateRecord(time) {
      const isoTime = new Date(time).toISOString();
      const res = await axios.post(
        "https://www.zyqj.online/api/getMigrateRecords?key=zyqj",
        {
          time: isoTime,
        }
      );
      const { unableToMigrate, githubKeysAfterPreMigration } = res.data;
      this.unableToMigrate = unableToMigrate;
      this.githubKeys = githubKeysAfterPreMigration;
      this.$notify("获取迁移计划成功");
    },
    async getData() {
      this.getMigrateRecord(this.time);
    },

    async bindUser(u) {
      this.selectedUser = u;
      this.showModal = true;
    },

    updateMigratePlan(userId, githubKey, cancel = false) {
      //找到指定user，将其githubKey更新为githubKey的值
      const index = this.unableToMigrate.findIndex((u) => u.userId === userId);
      this.unableToMigrate.splice(index, 1, {
        ...this.unableToMigrate[index],
        githubKey: cancel ? "" : githubKey,
      });
      this.showModal = false;
    },

    async bindUserToKey(migrates) {
      const validMigrations = migrates.filter((m) => m.githubKey);
      try {
        const res = await axios.post(
          "https://www.zyqj.online/api/bindUserToKey?key=zyqj",
          validMigrations
        );
        this.$notify(res.data.message);
      } catch (error) {
        console.log(error);
      }
    },
    getLocalMidnightTime() {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() + 1);
      let localStr = now.toLocaleString();
      const dateArr = localStr.split(" ")[0].split("/"); // '2024/2/8'
      const [_, m, d] = dateArr;
      dateArr[1] = m < 10 ? "0" + m : m;
      dateArr[2] = d < 10 ? "0" + d : d;
      const dateStr = dateArr.join("-"); // '2024-02-08'
      const [h, min] = localStr.split(" ")[1].split(":"); // '22:35:34'
      const timeStr = `${dateStr}T${h}:${min}`; // '2024-02-08T22:35'
      return timeStr;
    },
  },
  computed: {
    githubKeysPreview() {
      return this.githubKeys.map((key) => {
        const currentBindings = this.unableToMigrate.reduce(
          (usingCount, cur) =>
            cur.githubKey === key.githubKey ? usingCount + 1 : usingCount,
          key.currentBindings
        );
        return {
          ...key,
          currentBindings,
        };
      });
    },
  },
};
</script>
