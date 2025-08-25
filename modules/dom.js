try { 
  const info = { 
    title: document.title, 
    url: window.location.href, 
    domain: window.location.hostname, 
    protocol: window.location.protocol, 
    forms: document.forms.length, 
    inputs: document.querySelectorAll('input').length, 
    links: document.querySelectorAll('a').length, 
    images: document.querySelectorAll('img').length, 
    scripts: document.querySelectorAll('script').length, 
    viewport: window.innerWidth + 'x' + window.innerHeight, 
    scroll: window.scrollX + ',' + window.scrollY, 
    userAgent: navigator.userAgent.substring(0, 100) + '...' 
  }; 
  
  let result = '页面基本信息:\n'; 
  result += '标题: ' + info.title + '\n'; 
  result += 'URL: ' + info.url + '\n'; 
  result += '域名: ' + info.domain + '\n'; 
  result += '协议: ' + info.protocol + '\n'; 
  result += '表单数量: ' + info.forms + '\n'; 
  result += '输入框数量: ' + info.inputs + '\n'; 
  result += '链接数量: ' + info.links + '\n'; 
  result += '图片数量: ' + info.images + '\n'; 
  result += '脚本数量: ' + info.scripts + '\n'; 
  result += '视口大小: ' + info.viewport + '\n'; 
  result += '滚动位置: ' + info.scroll + '\n'; 
  result += 'User-Agent: ' + info.userAgent; 
  
  return result; 
} catch (error) { 
  return '页面信息获取失败: ' + error.message; 
}