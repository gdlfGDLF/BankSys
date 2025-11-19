


// http-proxy.js - 包含所有API路由
const express = require('express');
const net = require('net');

const app = express();

app.use((req, res, next) => {
    // 允许所有来源访问（生产环境应该指定具体域名）
    res.header('Access-Control-Allow-Origin', '*');
    // 允许的请求头
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    // 允许的HTTP方法
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    // 允许携带凭证（如cookies）
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 处理预检请求（OPTIONS）
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.json());


// 添加健康检查路由
app.get('/health', (req, res) => {
    console.log('✅ 健康检查请求');
    res.json({ 
        status: 'HTTP代理服务器运行正常',
        server: 'Bank CRM System Proxy',
        timestamp: new Date().toISOString(),
        port: 3000
    });
});
// 测试C++服务器连接的路由
app.get('/test-tcp', (req, res) => {
    console.log('🧪 测试TCP连接');
    
    const tcpClient = new net.Socket();
    const testData = {
        action: 'test_connection',
        data: { test: 'connection' }
    };
    
    // 修改这一行：将 'localhost' 改为 '127.0.0.1'
    tcpClient.connect(8080, '127.0.0.1', () => {
        console.log('✅ 连接到C++ TCP服务器');
        tcpClient.write(JSON.stringify(testData));
    });
    
    let responseData = '';
    tcpClient.on('data', (data) => {
        responseData += data.toString();
        console.log('📥 收到TCP响应:', responseData);
        
        try {
            const jsonResponse = JSON.parse(responseData);
            res.json({
                http_status: 'connected',
                tcp_status: 'connected',
                response: jsonResponse
            });
        } catch (e) {
            res.json({
                http_status: 'connected',
                tcp_status: 'connected_but_invalid_json',
                raw_response: responseData
            });
        }
        tcpClient.destroy();
    });
    
    tcpClient.on('error', (error) => {
        console.error('❌ TCP连接失败:', error.message);
        res.json({
            http_status: 'connected',
            tcp_status: 'disconnected',
            error: error.message
        });
    });
    
    setTimeout(() => {
        if (!tcpClient.destroyed) {
            tcpClient.destroy();
            res.json({
                http_status: 'connected', 
                tcp_status: 'timeout',
                error: 'TCP连接超时'
            });
        }
    }, 5000);
});



// ========== 认证相关路由 ==========
app.post('/api/login', (req, res) => {
    forwardToTCP('user_login', req.body, null, res);
});

app.post('/api/logout', (req, res) => {
    forwardToTCP('user_logout', {}, req.headers, res);
});

// ========== 用户管理路由 ==========
app.get('/api/admin/users', (req, res) => {
    forwardToTCP('get_users', { ...req.query }, req.headers, res);
});

app.post('/api/admin/users', (req, res) => {
    forwardToTCP('add_user', req.body, req.headers, res);
});

app.put('/api/admin/users/:id', (req, res) => {
    forwardToTCP('update_user', { id: req.params.id, ...req.body }, req.headers, res);
});

app.delete('/api/admin/users/:id', (req, res) => {
    forwardToTCP('delete_user', { id: req.params.id }, req.headers, res);
});

app.patch('/api/admin/users/:id/status', (req, res) => {
    forwardToTCP('toggle_user_status', { id: req.params.id, ...req.body }, req.headers, res);
});

// ========== 角色管理路由 ==========
app.get('/api/admin/roles', (req, res) => {
    forwardToTCP('get_roles', {}, req.headers, res);
});

app.put('/api/admin/roles/:id/permissions', (req, res) => {
    forwardToTCP('update_role_permissions', { id: req.params.id, ...req.body }, req.headers, res);
});

// ========== 系统管理路由 ==========
app.get('/api/admin/system-logs', (req, res) => {
    forwardToTCP('get_system_logs', { ...req.query }, req.headers, res);
});

app.get('/api/admin/system-settings', (req, res) => {
    forwardToTCP('get_system_settings', {}, req.headers, res);
});

app.put('/api/admin/system-settings', (req, res) => {
    forwardToTCP('update_system_settings', req.body, req.headers, res);
});

// ========== 统一的TCP转发函数 ==========
function forwardToTCP(action, data, headers, res) {
    const tcpClient = new net.Socket();
    const requestData = {
        action: action,
        data: data,
        token: headers?.authorization?.replace('Bearer ', '')
    };
    
    console.log('转发请求到TCP服务器:', action);
    
    // 修改这一行：将 'localhost' 改为 '127.0.0.1'
    tcpClient.connect(8080, '127.0.0.1', () => {
        tcpClient.write(JSON.stringify(requestData));
    });
    
    let responseData = '';
    tcpClient.on('data', (data) => {
        responseData += data.toString();
        if (isJsonComplete(responseData)) {
            try {
                const jsonResponse = JSON.parse(responseData);
                console.log('收到TCP响应:', action, jsonResponse.success ? '成功' : '失败');
                res.json(jsonResponse);
            } catch (e) {
                console.error('响应解析失败:', e);
                res.status(500).json({error: '响应解析失败'});
            }
            tcpClient.destroy();
        }
    });
    
    tcpClient.on('error', (error) => {
        console.error('TCP连接失败:', error);
        res.status(500).json({error: 'TCP连接失败'});
    });
    
    // 设置超时
    setTimeout(() => {
        if (!tcpClient.destroyed) {
            tcpClient.destroy();
            res.status(504).json({error: '请求超时'});
        }
    }, 10000);
}

function isJsonComplete(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// 启动服务器
app.listen(3000, () => {
    console.log('🚀 HTTP代理服务器运行在 http://localhost:3000');
    console.log('📡 支持CORS跨域访问');
    console.log('🔗 等待连接到C++ TCP服务器 (127.0.0.1:8080)...');
});