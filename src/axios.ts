// src/axios.js
import axios from 'axios';

// 创建 axios 实例并配置基础 URL
const instance = axios.create({
  baseURL: 'http://localhost:8081',  // 使用环境变量或直接配置
  timeout: 5000  // 超时时间
});


// 请求拦截器
instance.interceptors.request.use(config => {
    // 在请求发送之前做点什么，比如添加 token
    config.headers['Authorization'] =  localStorage.getItem('token');
    return config;
  }, error => {
    return Promise.reject(error);
  });
  
  // 响应拦截器
  instance.interceptors.response.use(response => {
    return response;
  }, error => {
    // 处理错误响应
    return Promise.reject(error);
  });


export default instance;
