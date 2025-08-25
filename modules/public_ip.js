return new Promise((resolve) => {
  try {
    // 使用多个公共API服务来获取公网IP，以提高可靠性
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://api.ip.sb/jsonip',
      'https://api.myip.com',
      'https://ipinfo.io/json'
    ];
    
    // 随机选择一个服务以分散负载
    const serviceUrl = ipServices[Math.floor(Math.random() * ipServices.length)];
    
    fetch(serviceUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP错误，状态码: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // 不同服务返回的字段名不同，需要适配
        let ip = data.ip || data.query || data.YourFuckingIPAddress || '';
        
        if (!ip && data.IPv4) {
          ip = data.IPv4;
        }
        
        let result = '公网IP信息:\n';
        result += `IP地址: ${ip}\n`;
        
        // 添加额外信息（如果有）
        if (data.country) result += `国家/地区: ${data.country}\n`;
        if (data.city) result += `城市: ${data.city}\n`;
        if (data.region) result += `地区: ${data.region}\n`;
        if (data.loc) result += `坐标: ${data.loc}\n`;
        if (data.org) result += `组织: ${data.org}\n`;
        if (data.hostname) result += `主机名: ${data.hostname}\n`;
        if (data.timezone) result += `时区: ${data.timezone}\n`;
        
        resolve(result);
      })
      .catch(error => {
        // 如果第一个服务失败，尝试备用服务
        console.error('第一个IP服务失败，尝试备用服务', error);
        
        // 使用备用服务
        fetch('https://api64.ipify.org?format=json')
          .then(response => response.json())
          .then(data => {
            resolve(`公网IP信息:\nIP地址: ${data.ip}`);
          })
          .catch(backupError => {
            resolve(`获取公网IP失败: ${backupError.message}`);
          });
      });
  } catch (error) {
    resolve(`获取公网IP时出错: ${error.message}`);
  }
});