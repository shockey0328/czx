// 看板配置
const dashboardConfig = {
    weekly: {
        'core-weekly': {
            name: '核心数据',
            path: '核心数据看板（周度）/index.html',
            type: 'static'
        },
        'search-weekly': {
            name: '搜索数据',
            path: '搜索数据看板（周度）/index.html',
            type: 'static'
        },
        'user-behavior-weekly': {
            name: '用户行为 (需启动服务器)',
            path: 'http://localhost:3001/dashboard-db.html',
            type: 'server',
            serverCommand: 'node server-with-db.js',
            serverPath: '用户行为看板（周度）'
        }
    },
    monthly: {
        'core-monthly': {
            name: '核心数据',
            path: '核心数据看板（月度）/index-static.html',
            type: 'static'
        },
        'penetration-monthly': {
            name: '各模块渗透率',
            path: '各模块渗透率看板（月度）/index.html',
            type: 'static'
        },
        'province-monthly': {
            name: '分省数据',
            path: '分省数据看板（月度）/index.html',
            type: 'static'
        }
    }
};

// 当前状态
let currentPeriod = 'weekly';
let currentDashboard = 'core-weekly';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadDashboard(currentPeriod, currentDashboard);
});

// 初始化事件监听
function initializeEventListeners() {
    // 周度/月度切换
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.dataset.period;
            if (period !== currentPeriod) {
                switchPeriod(period);
            }
        });
    });

    // 看板类型选择
    const dashboardSelect = document.getElementById('dashboardType');
    dashboardSelect.addEventListener('change', function() {
        const dashboardType = this.value;
        loadDashboard(currentPeriod, dashboardType);
    });
}

// 切换周度/月度
function switchPeriod(period) {
    currentPeriod = period;
    
    // 更新按钮状态
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });
    
    // 更新下拉选项
    updateDashboardOptions(period);
    
    // 加载默认看板
    const defaultDashboard = period === 'weekly' ? 'core-weekly' : 'core-monthly';
    loadDashboard(period, defaultDashboard);
}

// 更新看板选项
function updateDashboardOptions(period) {
    const dashboardSelect = document.getElementById('dashboardType');
    dashboardSelect.innerHTML = '';
    
    const options = dashboardConfig[period];
    for (const [key, value] of Object.entries(options)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value.name;
        dashboardSelect.appendChild(option);
    }
    
    // 设置默认选中
    dashboardSelect.value = period === 'weekly' ? 'core-weekly' : 'core-monthly';
}

// 加载看板
function loadDashboard(period, dashboardType) {
    currentDashboard = dashboardType;
    const container = document.getElementById('dashboardContainer');
    
    console.log('=== 加载看板 ===');
    console.log('周期:', period);
    console.log('看板类型:', dashboardType);
    
    // 显示加载动画
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在加载看板...</div>
        </div>
    `;
    
    // 获取看板路径
    const config = dashboardConfig[period][dashboardType];
    console.log('看板配置:', config);
    if (!config) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-text">看板不存在</div>
            </div>
        `;
        return;
    }
    
    // 如果是React应用，显示提示信息
    if (config.type === 'react') {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-text" style="max-width: 600px; text-align: center;">
                    <h3 style="color: #FF6B35; margin-bottom: 20px;">月度核心数据看板（React应用）</h3>
                    <p style="margin-bottom: 15px;">此看板需要单独运行React开发服务器</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: left;">
                        <p style="font-weight: bold; margin-bottom: 10px;">运行步骤：</p>
                        <ol style="line-height: 2;">
                            <li>打开终端</li>
                            <li>执行: <code style="background: #fff; padding: 2px 8px; border-radius: 4px;">cd 核心数据看板（月度）</code></li>
                            <li>执行: <code style="background: #fff; padding: 2px 8px; border-radius: 4px;">npm install</code> (首次运行)</li>
                            <li>执行: <code style="background: #fff; padding: 2px 8px; border-radius: 4px;">npm start</code></li>
                            <li>等待服务启动后，刷新此页面</li>
                        </ol>
                    </div>
                    <p style="margin-top: 15px; color: #666; font-size: 14px;">或者直接访问: <a href="http://localhost:3000" target="_blank" style="color: #FF6B35;">http://localhost:3000</a></p>
                </div>
            </div>
        `;
        
        // 尝试加载React应用（如果已经运行）
        setTimeout(() => {
            const iframe = document.createElement('iframe');
            iframe.src = config.path;
            iframe.className = 'dashboard-frame';
            iframe.style.display = 'none';
            
            iframe.onload = function() {
                console.log(`${config.name}看板加载完成`);
                iframe.style.display = 'block';
                container.innerHTML = '';
                container.appendChild(iframe);
            };
            
            iframe.onerror = function() {
                console.log('React应用未运行');
            };
            
            document.body.appendChild(iframe);
            
            // 5秒后如果还没加载成功，移除iframe
            setTimeout(() => {
                if (iframe.style.display === 'none') {
                    iframe.remove();
                }
            }, 5000);
        }, 1000);
        
        return;
    }
    
    // 如果是需要服务器的看板，显示提示信息
    if (config.type === 'server') {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-text" style="max-width: 700px; text-align: center;">
                    <h3 style="color: #FF6B35; margin-bottom: 20px;">🚀 ${config.name}看板</h3>
                    <p style="margin-bottom: 20px; font-size: 16px; color: #666;">此看板需要启动Node.js服务器才能使用</p>
                    
                    <div style="background: #fff5f0; padding: 24px; border-radius: 12px; text-align: left; margin-bottom: 20px; border: 2px solid #FFE8DF;">
                        <p style="font-weight: bold; margin-bottom: 15px; color: #FF6B35; font-size: 15px;">📋 启动步骤：</p>
                        <ol style="line-height: 2.2; color: #333; padding-left: 20px;">
                            <li>双击运行 <code style="background: #fff; padding: 3px 10px; border-radius: 4px; color: #FF6B35; font-weight: bold;">启动用户行为看板.bat</code></li>
                            <li>等待看到 "服务器运行在 http://localhost:3001" 提示</li>
                            <li>刷新此页面（按F5），或重新选择"用户行为"看板</li>
                        </ol>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 20px;">
                        <p style="font-weight: bold; margin-bottom: 12px; color: #666;">💡 手动启动（可选）：</p>
                        <div style="background: #fff; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; color: #333; margin-bottom: 8px;">
                            cd ${config.serverPath}
                        </div>
                        <div style="background: #fff; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; color: #333; margin-bottom: 8px;">
                            npm install <span style="color: #999;">(首次运行)</span>
                        </div>
                        <div style="background: #fff; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; color: #333;">
                            ${config.serverCommand}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center; align-items: center;">
                        <a href="${config.path}" target="_blank" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='#E85A2A'" onmouseout="this.style.background='#FF6B35'">
                            🔗 直接访问看板
                        </a>
                        <button onclick="location.reload()" style="background: #fff; color: #FF6B35; border: 2px solid #FF6B35; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='#FFF5F2'" onmouseout="this.style.background='#fff'">
                            🔄 刷新页面
                        </button>
                    </div>
                    
                    <p style="margin-top: 20px; color: #999; font-size: 13px;">
                        ⚠️ 如果服务器已启动但仍显示此页面，请点击"刷新页面"按钮
                    </p>
                </div>
            </div>
        `;
        
        // 尝试加载服务器应用（如果已经运行）
        setTimeout(() => {
            const iframe = document.createElement('iframe');
            iframe.src = config.path;
            iframe.className = 'dashboard-frame';
            iframe.style.display = 'none';
            
            iframe.onload = function() {
                console.log(`${config.name}看板加载完成`);
                iframe.style.display = 'block';
                container.innerHTML = '';
                container.appendChild(iframe);
            };
            
            iframe.onerror = function() {
                console.log('服务器应用未运行');
            };
            
            document.body.appendChild(iframe);
            
            // 5秒后如果还没加载成功，移除iframe
            setTimeout(() => {
                if (iframe.style.display === 'none') {
                    iframe.remove();
                }
            }, 5000);
        }, 1000);
        
        return;
    }
    
    // 创建iframe加载静态看板
    setTimeout(() => {
        const iframe = document.createElement('iframe');
        iframe.src = config.path;
        iframe.className = 'dashboard-frame';
        iframe.onload = function() {
            console.log(`${config.name}看板加载完成`);
        };
        iframe.onerror = function() {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-text">看板加载失败，请检查文件路径</div>
                </div>
            `;
        };
        
        container.innerHTML = '';
        container.appendChild(iframe);
    }, 300);
}

// 监听窗口大小变化
window.addEventListener('resize', function() {
    // 可以在这里添加响应式处理逻辑
});
