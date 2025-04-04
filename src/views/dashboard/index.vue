<template>
  <div class="dashboard-container">
    <div class="welcome-card">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎使用图书管理系统</h1>
        <div class="welcome-info">
          <div class="info-item">
            <i class="el-icon-user-solid"></i>
            <span>开发人员: 湖南科技大学 裘芯慈</span>
          </div>
          <div class="info-item">
            <i class="el-icon-message"></i>
            <span>联系方式-Email: 2712807127@qq.com</span>
          </div>
          <div class="info-item">
            <i class="el-icon-date"></i>
            <span>开发周期: 2025-3-19 —— 2025-4-10</span>
          </div>
        </div>
        
        
        <div class="tech-stack">
          <el-card shadow="hover" class="tech-card">
            <div slot="header" class="tech-header">
              <i class="el-icon-coin"></i>
              <span>数据库</span>
            </div>
            <div class="tech-content">MySQL 8.0</div>
          </el-card>
          
          <el-card shadow="hover" class="tech-card">
            <div slot="header" class="tech-header">
              <i class="el-icon-monitor"></i>
              <span>前端技术</span>
            </div>
            <div class="tech-content">HTML、<br>CSS、<br>Vue、<br>Axios、<br>ElementUI</div>
          </el-card>
          
          <el-card shadow="hover" class="tech-card">
            <div slot="header" class="tech-header">
              <i class="el-icon-cpu"></i>
              <span>后端技术</span>
            </div>
            <div class="tech-content">Java、<br>SpringBoot、<br>MyBatis、<br>MySQL</div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'id',
      'name',
      'roles'
    ])
  }
}
</script>

<style lang="scss" scoped>
/* 基础布局 - 确保完美居中 */
.dashboard-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('https://img.freepik.com/free-vector/hand-painted-watercolor-pastel-sky-background_23-2148902771.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  margin: 0;
}

/* 主卡片 - 居中核心设置 */
.welcome-card {
  width: 75%;
  max-width: 900px;
  background-color: rgba(255, 255, 255, 0.92);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 40px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  margin: 0 auto; /* 关键居中属性 */
  position: relative;
}

/* 内容区域 */
.welcome-content {
  text-align: center;
  width: 100%;
}

/* 标题样式 */
.welcome-title {
  color: #11714b;
  font-size: 2.5rem;
  margin-bottom: 30px;
  font-weight: lighter;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

/* 信息项样式 */
.welcome-info {
  text-align: left;
  margin: 0 auto;
  max-width: 600px;
}

.info-item {
  margin: 15px 0;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: #555;
  
  i {
    margin-right: 12px;
    color: #11714b;
    font-size: 1.3rem;
  }
}

/* 分隔线样式 */
.custom-divider {
  margin: 30px 0;
  font-size: 1.4rem;
  color: #11714b;
  
  ::v-deep .el-divider__text {
    background-color: transparent;
    padding: 0 20px;
  }
}

/* 技术栈卡片 */
.tech-stack {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
}

.tech-card {
  flex: 1;
  min-width: 250px;
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 15px;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
}

.tech-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #11714b;
  font-size: 1.1rem;
  
  i {
    margin-right: 10px;
    font-size: 1.2rem;
  }
}

.tech-content {
  color: #666;
  font-size: 1rem;
  padding: 10px 0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .welcome-card {
    width: 85%;
    padding: 30px;
  }
  
  .welcome-title {
    font-size: 2.2rem;
  }
  
  .info-item {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .welcome-card {
    width: 90%;
    padding: 25px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .info-item {
    font-size: 1rem;
    margin: 12px 0;
  }
  
  .tech-stack {
    flex-direction: column;
    gap: 15px;
  }
  
  .tech-card {
    min-width: 100%;
  }
}

@media (max-width: 480px) {
  .welcome-card {
    width: 95%;
    padding: 20px;
  }
  
  .welcome-title {
    font-size: 1.6rem;
  }
  
  .custom-divider {
    font-size: 1.2rem;
  }
}
</style>