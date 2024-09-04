<script setup lang="ts">
import Mind from './mind.vue';
import { ref } from 'vue'
import axios from 'axios';

const centerDialogVisible = ref(false)
const radio = ref(3)
const reportText = ref('')
const isActive = ref(0);
const typeId = ref(0);

function typeClick(id: number) {
    isActive.value = id;
    typeId.value = id;
    fetchMind(1, 10);
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


//帖子信息
const mindList: any = ref(null);
const fetchMind = async (pageNum: number, pageSize: number) => {
    try {
        const response =
            await axios.get('http://localhost:8081/mind', {
                headers: {
                    'Authorization': `eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjR9.gGS1UJcT_Q7EjFo6NrvSQPLAJK87DN2DY4SOrRueS9gMR678jz2_Rss8M8oD-6UAJIwYU4LFdrhD95aXTftxGg`
                },
                params: {
                    current: pageNum,
                    size: pageSize,
                    typeId: typeId.value == 0 ? null : typeId.value
                }
            });
        mindList.value = response.data.data.records;
        total.value = response.data.data.total;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
fetchMind(1, 10);


const scrollToTop = () => {
    //滚动到顶部
    window.scrollTo(0, 0);
}


import type { ComponentSize } from 'element-plus'
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
    fetchMind(val, 10);
    scrollToTop();
}

const activeNames = ref(['1'])
const handleChange = (val: string[]) => {
    console.log(val)
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
                <el-button type="primary" @click="centerDialogVisible = false">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>

    <div class="my-content">
        <div class="main-content">
            <!-- 类型导航 -->
            <div class="navigation" style="flex-wrap:nowrap">
                <a class="navigation-item" href="#/" @click="typeClick(item.id)"
                    :class="{ active: isActive == item.id }" v-for="(item, index) in typeList" :key="index">{{
                        item?.name }}</a>
            </div>
            <!-- 帖子列表 -->
            <Mind v-for="(item, index) in mindList" :key="index" :item=item>
            </Mind>
            <!-- 分页 -->
            <el-pagination class="pager" v-model:current-page="currentPage" v-model:page-size="pageSize" :size="size"
                :disabled="disabled" :background="background" layout="prev, pager, next, jumper" :total=total
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
        <div class="right-content">
            <el-button size="large" color="#f5cb2b">
                <router-link to="create_mind">
                    <div class="publish">
                        <span>发布求购</span>
                    </div>
                </router-link>
            </el-button>

            <el-card style="max-width: 100%; margin-top: 20px;" class='rule'>
                <!-- <p class="rule-title">社区规则</p> -->
                <el-collapse v-model="activeNames" @change="handleChange">
                    <el-collapse-item title="社区规则" name="1" class="rule-title">
                        <p class="rule-content">
                            欢迎来到我们的社区！为了确保每个人都能在这里愉快地交流和分享，我们制定了以下规则：<br><br>
                            1. 尊重他人：请尊重其他成员的观点、意见和感受。避免使用侮辱性、歧视性或攻击性的语言。<br>
                            2. 遵守法律和道德规范：请遵守国家法律法规以及社会道德准则，不传播违法信息、色情内容或其他有害信息。<br>
                            3. 保持友善和礼貌：请友好地对待其他成员，避免恶意评论、挑衅或侮辱行为。<br>
                            4. 保护隐私：请勿泄露他人的个人信息，包括姓名、地址、电话号码等敏感信息。<br>
                            5. 禁止广告和垃圾信息：请不要发布广告、垃圾邮件或未经授权的商业宣传信息。<br>
                            6. 负责任的讨论：请在讨论中保持理性和客观，避免人身攻击和过度情绪化的言辞。<br>
                            7. 遵守版权法：请勿上传、分享或传播侵犯他人知识产权的内容，如盗版软件、音乐、电影等。<br>
                            8. 不得散布谣言：不要散播未经证实的消息或谣言，以免误导他人。<br>
                            9. 鼓励互助和支持：请积极参与社区活动，互相帮助解决问题，共同进步。<br>
                            10. 举报违规行为：如果您发现任何违反社区规则的行为，请及时向管理员举报，我们将尽快处理。<br><br>

                            我们希望每位成员都能遵守这些规则，共同营造一个和谐、友好的社区环境。感谢您的理解和支持！
                        </p>
                    </el-collapse-item>
                </el-collapse>


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

.example-showcase .el-dropdown+.el-dropdown {
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
