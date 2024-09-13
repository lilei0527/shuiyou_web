<script setup lang="ts">
import Mind from './mind.vue'
import { ref } from 'vue'
import axios from '@/axios'

const centerDialogVisible = ref(false)
const radio = ref(3)
const reportText = ref('')
const isActive = ref(0)
const typeId = ref(0)

function typeClick(id: number) {
  isActive.value = id
  typeId.value = id
  fetchMind(1, 10)
}

interface type {
  id: number
  name: string
}



//类型
const typeList: any = ref(null)
const fetchType = async () => {
  try {
    const response = await axios.get('/type/getAll')
    response.data.data
    var data = response.data.data as type[]
    data.unshift({ id: 0, name: '全部' })
    typeList.value = data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
fetchType()

//帖子信息
const mindList: any = ref(null)
const fetchMind = async (pageNum: number, pageSize: number) => {
  try {
    const response = await axios.get('/mind/selectAll', {
      params: {
        current: pageNum,
        size: pageSize,
        typeId: typeId.value == 0 ? null : typeId.value
      }
    })
    mindList.value = response.data.data.records
    total.value = response.data.data.total
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
fetchMind(1, 10)

const scrollToTop = () => {
  //滚动到顶部
  window.scrollTo(0, 0)
}

import type { ComponentSize } from 'element-plus'
import { useRouter } from 'vue-router'
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(10)
const size = ref<ComponentSize>('large')
const background = ref(false)
const disabled = ref(false)

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  fetchMind(val, 10)
  scrollToTop()
}



const $router = useRouter()

function onPublishClick() {
  //是否登录
  if (!localStorage.getItem('token')) {
    $router.push({ name: 'login' })
    return
  }

  $router.push({ name: 'create_mind' })
}
</script>
<template>
  <el-dialog v-model="centerDialogVisible" title="举报" width="500px" center class="report-dialog">
    <el-radio-group v-model="radio" size="large">
      <el-radio :value="0">侮辱性、歧视性或攻击性言语</el-radio>
      <el-radio :value="1">法律和道德规范</el-radio>
      <el-radio :value="2">散布谣言</el-radio>
      <el-radio :value="3">传销诈骗</el-radio>
      <el-radio :value="4">侵权</el-radio>
    </el-radio-group>
    <span>具体描述：</span>
    <!-- <input type="text" size="10" width="100%" class="report-input"> -->
    <el-input type="textarea" v-model="reportText" rows="4" class="report-input" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="centerDialogVisible = false"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>

  <div class="my-content">
    <div class="main-content">
      <!-- 类型导航 -->
      <div class="navigation" style="flex-wrap: nowrap">
        <a
          class="navigation-item"
          href="#/"
          @click="typeClick(item.id)"
          :class="{ active: isActive == item.id }"
          v-for="(item, index) in typeList"
          :key="index"
          >{{ item?.name }}</a
        >
      </div>
      <!-- 帖子列表 -->

      <Mind :can-edit="false" v-for="(item, index) in mindList" :key="index" :mind="item"> </Mind>
      <div v-if="mindList&&mindList.length == 0">
        <el-empty description="更多的帖子正在等待发布" />
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
      <el-button size="large" color="#f5cb2b" @click="onPublishClick">
        <div class="publish">
          <span>发布求购</span>
        </div>
      </el-button>

      <el-card style="max-width: 100%; margin-top: 20px" class="rule">
          <span>本社区为个人求购信息交流平台，个人发布的求购信息仅供参考，双方交易需谨慎协商，以双方自愿为原则。</span>
      </el-card>

      <el-card style="max-width: 100%; margin-top: 20px" class="rule">
        <span>为了维护社区秩序，请遵守社区规定，不得发布违法或不道德的求购信息。被举报后并核实后，将永久封号</span>
      </el-card>
    </div>
  </div>
</template>

<style>
@import '../assets/base.css';

.navigation {
  line-height: 30px;
}

.navigation-item {
  margin-left: 20px;
  text-decoration: none;
  color: black;
  font-size: 18px;
}

.publish {
  width: 100%;
}

.rule {
  /* padding: 10px; */
  /* justify-content: center; */
}

.rule-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.pager {
  margin-top: 40px;
  justify-content: center;
}

.example-showcase .el-dropdown + .el-dropdown {
  margin-left: 15px;
}

.report-input {
  margin-top: 10px;
  width: 100%;
  height: 100px;
}

.active {
  color: #f5cb2b;
  font-size: 22px;
}

.time {
  display: flex;
  float: left;
}
</style>
