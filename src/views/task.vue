<template>
  <div class="my-content">
    <div class="main-content">
      <el-card class="card">
        <div class="card-item">
          <div class="sign-in-head">
            <img src="../assets/svg/sign_in.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">签到</span>
            <span class="task-reward">+5</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button v-if="!isSignIn" type="success" size="mini" style="margin-left: 10px" class="sign-in-btn"
            @click="sign">签到</el-button>
          <el-button v-else type="info" size="mini" style="margin-left: 10px" class="sign-in-btn"
            disabled>已签到</el-button>
        </div>
      </el-card>

      <!-- <el-card class="card">
        <div class="card-item">
          <div class="sign-in-head">
            <img src="../assets/svg/ad.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">广告</span>
            <span class="task-reward">+10</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="disabled" size="mini" style="margin-left: 10px" class="sign-in-btn">待接入广告</el-button>
        </div>
      </el-card> -->

      <el-card class="card">
        <div class="card-item">
          <div class="sign-in-head">
            <img src="../assets/svg/invite.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">邀请</span>
            <span class="task-reward">+30</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="success" size="mini" style="margin-left: 10px" class="sign-in-btn"
            @click="copyLink">复制专属邀请链接</el-button>
        </div>
      </el-card>


    </div>
    <div class="right-content">
      <el-card style="max-width: 100%; margin-top: 10px">
        <span>签到任务，一天只能签到一次，每天零点重置</span>
      </el-card>

      <el-card style="max-width: 100%; margin-top: 10px">
        <span>邀请任务，复制专属链接给好友或者各大社交平台，通过你的邀请链接进入并注册即可获得奖励</span>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from '@/axios';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { user } from '../stores/global'

function copyLink() {
  const textToCopy = '来《谁有求购》领取你的专属优惠!  ' + import.meta.env.VITE_BASE_URL + '/?inviteCode=' + user.inviteCode
  navigator.clipboard.writeText(textToCopy).then(() => {
    ElMessage.success('邀请链接已成功复制到剪贴板！')
  }).catch((error) => {
    ElMessage.error('无法复制邀请链接：', error);
  });
}

const isSignIn = ref(false)
function isSign() {
  axios.get('/user/isSignIn').then(res => {
    if (res.data.code === 200) {
      isSignIn.value = res.data.data
    } else {
      ElMessage.error(res.data.message)
    }
  })
}

function sign() {
  axios.post('/user/signIn').then(res => {
    if (res.data.code === 200) {
      ElMessage.success('签到成功')
      user.point += 5
      isSignIn.value = true
    } else {
      ElMessage.error(res.data.msmessageg)
    }
  })
}

onMounted(() => {
  isSign()
})

</script>

<style scoped="sass">
.card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sign-in-head {
  display: flex;
  align-items: center;
}

.task-name {
  margin-left: 10px;
  font-size: 16px;
  color: black;
  font-weight: bold;
}

.task-reward {
  margin-left: 10px;
  font-size: 16px;
  color: #99c84a;
  font-weight: bold;
}

.task-coin {
  margin-left: 10px;
  font-size: 16px;
  color: #ffd84a;
  font-weight: bold;
}

.card {
  margin-top: 1px;
 
}
</style>
