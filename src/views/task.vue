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

      <el-card class="card">
        <div class="card-item">
          <div class="sign-in-head">
            <img src="../assets/svg/ad.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">广告</span>
            <span class="task-reward">+10</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="success" size="mini" style="margin-left: 10px" class="sign-in-btn">剩余2次</el-button>
        </div>
      </el-card>

      <el-card class="card">
        <div class="card-item">
          <div class="sign-in-head">
            <img src="../assets/svg/invite.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">邀请</span>
            <span class="task-reward">+20</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="success" size="mini" style="margin-left: 10px" class="sign-in-btn">剩余2次</el-button>
        </div>
      </el-card>


    </div>
    <div class="right-content">
      <el-card style="max-width: 100%; margin-top: 10px">
        <span>请上传头像，大小不超过2MB<br />请填写用户名，长度在2到8个字符<br />请填写密码，长度在6到16个字符(不修改密码请留空)</span>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from '@/axios';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { user } from '../stores/global'

const isSignIn = ref(false)
function isSign() {
  axios.get('/user/isSignIn').then(res => {
    if (res.data.code === 200) {
      isSignIn.value = res.data.data
    } else {
      ElMessage.error(res.data.msg)
    }
  })
}

function sign() {
  axios.post('/user/signIn').then(res => {
    if (res.data.code === 200) {
      ElMessage.success('签到成功')
      user.point += 10
      isSignIn.value = true
    } else {
      ElMessage.error(res.data.msg)
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
