<script lang="ts" setup>
import { reactive } from 'vue'
import { ref } from 'vue'

import { Delete, Download, Plus, ZoomIn } from '@element-plus/icons-vue'

import type { UploadFile } from 'element-plus'
import axios from 'axios';

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const disabled = ref(false)

const handleRemove = (file: UploadFile) => {
  console.log(file)
}

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}

const handleDownload = (file: UploadFile) => {
  console.log(file)
}

// do not use same name with ref
const form = reactive({
  type: 0,
  desc: '',
})


const onSubmit = async () => {
  var response = await axios.post('http://localhost:8081/mind', {
    typeId: form.type,
    content: form.desc,
    imgUrl: dialogImageUrl.value,
  }, {
    headers: {
      'Authorization': `eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjR9.gGS1UJcT_Q7EjFo6NrvSQPLAJK87DN2DY4SOrRueS9gMR678jz2_Rss8M8oD-6UAJIwYU4LFdrhD95aXTftxGg`
    },
  });
  //发布成功弹窗
  response.data.data == true ? alert('发布成功') : alert('发布失败')
}


//类型
const typeList: any = ref(null);
const fetchType = async () => {
  try {
    const response =
      await axios.get('http://localhost:8081/type/getAll', {
        headers: {
          'Authorization': `eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjR9.gGS1UJcT_Q7EjFo6NrvSQPLAJK87DN2DY4SOrRueS9gMR678jz2_Rss8M8oD-6UAJIwYU4LFdrhD95aXTftxGg`
        },
      });
    typeList.value = response.data.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
fetchType();
</script>

<template>
  <div class="my-content">
    <div class="main-content">
      <el-form :model="form" label-width="auto" style="max-width: 100%">
        <el-form-item label="分类">
          <el-radio-group v-model="form.type">
            <el-radio v-for="(item, index) in typeList" :key="index" :value=item.id>{{ item.name }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="求购描述">
          <el-input v-model="form.desc" type="textarea" rows="10" />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload action="#" list-type="picture-card" :auto-upload="false">
            <el-icon>
              <Plus />
            </el-icon>
            <template #file="{ file }">
              <div>
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                    <el-icon><zoom-in /></el-icon>
                  </span>
                  <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </span>
                </span>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" />
        </el-dialog>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">发布</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="right-content">
      <div class="cell">
        <span>12dfdsfsdfsdfsdfsd</span>
        <div>df11</div>
      </div>
    </div>
  </div>


</template>

<style scoped="scss">
form {
  margin-left: 10px auto;
  position: inherit;
  width: 100%;
}

button {
  display: flex;
  position: inherit;
  float: right;
  margin: auto;
}
</style>
