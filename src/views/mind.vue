<script setup lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const editorRef = shallowRef()
const valueHtml = ref('<p>hello</p>')


// onMounted(() => {
//     setTimeout(() => {
//         valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//     }, 1500)
// })

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

const $router = useRouter()


const reportRadio = ref(3)
const reportText = ref('')
const centerDialogVisible = ref(false)
const commentDialogVisible = ref(false)

const props = defineProps<{
    //子组件接收父组件传递过来的值
    item: any,
}>()


const imgUrlList = props.item.images?.split(';');
const imageList = ref(imgUrlList);


function onCommentClick() {
    const routerPath = $router.currentRoute.value.path

    if (routerPath == '/minds' || routerPath == '/') {
        $router.push({ path: '/comment', query: { ...props.item } })
    } else if (routerPath == '/comment') {
        commentDialogVisible.value = true;
    }

}

const route = useRoute()
var mind = route.query;

//提交评论
const submitComment = () => {
    // 发送请求
    var response = axios.post('http://localhost:8081/comment', {
        content: valueHtml.value,
        mindId: mind.id,
        toUserId: mind.userId,
    }, {
        headers: {
            'Authorization': localStorage.getItem('token')
        },
    });

    response.then(function (response) {
        console.log(response);
        commentDialogVisible.value = false;
        // 刷新页面
        location.reload();
    }).catch(function (error) {
        console.log(error);
    })
}


//举报
function report() {
    axios.post('http://localhost:8081/report', {
        mindId: props.item.id,
        type: reportRadio.value,
        content: reportText.value,
        toUserId: props.item.userId
    }, {
        headers: {
            'Authorization': localStorage.getItem('token')
        },
    }).then(res => {
        console.log(res)
        ElMessage({
            type: 'success',
            message: '举报成功'
        })
    }
    )

    centerDialogVisible.value = false
}

//关注帖子
function follow(mindId: number) {
    axios.post('http://localhost:8081/follow', { mindId: mindId }, {
        headers: {
            'Authorization': localStorage.getItem('token')
        },
    }).then(res => {
        console.log(res)
        ElMessage('已关注')
    })
}

</script>

<template>
    <el-dialog v-model="centerDialogVisible" title="举报" width="500px" center class="report-dialog">
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
                <el-button @click="centerDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="report">
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

    <table cellpadding="0" cellspacing="0" width="100%">
        <tr class="mind_row">
            <td width="24" valign="top"><img :src=props.item.userHeadImage class="avatar" width="24"
                    style="width: 40px; max-height: 40px;" alt="zj9495"></td>
            <td width="100%" valign="top" class="mind_content_col">
                <div class="fr">
                    <strong>{{ props.item.accountName }}</strong><span class="fade small time">{{ props.item.createTime
                        }}</span>
                </div>
                <div class="mind_content">
                    <span>{{ props.item.content }}
                    </span>
                </div>
        <tr class="mind_images_row">
            <td class="mind_images" v-for="(item, index) in imageList" :key="index">
                <div class="demo-image__preview">
                    <el-image style="width: 100px; height: 100px" :src=item :preview-src-list=imageList>
                    </el-image>
                </div>
            </td>
        </tr>
        <tr class="mind_operation_row">
            <span class="mind_operation_col" plain @click="centerDialogVisible = true">
                <img src="../assets/svg/report.svg" style="width: 40px; max-height: 40px;" alt="举报">
                <span class="mind_operation_text">举报</span>
            </span>
            <div @click="onCommentClick">
                <span class="mind_operation_col">
                    <img src="../assets/svg/comment.svg" style="width: 40px; max-height: 40px;" alt="评论">
                    <span class="mind_operation_text">{{ props.item.commentNum }}</span>
                </span>
            </div>

            <span class="mind_operation_col" @click="follow(props.item.id)">
                <img src="../assets/svg/collect.svg" style="width: 40px; max-height: 40px;" alt="关注">
                <span class="mind_operation_text">关注</span>
            </span>

            <span></span>
        </tr>

        </td>
        </tr>
    </table>
</template>

<style scoped lang="scss">
.fade {
    color: #999;
}

.small {
    font-size: 12px;
}

table {
    display: flex;
    border-collapse: separate;
    box-sizing: border-box;
    text-indent: initial;
    unicode-bidi: isolate;
    border-spacing: 2px;
    border-color: gray;
    margin-top: 30px;
    margin-bottom: 30px;
}

.mind_images_row {
    display: flex;
    margin-top: 10px;
}

.mind_images {
    margin-right: 10px;
}

.fr {
    display: flex;
}

.time {
    display: flex;
    float: left;
}

.mind_row {
    width: 100%;
}

.mind_operation_row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.mind_operation_col {
    display: flex;
    align-items: center;
}

.mind_operation_text {
    margin-left: 10px;
    cursor: pointer;
}

.mind_operation_text:hover {
    color: #F5CB2B;
}

.mind_content_col {
    padding-left: 20px;
}
</style>
