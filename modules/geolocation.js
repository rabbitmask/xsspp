try {
  return new Promise((resolve) => {
    // 检查是否为安全源
    const isSecureOrigin = () => {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      
      // HTTPS 始终是安全的
      if (protocol === 'https:') return true;
      
      // localhost 和 127.0.0.1 在 HTTP 下也是安全的
      if (protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1')) return true;
      
      // 其他情况（如 IP 地址）在 HTTP 下不安全
      return false;
    };
    
    // 如果不是安全源，提供明确的错误信息
    if (!isSecureOrigin()) {
      resolve('安全限制：地理位置功能要求使用安全源（HTTPS 或 localhost）。\n' +
              '当前使用的是不安全源：' + window.location.origin + '\n' +
              '解决方案：\n' +
              '1. 使用 localhost 或 127.0.0.1 替代 IP 地址\n' +
              '2. 配置 HTTPS\n' +
              '3. 在 Chrome 中访问 chrome://flags/#unsafely-treat-insecure-origin-as-secure 并添加此网址');
      return;
    }
    
    // 检查浏览器是否支持地理位置API
    if (!navigator.geolocation) {
      resolve('您的浏览器不支持地理位置功能');
      return;
    }
    
    // 定义获取位置的选项
    const options = {
      enableHighAccuracy: true, // 尝试获取最精确的位置
      timeout: 10000,          // 10秒超时
      maximumAge: 0            // 不使用缓存的位置
    };
    
    // 成功回调
    function success(position) {
      // 获取坐标
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const altitude = position.coords.altitude;
      const altitudeAccuracy = position.coords.altitudeAccuracy;
      const heading = position.coords.heading;
      const speed = position.coords.speed;
      const timestamp = new Date(position.timestamp).toLocaleString();
      
      // 尝试获取地址信息
      try {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
          .then(response => response.json())
          .then(data => {
            // 构建结果
            let result = '位置信息:\n';
            result += `时间: ${timestamp}\n`;
            result += `纬度: ${latitude}\n`;
            result += `经度: ${longitude}\n`;
            result += `精确度: ${accuracy || '未知'} 米\n`;
            
            if (altitude !== null) {
              result += `海拔: ${altitude} 米\n`;
            }
            
            if (altitudeAccuracy !== null) {
              result += `海拔精确度: ${altitudeAccuracy} 米\n`;
            }
            
            if (heading !== null) {
              result += `方向: ${heading} 度\n`;
            }
            
            if (speed !== null) {
              result += `速度: ${speed} 米/秒\n`;
            }
            
            // 添加地址信息
            if (data && data.display_name) {
              result += '\n地址信息:\n';
              result += data.display_name;
            }
            
            resolve(result);
          })
          .catch(err => {
            // 如果地址解析失败，仍然返回坐标信息
            let result = '位置信息:\n';
            result += `时间: ${timestamp}\n`;
            result += `纬度: ${latitude}\n`;
            result += `经度: ${longitude}\n`;
            result += `精确度: ${accuracy || '未知'} 米\n`;
            
            if (altitude !== null) {
              result += `海拔: ${altitude} 米\n`;
            }
            
            resolve(result);
          });
      } catch (e) {
        // 如果地址解析出错，仍然返回坐标信息
        let result = '位置信息:\n';
        result += `时间: ${timestamp}\n`;
        result += `纬度: ${latitude}\n`;
        result += `经度: ${longitude}\n`;
        result += `精确度: ${accuracy || '未知'} 米\n`;
        
        if (altitude !== null) {
          result += `海拔: ${altitude} 米\n`;
        }
        
        resolve(result);
      }
    }
    
    // 错误回调
    function error(err) {
      let errorMessage = '';
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = '用户拒绝了位置请求';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = '位置信息不可用';
          break;
        case err.TIMEOUT:
          errorMessage = '获取位置请求超时';
          break;
        case err.UNKNOWN_ERROR:
          errorMessage = '发生未知错误';
          break;
      }
      
      resolve(`获取位置失败: ${errorMessage}`);
    }
    
    // 请求位置
    navigator.geolocation.getCurrentPosition(success, error, options);
  });
} catch (error) {
  return `获取位置时出错: ${error.message}`;
}