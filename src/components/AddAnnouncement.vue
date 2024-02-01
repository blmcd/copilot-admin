<template>
  <div>
    <h5>添加公告</h5>
    <div class="mb-3 form-floating">
      <textarea
        placeholder="Enter announcement content here"
        class="form-control"
        id="announcementContent"
        v-model="announcementContent"
      ></textarea>
      <label for="announcementContent" class="form-label"
        >Announcement Content</label
      >
    </div>
    <button
      @click="addAnnouncement(announcementContent)"
      class="btn btn-primary"
    >
      添加公告
    </button>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      announcementContent: "",
    };
  },
  methods: {
    async addAnnouncement(announcementContent) {
      const res = await axios.post(
        "https://www.zyqj.online/api/announcement?key=zyqj",
        { content: announcementContent },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      this.$notify(res.data);
    },
  },
};
</script>
