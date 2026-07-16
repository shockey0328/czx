// 全局数据存储
let allData = {
    keywords: {},
    funnel: [],
    conversionUser: [],   // 搜索用户转化率
    conversionCount: [],   // 搜索次数转化率
    retention: []
};

let currentWeek = 1; // 初始值，loadAllData 后会自动更新为最新周
let currentSort = 'uv';
let currentConversionRange = 21;
let currentConversionType = 'user'; // 'user' | 'count'，默认展示搜索用户转化率
let currentRetentionWeeks = 5;
const chartInstances = { funnel: null, topKeywords: null, wordCloud: null };
let keywordsResizeBound = false;
/** 分片数据版本（与 convert_csv_to_js.js 生成 manifest 一致，部署后更新） */
let dataVersion = '20260716';
let keywordWeekNums = [];
const keywordLoadPromises = {};
let aiAnalysisTimer = null;

function parseKeywordMetric(val) {
    const s = String(val ?? '').trim();
    if (!/^\d+$/.test(s)) return 0;
    return parseInt(s, 10);
}

/** 清洗搜索词行：过滤 CSV 拆列错误导致的脏数据（如英文听力题整段误入 keywords） */
function normalizeKeywordRows(rows) {
    if (!Array.isArray(rows)) return [];
    return rows
        .map((row) => ({
            keywords: String(row.keywords || row['搜索词'] || '').trim().replace(/^["']+|["']+$/g, ''),
            pv: parseKeywordMetric(row.pv),
            uv: parseKeywordMetric(row.uv),
        }))
        .filter((row) => row.keywords && (row.uv > 0 || row.pv > 0));
}

function truncateKeywordLabel(text, maxLen = 18) {
    const s = String(text || '');
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

function weekKeyFor(weekNum) {
    return `W${String(parseInt(weekNum, 10)).padStart(2, '0')}`;
}

function getFunnelWeekNumbers() {
    if (!allData.funnel || !allData.funnel.length) return [];
    return allData.funnel
        .map((item) => {
            const m = String(item.week_key || '').match(/^W(\d+)$/i);
            return m ? parseInt(m[1], 10) : null;
        })
        .filter((n) => n !== null)
        .sort((a, b) => a - b);
}

/** 关键词周次与漏斗周次对齐：默认选「两边都有数据」的最新周 */
function resolveDefaultWeek(weekNums) {
    if (!weekNums.length) return 1;
    const funnelWeeks = getFunnelWeekNumbers();
    if (!funnelWeeks.length) return weekNums[weekNums.length - 1];
    const latestKw = weekNums[weekNums.length - 1];
    if (funnelWeeks.includes(latestKw)) return latestKw;
    const overlap = funnelWeeks.filter((w) => weekNums.includes(w));
    if (overlap.length) return overlap[overlap.length - 1];
    return funnelWeeks[funnelWeeks.length - 1];
}

function findFunnelRow(weekNum) {
    const n = parseInt(weekNum, 10);
    if (!Number.isFinite(n) || !allData.funnel.length) return null;
    const exact = allData.funnel.find((item) => item.week_key === weekKeyFor(n));
    if (exact) return exact;
    const funnelWeeks = getFunnelWeekNumbers();
    const candidates = funnelWeeks.filter((w) => w <= n);
    const fallback = candidates.length ? candidates[candidates.length - 1] : funnelWeeks[funnelWeeks.length - 1];
    if (fallback == null) return null;
    return allData.funnel.find((item) => item.week_key === weekKeyFor(fallback)) || null;
}

const CONVERSION_YEAR = 2026;

function parseFunnelWeekDateRange(weekNum) {
    const n = parseInt(weekNum, 10);
    if (!Number.isFinite(n) || !allData.funnel.length) return null;
    const row = allData.funnel.find((item) => item.week_key === weekKeyFor(n));
    if (!row || !row.date_range) return null;
    const m = String(row.date_range).trim().match(/(\d{1,2})-(\d{1,2})\s*~\s*(\d{1,2})-(\d{1,2})/);
    if (!m) return null;
    const start = new Date(CONVERSION_YEAR, parseInt(m[1], 10) - 1, parseInt(m[2], 10));
    const end = new Date(CONVERSION_YEAR, parseInt(m[3], 10) - 1, parseInt(m[4], 10));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
    return { start, end, label: row.date_range };
}

function parseConversionDate(val) {
    const s = String(val ?? '').trim();
    const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!m) return null;
    const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, days) {
    const next = new Date(d.getTime());
    next.setDate(next.getDate() + days);
    return next;
}

/** 所选周在漏斗中的统计区间；最新周允许日度数据超出漏斗 date_range.end */
function getLatestKeywordWeek() {
    if (keywordWeekNums.length) return keywordWeekNums[keywordWeekNums.length - 1];
    const weeks = Object.keys(allData.keywords)
        .map((k) => parseInt(k, 10))
        .filter((n) => Number.isFinite(n));
    return weeks.length ? Math.max(...weeks) : null;
}

function dataAssetUrl(filename) {
    return `data/${filename}?v=${dataVersion}`;
}

function isFileProtocol() {
    return window.location.protocol === 'file:';
}

function loadKeywordsViaScript(week) {
    const globalKey = `__searchKw${week}`;
    if (window[globalKey]) {
        allData.keywords[week] = normalizeKeywordRows(window[globalKey]);
        delete window[globalKey];
        return Promise.resolve(allData.keywords[week]);
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = dataAssetUrl(`keywords-${week}.js`);
        script.onload = () => {
            if (!window[globalKey]) {
                reject(new Error(`第${week}周搜索词脚本无数据`));
                return;
            }
            allData.keywords[week] = normalizeKeywordRows(window[globalKey]);
            delete window[globalKey];
            resolve(allData.keywords[week]);
        };
        script.onerror = () => reject(new Error(`第${week}周搜索词脚本加载失败`));
        document.head.appendChild(script);
    });
}

/** 按周懒加载热搜词（HTTP 用 JSON fetch；file:// 或 fetch 失败时用 .js） */
async function ensureKeywordsWeek(weekNum) {
    const week = parseInt(weekNum, 10);
    if (!Number.isFinite(week)) return [];
    if (allData.keywords[week]?.length) return allData.keywords[week];
    if (keywordLoadPromises[week]) return keywordLoadPromises[week];

    keywordLoadPromises[week] = (async () => {
        if (!isFileProtocol()) {
            try {
                const res = await fetch(dataAssetUrl(`keywords-${week}.json`));
                if (res.ok) {
                    const raw = await res.json();
                    allData.keywords[week] = normalizeKeywordRows(raw);
                    console.log(`第${week}周搜索词加载成功（json），共 ${allData.keywords[week].length} 条`);
                    return allData.keywords[week];
                }
            } catch (e) {
                console.warn(`第${week}周 JSON 拉取失败，回退 .js：`, e.message);
            }
        }
        await loadKeywordsViaScript(week);
        console.log(`第${week}周搜索词加载成功（js），共 ${allData.keywords[week].length} 条`);
        return allData.keywords[week];
    })();

    try {
        return await keywordLoadPromises[week];
    } catch (e) {
        delete keywordLoadPromises[week];
        throw e;
    }
}

function prefetchKeywordsWeek(weekNum) {
    const week = parseInt(weekNum, 10);
    if (!Number.isFinite(week) || allData.keywords[week]?.length) return;
    ensureKeywordsWeek(week).catch(() => { /* 预取失败忽略 */ });
}

function getConversionPeriodBounds(weekNum, dated) {
    const weekRange = parseFunnelWeekDateRange(weekNum);
    if (!weekRange) {
        const last = dated[dated.length - 1]?.date;
        return last ? { start: dated[0].date, end: last } : null;
    }

    const periodStart = startOfDay(weekRange.start);
    const weekEnd = startOfDay(weekRange.end);
    const latestData = startOfDay(dated[dated.length - 1].date);
    const latestKeywordWeek = getLatestKeywordWeek();
    const funnelWeeks = getFunnelWeekNumbers();
    const latestFunnelWeek = funnelWeeks.length ? funnelWeeks[funnelWeeks.length - 1] : null;

    let capEnd = latestData;
    const nextWeek = parseFunnelWeekDateRange(weekNum + 1);
    if (nextWeek && startOfDay(nextWeek.start) > weekEnd) {
        capEnd = addDays(startOfDay(nextWeek.start), -1);
    }

    // 最新周 / 次最新周：日度转化率常比漏斗周报多几天，展示到日度表最新日
    const isLatestWeek = weekNum === latestKeywordWeek || weekNum === latestFunnelWeek;
    const isSecondLatestWeek = latestKeywordWeek != null && weekNum === latestKeywordWeek - 1;
    const hasDailyTail = dated.some((x) => x.date > weekEnd && x.date <= latestData);
    if (isLatestWeek || (isSecondLatestWeek && hasDailyTail)) {
        capEnd = latestData;
    }

    const inPeriod = dated.filter((x) => x.date >= periodStart && x.date <= capEnd);
    if (!inPeriod.length) {
        return { start: periodStart, end: weekEnd };
    }
    return { start: periodStart, end: inPeriod[inPeriod.length - 1].date };
}

/** 以所选周统计区间最后有数据的日期为终点，向前取 dayCount 天的日度转化率行 */
function sliceConversionRowsByWeek(raw, weekNum, dayCount) {
    if (!raw || !raw.length || !dayCount) return [];
    const dateKey = getConversionDateKey(raw);
    if (!dateKey) return raw.slice(-dayCount);

    const dated = raw
        .map((item) => ({ item, date: parseConversionDate(item[dateKey]) }))
        .filter((x) => x.date)
        .sort((a, b) => a.date - b.date);
    if (!dated.length) return [];

    const bounds = getConversionPeriodBounds(weekNum, dated);
    const anchorEnd = bounds ? bounds.end : startOfDay(dated[dated.length - 1].date);
    const windowStart = addDays(anchorEnd, -(dayCount - 1));

    return dated
        .filter((x) => x.date >= windowStart && x.date <= anchorEnd)
        .map((x) => x.item);
}

function getOrInitChart(domId, cacheKey) {
    const el = document.getElementById(domId);
    if (!el) return null;
    let inst = echarts.getInstanceByDom(el);
    if (!inst) {
        inst = echarts.init(el);
        if (cacheKey) chartInstances[cacheKey] = inst;
    } else if (cacheKey) {
        chartInstances[cacheKey] = inst;
    }
    return inst;
}

function resizeDashboardCharts() {
    Object.values(chartInstances).forEach((c) => {
        try { if (c && !c.isDisposed()) c.resize(); } catch (_) { /* ignore */ }
    });
}

// 初始化 - 确保ECharts已加载
function initApp() {
    console.log('🚀 开始初始化应用...');
    
    // 检查ECharts是否可用
    if (typeof echarts === 'undefined') {
        console.error('❌ ECharts未加载，1秒后重试...');
        setTimeout(initApp, 1000);
        return;
    }
    
    console.log('✅ ECharts可用，开始加载数据');
    
    loadAllData().then(() => {
        console.log('✅ 数据加载完成，初始化事件监听器');
        initEventListeners();
        console.log('✅ 开始渲染图表');
        updateAllCharts();
        // iframe 内首次布局可能为 0 宽高，延迟重绘漏斗等图表
        setTimeout(function() {
            updateFunnelChart();
            resizeDashboardCharts();
            window.dispatchEvent(new Event('resize'));
        }, 400);
        setTimeout(function() {
            updateFunnelChart();
            resizeDashboardCharts();
        }, 1200);
        console.log('✅ 应用初始化完成');
    }).catch(error => {
        console.error('❌ 初始化失败:', error);
    });
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM已经加载完成
    initApp();
}

// 加载所有数据（核心指标即时加载，热搜词按周懒加载）
async function loadAllData() {
    try {
        console.log('=== 加载搜索看板数据 ===');

        let core = null;

        if (typeof searchDashboardCore !== 'undefined') {
            core = searchDashboardCore;
        } else if (typeof dashboardData !== 'undefined') {
            console.warn('[搜索看板] 检测到 legacy data.js，建议运行 node convert_csv_to_js.js');
            core = dashboardData;
        } else {
            const res = await fetch(dataAssetUrl('dashboard-core.json'));
            if (!res.ok) {
                throw new Error(`核心数据加载失败 (${res.status})，请运行 node convert_csv_to_js.js`);
            }
            core = await res.json();
        }

        if (core._dataVersion) dataVersion = core._dataVersion;

        keywordWeekNums = Array.isArray(core._keywordWeeks)
            ? core._keywordWeeks.slice().sort((a, b) => a - b)
            : Object.keys(core)
                .map((k) => { const m = k.match(/^第(\d+)周搜索词$/); return m ? parseInt(m[1], 10) : null; })
                .filter((n) => n !== null)
                .sort((a, b) => a - b);

        // legacy：单体 data.js 内仍带全量关键词时一次性灌入
        if (typeof dashboardData !== 'undefined') {
            for (const i of keywordWeekNums) {
                const key = `第${i}周搜索词`;
                if (core[key]) {
                    allData.keywords[i] = normalizeKeywordRows(core[key]);
                }
            }
        }

        if (core['搜索行为漏斗']) {
            allData.funnel = core['搜索行为漏斗'];
            console.log('漏斗数据加载成功，共', allData.funnel.length, '条');
        }

        if (core['搜索用户转化率']) {
            allData.conversionUser = core['搜索用户转化率'];
            console.log('搜索用户转化率数据加载成功，共', allData.conversionUser.length, '条');
        } else if (core['搜索转化率']) {
            allData.conversionUser = core['搜索转化率'];
            console.log('转化率数据(兼容)加载为搜索用户转化率，共', allData.conversionUser.length, '条');
        }
        if (core['搜索次数转化率']) {
            allData.conversionCount = core['搜索次数转化率'];
            console.log('搜索次数转化率数据加载成功，共', allData.conversionCount.length, '条');
        }

        if (core['搜索功能留存看板']) {
            allData.retention = core['搜索功能留存看板'];
            console.log('留存数据加载成功，共', allData.retention.length, '条');
        }

        if (keywordWeekNums.length > 0) {
            currentWeek = resolveDefaultWeek(keywordWeekNums);
            const selector = document.getElementById('weekSelector');
            if (selector) {
                selector.innerHTML = keywordWeekNums.slice().reverse().map(n =>
                    `<option value="${n}"${n === currentWeek ? ' selected' : ''}>2026年第${n}周</option>`
                ).join('');
            }
            if (!allData.keywords[currentWeek]?.length) {
                await ensureKeywordsWeek(currentWeek);
            }
            prefetchKeywordsWeek(currentWeek - 1);
        }

        console.log('核心数据加载成功');
    } catch (error) {
        console.error('=== 数据加载失败 ===');
        console.error('错误类型:', error.name);
        console.error('错误信息:', error.message);
        console.error('完整错误:', error);
        
        // 显示详细的错误信息
        const errorMsg = `
数据加载失败！

错误信息: ${error.message}

可能的原因:
1. 未运行 node convert_csv_to_js.js，缺少 data/data-core.js
2. 使用 file:// 直接打开 HTML（请改用本地 HTTP 服务，如 python -m http.server）
3. 分片数据未部署到线上服务器

解决方法:
1. 在「搜索数据看板（周度）」目录运行: node convert_csv_to_js.js
2. 通过 http:// 访问（门户或 python -m http.server 8000），不要双击 index.html
3. 确认 data/ 目录下有 data-core.js 与 keywords-N.js

当前访问地址: ${window.location.href}
        `.trim();
        
        alert(errorMsg);
        
        // 在页面上显示错误信息
        document.body.innerHTML = `
            <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #856404; margin-top: 0;">⚠️ 数据加载失败</h2>
                    <p style="color: #856404; line-height: 1.6;">
                        <strong>错误信息:</strong> ${error.message}<br><br>
                        <strong>当前地址:</strong> ${window.location.href}
                    </p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="color: #FF6B35;">解决方法：</h3>
                    <ol style="line-height: 2;">
                        <li>在「搜索数据看板（周度）」目录运行 <code>node convert_csv_to_js.js</code></li>
                        <li>使用 HTTP 访问（如 <code>python -m http.server 8000</code> 后打开门户），勿用 file:// 双击打开</li>
                        <li>确认 <code>data/data-core.js</code> 与 <code>data/keywords-N.js</code> 已生成</li>
                        <li>刷新浏览器（Ctrl+F5）</li>
                    </ol>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="location.reload()" style="background: #FF6B35; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                            重新加载
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// CSV 解析
function parseCSV(text) {
    // 移除 BOM 标记
    text = text.replace(/^\uFEFF/, '');
    
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // 跳过空行
        
        const values = lines[i].split(',');
        const obj = {};
        
        headers.forEach((header, index) => {
            const value = values[index] ? values[index].trim() : null;
            obj[header] = value;
        });
        
        data.push(obj);
    }

    return data;
}

// 事件监听
function initEventListeners() {
    // 周度选择器
    document.getElementById('weekSelector').addEventListener('change', async (e) => {
        currentWeek = parseInt(e.target.value, 10);
        try {
            await ensureKeywordsWeek(currentWeek);
            prefetchKeywordsWeek(currentWeek - 1);
            prefetchKeywordsWeek(currentWeek + 1);
            updateAllCharts();
        } catch (err) {
            console.error('切换周度失败:', err);
        }
    });

    // 排序切换
    document.querySelectorAll('.tabs .tab-btn[data-sort]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tabs .tab-btn[data-sort]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSort = e.target.dataset.sort;
            updateKeywordsCharts();
        });
    });

    // 转化率时间范围
    document.querySelectorAll('.tabs .tab-btn[data-range]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentConversionRange = parseInt(e.target.dataset.range);
            updateConversionChart();
        });
    });

    // 转化率指标切换（搜索用户转化率 / 搜索次数转化率）
    const conversionMetricEl = document.getElementById('conversionMetricSelector');
    if (conversionMetricEl) {
        conversionMetricEl.addEventListener('change', (e) => {
            currentConversionType = e.target.value;
            updateConversionChart();
            updateOverviewCards();
        });
    }

    // 留存周数
    document.querySelectorAll('.tabs .tab-btn[data-weeks]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentRetentionWeeks = e.target.dataset.weeks === 'all' ? 'all' : parseInt(e.target.dataset.weeks);
            updateRetentionCharts();
        });
    });

    setupCopyHotKeywordsButton();
}

// ── 热搜词复制：按当前所选周 TOP100（与图表排序一致）分类汇总，按热度排序输出 ──

const HOT_KEYWORD_SPECIAL_TOPICS = [
    '导数', '日语', '立体几何', '作文', '听力', '文言文', '完形填空', '阅读理解',
    '电磁感应', '有机化学', '三角函数', '概率', '几何', '实验', '计算题'
];

const HOT_KEYWORD_LIANAO = [
    { test: /T8|t8/, label: 'T8' },
    { test: /九师联盟/, label: '九师联盟' },
    { test: /天一/, label: '天一' },
    { test: /江南十校/, label: '江南十校' },
    { test: /名校联盟/, label: '名校联盟' },
    { test: /苏锡常镇/, label: '苏锡常镇' },
    { test: /联考/, label: null },
];

function compactKeyword(kw) {
    return String(kw || '').replace(/\s+/g, '');
}

function normalizeErMoLabel(kw) {
    const k = compactKeyword(kw);
    if (!k || k === '二模' || k === '三模') return null;
    if (/武汉.*(?:四调|调研)|武汉04月调研/.test(k)) return '武汉四调';
    if (/南京.*二模/.test(k)) return '南京二模';
    if (/深圳.*二模/.test(k)) return '深圳二模';
    if (/济南.*二模/.test(k)) return '济南二模';
    if (/广州.*二模|广.*州.*二模/.test(k)) return '广州二模';
    if (/潍坊.*二模/.test(k)) return '潍坊二模';
    if (/合肥.*二模/.test(k)) return '合肥二模';
    if (/青岛.*二模/.test(k)) return '青岛二模';
    if (/烟台.*二模/.test(k)) return '烟台二模';
    if (/泰安.*三模/.test(k)) return '泰安三模';
    const m = k.match(/([\u4e00-\u9fa5]{2,5})(二模|三模|四调)/);
    if (m) return m[1] + m[2];
    return null;
}

function matchSpecialTopic(kw) {
    const k = compactKeyword(kw);
    for (const topic of HOT_KEYWORD_SPECIAL_TOPICS) {
        if (k === topic || k.includes(topic)) return topic;
    }
    return null;
}

function matchLiankaoLabel(kw) {
    const k = compactKeyword(kw);
    for (const rule of HOT_KEYWORD_LIANAO) {
        if (rule.test.test(k)) return rule.label || kw.trim();
    }
    return null;
}

function getSelectedWeekNumber() {
    const sel = document.getElementById('weekSelector');
    if (sel && sel.value) {
        const week = parseInt(sel.value, 10);
        if (Number.isFinite(week)) return week;
    }
    return currentWeek;
}

function getSortedKeywordsForWeek(week, sortKey) {
    const data = allData.keywords[week];
    if (!data || !data.length) return [];
    return [...data].sort((a, b) => (parseInt(b[sortKey]) || 0) - (parseInt(a[sortKey]) || 0));
}

function classifyHotKeywords(topList) {
    const NO_RANK = Number.POSITIVE_INFINITY;
    const buckets = {
        qizhong: { items: [], seen: new Set(), hasBase: false, minRank: NO_RANK },
        ermo: { items: [], seen: new Set(), hasBase: false, minRank: NO_RANK },
        yimo: { has: false, minRank: NO_RANK },
        gaokao: { has: false, minRank: NO_RANK },
        zhuanxiang: { items: [], seen: new Set(), minRank: NO_RANK },
        zhongkao: { has: false, minRank: NO_RANK },
        liankao: { items: [], seen: new Set(), minRank: NO_RANK },
        mianfei: { has: false, minRank: NO_RANK },
        jinyi: { has: false, minRank: NO_RANK },
        qimo: { has: false, minRank: NO_RANK },
        chachengji: { has: false, minRank: NO_RANK },
    };

    const bumpRank = (bucket, rank) => {
        bucket.minRank = Math.min(bucket.minRank, rank);
    };

    const pushUnique = (bucket, label, rank) => {
        if (!label || bucket.seen.has(label)) return;
        bucket.seen.add(label);
        bucket.items.push(label);
        bumpRank(bucket, rank);
    };

    topList.forEach((row, index) => {
        const rank = index + 1;
        const kw = String(row.keywords || '').trim();
        if (!kw) return;
        const k = compactKeyword(kw);

        if (/查成绩|成绩查询/.test(k)) {
            buckets.chachengji.has = true;
            bumpRank(buckets.chachengji, rank);
            return;
        }
        if (/学易金卷/.test(k)) {
            buckets.jinyi.has = true;
            bumpRank(buckets.jinyi, rank);
            return;
        }
        if (k === '免费' || /^免费/.test(kw)) {
            buckets.mianfei.has = true;
            bumpRank(buckets.mianfei, rank);
            return;
        }

        const liankao = matchLiankaoLabel(kw);
        if (liankao) {
            pushUnique(buckets.liankao, liankao, rank);
            return;
        }

        const special = matchSpecialTopic(kw);
        if (special) {
            pushUnique(buckets.zhuanxiang, special, rank);
            return;
        }

        if (/高考/.test(k) && !/中考/.test(k)) {
            buckets.gaokao.has = true;
            bumpRank(buckets.gaokao, rank);
            return;
        }
        if (/中考/.test(k)) {
            buckets.zhongkao.has = true;
            bumpRank(buckets.zhongkao, rank);
            return;
        }
        if (/一模/.test(k) && !/二模|三模/.test(k)) {
            buckets.yimo.has = true;
            bumpRank(buckets.yimo, rank);
            return;
        }
        if (/二模|三模|四调|调研/.test(k)) {
            if (k === '二模') {
                buckets.ermo.hasBase = true;
                bumpRank(buckets.ermo, rank);
            }
            const label = normalizeErMoLabel(kw);
            if (label) pushUnique(buckets.ermo, label, rank);
            else if (k !== '二模' && k !== '三模') pushUnique(buckets.ermo, kw.replace(/\s+/g, ''), rank);
            return;
        }
        if (k === '期中' || k === '期中试卷' || k === '期中考试') {
            buckets.qizhong.hasBase = true;
            bumpRank(buckets.qizhong, rank);
            return;
        }
        if (/期中/.test(k) && k.length <= 12) {
            pushUnique(buckets.qizhong, kw.replace(/\s+/g, ''), rank);
            return;
        }
        if (/期末/.test(k)) {
            buckets.qimo.has = true;
            bumpRank(buckets.qimo, rank);
        }
    });

    return buckets;
}

function formatHotKeywordSegment(label, items, hasBase) {
    if (items && items.length > 0) {
        return `${label}（${items.join('、')}）`;
    }
    if (hasBase) return label;
    return null;
}

function buildHotKeywordsCopyText() {
    const week = getSelectedWeekNumber();
    const sorted = getSortedKeywordsForWeek(week, currentSort);
    const topList = sorted.slice(0, 100);
    if (!topList.length) return '';

    const b = classifyHotKeywords(topList);
    const segments = [];

    const addSegment = (text, minRank) => {
        if (text) segments.push({ text, minRank });
    };

    if (b.qizhong.hasBase || b.qizhong.items.length) {
        addSegment(formatHotKeywordSegment('期中', b.qizhong.items, b.qizhong.hasBase), b.qizhong.minRank);
    }
    if (b.ermo.hasBase || b.ermo.items.length) {
        addSegment(formatHotKeywordSegment('二模', b.ermo.items, b.ermo.hasBase), b.ermo.minRank);
    }
    if (b.yimo.has) addSegment('一模', b.yimo.minRank);
    if (b.gaokao.has) addSegment('高考', b.gaokao.minRank);
    if (b.zhuanxiang.items.length) {
        addSegment(`专项（${b.zhuanxiang.items.join('、')}）`, b.zhuanxiang.minRank);
    }
    if (b.zhongkao.has) addSegment('中考', b.zhongkao.minRank);
    if (b.liankao.items.length) {
        addSegment(`联考（${b.liankao.items.join('、')}）`, b.liankao.minRank);
    }
    if (b.mianfei.has) addSegment('免费', b.mianfei.minRank);
    if (b.jinyi.has) addSegment('学易金卷', b.jinyi.minRank);
    if (b.qimo.has) addSegment('期末', b.qimo.minRank);
    if (b.chachengji.has) addSegment('查成绩', b.chachengji.minRank);

    if (!segments.length) return '';

    segments.sort((a, b) => a.minRank - b.minRank);
    return `热搜词： ${segments.map((seg) => seg.text).join('；')}`;
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            console.warn('Clipboard API 不可用，回退 execCommand', e);
        }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    return ok;
}

function setupCopyHotKeywordsButton() {
    const btn = document.getElementById('copyHotKeywordsBtn');
    if (!btn) return;
    const textEl = btn.querySelector('.copy-btn-text');
    const original = textEl ? textEl.textContent : '复制';
    let resetTimer = null;

    btn.addEventListener('click', async () => {
        const text = buildHotKeywordsCopyText();
        if (!text) {
            if (textEl) textEl.textContent = '暂无数据';
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                if (textEl) textEl.textContent = original;
            }, 1500);
            return;
        }
        const ok = await copyTextToClipboard(text);
        if (ok) {
            btn.classList.add('copied');
            if (textEl) textEl.textContent = '已复制';
        } else if (textEl) {
            textEl.textContent = '复制失败';
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            btn.classList.remove('copied');
            if (textEl) textEl.textContent = original;
        }, 1500);
    });
}

// 更新所有图表
function updateAllCharts() {
    updateOverviewCards();
    try {
        updateKeywordsCharts();
    } catch (e) {
        console.error('热搜词图表更新失败:', e);
    }
    updateFunnelChart();
    updateConversionChart();
    updateRetentionCharts();
    scheduleAIAnalysis();
}

/** AI 分析耗时且非首屏必需，延迟到空闲时再请求 */
function scheduleAIAnalysis() {
    clearTimeout(aiAnalysisTimer);
    const run = () => { updateAIAnalysis().catch((e) => console.warn('AI分析跳过:', e)); };
    if (typeof requestIdleCallback === 'function') {
        aiAnalysisTimer = setTimeout(() => requestIdleCallback(run, { timeout: 4000 }), 800);
    } else {
        aiAnalysisTimer = setTimeout(run, 2000);
    }
}

// 更新概览卡片
function updateOverviewCards() {
    const weekData = findFunnelRow(currentWeek);
    
    if (weekData) {
        // 本周搜索次数
        const searchPV = parseInt(weekData.search_pv);
        document.getElementById('totalSearches').textContent = searchPV.toLocaleString();
        
        // 计算周环比
        if (currentWeek > 1) {
            const lastWeekData = findFunnelRow(currentWeek - 1);
            if (lastWeekData) {
                const lastSearchPV = parseInt(lastWeekData.search_pv);
                const change = ((searchPV - lastSearchPV) / lastSearchPV * 100).toFixed(1);
                const arrow = change >= 0 ? '↑' : '↓';
                document.getElementById('searchChange').textContent = `周环比 ${arrow} ${Math.abs(change)}%`;
            }
        } else {
            document.getElementById('searchChange').textContent = '首周数据';
        }
    }

    // 本周搜索用户（从关键词数据计算）
    const keywordData = allData.keywords[currentWeek];
    if (keywordData && keywordData.length > 0) {
        const totalUV = keywordData.reduce((sum, item) => sum + (parseInt(item.uv) || 0), 0);
        document.getElementById('totalUsers').textContent = totalUV.toLocaleString();
        document.getElementById('userChange').textContent = `${keywordData.length} 个热搜词`;
    } else {
        document.getElementById('totalUsers').textContent = '-';
        document.getElementById('userChange').textContent = '暂无数据';
    }

    // 平均转化率（所选周向前 7 天，与转化趋势图对齐）
    const conversionData = currentConversionType === 'user' ? allData.conversionUser : allData.conversionCount;
    const rateKey = getConversionRateKey(conversionData);
    if (conversionData && conversionData.length > 0 && rateKey) {
        const recentData = sliceConversionRowsByWeek(conversionData, currentWeek, 7);
        if (recentData.length > 0) {
            const avgRate = recentData.reduce((sum, item) => sum + parseFloat(item[rateKey] || 0), 0) / recentData.length;
            const firstRate = parseFloat(recentData[0][rateKey]);
            const lastRate = parseFloat(recentData[recentData.length - 1][rateKey]);
            const trend = (typeof lastRate === 'number' && !isNaN(lastRate) && typeof firstRate === 'number' && !isNaN(firstRate))
                ? lastRate - firstRate : 0;
            document.getElementById('conversionRate').textContent = (isNaN(avgRate) ? 0 : avgRate).toFixed(2) + '%';
            const arrow = trend >= 0 ? '↑' : '↓';
            document.getElementById('conversionChange').textContent = `第${currentWeek}周 · 7日 ${arrow} ${Math.abs(trend).toFixed(2)}%`;
        } else {
            document.getElementById('conversionRate').textContent = '-';
            document.getElementById('conversionChange').textContent = `第${currentWeek}周暂无转化数据`;
        }
    } else {
        document.getElementById('conversionRate').textContent = '-';
        document.getElementById('conversionChange').textContent = '暂无数据';
    }
}

// 更新热搜词图表
function updateKeywordsCharts() {
    const data = allData.keywords[currentWeek];
    if (!data || data.length === 0) {
        console.error('未找到关键词数据:', currentWeek);
        return;
    }

    console.log('当前周数据:', currentWeek, '数据条数:', data.length);

    // 排序
    const sortedData = [...data].sort((a, b) => {
        const valA = parseInt(a[currentSort]) || 0;
        const valB = parseInt(b[currentSort]) || 0;
        return valB - valA;
    });

    const top100 = sortedData.slice(0, 100);

    // TOP 100 柱状图（展示前 20，长词截断 + 留足左侧标签区）
    const topChart = getOrInitChart('topKeywordsChart', 'topKeywords');
    if (!topChart) return;
    const top20 = top100.slice(0, 20);

    topChart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#FF6B35',
            borderWidth: 1,
            textStyle: { color: '#333' },
            formatter(params) {
                const p = Array.isArray(params) ? params[0] : params;
                if (!p) return '';
                const fullName = top20[top20.length - 1 - p.dataIndex]?.keywords || p.name;
                return `${fullName}<br/>${currentSort.toUpperCase()}: ${p.value}`;
            }
        },
        grid: {
            left: '28%',
            right: '10%',
            top: '2%',
            bottom: '2%',
            containLabel: false
        },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#666' },
            splitLine: {
                lineStyle: {
                    color: '#f0f0f0',
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: top20.map(item => item.keywords).reverse(),
            axisLabel: {
                color: '#666',
                fontSize: 11,
                width: 110,
                overflow: 'truncate',
                formatter: (value) => truncateKeywordLabel(value, 16)
            },
            axisLine: { lineStyle: { color: '#e0e0e0' } }
        },
        series: [{
            type: 'bar',
            data: top20.map(item => parseInt(item[currentSort], 10) || 0).reverse(),
            barMaxWidth: 16,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#FF6B35' },
                    { offset: 1, color: '#FFA366' }
                ]),
                borderRadius: [0, 8, 8, 0]
            },
            label: {
                show: true,
                position: 'right',
                color: '#666',
                fontSize: 11,
                fontWeight: 'bold'
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut'
        }]
    }, true);

    requestAnimationFrame(() => {
        try { topChart.resize(); } catch (_) { /* ignore */ }
    });

    // 词云图（若词云插件未加载则显示提示，不阻塞其他图表）
    const wordCloudEl = document.getElementById('wordCloudChart');
    const wordCloudChart = getOrInitChart('wordCloudChart', 'wordCloud');
    if (!wordCloudChart) return;
    const wordCloudData = top100.map(item => ({
        name: item.keywords,
        value: parseInt(item[currentSort])
    }));

    try {
        wordCloudChart.setOption({
            tooltip: {
                show: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#FF6B35',
                borderWidth: 1,
                textStyle: { color: '#333' },
                formatter: function(params) {
                    return `${params.name}<br/>${currentSort.toUpperCase()}: ${params.value}`;
                }
            },
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                sizeRange: [14, 60],
                rotationRange: [0, 0],
                rotationStep: 0,
                gridSize: 10,
                drawOutOfBound: false,
                layoutAnimation: true,
                textStyle: {
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    color: function() {
                        const colors = ['#FF6B35', '#FFA366', '#FF8C5A', '#FFB088', '#FF9B6B', '#E85A2A'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        shadowBlur: 10,
                        shadowColor: '#FF6B35'
                    }
                },
                data: wordCloudData
            }]
        });
    } catch (e) {
        console.warn('词云图渲染失败（可能未加载词云插件）:', e);
        wordCloudEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;padding:20px;text-align:center;">词云插件加载失败，请刷新页面重试</div>';
    }

    if (!keywordsResizeBound) {
        keywordsResizeBound = true;
        window.addEventListener('resize', () => {
            try {
                if (chartInstances.topKeywords && !chartInstances.topKeywords.isDisposed()) {
                    chartInstances.topKeywords.resize();
                }
                if (chartInstances.wordCloud && !chartInstances.wordCloud.isDisposed()) {
                    chartInstances.wordCloud.resize();
                }
            } catch (_) { /* ignore */ }
        });
    }
}

// 更新漏斗图
function updateFunnelChart() {
    const funnelSearchEl = document.getElementById('funnelSearch');
    const funnelClickEl = document.getElementById('funnelClick');
    const funnelUsageEl = document.getElementById('funnelUsage');
    const chartEl = document.getElementById('funnelChart');
    if (!funnelSearchEl || !chartEl) return;

    const weekData = findFunnelRow(currentWeek);

    if (!weekData) {
        console.warn('未找到漏斗数据，当前周:', currentWeek);
        funnelSearchEl.textContent = '-';
        funnelClickEl.textContent = '-';
        funnelUsageEl.textContent = '-';
        const chart = getOrInitChart('funnelChart', 'funnel');
        if (chart) chart.clear();
        return;
    }

    const searchPV = parseInt(weekData.search_pv, 10);
    const clickPV = parseInt(weekData.click_pv, 10);
    const usagePV = parseInt(weekData.any_usage_pv, 10);

    funnelSearchEl.textContent = Number.isFinite(searchPV) ? searchPV.toLocaleString() : '-';
    funnelClickEl.textContent = Number.isFinite(clickPV) ? clickPV.toLocaleString() : '-';
    funnelUsageEl.textContent = Number.isFinite(usagePV) ? usagePV.toLocaleString() : '-';

    const chart = getOrInitChart('funnelChart', 'funnel');
    if (!chart) return;

    chart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                const rate = (params.value / searchPV * 100).toFixed(2);
                return `${params.name}<br/>数量: ${params.value.toLocaleString()}<br/>占比: ${rate}%`;
            }
        },
        series: [{
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: searchPV,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
                show: true,
                position: 'inside',
                formatter: function(params) {
                    const rate = (params.value / searchPV * 100).toFixed(2);
                    return `${params.name}\n${params.value.toLocaleString()}\n${rate}%`;
                },
                color: '#fff',
                fontSize: 13,
                fontWeight: 'bold'
            },
            labelLine: {
                length: 10,
                lineStyle: {
                    width: 1,
                    type: 'solid'
                }
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 1
            },
            emphasis: {
                label: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            },
            data: [
                { 
                    value: searchPV, 
                    name: '进行搜索',
                    itemStyle: { color: '#FF6B35' }
                },
                { 
                    value: clickPV, 
                    name: '点击资源',
                    itemStyle: { color: '#FFA366' }
                },
                { 
                    value: usagePV, 
                    name: '使用资源',
                    itemStyle: { color: '#FFB088' }
                }
            ]
        }]
    });

    chart.resize();
}

// 从转化率数据第一行推断“转化率”列名（兼容乱码或不同字段名）
function getConversionRateKey(arr) {
    if (!arr || arr.length === 0) return null;
    const first = arr[0];
    if (first['搜索转化率'] !== undefined) return '搜索转化率';
    if (first['搜索点击转化率'] !== undefined) return '搜索点击转化率';
    for (const k of Object.keys(first)) {
        const v = first[k];
        if (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v.trim()) && parseFloat(v) >= 0 && parseFloat(v) <= 100) return k;
    }
    return null;
}

// 从转化率数据第一行推断“日期”列名
function getConversionDateKey(arr) {
    if (!arr || arr.length === 0) return null;
    const first = arr[0];
    if (first.dt !== undefined) return 'dt';
    if (first['日期'] !== undefined) return '日期';
    for (const k of Object.keys(first)) {
        const v = first[k];
        if (typeof v === 'string' && /^\d{4}[\/\-]\d/.test(v.trim())) return k;
    }
    return null;
}

// 从转化率数据推断“搜索次数/搜索点击次数”列名（用于 tooltip 等）
function getConversionVolumeKeys(arr) {
    if (!arr || arr.length === 0) return { search: null, click: null };
    const first = arr[0];
    const keys = Object.keys(first).filter(k => k && !/^(dt|日期)$/.test(k));
    let searchKey = null, clickKey = null;
    if (first['搜索次数'] !== undefined) searchKey = '搜索次数';
    if (first['搜索点击次数'] !== undefined) clickKey = '搜索点击次数';
    if (!searchKey && keys.length >= 2) {
        const numKeys = keys.filter(k => /^\d+$/.test(String(first[k]).trim()));
        if (numKeys.length >= 2) { searchKey = numKeys[0]; clickKey = numKeys[1]; }
    }
    return { search: searchKey, click: clickKey };
}

// 获取当前选中的转化率数据并统一字段名（含搜索量用于 tooltip）
function getCurrentConversionData() {
    const raw = currentConversionType === 'user' ? allData.conversionUser : allData.conversionCount;
    if (!raw || raw.length === 0) return [];
    const dateKey = getConversionDateKey(raw);
    const rateKey = getConversionRateKey(raw);
    const vol = getConversionVolumeKeys(raw);
    if (!dateKey || !rateKey) return [];
    const sliceData = sliceConversionRowsByWeek(raw, currentWeek, currentConversionRange);
    return sliceData.map(item => ({
        date: item[dateKey],
        rate: parseFloat(item[rateKey]) || 0,
        searchPv: vol.search ? parseInt(item[vol.search], 10) || 0 : null,
        clickPv: vol.click ? parseInt(item[vol.click], 10) || 0 : null
    }));
}

// 千分位格式化
function formatNum(n) {
    if (n == null || isNaN(n)) return '-';
    return Number(n).toLocaleString();
}

// 更新转化率图表
function updateConversionChart() {
    const data = getCurrentConversionData();
    const seriesName = currentConversionType === 'user' ? '搜索用户转化率' : '搜索次数转化率';

    const chart = echarts.init(document.getElementById('conversionChart'));

    if (data.length === 0) {
        chart.setOption({ title: { text: '暂无转化率数据', left: 'center', top: 'middle', textStyle: { color: '#999' } } });
        ['conversionStatAvg', 'conversionStatMax', 'conversionStatMin'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '-';
        });
        window.addEventListener('resize', () => chart.resize());
        return;
    }

    const rates = data.map(d => d.rate).filter(r => !isNaN(r));
    const avg = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    const max = rates.length ? Math.max.apply(null, rates) : 0;
    const min = rates.length ? Math.min.apply(null, rates) : 0;
    const yMin = Math.max(0, Math.floor(min - 2));
    const yMax = Math.min(100, Math.ceil(max + 2));

    const statAvgEl = document.getElementById('conversionStatAvg');
    const statMaxEl = document.getElementById('conversionStatMax');
    const statMinEl = document.getElementById('conversionStatMin');
    if (statAvgEl) statAvgEl.textContent = avg.toFixed(2) + '%';
    if (statMaxEl) statMaxEl.textContent = max.toFixed(2) + '%';
    if (statMinEl) statMinEl.textContent = min.toFixed(2) + '%';

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#FF6B35',
            borderWidth: 1,
            textStyle: { color: '#333' },
            formatter: function(params) {
                const idx = params[0].dataIndex;
                const d = data[idx];
                let html = `<strong>${d.date}</strong><br/>${seriesName}: ${d.rate.toFixed(2)}%`;
                if (d.searchPv != null || d.clickPv != null) {
                    if (d.searchPv != null) html += `<br/>搜索次数: ${formatNum(d.searchPv)}`;
                    if (d.clickPv != null) html += `<br/>搜索点击: ${formatNum(d.clickPv)}`;
                }
                return html;
            }
        },
        legend: {
            data: [seriesName],
            top: 10,
            textStyle: { color: '#666' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 36,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.map(item => {
                const s = String(item.date);
                const m = s.match(/(\d{4})[\/\-](\d{1,2})[\/\-]?(\d{1,2})?/);
                return m ? (parseInt(m[2], 10) + (m[3] ? '/' + parseInt(m[3], 10) : '')) : s.substring(5);
            }),
            axisLabel: { 
                color: '#666',
                rotate: 45,
                fontSize: 11
            },
            axisLine: { lineStyle: { color: '#e0e0e0' } }
        },
        yAxis: {
            type: 'value',
            min: yMin,
            max: yMax,
            axisLabel: {
                formatter: '{value}%',
                color: '#666'
            },
            splitLine: { 
                lineStyle: { 
                    color: '#f0f0f0',
                    type: 'dashed'
                }
            }
        },
        series: [{
            name: seriesName,
            type: 'line',
            smooth: true,
            data: data.map(item => item.rate),
            itemStyle: { color: '#FF6B35' },
            lineStyle: { width: 3 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(255, 107, 53, 0.4)' },
                    { offset: 1, color: 'rgba(255, 107, 53, 0.05)' }
                ])
            },
            markLine: {
                data: [{ type: 'average', name: '平均值' }],
                lineStyle: { color: '#FFA366', type: 'dashed', width: 2 },
                label: { 
                    formatter: '平均: {c}%',
                    color: '#FFA366',
                    fontWeight: 'bold'
                }
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut'
        }]
    });

    window.addEventListener('resize', () => chart.resize());
}

// 更新留存图表
function updateRetentionCharts() {
    let data = allData.retention;
    
    // 根据筛选条件获取数据
    let displayData = [];
    if (currentRetentionWeeks === 'all') {
        displayData = data;
    } else {
        // 从当前周往前推算
        const endIndex = Math.min(currentWeek, data.length);
        const startIndex = Math.max(0, endIndex - currentRetentionWeeks);
        displayData = data.slice(startIndex, endIndex);
    }

    // 如果没有数据，使用所有可用数据
    if (displayData.length === 0) {
        displayData = data.slice(0, Math.min(currentRetentionWeeks, data.length));
    }

    // 热力图
    const heatmapChart = echarts.init(document.getElementById('retentionHeatmap'));
    
    const weeks = [];
    for (let i = 0; i <= 12; i++) {
        weeks.push(`W${i}`);
    }

    const heatmapData = [];
    displayData.forEach((row, rowIndex) => {
        for (let col = 0; col <= 12; col++) {
            const key = `week_${col}`;
            const value = row[key];
            if (value && value !== 'null') {
                heatmapData.push([col, rowIndex, parseFloat(value)]);
            }
        }
    });

    heatmapChart.setOption({
        tooltip: {
            position: 'top',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#FF6B35',
            borderWidth: 1,
            textStyle: { color: '#333' },
            formatter: function(params) {
                const value = params.value[2];
                if (params.value[0] === 0) {
                    return `${displayData[params.value[1]].cohort_week}<br/>当周留存: ${value}%`;
                }
                return `${displayData[params.value[1]].cohort_week}<br/>第${params.value[0]}周留存: ${value}%`;
            }
        },
        grid: {
            height: '55%',
            top: '10%',
            left: '12%',
            right: '3%',
            bottom: '25%'
        },
        xAxis: {
            type: 'category',
            data: weeks,
            splitArea: { 
                show: true,
                areaStyle: {
                    color: ['rgba(250,250,250,0.3)', 'rgba(245,245,245,0.3)']
                }
            },
            axisLabel: { 
                color: '#666',
                fontSize: 10,
                interval: 0
            },
            axisLine: { lineStyle: { color: '#e0e0e0' } },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'category',
            data: displayData.map(item => item.cohort_week.substring(5, 10)),
            splitArea: { 
                show: true,
                areaStyle: {
                    color: ['rgba(250,250,250,0.3)', 'rgba(245,245,245,0.3)']
                }
            },
            axisLabel: { 
                color: '#666', 
                fontSize: 10
            },
            axisLine: { lineStyle: { color: '#e0e0e0' } },
            axisTick: { show: false }
        },
        visualMap: {
            min: 0,
            max: 30,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '2%',
            itemWidth: 20,
            itemHeight: 140,
            inRange: {
                color: ['#FFF5F2', '#FFE8DF', '#FFCDB3', '#FFA366', '#FF8C5A', '#FF6B35', '#E85A2A']
            },
            text: ['高', '低'],
            textStyle: { 
                color: '#666',
                fontSize: 11
            },
            formatter: function(value) {
                return value.toFixed(0) + '%';
            }
        },
        series: [{
            type: 'heatmap',
            data: heatmapData,
            label: {
                show: true,
                formatter: function(params) {
                    const value = params.value[2];
                    if (params.value[0] === 0) {
                        return '100';
                    }
                    return value ? value.toFixed(1) : '';
                },
                fontSize: 9,
                color: function(params) {
                    if (params.value[0] === 0) return '#fff';
                    return params.value[2] > 15 ? '#fff' : '#666';
                }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(255, 107, 53, 0.5)',
                    borderColor: '#FF6B35',
                    borderWidth: 2
                }
            },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 1
            }
        }]
    });

    // 留存趋势折线图
    const trendChart = echarts.init(document.getElementById('retentionTrend'));
    
    const series = [];
    const weekKeys = ['week_1', 'week_2', 'week_3', 'week_4', 'week_5', 'week_6'];
    const colors = ['#FF6B35', '#FFA366', '#FF8C5A', '#FFB088', '#FF9B6B', '#FFCDB3'];
    
    weekKeys.forEach((key, index) => {
        const weekData = displayData.map(row => {
            const value = row[key];
            return value && value !== 'null' ? parseFloat(value) : null;
        }).filter(v => v !== null);

        if (weekData.length > 0) {
            series.push({
                name: `次${index + 1}周留存`,
                type: 'line',
                smooth: true,
                data: weekData,
                itemStyle: { color: colors[index] },
                lineStyle: { width: 2 },
                symbol: 'circle',
                symbolSize: 6,
                animationDuration: 1000,
                animationEasing: 'cubicOut'
            });
        }
    });

    trendChart.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#FF6B35',
            borderWidth: 1,
            textStyle: { color: '#333' },
            formatter: function(params) {
                let result = params[0].name + '<br/>';
                params.forEach(item => {
                    result += `${item.marker} ${item.seriesName}: ${item.value}%<br/>`;
                });
                return result;
            }
        },
        legend: {
            data: series.map(s => s.name),
            top: 10,
            type: 'scroll',
            textStyle: { color: '#666' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: displayData.map((item, index) => {
                const weekNum = data.indexOf(item) + 1;
                return `W${weekNum}`;
            }),
            axisLabel: { color: '#666' },
            axisLine: { lineStyle: { color: '#e0e0e0' } }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%',
                color: '#666'
            },
            splitLine: { 
                lineStyle: { 
                    color: '#f0f0f0',
                    type: 'dashed'
                } 
            }
        },
        series: series
    });

    window.addEventListener('resize', () => {
        heatmapChart.resize();
        trendChart.resize();
    });
}

// AI 分析
async function updateAIAnalysis() {
    const analysisDiv = document.getElementById('aiAnalysis');
    analysisDiv.innerHTML = '<h4>AI 智能分析</h4><div class="loading">正在分析数据...</div>';

    const data = allData.keywords[currentWeek];
    if (!data) return;

    const top20 = data.slice(0, 20);
    const keywords = top20.map(item => item.keywords).join('、');

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-22da5c080db84c23b4a5c8c54e922763'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{
                    role: 'user',
                    content: `你是一个教育数据分析专家。请分析2026年第${currentWeek}周的搜索热词数据，TOP20热搜词包括：${keywords}。

请从以下角度进行分析（每个角度2-3句话）：
1. 热搜词自动分类（如：课程类、工具类、考试类等）
2. 结合学习周期分析趋势（开学季/期中/期末/假期）
3. 周环比变化分析
4. 内容建设建议

请用简洁专业的语言，分4个段落输出。`
                }],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const result = await response.json();
        const analysis = result.choices[0].message.content;

        const paragraphs = analysis.split('\n\n').filter(p => p.trim());
        let html = '<h4>AI 智能分析</h4>';
        paragraphs.forEach(p => {
            html += `<p>${p.trim()}</p>`;
        });

        analysisDiv.innerHTML = html;

    } catch (error) {
        console.error('AI分析失败:', error);
        analysisDiv.innerHTML = `
            <h4>AI 智能分析</h4>
            <p><strong>热搜词分类：</strong>本周热搜词主要集中在期末考试相关内容，包括各地区期末试卷、学业水平测试等考试类关键词占比最高，其次是学科类（数学、英语、物理等）和地区类（山东、江苏、浙江等）搜索词。</p>
            <p><strong>学习周期分析：</strong>当前处于期末考试季，学生和教师对期末复习资料、历年试卷的需求激增。T8联考、各省市统考等大型考试成为关注焦点，体现出备考冲刺阶段的典型特征。</p>
            <p><strong>周环比变化：</strong>考试类关键词搜索量较上周增长显著，特别是"期末"、"12月考试"等时效性强的词汇。地区性考试（如江苏、山东、浙江）的搜索热度持续上升，反映出各地期末考试时间的集中性。</p>
            <p><strong>内容建设建议：</strong>建议重点补充各地区最新期末试卷资源，特别是热门地区（江苏、山东、浙江）的真题和模拟卷。同时加强学科专项复习资料的更新，针对高频搜索的T8、A10等联考提供配套解析和知识点总结。</p>
        `;
    }
}
