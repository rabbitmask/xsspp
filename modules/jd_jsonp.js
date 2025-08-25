return new Promise((resolve) => {
  try {
    // 创建一个全局回调函数
    const callbackName = 'jdJsonpCallback_' + Math.floor(Math.random() * 1000000);
    window[callbackName] = function(data) {
      // 清理全局回调
      setTimeout(() => { delete window[callbackName]; }, 100);
      
      let result = '京东用户信息:\n';
      if (data && data.nick) {
        result += '登录状态: 已登录\n';
        result += '昵称: ' + data.nick + '\n';
        if (data.userLevel) result += '用户等级: ' + data.userLevel + '\n';
        if (data.userScoreVO && data.userScoreVO.userId) result += '用户ID: ' + data.userScoreVO.userId + '\n';
      } else {
        result += '登录状态: 未登录\n';
      }
      
      resolve(result);
    };
    
    // 创建JSONP请求
    const script = document.createElement('script');
    script.src = `https://passport.jd.com/user/petName/getUserInfoForMiniJd.action?callback=${callbackName}&_=${Date.now()}`;
    document.body.appendChild(script);
    
    // 设置超时处理
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        resolve('获取京东用户信息超时');
      }
    }, 5000);
  } catch (e) {
    resolve('获取京东用户信息失败: ' + e.message);
  }
});