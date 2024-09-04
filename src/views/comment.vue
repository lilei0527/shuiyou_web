<script setup lang="ts">

import axios from 'axios';
import { useRoute } from 'vue-router'
import Mind from './mind.vue';
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'



const route = useRoute()
var mind = route.query;

interface Comment {
    id: number;
    mindId: number;
    commentId: number;
    fromUserId: number;
    fromUserName: string;
    fromUserHeadImage: string;
    toUserId: number;
    toUserName: string;
    toUserHeadImage: string;
    content: string;
    createTime: string;
    childComments: Array<Comment>;
}

// 评论列表
var pageNum = 1;
const commentList = ref<Array<Comment>>([]);
const getCommentList = () => {
    busy.value = true;
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

        if(newItems.length == 10){
            pageNum++;
        }
        busy.value = false;
    })
}

onMounted(() => {
    getCommentList();
});


const reportRadio = ref(3)
const reportText = ref('')

const reportUserId = ref(0);
const reportCommentId = ref(0);
const commentUserId = ref(0);
const commentCId = ref(0); //根评论id

const reportDialogVisible = ref(false)
const commentDialogVisible = ref(false)


//举报评论
function report() {
    axios.post('http://localhost:8081/report', {
        commentId: reportCommentId.value,
        type: reportRadio.value,
        content: reportText.value,
        toUserId: reportUserId.value
    }, {
        headers: {
            'Authorization': `eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjR9.gGS1UJcT_Q7EjFo6NrvSQPLAJK87DN2DY4SOrRueS9gMR678jz2_Rss8M8oD-6UAJIwYU4LFdrhD95aXTftxGg`
        },
    }).then(res => {
        console.log(res)
        ElMessage({
            type: 'success',
            message: '举报成功'
        })
        reportUserId.value = 0
        reportCommentId.value = 0
    }
    )
    reportDialogVisible.value = false
}

//提交评论
const submitComment = () => {
    // 发送请求
    var response = axios.post('http://localhost:8081/comment', {
        content: valueHtml.value,
        mindId: mind.id,
        toUserId: commentUserId.value,
        commentId: commentCId.value
    }, {
        headers: {
            'Authorization': `eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjR9.gGS1UJcT_Q7EjFo6NrvSQPLAJK87DN2DY4SOrRueS9gMR678jz2_Rss8M8oD-6UAJIwYU4LFdrhD95aXTftxGg`
        },
    });

    response.then(function (response) {
        console.log(response);
        commentDialogVisible.value = false;

        for (let i = 0; i < commentList.value.length; i++) {
            if (commentList.value[i].id === commentCId.value) {
                commentList.value[i].childComments.push(response.data.data)
                break;
            }
        }
    }).catch(function (error) {
        console.log(error);
    })
}


const editorRef = shallowRef()
const valueHtml = ref('<p>hello</p>')
const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }
const editor = editorRef.value
onBeforeUnmount(() => {
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}


const handleChange = (editor: { getHtml: () => any }) => {
    valueHtml.value = editor.getHtml()
    console.log('change:', editor.getHtml());
};
const handleDestroyed = (editor: any) => {
    console.log('destroyed', editor);
};
const handleFocus = (editor: any) => {
    console.log('focus', editor);
};
const handleBlur = (editor: any) => {
    console.log('blur', editor);
};
const customAlert = (info: any, type: any) => {
    alert(`【自定义提示】${type} - ${info}`);
};
const customPaste = (editor: any, event: any) => {
    console.log('ClipboardEvent 粘贴事件对象', event);
}
const mode = 'default'


function onReportClick(commentId: number, userId: number) {
    reportCommentId.value = commentId
    reportUserId.value = userId
    reportDialogVisible.value = true
}

function onCommentClick(commentId: number, userId: number) {
    commentUserId.value = userId;
    commentCId.value = commentId;
    commentDialogVisible.value = true
}

const busy = ref(false);
</script>


<template>
    <el-dialog v-model="reportDialogVisible" title="举报" width="500px" center class="report-dialog">
        <el-radio-group v-model="reportRadio" size="large">
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
                <el-button @click="reportDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="report()">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>


    <el-dialog v-model="commentDialogVisible" title="评论" width="800px" center>
        <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode"
            style="border-bottom: 1px solid #ccc" />
        <Editor :defaultConfig="editorConfig" :mode="mode" v-model="valueHtml" style="height: 500px; overflow-y: hidden"
            @onCreated="handleCreated" @onChange="handleChange" @onDestroyed="handleDestroyed" @onFocus="handleFocus"
            @onBlur="handleBlur" @customAlert="customAlert" @customPaste="customPaste" />
        <template #footer>
            <div class="dialog-footer">
                <el-button type="success" @click="submitComment">提交</el-button>
                <el-button type="info" @click="commentDialogVisible = false">取消</el-button>
            </div>
        </template>
    </el-dialog>

    <div class="my-content">
        <div class="main-content">
            <div class="edior">
                <Mind :item=mind />
                <!-- 评论区 -->
                <div class="comment" v-infinite-scroll="getCommentList" infinite-scroll-disabled="busy">
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
                            <span class="report-operate" @click="onReportClick(item.id, item.fromUserId)">举报</span><span
                                class="reply-operate" @click="onCommentClick(item.id, item.fromUserId)">回复</span>
                            <!-- <hr class="comment-line" /> -->


                            <!-- 子评论 -->
                            <div class="child-comment" v-for="(childItem, index) in item.childComments" :key="index">
                                <div class="user-header">
                                    <img :src="childItem.fromUserHeadImage" alt="" style="width: 30px; max-height: 30px;" />
                                    <span class="user-name">{{ childItem.fromUserName }}</span>
                                    <span class="reply-text">回复</span>
                                    <span class="user-name-child">{{ childItem.toUserName }}</span>
                                    <span class="time">{{ childItem.createTime }}</span>
                                </div>
                                <div v-html="childItem.content" class="user-content_child">
                                </div>
                                <span class="report-operate"
                                    @click="onReportClick(childItem.id, childItem.fromUserId)">举报</span><span
                                    class="reply-operate"
                                    @click="onCommentClick(item.id, childItem.fromUserId)">回复</span>
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
    margin-top: 10px;
    display: flex;
    align-items: center;
}

.user-name {
    margin-left: 20px;
    font-size: 16px;
    color: black;
    font-weight: 600;
}

.user-name-child {
    font-size: 16px;
    color: black;
    font-weight: 600;
}

.user-content {
    margin-left: 60px;
    color: black;
    font-weight: 600;
}

.user-content_child {
    margin-left: 50px;
    color: black;
    font-weight: 600;
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

.report-operate {
    color: #999;
    font-size: 12px;
    margin-left: 60px;
    cursor: pointer;
}

.report-operate:hover{
    color: #F5CB2B;
}

.reply-operate {
    color: #999;
    font-size: 12px;
    margin-left: 10px;
    cursor: pointer;
}

.reply-operate:hover{
    color: #F5CB2B;
}

.reply-text{
    margin: 0 10px 0 10px;
}
</style>