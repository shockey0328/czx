// 看板切换功能
document.addEventListener('DOMContentLoaded', function() {
    const periodButtons = document.querySelectorAll('.period-btn');
    const dashboardSelect = document.getElementById('dashboardSelect');
    const dashboardPanels = document.querySelectorAll('.dashboard-panel');
    const weeklyOptions = document.getElementById('weekly-options');
    const monthlyOptions = document.getElementById('monthly-options');

    // 当前激活的周期类型
    let currentPeriod = 'weekly';

    // 周度/月度切换
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            currentPeriod = period;
            
            // 更新按钮状态
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 根据周期类型，选择对应的第一个选项
            if (period === 'weekly') {
                dashboardSelect.value = 'core-weekly';
                weeklyOptions.style.display = '';
                monthlyOptions.style.display = 'none';
            } else {
                // 月度默认选择各模块渗透率（因为核心数据需要构建）
                dashboardSelect.value = 'penetration-monthly';
                weeklyOptions.style.display = 'none';
                monthlyOptions.style.display = '';
            }
            
            // 触发看板切换
            showDashboard(dashboardSelect.value);
            
            // 保存当前选择
            localStorage.setItem('activePeriod', period);
            localStorage.setItem('activeDashboard', dashboardSelect.value);
        });
    });

    // 看板选择下拉框变化
    dashboardSelect.addEventListener('change', function() {
        const selectedDashboard = this.value;
        showDashboard(selectedDashboard);
        
        // 保存当前选择
        localStorage.setItem('activeDashboard', selectedDashboard);
    });

    // 显示指定看板的函数
    function showDashboard(dashboardId) {
        dashboardPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(dashboardId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    // 页面加载时恢复上次的选择
    const savedPeriod = localStorage.getItem('activePeriod');
    const savedDashboard = localStorage.getItem('activeDashboard');
    
    if (savedPeriod && savedPeriod !== 'weekly') {
        // 如果保存的不是默认的周度，则切换
        const savedPeriodBtn = document.querySelector(`[data-period="${savedPeriod}"]`);
        if (savedPeriodBtn) {
            periodButtons.forEach(btn => btn.classList.remove('active'));
            savedPeriodBtn.classList.add('active');
            currentPeriod = savedPeriod;
            
            if (savedPeriod === 'monthly') {
                weeklyOptions.style.display = 'none';
                monthlyOptions.style.display = '';
            }
        }
    }
    
    if (savedDashboard) {
        // 检查保存的看板是否属于当前周期
        const option = dashboardSelect.querySelector(`option[value="${savedDashboard}"]`);
        if (option && option.parentElement.id === `${currentPeriod}-options`) {
            dashboardSelect.value = savedDashboard;
            showDashboard(savedDashboard);
        }
    }

    // 键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        // Alt + W: 切换到周度
        if (e.altKey && e.key.toLowerCase() === 'w') {
            e.preventDefault();
            document.querySelector('[data-period="weekly"]').click();
        }
        // Alt + M: 切换到月度
        if (e.altKey && e.key.toLowerCase() === 'm') {
            e.preventDefault();
            document.querySelector('[data-period="monthly"]').click();
        }
        // Alt + 左右箭头: 在当前周期内切换看板
        if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            const options = Array.from(dashboardSelect.options).filter(opt => 
                opt.parentElement.id === `${currentPeriod}-options`
            );
            const currentIndex = options.findIndex(opt => opt.value === dashboardSelect.value);
            
            let nextIndex;
            if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            } else {
                nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            }
            
            dashboardSelect.value = options[nextIndex].value;
            dashboardSelect.dispatchEvent(new Event('change'));
        }
        // Alt + 数字键: 快速切换到指定看板
        if (e.altKey && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const allOptions = Array.from(dashboardSelect.options);
            const index = parseInt(e.key) - 1;
            if (allOptions[index]) {
                // 先切换到对应的周期
                const optgroup = allOptions[index].parentElement;
                const period = optgroup.id.replace('-options', '');
                if (period !== currentPeriod) {
                    document.querySelector(`[data-period="${period}"]`).click();
                }
                // 再选择看板
                setTimeout(() => {
                    dashboardSelect.value = allOptions[index].value;
                    dashboardSelect.dispatchEvent(new Event('change'));
                }, 100);
            }
        }
    });

    // iframe加载错误处理
    const iframes = document.querySelectorAll('.dashboard-iframe');
    iframes.forEach(iframe => {
        iframe.addEventListener('error', function() {
            console.error(`Failed to load dashboard iframe: ${this.src}`);
            // 不显示错误提示，静默处理
        });
        
        iframe.addEventListener('load', function() {
            console.log(`Dashboard iframe loaded: ${this.src}`);
            // 隐藏iframe内部可能显示的错误提示
            try {
                const iframeDoc = this.contentDocument || this.contentWindow.document;
                // 尝试隐藏错误提示（如果有的话）
                const errorElements = iframeDoc.querySelectorAll('.error, .alert, [role="alert"]');
                errorElements.forEach(el => {
                    if (el.textContent.includes('Failed to fetch') || el.textContent.includes('加载失败')) {
                        el.style.display = 'none';
                    }
                });
            } catch (e) {
                // 跨域限制，无法访问iframe内容
                console.log('Cannot access iframe content (CORS)');
            }
        });
    });

    // 页面可见性变化监听
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('Page hidden');
        } else {
            console.log('Page visible');
        }
    });

    // 监听窗口大小变化
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            console.log('Window resized');
        }, 250);
    });

    // 初始化时根据周期显示/隐藏选项组
    if (currentPeriod === 'weekly') {
        monthlyOptions.style.display = 'none';
    } else {
        weeklyOptions.style.display = 'none';
    }
});

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// 监听iframe内部的消息
window.addEventListener('message', function(event) {
    console.log('Message from iframe:', event.data);
});

// 工具函数：显示加载提示
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 300);
    }, 1000);
}
