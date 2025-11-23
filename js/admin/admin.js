// 管理员页面功能模块
class AdminSystem {
    constructor() {
        this.currentPage = 1;
        this.usersPerPage = 10;
        this.init();
    }

    // 初始化系统
    init() {
        this.bindEvents();
        this.loadUserData();
        this.checkLoginStatus();
    }

    // 绑定事件
    bindEvents() {
        // 导航菜单点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // 退出登录
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // 添加用户按钮
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.showAddUserModal();
        });

        // 模态框关闭
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal('add-user-modal');
            });
        });

        // 确认添加用户
        document.getElementById('confirm-add-user').addEventListener('click', () => {
            this.addNewUser();
        });

        // 搜索功能
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchUsers();
        });

        // 分页按钮
        document.getElementById('prev-page').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.nextPage();
        });

        // 点击模态框外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal('add-user-modal');
            }
        });
    }

    // 检查登录状态
    checkLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.username || currentUser.role !== 'admin') {
            // 如果未登录或不是管理员，跳转到登录页
            window.location.href = 'login.html';
            return;
        }
        
        // 显示当前管理员信息
        document.getElementById('current-admin').textContent = currentUser.username;
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新导航激活状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 显示对应内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    // 显示添加用户模态框
    showAddUserModal() {
        document.getElementById('add-user-modal').classList.add('active');
        document.getElementById('add-user-form').reset();
    }

    // 隐藏模态框
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // 添加新用户
    async addNewUser() {
        try {
            const form = document.getElementById('add-user-form');
            const formData = new FormData(form);
            const userData = Object.fromEntries(formData);
    
            console.log('发送的用户数据:', userData); // 调试用
    
            const result = await window.apiService.addUser(userData);
    
            if (result.success) { 
                // 显示成功消息
                alert('用户添加成功！');
                // 关闭模态框
                this.hideModal('add-user-modal');
                // 清空表单
                form.reset();
                // 刷新用户列表
                this.loadUserData();
            } else {
                alert(`添加失败: ${result.message || '未知错误'}`);
            }
        } catch (error) {
            console.error('添加用户时发生错误:', error);
            alert('添加失败，请检查网络连接或联系管理员');
        }
    }

    // 加载用户数据
    async loadUserData() {
        try {
            const result = await window.apiService.getUsers();
            console.log('完整响应:', result);
            console.log('users 字段:', result.users);
            console.log('users 类型:', typeof result.users);
            console.log('是否是数组:', Array.isArray(result.users));
            
            if (result.success && Array.isArray(result.users)) {
                this.renderUserTable(result.users);
            } else {
                console.error('users 不是数组或为空');
            }
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    }
    // 渲染用户表格
    renderUserTable(users) {
        const tbody = document.getElementById('user-table-body');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            
            // 根据状态设置样式
            const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
            const statusText = user.status === 'active' ? '活跃' : '禁用';
            
            // 角色显示文本
            const roleText = {
                'admin': '管理员',
                'sales_manager': '销售经理',
                'customer_manager': '客户经理'
            }[user.role] || user.role;

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.displayName}</td>
                <td>${roleText}</td>
                <td>${user.email}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${user.createTime}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminSystem.editUser(${user.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminSystem.toggleUserStatus(${user.id})">
                        <i class="fas fa-power-off"></i> ${user.status === 'active' ? '禁用' : '启用'}
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        // 更新分页信息
        this.updatePaginationInfo();
    }

    // 搜索用户
    searchUsers() {
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        const roleFilter = document.getElementById('role-filter').value;
        
        // 实际项目中这里应该是API搜索
        console.log('搜索条件:', { searchTerm, roleFilter });
        
        // 模拟搜索后重新加载数据
        this.loadUserData();
    }

    // 编辑用户
    editUser(userId) {
        console.log('编辑用户:', userId);
        // 实际项目中这里应该打开编辑模态框
        alert(`编辑用户 ID: ${userId} - 功能开发中`);
    }

    // 切换用户状态
    toggleUserStatus(userId) {
        if (confirm('确定要切换该用户的状态吗？')) {
            console.log('切换用户状态:', userId);
            // 实际项目中这里应该是API调用
            alert('用户状态已更新！');
            this.loadUserData(); // 刷新列表
        }
    }

    // 上一页
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadUserData();
        }
    }

    // 下一页
    nextPage() {
        this.currentPage++;
        this.loadUserData();
    }

    // 更新分页信息
    updatePaginationInfo() {
        document.getElementById('page-info').textContent = `第 ${this.currentPage} 页，共 5 页`;
        
        // 更新按钮状态
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === 5;
    }

    // 退出登录
    logout() {
        if (confirm('确定要退出系统吗？')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }
}

// 页面加载完成后初始化系统
document.addEventListener('DOMContentLoaded', function() {
    window.adminSystem = new AdminSystem();
});

// 全局函数 - 供HTML中的onclick调用
window.editUser = function(userId) {
    window.adminSystem.editUser(userId);
};

window.toggleUserStatus = function(userId) {
    window.adminSystem.toggleUserStatus(userId);
};