<template>
    <!-- <img src="./assets/logo.png">
      <router-view/> -->
    <el-backtop :right="100" :bottom="100" />
    <div class="my-header">
        <div class="header-content">
            <img src="../assets/image/sy_logo.png" style="width: 80px; height: 80px;" alt="logo" />
            <div class="info-content">
                <div class="search bar7">
                    <form class="example" action="/" style="margin:auto;max-width:300px">
                        <input type="text" placeholder="搜索.." name="search2">
                        <button type="submit"><i class="fa fa-search"></i></button>
                    </form>
                </div>
                <router-link to="/person">
                    <img src="http://123.60.87.243/images/xpic5928.jpg" class="avatar" width="24"
                        style="width: 40px; max-height: 40px;" alt="头像">
                </router-link>
                <span class="username">诚实可靠小郎君</span>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>



</script>

<style>
@import '../assets/base.css';

body {
    margin: 0;
    padding: 0;
    background-color: #f3f3f3;
}

.my-header {
    background-color: white;
    height: 80px;
}

.avatar-frame {
    width: 60px;
    /* 设置宽度 */
    height: 60px;
    /* 设置高度 */
    border-radius: 50%;
    /* 设置为圆形 */
    overflow: hidden;
    /* 隐藏超出边框的内容 */
    display: flex;
    /* 使用Flexbox布局 */
    justify-content: center;
    /* 水平居中 */
    align-items: end;
    /* 垂直底部对齐 */
}

.avatar-frame img {
    width: 100%;
    /* 使图片填充整个框架 */
    height: auto;
    /* 保持图片的纵横比 */
}

.cell {
    padding: 10px;
    font-size: 14px;
    line-height: 150%;
    text-align: left;
    border-bottom: 1px solid var(--box-border-color);
    word-break: break-word;
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
}



.fr {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
}

.my-content {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: auto;
    width: 1200px;
    height: auto;
    display: flex;
}

.main-content {
    margin: 20px;
    padding: 20px;
    width: 70%;
    background-color: white;

}

.right-content {
    padding: 20px;
    margin: 20px;
    width: 25%;
    background-color: white;
    display: flex;
    flex-direction: column;
}

.header-content {
    display: flex;
    margin-left: auto;
    margin-right: auto;
    width: 70%;
    height: 100%;
    align-items: center;
}

.info-content {
    display: flex;
    align-items: center;
    margin-left: auto;
}

form.example {
    display: flex;
    align-items: center;
}

form.example input[type=text] {
    /* padding: 10px; */
    font-size: 17px;
    border: 1px solid grey;
    height: 30px;
    /* float: left; */
    /* width: 80%; */
    background: #f1f1f1;
}

form.example button {
    float: left;
    width: 35px;
    height: 35px;
    /* padding: 10px; */
    background: #f5cb2b;
    color: white;
    font-size: 17px;
    border: 1px solid grey;
    border-left: none;
    cursor: pointer;
}

form.example button:hover {
    background: hwb(69 4% 15%);
}

form.example::content {
    content: "\f002";
    clear: both;
    display: table;
}


.navigation {
    line-height: 30px;
}

.navigation-item {
    margin-left: 20px;
    text-decoration: none;
}

.username {
    margin-left: 10px;
    font-size: 16px;
}

.avatar {
    margin-left: 10px;
}
</style>
