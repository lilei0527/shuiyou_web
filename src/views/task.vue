<template>
  <div class="my-content">
    <div class="main-content">
      <el-card >
        <div class="card-item">
            <div class="sign-in-head">
            <img src="../assets/svg/sign_in.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">签到</span>
            <span class="task-reward">+5</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="primary" size="mini" style="margin-left: 10px" class="sign-in-btn"
            >签到</el-button
          >
        </div>
      </el-card>

      <el-card >
        <div class="card-item">
            <div class="sign-in-head">
            <img src="../assets/svg/ad.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">广告</span>
            <span class="task-reward">+10</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="primary" size="mini" style="margin-left: 10px" class="sign-in-btn"
            >剩余2次</el-button
          >
        </div>
      </el-card>

      <el-card >
        <div class="card-item">
            <div class="sign-in-head">
            <img src="../assets/svg/share.svg" style="width: 20px; height: 20px ;margin-left: 2px;" alt="" />
            <span class="task-name">分享</span>
            <span class="task-reward">+20</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="primary" size="mini" style="margin-left: 10px" class="sign-in-btn"
            >已邀请3人</el-button
          >
        </div>
      </el-card>

      <el-card >
        <div class="card-item">
            <div class="sign-in-head">
            <img src="../assets/svg/invite.svg" style="width: 25px; height: 25px" alt="" />
            <span class="task-name">邀请</span>
            <span class="task-reward">+30</span>
            <span class="task-coin">金币</span>
          </div>
          <el-button type="primary" size="mini" style="margin-left: 10px" class="sign-in-btn"
            >剩余2次</el-button
          >
        </div>
      </el-card>

      
    </div>
    <div class="right-content">
      <el-card style="max-width: 100%; margin-top: 10px">
        <span
          >请上传头像，大小不超过2MB<br />请填写用户名，长度在2到8个字符<br />请填写密码，长度在6到16个字符(不修改密码请留空)</span
        >
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped="sass">
.card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sign-in-head{
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


</style>
