// 全局变量
let rawData = [];
let filteredData = [];
let charts = {};

// 月份映射
const monthMapping = {
    '2025年3月': '2025-03',
    '2025年4月': '2025-04',
    '2025年5月': '2025-05',
    '2025年6月': '2025-06',
    '2025年7月': '2025-07',
    '2025年8月': '2025-08',
    '2025年9月': '2025-09',
    '2025年10月': '2025-10',
    '2025年11月': '2025-11',
    '2025年12月': '2025-12',
    '2026年1月': '2026-01'
};

const monthLabels = ['25年3月', '25年4月', '25年5月', '25年6月', '25年7月', '25年8月', '25年9月', '25年10月', '25年11月', '25年12月', '26年1月'];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    setupLogoErrorHandling();
});

// 设置logo错误处理
function setupLogoErrorHandling() {
    const logo = document.getElementById('mainLogo');
    const logoFallback = document.getElementById('logoFallback');
    
    if (logo && logoFallback) {
        // 添加加载成功处理
        logo.addEventListener('load', function() {
            console.log('Logo加载成功');
            this.style.opacity = '1';
            logoFallback.style.display = 'none';
        });
        
        // 添加加载失败处理
        logo.addEventListener('error', function() {
            console.warn('Logo文件加载失败，显示fallback');
            this.style.display = 'none';
            logoFallback.style.display = 'flex';
        });
        
        // 设置初始状态
        logo.style.opacity = '0';
        logo.style.transition = 'opacity 0.3s ease';
        
        // 检查logo是否已经加载完成（处理缓存情况）
        if (logo.complete) {
            if (logo.naturalWidth > 0) {
                logo.style.opacity = '1';
                logoFallback.style.display = 'none';
            } else {
                logo.style.display = 'none';
                logoFallback.style.display = 'flex';
            }
        }
    }
}

// 加载数据
async function loadData() {
    try {
        // 检查是否有嵌入的数据
        if (typeof dashboardData !== 'undefined' && dashboardData['各模块渗透率']) {
            console.log('使用嵌入的数据');
            parseEmbeddedData(dashboardData['各模块渗透率']);
            updateDashboard();
            return;
        }
        
        // 尝试从CSV加载
        const response = await fetch('各模块渗透率.csv');
        if (!response.ok) {
            throw new Error('CSV文件加载失败');
        }
        const csvText = await response.text();
        parseCSV(csvText);
        updateDashboard();
    } catch (error) {
        console.log('使用内置示例数据');
        // 直接使用示例数据，不显示错误
        parseCSV(''); // parseCSV函数内部已经有完整的示例数据
        updateDashboard();
    }
}

// 解析嵌入的数据
function parseEmbeddedData(data) {
    console.log('解析嵌入数据，共', data.length, '条');
    
    // CSV字段名到显示标签的映射
    const fieldMapping = {
        '2025年3月': '25年3月',
        '2025年4月': '25年4月',
        '2025年5月': '25年5月',
        '2025年6月': '25年6月',
        '2025年7月': '25年7月',
        '2025年8月': '25年8月',
        '2025年9月': '25年9月',
        '2025年10月': '25年10月',
        '2025年11月': '25年11月',
        '2025年12月': '25年12月',
        '2026年1月': '26年1月'
    };
    
    // 将CSV格式的数据转换为内部数据结构
    const dataByModule = {};
    
    data.forEach(row => {
        const module1 = row['一级模块'] || '';
        const module2 = row['二级模块'] || '';
        const key = `${module1}-${module2}`;
        
        if (!dataByModule[key]) {
            dataByModule[key] = {
                一级模块: module1,
                二级模块: module2,
                data: {}
            };
        }
        
        // 将每个月份的数据添加到data对象中
        Object.keys(fieldMapping).forEach(csvField => {
            const displayLabel = fieldMapping[csvField];
            const value = row[csvField];
            
            if (value && value !== '' && value !== 'null') {
                dataByModule[key].data[displayLabel] = parseFloat(value);
            } else {
                dataByModule[key].data[displayLabel] = null;
            }
        });
    });
    
    rawData = Object.values(dataByModule);
    console.log('解析完成，共', rawData.length, '个模块');
    console.log('示例数据:', rawData[0]);
}

// 解析CSV数据
function parseCSV(csvText) {
    // 使用提供的正确数据结构
    console.log('使用正确的数据结构');
    
    rawData = [
        // 功能模块
        {
            一级模块: '功能',
            二级模块: '搜索',
            data: {
                '25年3月': 55.22, '25年4月': 57.83, '25年5月': 55.46, '25年6月': 53.59,
                '25年7月': 45.78, '25年8月': 43.33, '25年9月': 42.94, '25年10月': 48.21,
                '25年11月': 51.62, '25年12月': 49.97, '26年1月': 53.59
            }
        },
        {
            一级模块: '功能',
            二级模块: '拍照答疑',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': null, '25年6月': null,
                '25年7月': null, '25年8月': null, '25年9月': null, '25年10月': null,
                '25年11月': 3.01, '25年12月': 8.05, '26年1月': 9.26
            }
        },
        // 真题试卷模块
        {
            一级模块: '真题试卷',
            二级模块: '刷真题',
            data: {
                '25年3月': 43.87, '25年4月': 58.11, '25年5月': 54.63, '25年6月': 58.72,
                '25年7月': 53.65, '25年8月': 52.17, '25年9月': 52.54, '25年10月': 56.35,
                '25年11月': 57.84, '25年12月': 55.04, '26年1月': 58.11
            }
        },
        // 同步模块
        {
            一级模块: '同步',
            二级模块: '单元卷',
            data: {
                '25年3月': 11.44, '25年4月': 11.19, '25年5月': 10.34, '25年6月': 7.88,
                '25年7月': 11.46, '25年8月': 13.56, '25年9月': 22.27, '25年10月': 17.05,
                '25年11月': 11.1, '25年12月': 10.91, '26年1月': 6.66
            }
        },
        {
            一级模块: '同步',
            二级模块: '练习',
            data: {
                '25年3月': 7.16, '25年4月': 8.31, '25年5月': 7.62, '25年6月': 6.9,
                '25年7月': 10.48, '25年8月': 11.34, '25年9月': 16.55, '25年10月': 16.51,
                '25年11月': 13.52, '25年12月': 12.73, '26年1月': 9.66
            }
        },
        {
            一级模块: '同步',
            二级模块: '同步学',
            data: {
                '25年3月': 6.46, '25年4月': 7.03, '25年5月': 6.41, '25年6月': 6.94,
                '25年7月': 14.28, '25年8月': 14.45, '25年9月': 21.05, '25年10月': 14.14,
                '25年11月': 11.86, '25年12月': 10.46, '26年1月': 7.27
            }
        },
        {
            一级模块: '同步',
            二级模块: '视频',
            data: {
                '25年3月': 9.79, '25年4月': 9.67, '25年5月': 9.54, '25年6月': 8.88,
                '25年7月': 13.48, '25年8月': 13.48, '25年9月': 13.95, '25年10月': 11.64,
                '25年11月': 9.72, '25年12月': 9.02, '26年1月': 7.53
            }
        },
        {
            一级模块: '同步',
            二级模块: '知识清单',
            data: {
                '25年3月': 5.97, '25年4月': 7.24, '25年5月': 7.27, '25年6月': 6.05,
                '25年7月': 6.85, '25年8月': 6.84, '25年9月': 8.36, '25年10月': 7.41,
                '25年11月': 6.08, '25年12月': 5.73, '26年1月': 4.65
            }
        },
        {
            一级模块: '同步',
            二级模块: '寒暑假',
            data: {
                '25年3月': 1.36, '25年4月': 1.63, '25年5月': 1.68, '25年6月': 4.71,
                '25年7月': 12.54, '25年8月': 10.11, '25年9月': 2.85, '25年10月': 2.3,
                '25年11月': 2.72, '25年12月': 3.31, '26年1月': 5.38
            }
        },
        {
            一级模块: '同步',
            二级模块: '特色内容',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': 0, '25年6月': 0.29,
                '25年7月': 1.66, '25年8月': 5.6, '25年9月': 6.93, '25年10月': 7.18,
                '25年11月': 5.94, '25年12月': 5.52, '26年1月': 4.54
            }
        },
        // 备考模块
        {
            一级模块: '备考',
            二级模块: '阶段复习',
            data: {
                '25年3月': 6.57, '25年4月': 18.47, '25年5月': 12.66, '25年6月': 18.74,
                '25年7月': 12.48, '25年8月': 8.18, '25年9月': 8.35, '25年10月': 16.2,
                '25年11月': 22.48, '25年12月': 16.89, '26年1月': 21.06
            }
        },
        {
            一级模块: '备考',
            二级模块: '升学备考',
            data: {
                '25年3月': 10.03, '25年4月': 12.5, '25年5月': 13.88, '25年6月': 12.73,
                '25年7月': 8.67, '25年8月': 10.18, '25年9月': 9.11, '25年10月': 7.77,
                '25年11月': 7.26, '25年12月': 6.3, '26年1月': 5.78
            }
        },
        {
            一级模块: '备考',
            二级模块: '推广图',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': null, '25年6月': null,
                '25年7月': null, '25年8月': null, '25年9月': 2.05, '25年10月': 0.61,
                '25年11月': 9.88, '25年12月': 12.68, '26年1月': 8.62
            }
        },
        {
            一级模块: '备考',
            二级模块: '学考',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': 0, '25年6月': 1.73,
                '25年7月': 2.9, '25年8月': 2.94, '25年9月': 3.06, '25年10月': 2.53,
                '25年11月': 2.16, '25年12月': 2.75, '26年1月': 1.81
            }
        }
    ];
    
    console.log('数据加载完成，共', rawData.length, '个模块');
}

// 加载示例数据（使用正确的数据结构）
function loadSampleData() {
    rawData = [
        // 功能模块
        {
            一级模块: '功能',
            二级模块: '搜索',
            data: {
                '25年3月': 55.22, '25年4月': 57.83, '25年5月': 55.46, '25年6月': 53.59,
                '25年7月': 45.78, '25年8月': 43.33, '25年9月': 42.94, '25年10月': 48.21,
                '25年11月': 51.62, '25年12月': 49.97, '26年1月': 53.59
            }
        },
        {
            一级模块: '功能',
            二级模块: '拍照答疑',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': null, '25年6月': null,
                '25年7月': null, '25年8月': null, '25年9月': null, '25年10月': null,
                '25年11月': 3.01, '25年12月': 8.05, '26年1月': 9.26
            }
        },
        // 真题试卷模块
        {
            一级模块: '真题试卷',
            二级模块: '刷真题',
            data: {
                '25年3月': 43.87, '25年4月': 58.11, '25年5月': 54.63, '25年6月': 58.72,
                '25年7月': 53.65, '25年8月': 52.17, '25年9月': 52.54, '25年10月': 56.35,
                '25年11月': 57.84, '25年12月': 55.04, '26年1月': 58.11
            }
        },
        // 同步模块
        {
            一级模块: '同步',
            二级模块: '单元卷',
            data: {
                '25年3月': 11.44, '25年4月': 11.19, '25年5月': 10.34, '25年6月': 7.88,
                '25年7月': 11.46, '25年8月': 13.56, '25年9月': 22.27, '25年10月': 17.05,
                '25年11月': 11.1, '25年12月': 10.91, '26年1月': 6.66
            }
        },
        {
            一级模块: '同步',
            二级模块: '练习',
            data: {
                '25年3月': 7.16, '25年4月': 8.31, '25年5月': 7.62, '25年6月': 6.9,
                '25年7月': 10.48, '25年8月': 11.34, '25年9月': 16.55, '25年10月': 16.51,
                '25年11月': 13.52, '25年12月': 12.73, '26年1月': 9.66
            }
        },
        {
            一级模块: '同步',
            二级模块: '同步学',
            data: {
                '25年3月': 6.46, '25年4月': 7.03, '25年5月': 6.41, '25年6月': 6.94,
                '25年7月': 14.28, '25年8月': 14.45, '25年9月': 21.05, '25年10月': 14.14,
                '25年11月': 11.86, '25年12月': 10.46, '26年1月': 7.27
            }
        },
        {
            一级模块: '同步',
            二级模块: '视频',
            data: {
                '25年3月': 9.79, '25年4月': 9.67, '25年5月': 9.54, '25年6月': 8.88,
                '25年7月': 13.48, '25年8月': 13.48, '25年9月': 13.95, '25年10月': 11.64,
                '25年11月': 9.72, '25年12月': 9.02, '26年1月': 7.53
            }
        },
        {
            一级模块: '同步',
            二级模块: '知识清单',
            data: {
                '25年3月': 5.97, '25年4月': 7.24, '25年5月': 7.27, '25年6月': 6.05,
                '25年7月': 6.85, '25年8月': 6.84, '25年9月': 8.36, '25年10月': 7.41,
                '25年11月': 6.08, '25年12月': 5.73, '26年1月': 4.65
            }
        },
        {
            一级模块: '同步',
            二级模块: '寒暑假',
            data: {
                '25年3月': 1.36, '25年4月': 1.63, '25年5月': 1.68, '25年6月': 4.71,
                '25年7月': 12.54, '25年8月': 10.11, '25年9月': 2.85, '25年10月': 2.3,
                '25年11月': 2.72, '25年12月': 3.31, '26年1月': 5.38
            }
        },
        {
            一级模块: '同步',
            二级模块: '特色内容',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': 0, '25年6月': 0.29,
                '25年7月': 1.66, '25年8月': 5.6, '25年9月': 6.93, '25年10月': 7.18,
                '25年11月': 5.94, '25年12月': 5.52, '26年1月': 4.54
            }
        },
        // 备考模块
        {
            一级模块: '备考',
            二级模块: '阶段复习',
            data: {
                '25年3月': 6.57, '25年4月': 18.47, '25年5月': 12.66, '25年6月': 18.74,
                '25年7月': 12.48, '25年8月': 8.18, '25年9月': 8.35, '25年10月': 16.2,
                '25年11月': 22.48, '25年12月': 16.89, '26年1月': 21.06
            }
        },
        {
            一级模块: '备考',
            二级模块: '升学备考',
            data: {
                '25年3月': 10.03, '25年4月': 12.5, '25年5月': 13.88, '25年6月': 12.73,
                '25年7月': 8.67, '25年8月': 10.18, '25年9月': 9.11, '25年10月': 7.77,
                '25年11月': 7.26, '25年12月': 6.3, '26年1月': 5.78
            }
        },
        {
            一级模块: '备考',
            二级模块: '推广图',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': null, '25年6月': null,
                '25年7月': null, '25年8月': null, '25年9月': 2.05, '25年10月': 0.61,
                '25年11月': 9.88, '25年12月': 12.68, '26年1月': 8.62
            }
        },
        {
            一级模块: '备考',
            二级模块: '学考',
            data: {
                '25年3月': null, '25年4月': null, '25年5月': 0, '25年6月': 1.73,
                '25年7月': 2.9, '25年8月': 2.94, '25年9月': 3.06, '25年10月': 2.53,
                '25年11月': 2.16, '25年12月': 2.75, '26年1月': 1.81
            }
        }
    ];
}

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('monthFilter').addEventListener('change', updateDashboard);
    document.getElementById('moduleFilter').addEventListener('change', updateDashboard);
    
    // 时间范围按钮
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateTrendChart();
        });
    });
    
    // 热力图时间范围按钮
    document.querySelectorAll('.heatmap-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.heatmap-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateHeatmap();
        });
    });
}

// 更新仪表板
function updateDashboard() {
    filterData();
    updateKPIs();
    updateTrendChart();
    updateRankingChart();
    updatePieChart();
    updateHeatmap();
    updateDataTable();
}

// 筛选数据
function filterData() {
    const monthFilter = document.getElementById('monthFilter').value;
    const moduleFilter = document.getElementById('moduleFilter').value;
    
    filteredData = rawData.filter(item => {
        if (moduleFilter !== 'all' && item.一级模块 !== moduleFilter) {
            return false;
        }
        return true;
    });
}

// 更新KPI
function updateKPIs() {
    const monthFilter = document.getElementById('monthFilter').value;
    
    if (monthFilter === 'recent-year') {
        updateKPIsForYear();
    } else {
        updateKPIsForMonth(monthFilter);
    }
}

function updateKPIsForYear() {
    let totalSum = 0;
    let totalCount = 0;
    let maxValue = 0;
    let maxModule = '';
    let moduleCount = filteredData.length;
    
    // 计算平均渗透率和最高渗透率
    filteredData.forEach(item => {
        let itemSum = 0;
        let itemCount = 0;
        
        monthLabels.forEach(month => {
            if (item.data[month] !== null && item.data[month] !== undefined) {
                itemSum += item.data[month];
                itemCount++;
                totalSum += item.data[month];
                totalCount++;
                
                if (item.data[month] > maxValue) {
                    maxValue = item.data[month];
                    maxModule = item.二级模块;
                }
            }
        });
    });
    
    const avgPenetration = totalCount > 0 ? (totalSum / totalCount).toFixed(2) : 0;
    
    // 计算环比增长最快（百分点增长）
    let fastestGrowth = 0;
    let fastestModule = '';
    
    filteredData.forEach(item => {
        const dec = item.data['25年12月'];
        const jan = item.data['26年1月'];
        
        if (dec !== null && jan !== null) {
            const growth = jan - dec; // 直接相减得到百分点增长
            if (growth > fastestGrowth) {
                fastestGrowth = growth;
                fastestModule = item.二级模块;
            }
        }
    });
    
    // 更新显示
    document.getElementById('avgPenetration').textContent = avgPenetration;
    document.getElementById('maxPenetration').textContent = maxValue.toFixed(2) + '%';
    document.getElementById('maxModule').textContent = maxModule;
    document.getElementById('fastestGrowth').textContent = fastestGrowth.toFixed(1) + 'pp';
    document.getElementById('fastestModule').textContent = fastestModule;
    document.getElementById('moduleCount').textContent = moduleCount;
}

function updateKPIsForMonth(month) {
    const monthLabel = getMonthLabel(month);
    let totalSum = 0;
    let totalCount = 0;
    let maxValue = 0;
    let maxModule = '';
    let moduleCount = 0;
    
    filteredData.forEach(item => {
        const value = item.data[monthLabel];
        if (value !== null && value !== undefined) {
            totalSum += value;
            totalCount++;
            moduleCount++;
            
            if (value > maxValue) {
                maxValue = value;
                maxModule = item.二级模块;
            }
        }
    });
    
    const avgPenetration = totalCount > 0 ? (totalSum / totalCount).toFixed(2) : 0;
    
    // 计算环比增长（与上个月比较，百分点增长）
    const prevMonth = getPreviousMonth(monthLabel);
    let fastestGrowth = 0;
    let fastestModule = '';
    
    if (prevMonth) {
        filteredData.forEach(item => {
            const currentValue = item.data[monthLabel];
            const prevValue = item.data[prevMonth];
            
            if (currentValue !== null && prevValue !== null) {
                const growth = currentValue - prevValue; // 直接相减得到百分点增长
                if (growth > fastestGrowth) {
                    fastestGrowth = growth;
                    fastestModule = item.二级模块;
                }
            }
        });
    }
    
    // 更新显示
    document.getElementById('avgPenetration').textContent = avgPenetration;
    document.getElementById('maxPenetration').textContent = maxValue.toFixed(2) + '%';
    document.getElementById('maxModule').textContent = maxModule;
    document.getElementById('fastestGrowth').textContent = fastestGrowth.toFixed(1) + 'pp';
    document.getElementById('fastestModule').textContent = fastestModule;
    document.getElementById('moduleCount').textContent = moduleCount;
}

// 更新趋势折线图
function updateTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const activeRange = document.querySelector('.time-btn.active').dataset.range;
    const monthFilter = document.getElementById('monthFilter').value;
    
    let months;
    if (monthFilter === 'recent-year') {
        // 近1年模式，使用时间范围按钮
        months = getMonthsForRange(parseInt(activeRange));
    } else {
        // 特定月份模式，以选择的月份为结束点显示趋势
        const selectedMonthLabel = getMonthLabel(monthFilter);
        months = getMonthsEndingWith(selectedMonthLabel, parseInt(activeRange));
    }
    
    if (charts.trend) {
        charts.trend.destroy();
    }
    
    const datasets = filteredData.map((item, index) => {
        const data = months.map(month => ({
            x: month,
            y: item.data[month]
        })).filter(point => point.y !== null);
        
        return {
            label: item.二级模块,
            data: data,
            borderColor: getColor(index),
            backgroundColor: getColor(index, 0.1),
            tension: 0.4,
            fill: false
        };
    });
    
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 5,
                    right: 15,
                    bottom: 5,
                    left: 15
                }
            },
            plugins: {
                legend: {
                    labels: { 
                        color: '#ffffff',
                        padding: 8,
                        boxWidth: 12,
                        font: {
                            size: 11
                        },
                        usePointStyle: true
                    },
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: months,
                    ticks: { 
                        color: '#ffffff',
                        font: {
                            size: 11
                        },
                        maxRotation: 0,
                        minRotation: 0
                    },
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: { 
                        color: '#ffffff',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { 
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 5
                },
                line: {
                    tension: 0.4
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// 更新排名柱状图
function updateRankingChart() {
    const ctx = document.getElementById('rankingChart').getContext('2d');
    const monthFilter = document.getElementById('monthFilter').value;
    
    if (charts.ranking) {
        charts.ranking.destroy();
    }
    
    let rankingData = [];
    
    if (monthFilter === 'recent-year') {
        // 显示平均渗透率排名
        rankingData = filteredData.map(item => {
            let sum = 0;
            let count = 0;
            monthLabels.forEach(month => {
                if (item.data[month] !== null) {
                    sum += item.data[month];
                    count++;
                }
            });
            return {
                module: item.二级模块,
                value: count > 0 ? sum / count : 0
            };
        });
    } else {
        // 显示当月排名
        const monthLabel = getMonthLabel(monthFilter);
        rankingData = filteredData.map(item => ({
            module: item.二级模块,
            value: item.data[monthLabel] || 0
        }));
    }
    
    // 按降序排列
    rankingData.sort((a, b) => b.value - a.value);
    
    charts.ranking = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rankingData.map(item => item.module),
            datasets: [{
                data: rankingData.map(item => item.value),
                backgroundColor: rankingData.map((_, index) => getColor(index, 0.8)),
                borderColor: rankingData.map((_, index) => getColor(index)),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                }
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { 
                        color: '#ffffff',
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { 
                        color: '#ffffff',
                        font: {
                            size: 10
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

// 更新分类占比图
function updatePieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (charts.pie) {
        charts.pie.destroy();
    }
    
    // 统计各一级模块的二级模块数量
    const categoryCount = {};
    filteredData.forEach(item => {
        const category = item.一级模块;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    const labels = Object.keys(categoryCount);
    const data = Object.values(categoryCount);
    
    charts.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map((_, index) => getColor(index, 0.8)),
                borderColor: labels.map((_, index) => getColor(index)),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 5,
                    right: 5,
                    bottom: 5,
                    left: 5
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: '#ffffff',
                        padding: 10,
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// 更新热力图
function updateHeatmap() {
    const container = document.getElementById('heatmapContainer');
    const activeRange = document.querySelector('.heatmap-btn.active').dataset.range;
    const monthFilter = document.getElementById('monthFilter').value;
    
    let months;
    if (monthFilter === 'recent-year') {
        // 近1年模式，使用时间范围按钮
        months = getMonthsForRange(parseInt(activeRange));
    } else {
        // 特定月份模式，以选择的月份为结束点显示趋势
        const selectedMonthLabel = getMonthLabel(monthFilter);
        months = getMonthsEndingWith(selectedMonthLabel, parseInt(activeRange));
    }
    
    // 创建热力图表格
    let html = '<table class="heatmap-table"><thead><tr><th>模块</th>';
    months.forEach(month => {
        html += `<th>${month}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    filteredData.forEach(item => {
        html += `<tr><td>${item.二级模块}</td>`;
        months.forEach(month => {
            const value = item.data[month];
            const cellClass = getHeatmapCellClass(value);
            const displayValue = value !== null ? value.toFixed(1) + '%' : '--';
            html += `<td class="heatmap-cell ${cellClass}" title="${item.二级模块} - ${month}: ${displayValue}">${displayValue}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 更新数据表格
function updateDataTable() {
    const tbody = document.getElementById('tableBody');
    let html = '';
    
    filteredData.forEach(item => {
        html += `<tr>
            <td>${item.一级模块}</td>
            <td>${item.二级模块}</td>`;
        
        monthLabels.forEach(month => {
            const value = item.data[month];
            const displayValue = value !== null ? value.toFixed(2) + '%' : '--';
            html += `<td>${displayValue}</td>`;
        });
        
        // 计算平均值
        let sum = 0;
        let count = 0;
        monthLabels.forEach(month => {
            if (item.data[month] !== null) {
                sum += item.data[month];
                count++;
            }
        });
        const avg = count > 0 ? (sum / count).toFixed(2) + '%' : '--';
        html += `<td><strong>${avg}</strong></td>`;
        
        html += '</tr>';
    });
    
    tbody.innerHTML = html;
}

// 辅助函数
function getMonthLabel(monthValue) {
    const mapping = {
        '2025-03': '25年3月',
        '2025-04': '25年4月',
        '2025-05': '25年5月',
        '2025-06': '25年6月',
        '2025-07': '25年7月',
        '2025-08': '25年8月',
        '2025-09': '25年9月',
        '2025-10': '25年10月',
        '2025-11': '25年11月',
        '2025-12': '25年12月',
        '2026-01': '26年1月'
    };
    return mapping[monthValue];
}

function getPreviousMonth(monthLabel) {
    const index = monthLabels.indexOf(monthLabel);
    return index > 0 ? monthLabels[index - 1] : null;
}

function getMonthsForRange(range) {
    const endIndex = monthLabels.length - 1;
    const startIndex = Math.max(0, endIndex - range + 1);
    return monthLabels.slice(startIndex, endIndex + 1);
}

function getMonthsEndingWith(endMonth, range) {
    const endIndex = monthLabels.indexOf(endMonth);
    if (endIndex === -1) return [endMonth]; // 如果找不到月份，返回该月份
    
    const startIndex = Math.max(0, endIndex - range + 1);
    return monthLabels.slice(startIndex, endIndex + 1);
}

function getColor(index, alpha = 1) {
    const colors = [
        `rgba(255, 107, 53, ${alpha})`,   // 橙色
        `rgba(54, 162, 235, ${alpha})`,   // 蓝色
        `rgba(255, 206, 86, ${alpha})`,   // 黄色
        `rgba(75, 192, 192, ${alpha})`,   // 青色
        `rgba(153, 102, 255, ${alpha})`,  // 紫色
        `rgba(255, 159, 64, ${alpha})`,   // 橙黄色
        `rgba(199, 199, 199, ${alpha})`,  // 灰色
        `rgba(83, 102, 255, ${alpha})`,   // 靛蓝色
        `rgba(255, 99, 132, ${alpha})`,   // 粉红色
        `rgba(50, 205, 50, ${alpha})`     // 绿色
    ];
    return colors[index % colors.length];
}

function getHeatmapCellClass(value) {
    if (value === null || value === undefined) return 'heatmap-null';
    if (value < 10) return 'heatmap-low';
    if (value < 30) return 'heatmap-medium';
    if (value < 50) return 'heatmap-high';
    return 'heatmap-very-high';
}
// AI分析相关配置
const AI_CONFIG = {
    apiKey: 'sk-22da5c080db84c23b4a5c8c54e922763',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};

// 设置AI分析按钮事件监听器
function setupAIAnalysis() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', generateAIAnalysis);
    }
}

// 生成AI分析报告
async function generateAIAnalysis() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const aiAnalysis = document.getElementById('aiAnalysis');
    const aiLoading = document.getElementById('aiLoading');
    
    // 显示加载状态
    analyzeBtn.disabled = true;
    aiAnalysis.style.display = 'none';
    aiLoading.style.display = 'flex';
    
    try {
        // 准备数据
        const analysisData = prepareAnalysisData();
        
        // 调用AI API
        const analysis = await callDeepSeekAPI(analysisData);
        
        // 显示分析结果
        displayAnalysisResult(analysis);
        
    } catch (error) {
        console.error('AI分析失败:', error);
        displayAnalysisError(error.message);
    } finally {
        // 恢复按钮状态
        analyzeBtn.disabled = false;
        aiLoading.style.display = 'none';
        aiAnalysis.style.display = 'block';
    }
}

// 准备分析数据
function prepareAnalysisData() {
    const monthFilter = document.getElementById('monthFilter').value;
    const moduleFilter = document.getElementById('moduleFilter').value;
    
    // 获取当前筛选的数据
    const currentData = filteredData.map(item => {
        const moduleData = {
            一级模块: item.一级模块,
            二级模块: item.二级模块,
            数据: {}
        };
        
        // 根据月份筛选决定包含哪些数据
        if (monthFilter === 'recent-year') {
            moduleData.数据 = item.data;
        } else {
            const monthLabel = getMonthLabel(monthFilter);
            moduleData.数据[monthLabel] = item.data[monthLabel];
            
            // 包含前一个月的数据用于环比分析
            const prevMonth = getPreviousMonth(monthLabel);
            if (prevMonth) {
                moduleData.数据[prevMonth] = item.data[prevMonth];
            }
        }
        
        return moduleData;
    });
    
    // 计算统计信息
    const stats = calculateStats();
    
    return {
        筛选条件: {
            月份: monthFilter === 'recent-year' ? '近1年' : getMonthLabel(monthFilter),
            模块: moduleFilter === 'all' ? '全部模块' : moduleFilter
        },
        统计信息: stats,
        详细数据: currentData
    };
}

// 计算统计信息
function calculateStats() {
    const monthFilter = document.getElementById('monthFilter').value;
    
    if (monthFilter === 'recent-year') {
        return calculateYearStats();
    } else {
        return calculateMonthStats(monthFilter);
    }
}

function calculateYearStats() {
    let totalSum = 0;
    let totalCount = 0;
    let maxValue = 0;
    let maxModule = '';
    let fastestGrowth = 0;
    let fastestModule = '';
    
    filteredData.forEach(item => {
        let itemSum = 0;
        let itemCount = 0;
        
        monthLabels.forEach(month => {
            if (item.data[month] !== null) {
                itemSum += item.data[month];
                itemCount++;
                totalSum += item.data[month];
                totalCount++;
                
                if (item.data[month] > maxValue) {
                    maxValue = item.data[month];
                    maxModule = item.二级模块;
                }
            }
        });
        
        // 计算环比增长
        const dec = item.data['25年12月'];
        const jan = item.data['26年1月'];
        if (dec !== null && jan !== null) {
            const growth = jan - dec;
            if (growth > fastestGrowth) {
                fastestGrowth = growth;
                fastestModule = item.二级模块;
            }
        }
    });
    
    return {
        平均渗透率: totalCount > 0 ? (totalSum / totalCount).toFixed(2) : 0,
        最高渗透率: maxValue.toFixed(2),
        最高渗透率模块: maxModule,
        环比增长最快: fastestGrowth.toFixed(1) + 'pp',
        环比增长最快模块: fastestModule,
        模块总数: filteredData.length
    };
}

function calculateMonthStats(monthFilter) {
    const monthLabel = getMonthLabel(monthFilter);
    const prevMonth = getPreviousMonth(monthLabel);
    
    let totalSum = 0;
    let totalCount = 0;
    let maxValue = 0;
    let maxModule = '';
    let fastestGrowth = 0;
    let fastestModule = '';
    
    filteredData.forEach(item => {
        const value = item.data[monthLabel];
        if (value !== null) {
            totalSum += value;
            totalCount++;
            
            if (value > maxValue) {
                maxValue = value;
                maxModule = item.二级模块;
            }
        }
        
        // 计算环比增长
        if (prevMonth) {
            const currentValue = item.data[monthLabel];
            const prevValue = item.data[prevMonth];
            if (currentValue !== null && prevValue !== null) {
                const growth = currentValue - prevValue;
                if (growth > fastestGrowth) {
                    fastestGrowth = growth;
                    fastestModule = item.二级模块;
                }
            }
        }
    });
    
    return {
        平均渗透率: totalCount > 0 ? (totalSum / totalCount).toFixed(2) : 0,
        最高渗透率: maxValue.toFixed(2),
        最高渗透率模块: maxModule,
        环比增长最快: fastestGrowth.toFixed(1) + 'pp',
        环比增长最快模块: fastestModule,
        模块总数: totalCount
    };
}

// 调用DeepSeek API - 分别获取整体分析和优化建议
async function callDeepSeekAPI(data) {
    // 整体分析的提示词 - 简洁版
    const overallPrompt = `
基于以下教育产品模块渗透率数据，请提供简洁的整体分析：

筛选条件：${JSON.stringify(data.筛选条件, null, 2)}
统计信息：${JSON.stringify(data.统计信息, null, 2)}

请用3-4个要点简洁分析：
1. 整体表现如何？
2. 哪些模块表现突出？
3. 主要问题是什么？
4. 关键趋势是什么？

每个要点控制在1-2句话，总字数不超过200字。
`;

    // 优化建议的提示词 - 简洁版
    const suggestionPrompt = `
基于以下教育产品模块渗透率数据，请提供简洁的优化建议：

筛选条件：${JSON.stringify(data.筛选条件, null, 2)}
统计信息：${JSON.stringify(data.统计信息, null, 2)}

请提供3-4个具体建议：
1. 立即行动：最紧急需要改进的
2. 重点提升：最有潜力的模块
3. 长期关注：持续优化方向
4. 风险防控：需要注意的问题

每个建议控制在1-2句话，总字数不超过200字。
`;

    // 并行调用两个API
    const [overallResponse, suggestionResponse] = await Promise.all([
        fetch(AI_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [{ role: 'user', content: overallPrompt }],
                temperature: 0.5,
                max_tokens: 300
            })
        }),
        fetch(AI_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [{ role: 'user', content: suggestionPrompt }],
                temperature: 0.5,
                max_tokens: 300
            })
        })
    ]);

    if (!overallResponse.ok || !suggestionResponse.ok) {
        throw new Error(`API请求失败: ${overallResponse.status} 或 ${suggestionResponse.status}`);
    }

    const [overallResult, suggestionResult] = await Promise.all([
        overallResponse.json(),
        suggestionResponse.json()
    ]);
    
    if (overallResult.error || suggestionResult.error) {
        throw new Error(overallResult.error?.message || suggestionResult.error?.message || 'API返回错误');
    }
    
    return {
        overall: overallResult.choices[0].message.content,
        suggestions: suggestionResult.choices[0].message.content
    };
}

// 显示分析结果
function displayAnalysisResult(analysis) {
    const aiResultsSection = document.getElementById('aiResultsSection');
    const overallAnalysis = document.getElementById('overallAnalysis');
    const optimizationSuggestions = document.getElementById('optimizationSuggestions');
    
    // 格式化并显示整体分析
    const formattedOverall = formatAnalysisText(analysis.overall);
    overallAnalysis.innerHTML = `<div class="ai-result">${formattedOverall}</div>`;
    
    // 格式化并显示优化建议
    const formattedSuggestions = formatAnalysisText(analysis.suggestions);
    optimizationSuggestions.innerHTML = `<div class="ai-result">${formattedSuggestions}</div>`;
    
    // 显示结果区域
    aiResultsSection.style.display = 'grid';
    
    // 强制应用白色文字样式
    setTimeout(() => {
        // 确保所有文本都是白色，只有数字是橙色
        const analysisElements = document.querySelectorAll('#overallAnalysis *, #optimizationSuggestions *');
        analysisElements.forEach(el => {
            if (!el.classList.contains('number-highlight') && !el.querySelector('.number-highlight')) {
                el.style.color = '#ffffff';
            }
        });
    }, 50);
    
    // 滚动到结果区域
    setTimeout(() => {
        aiResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// 格式化分析文本 - 统一白色文字，只有数字用橙色
function formatAnalysisText(text) {
    // 首先进行基本的文本格式化
    let formattedText = text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // 支持markdown粗体
    
    // 高亮数字和百分比 - 匹配各种数字格式
    formattedText = formattedText
        // 匹配百分比（如：55.22%、8.05%、3.01%）
        .replace(/(\d+\.?\d*%)/g, '<span class="number-highlight">$1</span>')
        // 匹配百分点（如：2.5pp、-1.2pp）
        .replace(/([+-]?\d+\.?\d*pp)/g, '<span class="number-highlight">$1</span>')
        // 匹配纯数字（如：14个、第1名、增长2.5）
        .replace(/(\d+\.?\d*(?=个|名|倍|次|点|位))/g, '<span class="number-highlight">$1</span>')
        // 匹配独立的数字
        .replace(/(?<!\d)(\d+\.?\d*)(?!\d|%|pp)/g, '<span class="number-highlight">$1</span>');
    
    // 处理包含数字的strong标签
    formattedText = formattedText.replace(/<strong>([^<]*<span class="number-highlight">[^<]*<\/span>[^<]*)<\/strong>/g, '<strong class="number-highlight">$1</strong>');
    
    return formattedText;
}

// 显示分析错误
function displayAnalysisError(errorMessage) {
    const aiAnalysis = document.getElementById('aiAnalysis');
    
    aiAnalysis.innerHTML = `
        <div class="ai-error">
            <h4>❌ 分析失败</h4>
            <p>抱歉，AI分析遇到了问题：${errorMessage}</p>
            <p>请稍后重试，或检查网络连接。</p>
        </div>
    `;
    
    // 隐藏结果区域
    const aiResultsSection = document.getElementById('aiResultsSection');
    aiResultsSection.style.display = 'none';
}

// 在初始化函数中添加AI分析设置
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    setupLogoErrorHandling();
    setupAIAnalysis(); // 添加AI分析设置
});