<template>
    <footer class="footer">
      <div class="footer-content">
        <p>© 2024 Shuiyou. All rights reserved.</p>
        <p>鄂ICP备2024068502号</p>
      </div>
    </footer>
  </template>
  
  <script lang="ts">
  export default {
    // eslint-disable-next-line vue/no-reserved-component-names
    name: 'Footer'
  }
  </script>
  
  <style scoped>
  .footer {
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 20px 0;
    width: 100%;
    margin-top: 300px;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .footer-nav {
    margin-top: 10px;
  }
  
  .footer-nav a {
    color: #fff;
    text-decoration: none;
    margin: 0 15px;
  }
  
  .footer-nav a:hover {
    text-decoration: underline;
  }
  </style>
  