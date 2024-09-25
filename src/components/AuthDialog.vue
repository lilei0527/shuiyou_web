<script setup lang="ts">
import axios from '@/axios'
import { ElMessage, type FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { user } from '../stores/global'
import { useMessageStore } from '../stores/message'

const messageStore = useMessageStore()
const isLoginDialogVisible = defineModel<boolean>('isLoginDialogVisible')
const isRegisterDialogVisible = defineModel<boolean>('isRegisterDialogVisible')

function login() {
  axios.post('/user/login', loginForm).then((response) => {
    if (response.data.code != 200) {
      ElMessage.error(response.data.message)
      return
    } else if (response.data.code == 200) {
      var userData = response.data.data
      localStorage.setItem('token', userData.token)
      localStorage.setItem('accountName', userData.accountName)
      localStorage.setItem('headImage', userData.headImage)
      localStorage.setItem('userId', userData.userId)
      user.accountName = userData.accountName
      user.headImage = userData.headImage
      user.token = userData.token
      user.userId = userData.userId
      user.point = userData.point
      isLoginDialogVisible.value = false

      const messageStore = useMessageStore()
      messageStore.initWebSocket() // 应用加载时初始化 WebSocket

      // location.reload();
      // getUnreadCount() // 获取未读消息数量
    }
  })
}

function getUnreadCount() {
  axios.get('/message/getUnreadCount').then(res => {
    messageStore.unreadCount = res.data.data
  })
}

function register() {
  //两次密码输入是否一致
  if (registerForm.password != registerForm.confirmPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }

  axios.post('/user/register', registerForm).then((response) => {
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
function onLoginClick() {
  isLoginDialogVisible.value = true
  isRegisterDialogVisible.value = false
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
  phone: '',
  account: '',
  code: '',
  password: '',
  confirmPassword: '',
  inviteCode: ''
})

const isRegisterFormValid = ref(false) // 表单是否验证通过
const redisterRuleFormRef = ref<FormInstance>()

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 5, max: 20, message: '账号长度在 6 到 16 个字符', trigger: 'blur' }
  ],

  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 16 个字符', trigger: 'blur' }
  ],

  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度为 4', trigger: 'blur' }
  ]
}

function handleInput() {
  // 每次输入时验证表单
  if (redisterRuleFormRef.value) {
    redisterRuleFormRef.value.validate((valid: boolean) => {
      isRegisterFormValid.value = valid // 根据验证结果控制按钮是否可用
    })
  }
}

const isCodeSend = ref(false)
const expireTime = ref(120)

function sendCode() {
  axios.post('/user/sendPhoneCode', { phone: registerForm.phone }).then((response) => {
    if (response.data.code != 200) {
      ElMessage.error(response.data.message)
      return
    } else if (response.data.code == 200) {
      isCodeSend.value = true
      countDown()
    }
  })
}

//倒计时
function countDown() {
  if (expireTime.value > 0) {
    expireTime.value -= 1
    setTimeout(() => {
      countDown()
    }, 1000)
  } else {
    isCodeSend.value = false
    expireTime.value = 120
  }
}
</script>

<template>
  <!-- 登录弹窗 -->
  <el-dialog v-model="isLoginDialogVisible" title="登录" center width="300" close-on-press-escape @cancel="loginCancel"
    @closed="loginReset">
    <el-form :model="loginForm" label-width="auto" style="max-width: 600px">
      <el-form-item label="账号">
        <el-input v-model="loginForm.account" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type="password" />
      </el-form-item>
      <div class="register-link">
        <span>没有账号?</span><span class="to-register" @click="onRegisterClick">去注册</span>
      </div>
    </el-form>

    <template #footer>
      <div class="text-center">
        <el-button type="primary" @click="loginCancel"> 取消 </el-button>
        <el-button type="primary" @click="login"> 登录 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="isRegisterDialogVisible" title="注册" center width="400" close-on-press-escape
    @cancel="registerCancel" @closed="registerReset">
    <div class="dialog-content">
      <el-form :model="registerForm" label-width="auto" style="max-width: 600px" :rules="rules"
        ref="redisterRuleFormRef" @input="handleInput">
        <el-form-item label="手机号" style="width: 90%" prop="phone">
          <el-input v-model="registerForm.phone" />
        </el-form-item>

        <el-form-item label=" " style="width: 90%">
          <el-button v-if="!isCodeSend" @click="sendCode" style="margin-top: 10px;">获取验证码</el-button>
          <el-button v-else-if="isCodeSend" style="margin-top: 10px;" type="info">{{ expireTime }}</el-button>
        </el-form-item>

        <el-form-item label="验证码" style="width: 90% " prop="code">
          <el-input v-model="registerForm.code" />
        </el-form-item>

        <el-form-item label="账号" style="width: 90%" prop="account">
          <el-input v-model="registerForm.account" />
        </el-form-item>
        <el-form-item label="密码" style="width: 90%" prop="password">
          <el-input v-model="registerForm.password" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" style="width: 90%" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" />
        </el-form-item>
        <div class="register-link">
          <span>已有账号?</span><span class="to-register" @click="onLoginClick">去登录</span>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="text-center">
        <el-button type="primary" @click="registerCancel"> 取消 </el-button>
        <el-button type="primary" @click="register" :disabled="!isRegisterFormValid">
          注册
        </el-button>
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
