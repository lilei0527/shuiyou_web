// src/axios.js
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL;


// 创建 axios 实例并配置基础 URL
const instance = axios.create({
  baseURL: apiBaseUrl,  // 使用环境变量
  timeout: 5000  // 超时时间
});


// 请求拦截器
instance.interceptors.request.use(config => {
  // 在请求发送之前做点什么，比如添加 token
  config.headers['Authorization'] = localStorage.getItem('token');
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
