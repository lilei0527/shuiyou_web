<script setup lang="ts">
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'

const isLoginDialogVisible = defineModel<boolean>('isLoginDialogVisible')
const isRegisterDialogVisible = defineModel<boolean>('isRegisterDialogVisible')

function login() {
  axios.post('http://localhost:8081/user/login', loginForm).then((response) => {
    if (response.data.code != 200) {
      ElMessage.error(response.data.message)
      return
    } else if (response.data.code == 200) {
      let token = response.data.data
      localStorage.setItem('token', token)
      isLoginDialogVisible.value = false
    }
  })
}

function register() {
  //两次密码输入是否一致
  if (registerForm.password != registerForm.confirmPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }

  axios.post('http://localhost:8081/user/register', registerForm).then((response) => {
    if (response.data.code != 200) {
      ElMessage.error(response.data.message)
      return
    } else if (response.data.code == 200) {
      isRegisterDialogVisible.value = false
      isLoginDialogVisible.value = true
    }
  })
}

function onRegisterClick() {
  isLoginDialogVisible.value = false
  isRegisterDialogVisible.value = true
}

function loginReset() {
  loginForm.account = ''
  loginForm.password = ''
  isLoginDialogVisible.value = false
}

function registerReset() {
  registerForm.account = ''
  registerForm.code = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  isRegisterDialogVisible.value = false
}

function loginCancel() {
  loginReset()
}

function registerCancel() {
  registerReset()
}

const loginForm = reactive({
  account: '',
  password: ''
})

const registerForm = reactive({
  account: '',
  code: '',
  password: '',
  confirmPassword: ''
})
</script>

<template>
  <!-- 登录弹窗 -->
  <el-dialog
    v-model="isLoginDialogVisible"
    title="登录"
    center
    width="300"
    close-on-press-escape
    @cancel="loginCancel"
    @closed="loginReset"
  >
    <el-form :model="loginForm" label-width="auto" style="max-width: 600px">
      <el-form-item label="邮箱">
        <el-input v-model="loginForm.account" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" />
      </el-form-item>
      <div class="register-link">
        <span>没有账号?</span><span class="to-register" @click="onRegisterClick">去注册</span>
      </div>
    </el-form>

    <template #footer>
      <div class="text-center">
        <el-button @click="loginCancel"> 取消 </el-button>
        <el-button type="primary" @click="login"> 登录 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="isRegisterDialogVisible"
    title="注册"
    center
    width="400"
    close-on-press-escape
    @cancel="registerCancel"
    @closed="registerReset"
  >
    <div class="dialog-content">
      <el-form :model="registerForm" label-width="auto" style="max-width: 600px">
        <el-form-item label="邮箱">
          <el-input v-model="registerForm.account" />
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="registerForm.code" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="registerForm.confirmPassword" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="text-center">
        <el-button @click="registerCancel"> 取消 </el-button>
        <el-button type="primary" @click="register"> 注册 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.to-register {
  color: #f5cb2b;
  margin-left: 20px;
  cursor: pointer;
}

.register-link {
  display: flex;
  justify-content: center;
}
</style>
