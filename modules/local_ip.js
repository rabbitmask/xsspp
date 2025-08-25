return new Promise((resolve) => {
  try {
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
      resolve('安全限制：内网IP获取功能要求使用安全源（HTTPS 或 localhost）。\n' +
              '当前使用的是不安全源：' + window.location.origin + '\n' +
              '解决方案：\n' +
              '1. 使用 localhost 或 127.0.0.1 替代 IP 地址\n' +
              '2. 配置 HTTPS\n' +
              '3. 在 Chrome 中访问 chrome://flags/#unsafely-treat-insecure-origin-as-secure 并添加此网址');
      return;
    }

    // 使用WebRTC技术获取内网IP
    const getLocalIPs = () => {
      return new Promise((resolve, reject) => {
        // 兼容性检查
        if (!window.RTCPeerConnection) {
          reject(new Error('此浏览器不支持WebRTC'));
          return;
        }
        
        const ips = new Set();
        const pc = new RTCPeerConnection({
          iceServers: []  // 不使用STUN/TURN服务器，只获取本地IP
        });
        
        // 创建数据通道触发ICE收集
        pc.createDataChannel('');
        
        // 监听ICE候选者
        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            // ICE收集完成
            pc.close();
            if (ips.size === 0) {
              reject(new Error('未能获取到内网IP地址'));
            } else {
              resolve(Array.from(ips));
            }
            return;
          }
          
          // 从候选者中提取IP地址
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
          const match = ipRegex.exec(event.candidate.candidate);
          if (match) {
            const ip = match[1];
            
            // 过滤掉公网IP和特殊IP
            if (ip.startsWith('10.') || 
                ip.startsWith('192.168.') || 
                ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) || 
                ip === '127.0.0.1') {
              ips.add(ip);
            }
          }
        };
        
        // 创建offer以启动ICE收集
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(err => reject(err));
          
        // 设置超时
        setTimeout(() => {
          if (pc.iceConnectionState !== 'closed') {
            pc.close();
            if (ips.size === 0) {
              reject(new Error('获取内网IP超时'));
            } else {
              resolve(Array.from(ips));
            }
          }
        }, 3000);
      });
    };
    
    // 尝试获取网络接口信息（仅在支持的浏览器中）
    const getNetworkInterfaces = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.connection) {
          reject(new Error('此浏览器不支持Network Information API'));
          return;
        }
        
        const networkInfo = {
          effectiveType: navigator.connection.effectiveType || '未知',
          downlink: navigator.connection.downlink || '未知',
          rtt: navigator.connection.rtt || '未知',
          saveData: navigator.connection.saveData || false
        };
        
        resolve(networkInfo);
      });
    };
    
    // 执行IP获取
    getLocalIPs()
      .then(ips => {
        let result = '内网IP信息:\n';
        
        if (ips.length > 0) {
          result += '检测到的内网IP地址:\n';
          ips.forEach(ip => {
            result += `- ${ip}\n`;
          });
        } else {
          result += '未检测到内网IP地址\n';
        }
        
        // 尝试获取额外的网络信息
        getNetworkInterfaces()
          .then(networkInfo => {
            result += '\n网络连接信息:\n';
            result += `连接类型: ${networkInfo.effectiveType}\n`;
            result += `下行速度: ${networkInfo.downlink} Mbps\n`;
            result += `往返时间: ${networkInfo.rtt} ms\n`;
            result += `省流模式: ${networkInfo.saveData ? '开启' : '关闭'}\n`;
            
            resolve(result);
          })
          .catch(() => {
            // 如果获取网络信息失败，仍然返回IP信息
            resolve(result);
          });
      })
      .catch(error => {
        // 尝试使用替代方法
        resolve(`获取内网IP失败: ${error.message}\n` +
                '注意: 现代浏览器出于安全考虑限制了内网IP的获取。');
      });
  } catch (error) {
    resolve(`获取内网IP时出错: ${error.message}`);
  }
});