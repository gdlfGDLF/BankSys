// DOM元素
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const messageDiv = document.getElementById('message');

// 初始化函数
function init() {
    bindEvents();
    checkLoginStatus();
}

// 绑定事件
function bindEvents() {
    loginForm.addEventListener('submit', handleLogin);
}

// 处理登录 - 修改为调用后端API
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (!username || !password) {
        showMessage('请输入用户名和密码', 'error');
        return;
    }
    
    showMessage('正在登录...', 'info');
    
    try {
        // 调用后端API进行登录
        const loginTime = new Date().toISOString();
        const result = await window.apiService.login(username, password,loginTime);
        
        if (result.success) {
            const userInfo = {
                username: username,  // 使用前端输入的用户名
                role: result.role    // 使用后端返回的角色
            };
            loginSuccess(userInfo, result.token);
        } else {
            showMessage(result.error || '登录失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请检查服务器是否启动', 'error');
        console.error('登录异常:', error);
    }
}

// 登录成功处理 - 修改为使用后端返回的数据
function loginSuccess(userInfo, token) {
    showMessage(`登录成功！正在跳转到${userInfo.role}页面...`, 'success');
    
    // 保存用户信息和token
    saveUserInfo(userInfo, token);
    
    // 触发登录成功回调
    onLoginSuccess(userInfo);
    
    // 跳转到对应页面
    setTimeout(() => {
        redirectToDashboard(userInfo);
    }, 1500);
}

// 保存用户信息到localStorage - 修改为保存后端返回的数据
function saveUserInfo(userInfo, token) {
    localStorage.setItem('currentUser', JSON.stringify({
        username: username,
        role: userInfo.role,
        loginTime: new Date().toISOString()
    }));
    
    // 保存token（apiService会自动处理）
    if (token) {
        window.apiService.setToken(token);
    }
}

// 显示消息
function showMessage(message, type) {
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }, 3000);
}

// ========== 预留接口函数 ==========

// 登录成功后的回调（可被外部覆盖）
function onLoginSuccess(userInfo) {
    console.log('用户登录成功:', userInfo);
    
    // 预留接口：您可以在这里添加自定义逻辑
    if (typeof window.customLoginSuccess === 'function') {
        window.customLoginSuccess(userInfo);
    }
}

// 页面跳转逻辑（可被外部覆盖）
function redirectToDashboard(userInfo) {
    console.log('准备跳转到:', userInfo.role);
    
    // 根据角色跳转到不同页面
    switch(userInfo.role) {
        case 'admin':
            window.location.href = 'admin.html';
            break;
        case 'sales_manager':
            window.location.href = 'sales-manager.html';
            break;
        case 'customer_manager':
            window.location.href = 'customer-manager.html';
            break;
        default:
            window.location.href = 'login.html';
            break;
    }
}

// 检查登录状态
function checkLoginStatus() {
    const currentUser = getCurrentUser();
    if (currentUser && window.apiService.isLoggedIn()) {
        console.log('当前已登录用户:', currentUser);
        
        // 如果已经在登录页面，自动跳转到对应页面
        if (window.location.pathname.includes('login') || 
            window.location.pathname.endsWith('login.html')) {
            redirectToDashboard(currentUser);
        }
    }
}

// ========== 全局接口函数 ==========

// 获取当前用户信息
window.getCurrentUser = function() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
};

// 执行登录（可从外部调用）- 修改为调用API
window.performLogin = async function(username, password) {
    try {
        const result = await window.apiService.login(username, password);
        if (result.success) {
            loginSuccess(result.user, result.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('登录失败:', error);
        return false;
    }
};

// 退出登录 - 修改为调用API
window.logout = async function() {
    try {
        await window.apiService.logout();
        localStorage.removeItem('currentUser');
        showMessage('已成功退出登录', 'success');
        
        // 跳转到登录页
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('退出登录失败:', error);
        // 即使API调用失败，也清除本地数据
        localStorage.removeItem('currentUser');
        window.apiService.clearToken();
        window.location.href = 'login.html';
    }
};

// 检查是否已登录
window.isLoggedIn = function() {
    return window.apiService.isLoggedIn() && !!getCurrentUser();
};

// 初始化应用 - 只保留这一个初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保apiService已加载
    if (typeof window.apiService === 'undefined') {
        console.error('apiService未加载，请确保api-service.js在login.js之前引入');
        showMessage('系统初始化失败，请刷新页面', 'error');
        return;
    }
    
    console.log('API服务已加载，开始初始化登录页面');
    init();
});