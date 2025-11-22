// api-service.js - 前端调用后端的服务
// 防止重复加载
if (window.apiService) {
    throw new Error('ApiService already loaded');
}
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000'; // HTTP代理服务器地址
        this.token = localStorage.getItem('adminToken');
    }

    // 统一的请求头
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // 统一的错误处理
    handleError(error) {
        console.error('API请求错误:', error);
        return {
            success: false,
            error: error.message || '网络请求失败'
        };
    }

    // ========== 用户认证接口 ==========
    async login(username, password,LoginTime) {
        try {
            console.log('发送登录请求:', { username, password });
            
            const response = await fetch(`${this.baseURL}/api/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ username, password,LoginTime})
            });
            
            const result = await response.json();
            console.log('登录响应:', result);
            
            if (result.success && result.token) {
                this.setToken(result.token);
            }
            
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.baseURL}/api/logout`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            
            const result = await response.json();
            this.clearToken();
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }


    
    // ========== 用户管理接口 ==========
    async getUsers(page = 1, limit = 10, search = '', role = '') {
        try {
            const params = new URLSearchParams({ 
                page: page.toString(), 
                limit: limit.toString(),
                search: search,
                role: role
            });
            
            console.log('获取用户列表:', { page, limit, search, role });
            
            const response = await fetch(`${this.baseURL}/api/admin/users?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const result = await response.json();
            console.log('用户列表响应:', result);
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async addUser(userData) {
        try {
            console.log('添加用户:', userData);
            
            const response = await fetch(`${this.baseURL}/api/admin/users`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            console.log('添加用户响应:', result);
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateUser(userId, userData) {
        try {
            console.log('更新用户:', userId, userData);
            
            const response = await fetch(`${this.baseURL}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async deleteUser(userId) {
        try {
            console.log('删除用户:', userId);
            
            const response = await fetch(`${this.baseURL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ========== Token管理 ==========
    setToken(token) {
        this.token = token;
        localStorage.setItem('adminToken', token);
        console.log('Token已保存:', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('adminToken');
        console.log('Token已清除');
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.token;
    }

    // 获取当前用户信息（从token解析或从localStorage）
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // 保存用户信息
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

window.apiService = new ApiService();