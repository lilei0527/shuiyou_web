<script setup lang="ts">

import axios from 'axios';
import { useRoute } from 'vue-router'
import Mind from './mind.vue';
import router from '@/router';
import { ref, onMounted } from 'vue';


const route = useRoute()
var mind = route.query;




// 评论列表
var pageNum = 1;
const commentList = ref<Array<any>>([]);
const getCommentList = () => {
    // 发送请求
    var response = axios.get('http://localhost:8081/comment/getComments', {
        params: {
            mindId: mind.id,
            pageNum: pageNum,
            pageSize: 10
        },
        headers: {
            'Authorization': `eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjR9.gGS1UJcT_Q7EjFo6NrvSQPLAJK87DN2DY4SOrRueS9gMR678jz2_Rss8M8oD-6UAJIwYU4LFdrhD95aXTftxGg`
        },
    });

    response.then(function (response) {
        console.log(response);

        const newItems = response.data.data.records;
        if (newItems.length > 0) {
            commentList.value.push(...newItems);
            pageNum++;
        }
    })
}

onMounted(() => {
    getCommentList();
});

function back() {
    router.back();
}

const centerDialogVisible = ref(false);
</script>


<template>
    <!-- 评论框 -->

    <el-dialog v-model="centerDialogVisible" title="举报" width="500px" center class="report-dialog">
        <h3 style="margin-top: 50px;margin-bottom: 10px;">请输入您的方案：</h3>
        <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode"
            style="border-bottom: 1px solid #ccc" />
        <Editor :defaultConfig="editorConfig" :mode="mode" v-model="valueHtml" style="height: 500px; overflow-y: hidden"
            @onCreated="handleCreated" @onChange="handleChange" @onDestroyed="handleDestroyed" @onFocus="handleFocus"
            @onBlur="handleBlur" @customAlert="customAlert" @customPaste="customPaste" />
        <template #footer>
            <div class="dialog-footer">
                <el-button type="success" @click="submitComment">提交</el-button>
                <el-button type="info" @click="centerDialogVisible = false">取消</el-button>
            </div>
        </template>
    </el-dialog>

    <div class="my-content">
        <div class="main-content">
            <div class="edior">

                <Mind :item=mind />

                <!-- 评论区 -->

                <div class="comment" v-infinite-scroll="getCommentList">


                    <div class="comment-title-row"><img src="../assets/svg/planlist.svg"
                            style="width: 20px; max-height: 20px;" alt="方案"><span class="plan-name">方案列表</span></div>


                    <div v-for="(item, index) in commentList" :key="index">
                        <el-card>
                            <div class="user-header">
                                <img :src="item.fromUserHeadImage" alt="" style="width: 40px; max-height: 40px;" />
                                <span class="user-name">{{ item.fromUserName }}</span>
                                <span class="time">{{ item.createTime }}</span>
                            </div>
                            <div v-html="item.content" class="user-content">
                            </div>
                            <!-- <hr class="comment-line" /> -->


                            <!-- 子评论 -->
                            <div class="child-comment" v-for="(childItem, index) in item.childComments" :key="index">
                                <div class="user-header">
                                    <img :src="item.fromUserHeadImage" alt="" style="width: 30px; max-height: 30px;" />
                                    <span class="user-name">{{ childItem.fromUserName }}</span>
                                    <span class="time">{{ childItem.createTime }}</span>
                                </div>
                                <div v-html="childItem.content" class="user-content">
                                </div>
                                <!-- <hr class="comment-line" /> -->

                            </div>
                        </el-card>
                    </div>
                </div>



            </div>
        </div>
        <div class="right-content">
            <div class="cell">
                <span>12dfdsfsdfsdfsdfsd</span>
                <div>df11</div>
            </div>
        </div>
    </div>


</template>

<style scoped lang="scss">
.edior {
    margin: 10px;
}

.reply {
    margin-top: 30px;
    margin-left: 15px;
}

el-button {
    display: flex;
    position: inherit;
    float: right;
    margin: auto;
}

.operates {
    display: flex;
    justify-content: space-evenly;
}

.comment {
    margin: 10px;
}

.user-header {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px
}

.user-name {
    margin-left: 20px;
}

.user-content {
    margin-left: 60px;
}

.comment-line {
    margin-top: 30px;
    height: 1px;
    border: none;
    background-color: #80808069;
    size: 1px;
}

.time {
    margin-left: auto;
    color: #999;
    font-size: 12px;
}

.plan-name {
    margin-left: 10px;
    font-size: 20px;
}

.comment-title-row {
    display: flex;
    align-items: center;
}

.child-comment {
    margin-left: 60px;
}
</style>