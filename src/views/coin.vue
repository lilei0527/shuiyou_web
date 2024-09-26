<template>
  <div class="my-content">
    <div class="main-content">
      <div class="head">
        <span style="margin-right: 5px">我的金币：{{ user.point }}</span>
        <img src="../assets/svg/coin.svg" style="width: 20px; height: 20px" alt="" />
      </div>
      <div class="operation">
        <el-button type="primary" @click="onBuy">购买金币</el-button>
        <el-button type="primary">做任务领金币</el-button>
      </div>

      <!-- 金币记录 -->
      <div class="record">
        <el-table :data="tableData" border  style="width: 100%" class="point-table">
          <el-table-column prop="pointType" label="类型" />
          <el-table-column prop="point" label="金币变动" />
          <el-table-column prop="createTime" label="日期" />
        </el-table>
      </div>
      <!-- 分页 -->
      <el-pagination
        class="pager"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :size="size"
        :disabled="disabled"
        :background="background"
        layout="prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { user } from '../stores/global'
import { ElMessage, type ComponentSize } from 'element-plus'
import axios from '@/axios'
const tableData = ref([])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(10)
const size = ref<ComponentSize>('large')
const background = ref(false)
const disabled = ref(false)

const handleSizeChange = () => {}

const scrollToTop = () => {
  //滚动到顶部
  window.scrollTo(0, 0)
}

function fetchPointRecord(pageNum: number, pageSize: number) {
  //获取金币记录
  axios
    .get('/pointRecord/page', {
      params: {
        pageNum: pageNum,
        pageSize: pageSize
      }
    })
    .then((res) => {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    })
}

const handleCurrentChange = (val: number) => {
  fetchPointRecord(val, 10)
  scrollToTop()
}

function onBuy() {
    // $router.push({ path: '/alipay'})
    window.open('/alipay')
}

onMounted(() => {
  fetchPointRecord(1, 10)
})

</script>

<style scoped="sass">
.head {
  display: flex;
  align-items: center;
  justify-content: center;
}

.operation {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.point-table {
  margin-top: 50px;
}

</style>
