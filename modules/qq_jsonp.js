return new Promise((resolve) => {
  try {
    // 创建一个全局回调函数
    const callbackName = 'qqJsonpCallback_' + Math.floor(Math.random() * 1000000);
    window[callbackName] = function(data) {
      // 清理全局回调
      setTimeout(() => { delete window[callbackName]; }, 100);
      
      let result = 'QQ用户信息:\n';
      if (data && data.result === 0) {
        result += '登录状态: 已登录\n';
        if (data.nick) result += '昵称: ' + data.nick + '\n';
        if (data.uin) result += 'QQ号: ' + data.uin + '\n';
        if (data.headImgUrl) result += '头像: ' + data.headImgUrl + '\n';
      } else {
        result += '登录状态: 未登录\n';
      }
      
      resolve(result);
    };
    
    // 创建JSONP请求
    const script = document.createElement('script');
    script.src = `https://qfwd.qq.com/?g_tk=&ptlang=2052&callback=${callbackName}`;
    document.body.appendChild(script);
    
    // 设置超时处理
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        resolve('获取QQ用户信息超时');
      }
    }, 5000);
  } catch (e) {
    resolve('获取QQ用户信息失败: ' + e.message);
  }
});