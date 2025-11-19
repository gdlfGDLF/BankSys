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
    addNewUser() {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        
        // 简单的表单验证
        const username = document.getElementById('new-username').value.trim();
        const displayName = document.getElementById('new-displayname').value.trim();
        const email = document.getElementById('new-email').value.trim();
        const role = document.getElementById('new-role').value;
        const password = document.getElementById('new-password').value;

        if (!username || !displayName || !email || !role || !password) {
            alert('请填写所有必填字段！');
            return;
        }

        // 模拟API调用 - 实际项目中这里应该是真实的API请求
        console.log('添加新用户:', {
            username,
            displayName,
            email,
            role,
            password: '***' // 实际中不应该记录明文密码
        });

        // 显示成功消息
        alert('用户添加成功！');
        
        // 关闭模态框
        this.hideModal('add-user-modal');
        
        // 刷新用户列表
        this.loadUserData();
    }

    // 加载用户数据
    loadUserData() {
        // 模拟用户数据 - 实际项目中这里应该是从API获取
        const mockUsers = [
            {
                id: 1,
                username: 'admin',
                displayName: '系统管理员',
                role: 'admin',
                email: 'admin@bank.com',
                status: 'active',
                createTime: '2024-01-01 10:00:00'
            },
            {
                id: 2,
                username: 'zhangsan',
                displayName: '张三',
                role: 'sales_manager',
                email: 'zhangsan@bank.com',
                status: 'active',
                createTime: '2024-01-10 14:30:00'
            },
            {
                id: 3,
                username: 'lisi',
                displayName: '李四',
                role: 'customer_manager',
                email: 'lisi@bank.com',
                status: 'inactive',
                createTime: '2024-01-12 09:15:00'
            },
            {
                id: 4,
                username: 'wangwu',
                displayName: '王五',
                role: 'customer_manager',
                email: 'wangwu@bank.com',
                status: 'active',
                createTime: '2024-01-15 16:45:00'
            }
        ];

        this.renderUserTable(mockUsers);
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