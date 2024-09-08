interface ProcessEnv {
    readonly BASE_URL: 'http://localhost:8081' // 定义你需要的环境变量
  }
  
  declare namespace NodeJS {
    interface ProcessEnv extends ProcessEnv {
    }
  }