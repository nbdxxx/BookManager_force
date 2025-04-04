<template>
  <div class="login-container">
    <el-form 
      ref="loginForm" 
      :model="loginForm" 
      :rules="loginRules" 
      class="login-form"
      auto-complete="on" 
      label-position="left"
    >
      <!-- 标题 -->
      <div class="title-container">
        <h3 class="title">图书管理系统</h3>
        <p class="subtitle">登录您的账户</p>
      </div>
      
      <!-- 用户名 -->
      <el-form-item prop="username" class="form-item-glass">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="请输入用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
          class="glass-input"
        />
      </el-form-item>

      <!-- 密码 -->
      <el-form-item prop="password" class="form-item-glass">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="请输入密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          class="glass-input"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <!-- 权限 -->
      <el-form-item prop="authority" class="form-item-glass">
        <span class="svg-container">
          <svg-icon icon-class="authority" />
        </span>
        <el-select 
          v-model="loginForm.isadmin" 
          placeholder="请选择权限" 
          class="glass-select"
        >
          <el-option :key="1" label="管理员" :value="1"></el-option>
          <el-option :key="0" label="读者" :value="0"></el-option>
        </el-select>
      </el-form-item>
      
      <!-- 按钮组 -->
      <div class="button-group">
        <el-button 
          :loading="loading" 
          class="login-btn"
          @click.native.prevent="handleLogin"
        >
          登 录
        </el-button>
        <el-button 
          :loading="loading" 
          class="register-btn"
          @click.native.prevent="handleRegister"
        >
          注 册
        </el-button>
      </div>
    </el-form>
    
    <!-- 背景装饰元素 -->
    <div class="decor-circle circle-1"></div>
    <div class="decor-circle circle-2"></div>
    <div class="decor-circle circle-3"></div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'manager',
        password: '123456',
        isadmin: 1
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
        password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  methods: {
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? '' : 'password'
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    handleRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<style lang="scss">
/* 全局样式重置 */
.login-container * {
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* 背景与容器 */
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #104e33 0%, #1e3f2d 50%, #2a5741 100%);
  
  /* 背景装饰圆 */
  .decor-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.15;
    z-index: 0;
    
    &.circle-1 {
      width: 300px;
      height: 300px;
      background: #4fc08d;
      top: -100px;
      left: -100px;
      animation: float 8s ease-in-out infinite;
    }
    
    &.circle-2 {
      width: 400px;
      height: 400px;
      background: #3aaf85;
      bottom: -150px;
      right: -100px;
      animation: float 10s ease-in-out infinite reverse;
    }
    
    &.circle-3 {
      width: 200px;
      height: 200px;
      background: #2ecc71;
      top: 50%;
      right: 20%;
      animation: float 6s ease-in-out infinite 2s;
    }
  }
}

/* 登录表单 */
.login-form {
  width: 450px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  z-index: 1;
  position: relative;
  transform: translateY(0);
  animation: fadeInUp 0.8s ease-out;
}

/* 标题样式 */
.title-container {
  text-align: center;
  margin-bottom: 40px;
  
  .title {
    font-size: 28px;
    color: white;
    margin: 0 0 10px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  
  .subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

/* 表单项样式 */
.form-item-glass {
  margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: rgba(255, 255, 255, 0.25) !important;
  }
  
  .svg-container {
    padding: 0 15px;
    color: rgba(255, 255, 255, 0.7);
  }
}

/* 输入框样式 */
.glass-input {
  .el-input__inner {
    background: transparent !important;
    border: none !important;
    color: white !important;
    height: 48px;
    padding-left: 10px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5) !important;
    }
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.3);
    }
  }
}

/* 下拉框样式 */
.glass-select {
  width: 100%;
  
  .el-input__inner {
    background: rgba(255, 255, 255, 0.1) !important;
    border: none !important;
    color: white !important;
    height: 48px;
  }
  
  .el-select__caret {
    color: rgba(255, 255, 255, 0.7);
  }
}

/* 按钮组样式 */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  
  .el-button {
    flex: 1;
    height: 48px;
    border: none;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
    
    &:first-child {
      margin-right: 15px;
    }
  }
}

/* 登录按钮 */
.login-btn {
  background: linear-gradient(90deg, #3aaf85 0%, #2ecc71 100%);
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* 注册按钮 */
.register-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
}

/* 显示密码按钮 */
.show-pwd {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  
  &:hover {
    color: white;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
</style>