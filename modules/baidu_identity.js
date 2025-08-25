// 记录开始时间
const startTime = new Date().toLocaleString();

// 创建一个唯一的回调函数名
const callbackName = 'baiduCallback_' + Date.now();

// 定义全局回调函数
window[callbackName] = function(data) {
  try {
    // 记录接收到数据的时间
    const receiveTime = new Date().toLocaleString();
    
    // 将数据转换为字符串
    const dataStr = JSON.stringify(data, null, 2);
    
    // 在控制台输出
    console.log('百度返回数据:', data);
    
    // 存储结果
    window._baiduResult = '百度返回数据时间: ' + receiveTime + '\n';
    if (data && data.data) {
      window._baiduResult += '用户名: ' + (data.data.uname || '未知') + '\n';
      window._baiduResult += 'UID: ' + (data.data.uid || '未知') + '\n';
      window._baiduResult += '登录状态: ' + (data.data.is_login ? '已登录' : '未登录');
    } else {
      window._baiduResult += '未获取到用户数据';
    }
  } catch(e) {
    window._baiduResult = '处理返回数据时出错: ' + e.message;
    console.error('处理返回数据时出错:', e);
  }
};

// 创建一个不可见的div用于放置script
const container = document.createElement('div');
container.style.display = 'none';
document.body.appendChild(container);

// 创建meta标签模拟Referer
const meta = document.createElement('meta');
meta.name = 'referrer';
meta.content = 'no-referrer-when-downgrade';
document.head.appendChild(meta);

// 创建script标签
const script = document.createElement('script');
script.src = 'https://yuedu.baidu.com/nauser/getyduserinfo?na_uncheck=1&opid=wk_na&callback=' + callbackName + '&_=' + Date.now();
container.appendChild(script);

// 创建全局变量存储结果
window._baiduResult = '等待响应...';

// 设置一个定时器，3秒后返回结果
return new Promise(function(resolve) {
  setTimeout(function() {
    // 清理资源
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    if (document.head.contains(meta)) {
      document.head.removeChild(meta);
    }
    delete window[callbackName];
    
    resolve('请求发起时间: ' + startTime + '\n\n' + window._baiduResult);
  }, 3000);
});