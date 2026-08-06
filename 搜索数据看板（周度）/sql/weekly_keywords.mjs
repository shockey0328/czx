/**
 * 周度搜索词 · MaxCompute SQL 模板
 *
 * 改口径只改本文件。占位符：
 *   ${begin} ${end}     目标周起止 YYYY-MM-DD
 *   ${rnBegin} ${rnEnd} 分页行号（含端点），用于突破 MCP 单次约 1 万行上限
 *
 * 约定：UV 降序，最多 50000 条；写入 第N周搜索词.csv
 */
export const KEYWORD_LIMIT = 50000;
export const KEYWORD_PAGE_SIZE = 9000;

export const KEYWORD_SQL = {
  label: '周度搜索词',
  maxCU: 150,
  waitMs: 900000,
  /** 单页：按 UV 降序取 rnBegin～rnEnd */
  sql: `
SELECT keywords, pv, uv
FROM (
  SELECT
    keywords,
    pv,
    uv,
    ROW_NUMBER() OVER (ORDER BY uv DESC, keywords ASC) AS rn
  FROM (
    SELECT
      keywords,
      COUNT(1) AS pv,
      COUNT(DISTINCT user_id) AS uv
    FROM dmp_cdm.dwd_pub_io_log_zxxk_czx_search_result_3
    WHERE dt >= '\${begin}' AND dt <= '\${end}'
    GROUP BY keywords
  ) g
) t
WHERE rn >= \${rnBegin} AND rn <= \${rnEnd}
ORDER BY rn
`.trim()
};
