// 全局变量
let currentEditingId = null;
let opportunities = [];
let developmentPlans = [];

// DOM元素
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

const marketingPage = document.getElementById('marketingPage');
const developmentPage = document.getElementById('developmentPage');
const navLinks = document.querySelectorAll('.nav-link');

const opportunityTableBody = document.getElementById('opportunityTableBody');
const developmentTableBody = document.getElementById('developmentTableBody');

const opportunityModal = document.getElementById('opportunityModal');
const developmentModal = document.getElementById('developmentModal');
const opportunityForm = document.getElementById('opportunityForm');
const developmentForm = document.getElementById('developmentForm');
const opportunityModalTitle = document.getElementById('opportunityModalTitle');
const developmentModalTitle = document.getElementById('developmentModalTitle');

const addOpportunityBtn = document.getElementById('addOpportunityBtn');
const addDevelopmentBtn = document.getElementById('addDevelopmentBtn');
const closeOpportunityModal = document.getElementById('closeOpportunityModal');
const closeDevelopmentModal = document.getElementById('closeDevelopmentModal');
const cancelOpportunityBtn = document.getElementById('cancelOpportunityBtn');
const cancelDevelopmentBtn = document.getElementById('cancelDevelopmentBtn');
const saveOpportunityBtn = document.getElementById('saveOpportunity');
const saveDevelopmentBtn = document.getElementById('saveDevelopment');

const searchOpportunityInput = document.getElementById('searchOpportunityInput');
const searchOpportunityBtn = document.getElementById('searchOpportunityBtn');
const searchDevelopmentInput = document.getElementById('searchDevelopmentInput');
const searchDevelopmentBtn = document.getElementById('searchDevelopmentBtn');

// 初始化函数
function init() {
    checkLoginStatus();
    // 绑定事件监听器
    bindEvents();
    // 加载初始数据
    loadOpportunities();
    loadDevelopmentPlans();
}
function checkLoginStatus()
{
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.username || currentUser.role !== 'sales_manager') {
            // 如果未登录或不是管理员，跳转到登录页
            window.location.href = 'login.html';
            return false;
        }
        
        // 显示当前管理员信息
        document.getElementById('currentUser').textContent = currentUser.username;
}

// 绑定事件监听器
function bindEvents() {
    // 退出登录
    logoutBtn.addEventListener('click', handleLogout);
    
    // 导航链接点击
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // 添加按钮点击
    addOpportunityBtn.addEventListener('click', () => openOpportunityModal(false));
    addDevelopmentBtn.addEventListener('click', () => openDevelopmentModal(false));
    
    // 模态框关闭按钮
    closeOpportunityModal.addEventListener('click', closeOpportunityModalFunc);
    closeDevelopmentModal.addEventListener('click', closeDevelopmentModalFunc);
    cancelOpportunityBtn.addEventListener('click', closeOpportunityModalFunc);
    cancelDevelopmentBtn.addEventListener('click', closeDevelopmentModalFunc);
    
    // 保存按钮
    saveOpportunityBtn.addEventListener('click', saveOpportunity);
    saveDevelopmentBtn.addEventListener('click', saveDevelopment);
    
    // 搜索按钮
    searchOpportunityBtn.addEventListener('click', searchOpportunities);
    searchDevelopmentBtn.addEventListener('click', searchDevelopmentPlans);
    
    // 搜索框回车键
    searchOpportunityInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchOpportunities();
    });
    
    searchDevelopmentInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchDevelopmentPlans();
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            // 关闭所有模态框
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// 处理退出登录
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除登录状态
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        // 在实际应用中，这里应该重定向到登录页面
        alert('已退出登录');
    }
}

// 处理导航点击
function handleNavClick(e) {
    e.preventDefault();
    
    const targetPage = e.target.getAttribute('data-page');
    
    // 更新活动导航链接
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // 显示对应页面
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(`${targetPage}Page`).classList.add('active');
}

// ==================== 营销机会管理功能 ====================

// 加载营销机会数据
async function loadOpportunities() {
    try {
        // 调用API获取营销机会数据
        opportunities = await getOpportunities();
        renderOpportunityTable();
    } catch (error) {
        console.error('加载营销机会数据失败:', error);
        showMessage('加载营销机会数据失败', 'error');
    }
}

// 渲染营销机会表格
function renderOpportunityTable(data = opportunities) {
    opportunityTableBody.innerHTML = '';
    
    if (data.length === 0) {
        opportunityTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">暂无数据</td></tr>';
        return;
    }
    
    data.forEach(opportunity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${opportunity.Qdyh_ID}</td>
            <td>${opportunity.Qdyh_Name}</td>
            <td>${opportunity.Qdyh_Jhly}</td>
            <td>${opportunity.Qdyh_Tel}</td>
            <td>${opportunity.Qdyh_Fzr}</td>
            <td>${opportunity.Qdyh_Jl}</td>
            <td>${opportunity.Qdyh_Khdj}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm edit-opportunity-btn" data-id="${opportunity.Qdyh_ID}">编辑</button>
                <button class="btn btn-danger btn-sm delete-opportunity-btn" data-id="${opportunity.Qdyh_ID}">删除</button>
            </td>
        `;
        opportunityTableBody.appendChild(row);
    });
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.edit-opportunity-btn').forEach(btn => {
        btn.addEventListener('click', handleEditOpportunity);
    });
    
    document.querySelectorAll('.delete-opportunity-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteOpportunity);
    });
}
// 打开营销机会模态框
function openOpportunityModal(isEdit = false, id = null) {
    currentEditingId = id;
    opportunityModalTitle.textContent = isEdit ? '编辑营销机会' : '添加营销机会';
    opportunityModal.style.display = 'flex';
    
    if (isEdit && id) {
        // 编辑模式：从后端加载数据
        loadOpportunityDetail(id);
    } else {
        // 添加模式：清空表单
        opportunityForm.reset();
       
    }
}
// 关闭营销机会模态框
function closeOpportunityModalFunc() {
    opportunityModal.style.display = 'none';
    currentEditingId = null;
}

// 处理编辑营销机会
function handleEditOpportunity(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    openOpportunityModal(true, id);
}

// 处理删除营销机会
async function handleDeleteOpportunity(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    if (confirm('确定要删除这条营销机会吗？')) {
        try {
            await deleteOpportunity(id);
            opportunities = opportunities.filter(item => item.Qdyh_ID !== id);
            renderOpportunityTable();
            showMessage('删除成功', 'success');
        } catch (error) {
            console.error('删除营销机会失败:', error);
            showMessage('删除失败', 'error');
        }
    }
}

// 保存营销机会
async function saveOpportunity() {
    // 使用 FormData 获取表单数据（包含隐藏的 Qdyh_ID 字段）
    const form = document.getElementById('opportunityForm');
    const formData = new FormData(form);
    const oppdata = Object.fromEntries(formData);
    
    // 验证必填字段
    if (!oppdata.Qdyh_Name || oppdata.Qdyh_Name.trim() === '') {
        showMessage('客户名称是必填项！', 'error');
        return;
    }
    
    try {
        if (currentEditingId) {
            // 编辑现有记录 - 调用后端更新API
            const result = await window.apiService.updateOpportunity(currentEditingId, oppdata);
            
            if (result.success) {
                // 更新本地数据
                const index = opportunities.findIndex(item => item.Qdyh_ID === currentEditingId);
                if (index !== -1) {
                    opportunities[index] = { ...opportunities[index], ...oppdata };
                }
                showMessage('更新成功', 'success');
                renderOpportunityTable();
                closeOpportunityModalFunc();
            } else {
                showMessage('更新失败: ' + (result.message || '未知错误'), 'error');
            }
        } else {
            // 添加新记录 - 调用你的 createOpportunity 函数
            await createOpportunity(oppdata);
        }
    } catch (error) {
        console.error('保存营销机会失败:', error);
        showMessage('保存失败，请检查网络连接或联系管理员', 'error');
    }
}

// 搜索营销机会
async function searchOpportunities() {
    const keyword = searchOpportunityInput.value.toLowerCase().trim();
    
    if (!keyword) {
        await loadOpportunities();
        return;
    }
    
    try {
        const searchResults = await searchOpportunitiesAPI(keyword);
        renderOpportunityTable(searchResults);
    } catch (error) {
        console.error('搜索营销机会失败:', error);
        showMessage('搜索失败', 'error');
    }
}

// ==================== 客户开发计划功能 ====================

// 加载客户开发计划数据
async function loadDevelopmentPlans() {
    try {
        developmentPlans = await getDevelopmentPlans();
        renderDevelopmentTable();
    } catch (error) {
        console.error('加载客户开发计划数据失败:', error);
        showMessage('加载客户开发计划数据失败', 'error');
    }
}

// 渲染客户开发计划表格
function renderDevelopmentTable(data = developmentPlans) {
    developmentTableBody.innerHTML = '';
    
    if (data.length === 0) {
        developmentTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">暂无数据</td></tr>';
        return;
    }
    
    data.forEach(plan => {
        const statusClass = getStatusClass(plan.Dev_Status);
        const archiveClass = plan.Dev_ArchiveStatus === '已归档' ? 'status-info' : 'status-warning';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${plan.Dev_ID}</td>
            <td>${plan.Dev_Name}</td>
            <td>${plan.Dev_Summary}</td>
            <td>${plan.Dev_Contact}</td>
            <td><span class="status-badge ${statusClass}">${plan.Dev_Status}</span></td>
            <td>${plan.Dev_SuccessRate}</td>
            <td><span class="status-badge ${archiveClass}">${plan.Dev_ArchiveStatus}</span></td>
            <td class="actions">
                <button class="btn btn-primary btn-sm edit-development-btn" data-id="${plan.Dev_ID}">编辑</button>
                <button class="btn btn-danger btn-sm delete-development-btn" data-id="${plan.Dev_ID}">删除</button>
                <button class="btn btn-warning btn-sm archive-development-btn" data-id="${plan.Dev_ID}">${plan.Dev_ArchiveStatus === '已归档' ? '取消归档' : '归档'}</button>
            </td>
        `;
        developmentTableBody.appendChild(row);
    });
    
    // 添加编辑、删除和归档事件监听
    document.querySelectorAll('.edit-development-btn').forEach(btn => {
        btn.addEventListener('click', handleEditDevelopment);
    });
    
    document.querySelectorAll('.delete-development-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteDevelopment);
    });
    
    document.querySelectorAll('.archive-development-btn').forEach(btn => {
        btn.addEventListener('click', handleArchiveDevelopment);
    });
}

// 获取状态对应的CSS类
function getStatusClass(status) {
    switch(status) {
        case '开发成功':
            return 'status-success';
        case '开发失败':
            return 'status-danger';
        case '进行中':
            return 'status-warning';
        default:
            return 'status-info';
    }
}

// 打开客户开发计划模态框
function openDevelopmentModal(isEdit = false, id = null) {
    currentEditingId = id;
    developmentModalTitle.textContent = isEdit ? '编辑客户开发计划' : '添加客户开发计划';
    developmentModal.style.display = 'flex';
    
    if (isEdit && id) {
        const plan = developmentPlans.find(item => item.Dev_ID === id);
        if (plan) {
            document.getElementById('Dev_Name').value = plan.Dev_Name;
            document.getElementById('Dev_Contact').value = plan.Dev_Contact;
            document.getElementById('Dev_Summary').value = plan.Dev_Summary;
            document.getElementById('Dev_Status').value = plan.Dev_Status;
            document.getElementById('Dev_SuccessRate').value = plan.Dev_SuccessRate;
            document.getElementById('Dev_ArchiveStatus').value = plan.Dev_ArchiveStatus;
            document.getElementById('Dev_Plan').value = plan.Dev_Plan;
            document.getElementById('Dev_Effect').value = plan.Dev_Effect;
        }
    } else {
        developmentForm.reset();
    }
}

// 关闭客户开发计划模态框
function closeDevelopmentModalFunc() {
    developmentModal.style.display = 'none';
    currentEditingId = null;
}

// 处理编辑客户开发计划
function handleEditDevelopment(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    openDevelopmentModal(true, id);
}

// 处理删除客户开发计划
async function handleDeleteDevelopment(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    if (confirm('确定要删除这个客户开发计划吗？')) {
        try {
            await deleteDevelopmentPlan(id);
            developmentPlans = developmentPlans.filter(item => item.Dev_ID !== id);
            renderDevelopmentTable();
            showMessage('删除成功', 'success');
        } catch (error) {
            console.error('删除客户开发计划失败:', error);
            showMessage('删除失败', 'error');
        }
    }
}

// 处理归档客户开发计划
async function handleArchiveDevelopment(e) {
    const id = parseInt(e.target.getAttribute('data-id'));
    const plan = developmentPlans.find(item => item.Dev_ID === id);
    
    if (plan) {
        try {
            const newArchiveStatus = plan.Dev_ArchiveStatus === '已归档' ? '未归档' : '已归档';
            await updateDevelopmentPlan(id, { ...plan, Dev_ArchiveStatus: newArchiveStatus });
            
            plan.Dev_ArchiveStatus = newArchiveStatus;
            renderDevelopmentTable();
            showMessage('操作成功', 'success');
        } catch (error) {
            console.error('归档操作失败:', error);
            showMessage('操作失败', 'error');
        }
    }
}

// 保存客户开发计划
async function saveDevelopment() {
    const formData = {
        Dev_Name: document.getElementById('Dev_Name').value,
        Dev_Contact: document.getElementById('Dev_Contact').value,
        Dev_Summary: document.getElementById('Dev_Summary').value,
        Dev_Status: document.getElementById('Dev_Status').value,
        Dev_SuccessRate: document.getElementById('Dev_SuccessRate').value,
        Dev_ArchiveStatus: document.getElementById('Dev_ArchiveStatus').value,
        Dev_Plan: document.getElementById('Dev_Plan').value,
        Dev_Effect: document.getElementById('Dev_Effect').value
    };
    
    if (!formData.Dev_Name) {
        showMessage('客户名称是必填项！', 'error');
        return;
    }
    
    try {
        if (currentEditingId) {
            // 编辑现有记录
            await updateDevelopmentPlan(currentEditingId, formData);
            const index = developmentPlans.findIndex(item => item.Dev_ID === currentEditingId);
            if (index !== -1) {
                developmentPlans[index] = { ...developmentPlans[index], ...formData };
            }
            showMessage('更新成功', 'success');
        } else {
            // 添加新记录
            const newPlan = await createDevelopmentPlan(formData);
            developmentPlans.push(newPlan);
            showMessage('添加成功', 'success');
        }
        
        renderDevelopmentTable();
        closeDevelopmentModalFunc();
    } catch (error) {
        console.error('保存客户开发计划失败:', error);
        showMessage('保存失败', 'error');
    }
}

// 搜索客户开发计划
async function searchDevelopmentPlans() {
    const keyword = searchDevelopmentInput.value.toLowerCase().trim();
    
    if (!keyword) {
        await loadDevelopmentPlans();
        return;
    }
    
    try {
        const searchResults = await searchDevelopmentPlansAPI(keyword);
        renderDevelopmentTable(searchResults);
    } catch (error) {
        console.error('搜索客户开发计划失败:', error);
        showMessage('搜索失败', 'error');
    }
}

// ==================== 工具函数 ====================

// 显示消息
function showMessage(message, type = 'info') {
    // 移除现有的消息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
    `;
    
    // 设置背景色
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    messageEl.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// ==================== API接口函数 - 需要根据实际API实现 ====================

// 营销机会API
async function getOpportunities() {
    // 实现获取营销机会列表的API调用
    // 返回示例数据
    return [
        {
            Qdyh_ID: 1,
            Qdyh_Name: "北京科技有限公司",
            Qdyh_Jhly: "客户推荐",
            Qdyh_Tel: "13800138000",
            Qdyh_Gy: "企业信息化系统升级",
            Qdyh_Fzr: "张经理",
            Qdyh_Jl: "70%",
            Qdyh_Khdj: "A类客户",
            Qdyh_Address: "北京市海淀区",
            Qdyh_Jhms: "客户计划升级现有信息化系统，需要定制开发",
            Qdyh_Jhzp: "销售一部"
        }
    ];
}

async function createOpportunity(data) {
    const form = document.getElementById('opportunityForm');
    const formData = new FormData(form);
    const oppdata = Object.fromEntries(formData);
    
    try {
        const result = await window.apiService.addOpportunity(data);
        if (result.success) { 
            // 显示成功消息
            alert('用户添加成功！');
            // 关闭模态框
        } else {
            alert(`添加失败: ${result.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('添加用户时发生错误:', error);
        alert('添加失败，请检查网络连接或联系管理员');
    }
}

async function updateOpportunity(id, data) {
    // 实现更新营销机会的API调用
    return { success: true };
}

async function deleteOpportunity(id) {
    // 实现删除营销机会的API调用
    return { success: true };
}

async function searchOpportunitiesAPI(keyword) {
    // 实现搜索营销机会的API调用
    return opportunities.filter(opportunity => 
        opportunity.Qdyh_Name.toLowerCase().includes(keyword) ||
        opportunity.Qdyh_Jhly.toLowerCase().includes(keyword) ||
        opportunity.Qdyh_Fzr.toLowerCase().includes(keyword)
    );
}

// 客户开发计划API
async function getDevelopmentPlans() {
    // 实现获取客户开发计划列表的API调用
    // 返回示例数据
    return [
        {
            Dev_ID: 1,
            Dev_Name: "北京科技有限公司",
            Dev_Contact: "王先生",
            Dev_Summary: "企业信息化系统升级",
            Dev_Status: "进行中",
            Dev_SuccessRate: "70%",
            Dev_ArchiveStatus: "未归档",
            Dev_Plan: "一定要成功开发此客户，通过技术演示和案例展示赢得信任",
            Dev_Effect: "初步接触效果良好，客户对方案表示兴趣"
        }
    ];
}

async function createDevelopmentPlan(data) {
    // 实现创建客户开发计划的API调用
    // 返回创建后的数据（包含ID）
    return { Dev_ID: Date.now(), ...data };
}

async function updateDevelopmentPlan(id, data) {
    // 实现更新客户开发计划的API调用
    return { success: true };
}

async function deleteDevelopmentPlan(id) {
    // 实现删除客户开发计划的API调用
    return { success: true };
}

async function searchDevelopmentPlansAPI(keyword) {
    // 实现搜索客户开发计划的API调用
    return developmentPlans.filter(plan => 
        plan.Dev_Name.toLowerCase().includes(keyword) ||
        plan.Dev_Summary.toLowerCase().includes(keyword) ||
        plan.Dev_Contact.toLowerCase().includes(keyword)
    );
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);