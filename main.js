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
        }
    },
    monthly: {
        'core-monthly': {
            name: '核心数据',
            path: 'http://localhost:3000',
            type: 'react',
            note: '需要先运行: cd 核心数据看板（月度） && npm start'
        },
        'penetration-monthly': {
            name: '各模块渗透率',
            path: '各模块渗透率看板（月度）/index.html',
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
    
    // 显示加载动画
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在加载看板...</div>
        </div>
    `;
    
    // 获取看板路径
    const config = dashboardConfig[period][dashboardType];
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
