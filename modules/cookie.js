try { 
  const cookies = document.cookie; 
  if (!cookies) return '当前页面无 Cookie'; 
  const cookieArray = cookies.split(';').map(cookie => { 
    const [name, value] = cookie.trim().split('='); 
    return name + ': ' + (value || '(空值)'); 
  }); 
  return 'Cookie 信息 (' + cookieArray.length + ' 个):\n' + cookieArray.join('\n'); 
} catch (error) { 
  return 'Cookie 读取失败: ' + error.message; 
}