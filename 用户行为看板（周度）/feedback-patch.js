/**
 * 用户行为看板 dashboard-db.html 的反馈工具补丁
 * 作用：让看板支持从 URL 参数接收 uid/time/feedback，自动填充并触发【针对性分析】，
 *       分析完成后通过 postMessage 把结论回传给打开它的反馈工具页面（依赖 window.opener）。
 *
 * URL 参数约定（由反馈工具生成）：
 *   ?uid=88246469&time=2026-08-13+19:03:08&feedback=用户原文...
 */

(function () {
  const params = new URLSearchParams(location.search);
  const uid = params.get('uid') || '';
  const time = params.get('time') || '';
  const feedback = params.get('feedback') || '';
  if (!uid) return; // 无 uid 时不执行自动填充

  function parseYmd(dt) {
    try {
      const d = new Date(dt.replace(' ', 'T'));
      if (isNaN(d.getTime())) return null;
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return null;
    }
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
  }

  // 反馈时间对应日期作为 endDate，startDate 往前 7 天
  const endYmd = parseYmd(time) || parseYmd(new Date());
  let startYmd = endYmd;
  if (endYmd) {
    const s = new Date(endYmd + 'T00:00:00');
    s.setDate(s.getDate() - 7);
    startYmd = s.toISOString().slice(0, 10);
  }

  setValue('userIds', uid);
  setValue('startDate', startYmd);
  setValue('endDate', endYmd);

  // 针对性分析的提问：聚焦这条具体反馈背后的真实需求与对应模块/路径
  const prompt = feedback
    ? '请针对以下这条用户反馈做【针对性分析】（反馈时间：' + (time || '未指定') + '）：\n' + feedback
    : (time ? '请针对性分析用户 ' + uid + ' 在 ' + time + ' 前后的行为，定位其真实需求与对应模块。'
            : '请针对性分析用户 ' + uid + ' 的行为路径与真实需求。');
  setValue('chatInput', prompt);

  // 页面加载完成后：先切到「针对性分析」模式（看板默认是常规性分析），再自动点击「分析」按钮
  function autoAnalyze() {
    const sendBtn = document.getElementById('sendBtn');
    if (!sendBtn) return;
    // 切到针对性分析模式 + 兜底直接设置全局分析模式变量
    try { if (typeof selectMode === 'function') selectMode('specific'); } catch (e) {}
    try { analysisMode = 'specific'; } catch (e) {}
    // 等页面默认日期和统计加载完成再触发；若按钮暂被禁用则轮询重试
    let tries = 0;
    (function tryClick() {
      if (!sendBtn.disabled) { sendBtn.click(); return; }
      if (tries++ < 25) setTimeout(tryClick, 400);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoAnalyze);
  } else {
    autoAnalyze();
  }

  // Hook fetch('/api/analyze') 返回，分析完成后 postMessage 给 opener
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (url && url.indexOf('/api/analyze') !== -1) {
        const clone = response.clone();
        clone.json().then(data => {
          if (data && data.success && window.opener) {
            window.opener.postMessage({
              type: 'dashboard-analysis',
              payload: {
                uid: uid,
                time: time,
                dataCount: data.dataCount,
                analysis: data.analysis,
                mode: 'specific'
              }
            }, '*');
          }
        }).catch(() => {});
      }
    } catch (e) {}
    return response;
  };
})();
