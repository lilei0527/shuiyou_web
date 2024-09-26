<template>
  <div class="my-content">
    <div class="main-content">
      <!-- #ifdef H5 -->
      <div v-html="html"></div>
      <!-- #endif -->
    </div>
    <div class="right-content">
      <el-card style="max-width: 100%; margin-top: 10px">
        <span
          ></span
        >
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from '@/axios'
import { ElMessage } from 'element-plus'
import { nextTick, onMounted, ref } from 'vue'
const html = ref('')
const price = ref('10')

function alipay() {
  // 支付宝支付
  axios
    .get('/alipay/pay', {
      params: {
        price: price.value
      }
    })
    .then((res) => {
      if (res.data.code === 200) {
        html.value = res.data.data
        // 支付宝支付
        // window.document.querySelector('body').innerHTML = res
        nextTick(() => {
          window.document.forms[0].submit()
        })
      } else {
        ElMessage.error(res.data.msg)
      }
    })
}

onMounted(() => {
  alipay()
})
</script>

<style scoped="sass"></style>
