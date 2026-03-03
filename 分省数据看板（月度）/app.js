// 核心数据
const coreData = {
    '25年12月': {
        '山东': { 活跃用户: 2726700, 新用户: 1594400, 老用户: 1132300, 订单营收: 6382300, 深度访问率: 89, 使用率: 72, ARPU: 234, 同比活跃: -13, 环比活跃: 6, 同比新用户: -45, 环比新用户: 32, 同比老用户: 25, 环比老用户: 31, 同比营收: 25, 环比营收: 31, 同比深度: -6, 环比深度: 3, 同比使用率: 6, 环比使用率: 4, 同比ARPU: 45, 环比ARPU: 31 },
        '广东': { 活跃用户: 1320000, 新用户: 749400, 老用户: 570600, 订单营收: 6097500, 深度访问率: 85, 使用率: 61, ARPU: 462, 同比活跃: 16, 环比活跃: 30, 同比新用户: -9, 环比新用户: 48, 同比老用户: 22, 环比老用户: 34, 同比营收: 22, 环比营收: 34, 同比深度: -3, 环比深度: 2, 同比使用率: 19, 环比使用率: 12, 同比ARPU: 5, 环比ARPU: 12 },
        '安徽': { 活跃用户: 992400, 新用户: 532500, 老用户: 459900, 订单营收: 3824100, 深度访问率: 84, 使用率: 61, ARPU: 385, 同比活跃: 15, 环比活跃: -1, 同比新用户: -20, 环比新用户: 55, 同比老用户: 25, 环比老用户: 14, 同比营收: 25, 环比营收: 14, 同比深度: 0, 环比深度: 1, 同比使用率: 20, 环比使用率: 13, 同比ARPU: 9, 环比ARPU: 14 },
        '辽宁': { 活跃用户: 1159000, 新用户: 632700, 老用户: 526300, 订单营收: 5597400, 深度访问率: 86, 使用率: 66, ARPU: 483, 同比活跃: 22, 环比活跃: 30, 同比新用户: -14, 环比新用户: 65, 同比老用户: 29, 环比老用户: 12, 同比营收: 29, 环比营收: 12, 同比深度: 2, 环比深度: 1, 同比使用率: 20, 环比使用率: 12, 同比ARPU: 6, 环比ARPU: 12 },
        '河南': { 活跃用户: 837300, 新用户: 537900, 老用户: 299400, 订单营收: 1209600, 深度访问率: 83, 使用率: 57, ARPU: 144, 同比活跃: 2, 环比活跃: 6, 同比新用户: -23, 环比新用户: 47, 同比老用户: 33, 环比老用户: 31, 同比营收: 33, 环比营收: 31, 同比深度: -3, 环比深度: -2, 同比使用率: 24, 环比使用率: 13, 同比ARPU: 30, 环比ARPU: 31 },
        '福建': { 活跃用户: 802300, 新用户: 448300, 老用户: 354000, 订单营收: 2645500, 深度访问率: 85, 使用率: 64, ARPU: 330, 同比活跃: 14, 环比活跃: 4, 同比新用户: -25, 环比新用户: 62, 同比老用户: 45, 环比老用户: 16, 同比营收: 45, 环比营收: 16, 同比深度: -2, 环比深度: 2, 同比使用率: 16, 环比使用率: 10, 同比ARPU: 27, 环比ARPU: 16 }
    },
    '26年1月': {
        '山东': { 活跃用户: 40070, 新用户: 20513, 老用户: 17227, 订单营收: 57714, 深度访问率: 87, 使用率: 70, ARPU: 1.53, 同比活跃: 6, 环比活跃: 34, 同比新用户: -12, 环比新用户: 28, 同比老用户: 112, 环比老用户: 58, 同比营收: 112, 环比营收: 58, 同比深度: 3, 环比深度: 2, 同比使用率: 20, 环比使用率: 13, 同比ARPU: 100, 环比ARPU: 58 },
        '江苏': { 活跃用户: 29260, 新用户: 27586, 老用户: 1516, 订单营收: 79978, 深度访问率: 76, 使用率: 57, ARPU: 2.75, 同比活跃: 1, 环比活跃: 50, 同比新用户: -50, 环比新用户: 915, 同比老用户: 103, 环比老用户: 35, 同比营收: 103, 环比营收: 35, 同比深度: 13, 环比深度: 11, 同比使用率: 40, 环比使用率: 23, 同比ARPU: 102, 环比ARPU: 35 },
        '广东': { 活跃用户: 24154, 新用户: 10508, 老用户: 8014, 订单营收: 45254, 深度访问率: 84, 使用率: 64, ARPU: 2.44, 同比活跃: 30, 环比活跃: 48, 同比新用户: 14, 环比新用户: 51, 同比老用户: 127, 环比老用户: 53, 同比营收: 127, 环比营收: 53, 同比深度: 2, 环比深度: -1, 同比使用率: 23, 环比使用率: 5, 同比ARPU: 74, 环比ARPU: 53 },
        '安徽': { 活跃用户: 15893, 新用户: 9271, 老用户: 6774, 订单营收: 42587, 深度访问率: 85, 使用率: 66, ARPU: 2.65, 同比活跃: -1, 环比活跃: 4, 同比新用户: -25, 环比新用户: 32, 同比老用户: 42, 环比老用户: 36, 同比营收: 42, 环比营收: 36, 同比深度: 3, 环比深度: 1, 同比使用率: 20, 环比使用率: 5, 同比ARPU: 44, 环比ARPU: 36 },
        '辽宁': { 活跃用户: 15923, 新用户: 5566, 老用户: 6705, 订单营收: 34811, 深度访问率: 85, 使用率: 68, ARPU: 2.84, 同比活跃: 30, 环比活跃: 25, 同比新用户: 10, 环比新用户: 46, 同比老用户: 80, 环比老用户: 44, 同比营收: 80, 环比营收: 44, 同比深度: 2, 环比深度: -1, 同比使用率: 18, 环比使用率: 2, 同比ARPU: 39, 环比ARPU: 44 },
        '河南': { 活跃用户: 13844, 新用户: 8506, 老用户: 4507, 订单营收: 13693, 深度访问率: 85, 使用率: 65, ARPU: 1.05, 同比活跃: 6, 环比活跃: 0, 同比新用户: -9, 环比新用户: 36, 同比老用户: 74, 环比老用户: 74, 同比营收: 74, 环比营收: 74, 同比深度: 1, 环比深度: 2, 同比使用率: 22, 环比使用率: 8, 同比ARPU: 63, 环比ARPU: 74 },
        '福建': { 活跃用户: 13830, 新用户: 7756, 老用户: 5562, 订单营收: 26066, 深度访问率: 85, 使用率: 69, ARPU: 1.96, 同比活跃: 4, 环比活跃: 27, 同比新用户: -20, 环比新用户: 37, 同比老用户: 104, 环比老用户: 61, 同比营收: 104, 环比营收: 61, 同比深度: 2, 环比深度: 0, 同比使用率: 17, 环比使用率: 5, 同比ARPU: 96, 环比ARPU: 61 }
    },
    '26年2月': {
        '山东': { 活跃用户: 25089, 新用户: 8059, 老用户: 10304, 订单营收: 35936, 深度访问率: 81, 使用率: 61, ARPU: 1.96, 同比活跃: 37, 环比活跃: 25, 同比新用户: 3, 环比新用户: 63, 同比老用户: 46, 环比老用户: 17, 同比营收: 46, 环比营收: 17, 同比深度: 2, 环比深度: -6, 同比使用率: 15, 环比使用率: -9, 同比ARPU: 7, 环比ARPU: 17 },
        '江苏': { 活跃用户: 18670, 新用户: 8074, 老用户: 5864, 订单营收: 54324, 深度访问率: 75, 使用率: 52, ARPU: 3.90, 同比活跃: 34, 环比活跃: 29, 同比新用户: -21, 环比新用户: 110, 同比老用户: 41, 环比老用户: 9, 同比营收: 41, 环比营收: 9, 同比深度: 7, 环比深度: -1, 同比使用率: 32, 环比使用率: -5, 同比ARPU: 5, 环比ARPU: 9 },
        '广东': { 活跃用户: 13156, 新用户: 5083, 老用户: 5111, 订单营收: 39936, 深度访问率: 78, 使用率: 55, ARPU: 3.92, 同比活跃: 29, 环比活跃: -11, 同比新用户: -2, 环比新用户: 60, 同比老用户: -5, 环比老用户: 7, 同比营收: -5, 环比营收: 7, 同比深度: 2, 环比深度: -6, 同比使用率: 22, 环比使用率: -9, 同比ARPU: -26, 环比ARPU: 7 },
        '安徽': { 活跃用户: 11579, 新用户: 3860, 老用户: 4740, 订单营收: 26133, 深度访问率: 78, 使用率: 65, ARPU: 3.04, 同比活跃: 35, 环比活跃: 3, 同比新用户: 8, 环比新用户: 57, 同比老用户: 29, 环比老用户: 25, 同比营收: 29, 环比营收: 25, 同比深度: 1, 环比深度: -7, 同比使用率: 5, 环比使用率: -1, 同比ARPU: -4, 环比ARPU: 25 },
        '辽宁': { 活跃用户: 7490, 新用户: 3123, 老用户: 4338, 订单营收: 22990, 深度访问率: 81, 使用率: 63, ARPU: 3.08, 同比活跃: 0, 环比活跃: -15, 同比新用户: -33, 环比新用户: 25, 同比老用户: 12, 环比老用户: 32, 同比营收: 12, 环比营收: 32, 同比深度: 0, 环比深度: -4, 同比使用率: 15, 环比使用率: -5, 同比ARPU: 12, 环比ARPU: 32 },
        '河南': { 活跃用户: 9888, 新用户: 4221, 老用户: 2918, 订单营收: 11167, 深度访问率: 76, 使用率: 52, ARPU: 1.56, 同比活跃: 39, 环比活跃: 4, 同比新用户: 9, 环比新用户: 81, 同比老用户: 28, 环比老用户: 24, 同比营收: 28, 环比营收: 24, 同比深度: 7, 环比深度: -9, 同比使用率: 31, 环比使用率: -13, 同比ARPU: -8, 环比ARPU: 24 },
        '福建': { 活跃用户: 9168, 新用户: 3044, 老用户: 3618, 订单营收: 17046, 深度访问率: 80, 使用率: 60, ARPU: 2.56, 同比活跃: 38, 环比活跃: 21, 同比新用户: 5, 环比新用户: 65, 同比老用户: 51, 环比老用户: 25, 同比营收: 51, 环比营收: 25, 同比深度: 1, 环比深度: -5, 同比使用率: 16, 环比使用率: -9, 同比ARPU: 10, 环比ARPU: 25 }
    }
};

// 趋势数据 - 按省份组织
const provinceTrendData = {
    '福建': [
        { 月份: '25年1月', 活跃用户: 13318, 营收: 26066, ARPU: 1.96, 使用率: 69 },
        { 月份: '25年2月', 活跃用户: 6662, 营收: 17046, ARPU: 2.56, 使用率: 60 },
        { 月份: '25年3月', 活跃用户: 7998, 营收: 24665, ARPU: 3.08, 使用率: 65 },
        { 月份: '25年4月', 活跃用户: 10297, 营收: 25981, ARPU: 2.52, 使用率: 71 },
        { 月份: '25年5月', 活跃用户: 9534, 营收: 28894, ARPU: 3.03, 使用率: 72 },
        { 月份: '25年6月', 活跃用户: 12693, 营收: 37144, ARPU: 2.93, 使用率: 78 },
        { 月份: '25年7月', 活跃用户: 7990, 营收: 24263, ARPU: 3.04, 使用率: 67 },
        { 月份: '25年8月', 活跃用户: 4974, 营收: 16427, ARPU: 3.30, 使用率: 69 },
        { 月份: '25年9月', 活跃用户: 5349, 营收: 37392, ARPU: 6.99, 使用率: 70 },
        { 月份: '25年10月', 活跃用户: 8407, 营收: 52798, ARPU: 6.28, 使用率: 70 },
        { 月份: '25年11月', 活跃用户: 11194, 营收: 57648, ARPU: 5.15, 使用率: 78 },
        { 月份: '25年12月', 活跃用户: 9121, 营收: 38320, ARPU: 4.20, 使用率: 75 },
        { 月份: '26年1月', 活跃用户: 13830, 营收: 53081, ARPU: 3.84, 使用率: 81 },
        { 月份: '26年2月', 活跃用户: 9168, 营收: 25769, ARPU: 2.81, 使用率: 70 }
    ],
    '山东': [
        { 月份: '25年1月', 活跃用户: 37740, 营收: 57714, ARPU: 1.53, 使用率: 70 },
        { 月份: '25年2月', 活跃用户: 18363, 营收: 35936, ARPU: 1.96, 使用率: 61 },
        { 月份: '25年3月', 活跃用户: 24598, 营收: 60819, ARPU: 2.47, 使用率: 70 },
        { 月份: '25年4月', 活跃用户: 32810, 营收: 76191, ARPU: 2.32, 使用率: 75 },
        { 月份: '25年5月', 活跃用户: 29640, 营收: 75289, ARPU: 2.54, 使用率: 74 },
        { 月份: '25年6月', 活跃用户: 36114, 营收: 79701, ARPU: 2.21, 使用率: 78 },
        { 月份: '25年7月', 活跃用户: 23635, 营收: 52051, ARPU: 2.20, 使用率: 69 },
        { 月份: '25年8月', 活跃用户: 12106, 营收: 37448, ARPU: 3.09, 使用率: 68 },
        { 月份: '25年9月', 活跃用户: 11323, 营收: 54082, ARPU: 4.78, 使用率: 72 },
        { 月份: '25年10月', 活跃用户: 19323, 营收: 94265, ARPU: 4.88, 使用率: 77 },
        { 月份: '25年11月', 活跃用户: 30816, 营收: 102916, ARPU: 3.34, 使用率: 81 },
        { 月份: '25年12月', 活跃用户: 23617, 营收: 80057, ARPU: 3.39, 使用率: 77 },
        { 月份: '26年1月', 活跃用户: 40070, 营收: 122643, ARPU: 3.06, 使用率: 83 },
        { 月份: '26年2月', 活跃用户: 25089, 营收: 52506, ARPU: 2.09, 使用率: 70 }
    ],
    '江苏': [
        { 月份: '25年1月', 活跃用户: 29102, 营收: 79978, ARPU: 2.75, 使用率: 57 },
        { 月份: '25年2月', 活跃用户: 13938, 营收: 54324, ARPU: 3.90, 使用率: 52 },
        { 月份: '25年3月', 活跃用户: 19087, 营收: 88077, ARPU: 4.61, 使用率: 61 },
        { 月份: '25年4月', 活跃用户: 22242, 营收: 100389, ARPU: 4.51, 使用率: 68 },
        { 月份: '25年5月', 活跃用户: 22420, 营收: 111074, ARPU: 4.95, 使用率: 70 },
        { 月份: '25年6月', 活跃用户: 27395, 营收: 129753, ARPU: 4.74, 使用率: 73 },
        { 月份: '25年7月', 活跃用户: 12840, 营收: 64104, ARPU: 4.99, 使用率: 58 },
        { 月份: '25年8月', 活跃用户: 9230, 营收: 56282, ARPU: 6.10, 使用率: 65 },
        { 月份: '25年9月', 活跃用户: 11566, 营收: 102175, ARPU: 8.83, 使用率: 68 },
        { 月份: '25年10月', 活跃用户: 16976, 营收: 138293, ARPU: 8.15, 使用率: 72 },
        { 月份: '25年11月', 活跃用户: 22980, 营收: 138748, ARPU: 6.04, 使用率: 77 },
        { 月份: '25年12月', 活跃用户: 19378, 营收: 109830, ARPU: 5.67, 使用率: 73 },
        { 月份: '26年1月', 活跃用户: 29260, 营收: 162423, ARPU: 5.55, 使用率: 80 },
        { 月份: '26年2月', 活跃用户: 18670, 营收: 76391, ARPU: 4.09, 使用率: 69 }
    ],
    '广东': [
        { 月份: '25年1月', 活跃用户: 18522, 营收: 45254, ARPU: 2.44, 使用率: 64 },
        { 月份: '25年2月', 活跃用户: 10194, 营收: 39936, ARPU: 3.92, 使用率: 55 },
        { 月份: '25年3月', 活跃用户: 13053, 营收: 61207, ARPU: 4.69, 使用率: 61 },
        { 月份: '25年4月', 活跃用户: 15700, 营收: 63799, ARPU: 4.06, 使用率: 67 },
        { 月份: '25年5月', 活跃用户: 15965, 营收: 68465, ARPU: 4.29, 使用率: 70 },
        { 月份: '25年6月', 活跃用户: 21581, 营收: 87750, ARPU: 4.07, 使用率: 75 },
        { 月份: '25年7月', 活跃用户: 17235, 营收: 58836, ARPU: 3.41, 使用率: 67 },
        { 月份: '25年8月', 活跃用户: 9279, 营收: 44380, ARPU: 4.78, 使用率: 66 },
        { 月份: '25年9月', 活跃用户: 9271, 营收: 60263, ARPU: 6.50, 使用率: 67 },
        { 月份: '25年10月', 活跃用户: 12430, 营收: 75459, ARPU: 6.07, 使用率: 71 },
        { 月份: '25年11月', 活跃用户: 15678, 营收: 91230, ARPU: 5.82, 使用率: 76 },
        { 月份: '25年12月', 活跃用户: 15289, 营收: 74160, ARPU: 4.85, 使用率: 74 },
        { 月份: '26年1月', 活跃用户: 24154, 营收: 102768, ARPU: 4.25, 使用率: 79 },
        { 月份: '26年2月', 活跃用户: 13156, 营收: 38002, ARPU: 2.89, 使用率: 67 }
    ],
    '安徽': [
        { 月份: '25年1月', 活跃用户: 16045, 营收: 42587, ARPU: 2.65, 使用率: 66 },
        { 月份: '25年2月', 活跃用户: 8600, 营收: 26133, ARPU: 3.04, 使用率: 58 },
        { 月份: '25年3月', 活跃用户: 10212, 营收: 31493, ARPU: 3.08, 使用率: 63 },
        { 月份: '25年4月', 活跃用户: 12645, 营收: 44180, ARPU: 3.49, 使用率: 69 },
        { 月份: '25年5月', 活跃用户: 12206, 营收: 35675, ARPU: 2.92, 使用率: 70 },
        { 月份: '25年6月', 活跃用户: 15968, 营收: 57202, ARPU: 3.58, 使用率: 75 },
        { 月份: '25年7月', 活跃用户: 9361, 营收: 27109, ARPU: 2.90, 使用率: 65 },
        { 月份: '25年8月', 活跃用户: 6602, 营收: 27531, ARPU: 4.17, 使用率: 71 },
        { 月份: '25年9月', 活跃用户: 7168, 营收: 38427, ARPU: 5.36, 使用率: 72 },
        { 月份: '25年10月', 活跃用户: 10266, 营收: 53032, ARPU: 5.17, 使用率: 74 },
        { 月份: '25年11月', 活跃用户: 13056, 营收: 56636, ARPU: 4.34, 使用率: 78 },
        { 月份: '25年12月', 活跃用户: 11401, 营收: 47666, ARPU: 4.18, 使用率: 75 },
        { 月份: '26年1月', 活跃用户: 15893, 营收: 60672, ARPU: 3.82, 使用率: 80 },
        { 月份: '26年2月', 活跃用户: 11579, 营收: 33747, ARPU: 2.91, 使用率: 68 }
    ],
    '辽宁': [
        { 月份: '25年1月', 活跃用户: 12271, 营收: 34811, ARPU: 2.84, 使用率: 68 },
        { 月份: '25年2月', 活跃用户: 7461, 营收: 22990, ARPU: 3.08, 使用率: 63 },
        { 月份: '25年3月', 活跃用户: 9701, 营收: 45119, ARPU: 4.65, 使用率: 66 },
        { 月份: '25年4月', 活跃用户: 10854, 营收: 49571, ARPU: 4.57, 使用率: 71 },
        { 月份: '25年5月', 活跃用户: 11854, 营收: 47340, ARPU: 3.99, 使用率: 74 },
        { 月份: '25年6月', 活跃用户: 12283, 营收: 58510, ARPU: 4.76, 使用率: 76 },
        { 月份: '25年7月', 活跃用户: 10765, 营收: 48212, ARPU: 4.48, 使用率: 75 },
        { 月份: '25年8月', 活跃用户: 6838, 营收: 35021, ARPU: 5.12, 使用率: 72 },
        { 月份: '25年9月', 活跃用户: 7123, 营收: 55776, ARPU: 7.83, 使用率: 72 },
        { 月份: '25年10月', 活跃用户: 11013, 营收: 86877, ARPU: 7.89, 使用率: 76 },
        { 月份: '25年11月', 活跃用户: 12828, 营收: 76597, ARPU: 5.97, 使用率: 80 },
        { 月份: '25年12月', 活跃用户: 14145, 营收: 72349, ARPU: 5.11, 使用率: 79 },
        { 月份: '26年1月', 活跃用户: 15923, 营收: 62616, ARPU: 3.93, 使用率: 80 },
        { 月份: '26年2月', 活跃用户: 7490, 营收: 25814, ARPU: 3.45, 使用率: 72 }
    ],
    '河南': [
        { 月份: '25年1月', 活跃用户: 13013, 营收: 13693, ARPU: 1.05, 使用率: 65 },
        { 月份: '25年2月', 活跃用户: 7139, 营收: 11167, ARPU: 1.56, 使用率: 52 },
        { 月份: '25年3月', 活跃用户: 8253, 营收: 12598, ARPU: 1.53, 使用率: 59 },
        { 月份: '25年4月', 活跃用户: 10347, 营收: 16527, ARPU: 1.60, 使用率: 66 },
        { 月份: '25年5月', 活跃用户: 9480, 营收: 14160, ARPU: 1.49, 使用率: 67 },
        { 月份: '25年6月', 活跃用户: 13310, 营收: 19494, ARPU: 1.46, 使用率: 73 },
        { 月份: '25年7月', 活跃用户: 8454, 营收: 17649, ARPU: 2.09, 使用率: 65 },
        { 月份: '25年8月', 活跃用户: 5673, 营收: 8074, ARPU: 1.42, 使用率: 66 },
        { 月份: '25年9月', 活跃用户: 5001, 营收: 12205, ARPU: 2.44, 使用率: 67 },
        { 月份: '25年10月', 活跃用户: 7504, 营收: 21779, ARPU: 2.90, 使用率: 72 },
        { 月份: '25年11月', 活跃用户: 10496, 营收: 18930, ARPU: 1.80, 使用率: 76 },
        { 月份: '25年12月', 活跃用户: 8547, 营收: 16090, ARPU: 1.88, 使用率: 71 },
        { 月份: '26年1月', 活跃用户: 13844, 营收: 23799, ARPU: 1.72, 使用率: 78 },
        { 月份: '26年2月', 活跃用户: 9888, 营收: 14291, ARPU: 1.45, 使用率: 68 }
    ]
};

let trendCharts = {};
let currentPeriod = 'recent12';
let rankingCharts = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const monthFilter = document.getElementById('monthFilter');
    const provinceFilter = document.getElementById('provinceFilter');
    
    monthFilter.addEventListener('change', () => {
        updateCoreMetrics(monthFilter.value);
        updateRankingCharts(monthFilter.value);
        updateMonthlyMetrics(provinceFilter.value, monthFilter.value);
        updateTrendCharts(provinceFilter.value, currentPeriod, monthFilter.value);
    });
    
    provinceFilter.addEventListener('change', () => {
        updateMonthlyMetrics(provinceFilter.value, monthFilter.value);
        updateTrendCharts(provinceFilter.value, currentPeriod, monthFilter.value);
    });
    
    // 趋势周期切换
    document.querySelectorAll('.trend-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.trend-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentPeriod = e.target.dataset.period;
            updateTrendCharts(provinceFilter.value, currentPeriod, monthFilter.value);
        });
    });
    
    updateDashboard();
    updateMonthlyMetrics(provinceFilter.value, monthFilter.value);
    updateTrendCharts(provinceFilter.value, currentPeriod, monthFilter.value);
});

// 更新看板
function updateDashboard() {
    const selectedMonth = document.getElementById('monthFilter').value;
    updateCoreMetrics(selectedMonth);
    updateRankingCharts(selectedMonth);
}

// 模块一：更新核心指标
function updateCoreMetrics(month) {
    const container = document.getElementById('coreMetrics');
    container.innerHTML = '';
    
    const data = coreData[month];
    const provinces = ['山东', '江苏', '广东', '安徽', '辽宁', '河南', '福建'];
    
    provinces.forEach(province => {
        if (data[province]) {
            const metrics = data[province];
            const card = createMetricCard(province, metrics);
            container.appendChild(card);
        }
    });
}

function createMetricCard(province, metrics) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    
    card.innerHTML = `
        <h3>${province}</h3>
        <div class="metric-value">${formatNumber(metrics.活跃用户)}</div>
        <div class="metric-details">
            <div class="metric-row">
                <span class="metric-label">新用户:</span>
                <span class="metric-data">${formatNumber(metrics.新用户)}</span>
                <span class="metric-change ${metrics.同比新用户 >= 0 ? 'positive' : 'negative'}">同比${metrics.同比新用户 > 0 ? '+' : ''}${metrics.同比新用户}%</span>
                <span class="metric-change ${metrics.环比新用户 >= 0 ? 'positive' : 'negative'}">环比${metrics.环比新用户 > 0 ? '+' : ''}${metrics.环比新用户}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">老用户:</span>
                <span class="metric-data">${formatNumber(metrics.老用户)}</span>
                <span class="metric-change ${metrics.同比老用户 >= 0 ? 'positive' : 'negative'}">同比${metrics.同比老用户 > 0 ? '+' : ''}${metrics.同比老用户}%</span>
                <span class="metric-change ${metrics.环比老用户 >= 0 ? 'positive' : 'negative'}">环比${metrics.环比老用户 > 0 ? '+' : ''}${metrics.环比老用户}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">订单营收:</span>
                <span class="metric-data">${formatNumber(metrics.订单营收)}</span>
                <span class="metric-change ${metrics.同比营收 >= 0 ? 'positive' : 'negative'}">同比${metrics.同比营收 > 0 ? '+' : ''}${metrics.同比营收}%</span>
                <span class="metric-change ${metrics.环比营收 >= 0 ? 'positive' : 'negative'}">环比${metrics.环比营收 > 0 ? '+' : ''}${metrics.环比营收}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">深度访问率:</span>
                <span class="metric-data">${metrics.深度访问率}%</span>
                <span class="metric-change ${metrics.同比深度 >= 0 ? 'positive' : 'negative'}">同比${metrics.同比深度 > 0 ? '+' : ''}${metrics.同比深度}pp</span>
                <span class="metric-change ${metrics.环比深度 >= 0 ? 'positive' : 'negative'}">环比${metrics.环比深度 > 0 ? '+' : ''}${metrics.环比深度}pp</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">使用率:</span>
                <span class="metric-data">${metrics.使用率}%</span>
                <span class="metric-change ${metrics.同比使用率 >= 0 ? 'positive' : 'negative'}">同比${metrics.同比使用率 > 0 ? '+' : ''}${metrics.同比使用率}pp</span>
                <span class="metric-change ${metrics.环比使用率 >= 0 ? 'positive' : 'negative'}">环比${metrics.环比使用率 > 0 ? '+' : ''}${metrics.环比使用率}pp</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">ARPU:</span>
                <span class="metric-data">${metrics.ARPU}</span>
                <span class="metric-change ${metrics.同比ARPU >= 0 ? 'positive' : 'negative'}">同比${metrics.同比ARPU > 0 ? '+' : ''}${metrics.同比ARPU}%</span>
                <span class="metric-change ${metrics.环比ARPU >= 0 ? 'positive' : 'negative'}">环比${metrics.环比ARPU > 0 ? '+' : ''}${metrics.环比ARPU}%</span>
            </div>
        </div>
    `;
    
    return card;
}

// 模块二：更新排名图表
function updateRankingCharts(month) {
    const data = coreData[month];
    
    // 销毁旧图表
    Object.values(rankingCharts).forEach(chart => chart && chart.destroy());
    rankingCharts = {};
    
    // 活跃用户排名
    const activeUsersData = Object.entries(data)
        .sort((a, b) => b[1].活跃用户 - a[1].活跃用户)
        .slice(0, 7);
    
    rankingCharts.activeUsers = createBarChart(
        'activeUsersChart',
        activeUsersData.map(d => d[0]),
        activeUsersData.map(d => d[1].活跃用户),
        '活跃用户',
        '#FF6B35'
    );
    
    // 营收排名
    const revenueData = Object.entries(data)
        .sort((a, b) => b[1].订单营收 - a[1].订单营收)
        .slice(0, 7);
    
    rankingCharts.revenue = createBarChart(
        'revenueChart',
        revenueData.map(d => d[0]),
        revenueData.map(d => d[1].订单营收),
        '营收',
        '#FFA366'
    );
    
    // ARPU排名
    const arpuData = Object.entries(data)
        .sort((a, b) => b[1].ARPU - a[1].ARPU)
        .slice(0, 7);
    
    rankingCharts.arpu = createBarChart(
        'arpuChart',
        arpuData.map(d => d[0]),
        arpuData.map(d => d[1].ARPU),
        'ARPU',
        '#FF8C42'
    );
    
    // 使用率排名
    const usageData = Object.entries(data)
        .sort((a, b) => b[1].使用率 - a[1].使用率)
        .slice(0, 7);
    
    rankingCharts.usage = createBarChart(
        'usageRateChart',
        usageData.map(d => d[0]),
        usageData.map(d => d[1].使用率),
        '使用率 (%)',
        '#FFB380'
    );
}

// 创建柱状图
function createBarChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    borderRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// 模块三：更新月度指标卡片
function updateMonthlyMetrics(province, selectedMonth) {
    const container = document.getElementById('monthlyMetrics');
    container.innerHTML = '';
    
    const data = provinceTrendData[province];
    if (!data || data.length === 0) return;
    
    // 根据选中的月份找到对应的数据
    let currentIndex = -1;
    if (selectedMonth === '26年2月') {
        currentIndex = data.findIndex(d => d.月份 === '26年2月');
    } else if (selectedMonth === '26年1月') {
        currentIndex = data.findIndex(d => d.月份 === '26年1月');
    } else if (selectedMonth === '25年12月') {
        currentIndex = data.findIndex(d => d.月份 === '25年12月');
    }
    
    // 如果没找到，使用最新数据
    if (currentIndex === -1) {
        currentIndex = data.length - 1;
    }
    
    const latestData = data[currentIndex];
    const previousData = currentIndex > 0 ? data[currentIndex - 1] : null;
    const lastYearIndex = currentIndex - 12;
    const lastYearData = lastYearIndex >= 0 ? data[lastYearIndex] : null;
    
    // 计算同比和环比
    const yoyActiveUser = lastYearData ? ((latestData.活跃用户 - lastYearData.活跃用户) / lastYearData.活跃用户 * 100).toFixed(0) : 0;
    const momActiveUser = previousData ? ((latestData.活跃用户 - previousData.活跃用户) / previousData.活跃用户 * 100).toFixed(0) : 0;
    
    const yoyRevenue = lastYearData ? ((latestData.营收 - lastYearData.营收) / lastYearData.营收 * 100).toFixed(0) : 0;
    const momRevenue = previousData ? ((latestData.营收 - previousData.营收) / previousData.营收 * 100).toFixed(0) : 0;
    
    const yoyArpu = lastYearData ? ((latestData.ARPU - lastYearData.ARPU) / lastYearData.ARPU * 100).toFixed(0) : 0;
    const momArpu = previousData ? ((latestData.ARPU - previousData.ARPU) / previousData.ARPU * 100).toFixed(0) : 0;
    
    const yoyUsage = lastYearData ? (latestData.使用率 - lastYearData.使用率) : 0;
    const momUsage = previousData ? (latestData.使用率 - previousData.使用率) : 0;
    
    const metrics = [
        { 
            name: '月活用户', 
            value: formatNumber(latestData.活跃用户), 
            tag1: `同比: ${yoyActiveUser > 0 ? '+' : ''}${yoyActiveUser}%`, 
            tag2: `环比: ${momActiveUser > 0 ? '+' : ''}${momActiveUser}%` 
        },
        { 
            name: '营收', 
            value: (latestData.营收 / 10000).toFixed(1) + '万', 
            tag1: `同比: ${yoyRevenue > 0 ? '+' : ''}${yoyRevenue}%`, 
            tag2: `环比: ${momRevenue > 0 ? '+' : ''}${momRevenue}%` 
        },
        { 
            name: 'ARPU', 
            value: latestData.ARPU.toFixed(2), 
            tag1: `同比: ${yoyArpu > 0 ? '+' : ''}${yoyArpu}%`, 
            tag2: `环比: ${momArpu > 0 ? '+' : ''}${momArpu}%` 
        },
        { 
            name: '使用率', 
            value: latestData.使用率 + '%', 
            tag1: `同比: ${yoyUsage > 0 ? '+' : ''}${yoyUsage}pp`, 
            tag2: `环比: ${momUsage > 0 ? '+' : ''}${momUsage}pp` 
        }
    ];
    
    metrics.forEach(metric => {
        const card = document.createElement('div');
        card.className = 'monthly-metric-card';
        card.innerHTML = `
            <h4>${metric.name}</h4>
            <div class="monthly-metric-value">${metric.value}</div>
            <div class="monthly-metric-tags">
                <span class="metric-tag">${metric.tag1}</span>
                <span class="metric-tag">${metric.tag2}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// 模块三：更新趋势图表
function updateTrendCharts(province, period, selectedMonth) {
    const data = provinceTrendData[province];
    if (!data) return;
    
    // 找到选中月份的索引
    let endIndex = -1;
    if (selectedMonth === '26年2月') {
        endIndex = data.findIndex(d => d.月份 === '26年2月');
    } else if (selectedMonth === '26年1月') {
        endIndex = data.findIndex(d => d.月份 === '26年1月');
    } else if (selectedMonth === '25年12月') {
        endIndex = data.findIndex(d => d.月份 === '25年12月');
    }
    
    // 如果没找到，使用最新数据
    if (endIndex === -1) {
        endIndex = data.length - 1;
    }
    
    // 根据周期筛选数据（从选中月份往前推）
    let filteredData = [];
    let startIndex = 0;
    
    if (period === 'recent3') {
        startIndex = Math.max(0, endIndex - 2);
    } else if (period === 'recent6') {
        startIndex = Math.max(0, endIndex - 5);
    } else if (period === 'recent12') {
        startIndex = Math.max(0, endIndex - 11);
    }
    
    filteredData = data.slice(startIndex, endIndex + 1);
    
    // 销毁旧图表
    Object.values(trendCharts).forEach(chart => chart && chart.destroy());
    trendCharts = {};
    
    // 月活趋势
    trendCharts.activeUsers = createLineChart(
        'activeUsersTrendChart',
        filteredData.map(d => d.月份),
        filteredData.map(d => d.活跃用户),
        '活跃用户',
        '#FF6B35'
    );
    
    // 营收趋势
    trendCharts.revenue = createLineChart(
        'revenueTrendChart',
        filteredData.map(d => d.月份),
        filteredData.map(d => d.营收),
        '营收',
        '#FFA366'
    );
    
    // 使用率趋势
    trendCharts.retention = createLineChart(
        'retentionTrendChart',
        filteredData.map(d => d.月份),
        filteredData.map(d => d.使用率),
        '使用率 (%)',
        '#FF8C42'
    );
}

// 创建折线图
function createLineChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
                tension: 0.4,
                borderWidth: 3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    borderRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return label + ': ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
}


// AI分析功能
const DEEPSEEK_API_KEY = 'sk-22da5c080db84c23b4a5c8c54e922763';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const btn = document.getElementById('analyzeBtn');
    const container = document.getElementById('aiAnalysis');
    const selectedMonth = document.getElementById('monthFilter').value;
    
    // 禁用按钮
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = '分析中...';
    
    // 显示加载状态
    container.innerHTML = `
        <div class="ai-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">AI正在分析数据，请稍候...</div>
        </div>
    `;
    
    try {
        // 准备数据
        const monthData = coreData[selectedMonth];
        const dataText = Object.entries(monthData).map(([province, metrics]) => {
            return `${province}：活跃用户${formatNumber(metrics.活跃用户)}（同比${metrics.同比活跃}%，环比${metrics.环比活跃}%），新用户${formatNumber(metrics.新用户)}（同比${metrics.同比新用户}%），老用户${formatNumber(metrics.老用户)}（同比${metrics.同比老用户}%），订单营收${formatNumber(metrics.订单营收)}（同比${metrics.同比营收}%），深度访问率${metrics.深度访问率}%（同比${metrics.同比深度}pp），使用率${metrics.使用率}%（同比${metrics.同比使用率}pp），ARPU${metrics.ARPU}（同比${metrics.同比ARPU}%）`;
        }).join('\n');
        
        // 调用DeepSeek API
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: '你是一位专业的数据分析师，擅长分析业务数据并提供可执行的建议。请用中文回答，使用清晰的结构化格式。'
                    },
                    {
                        role: 'user',
                        content: `请分析以下${selectedMonth}各省份的核心数据情况：\n\n${dataText}\n\n请从以下几个方面进行分析：\n1. 各省数据表现总结（突出表现最好和需要关注的省份）\n2. 区域特点分析（用户增长、营收、使用率等维度）\n3. 可执行的优化建议（针对不同省份的具体建议）\n\n请用简洁专业的语言，分点列出，每个建议要具体可执行。`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        
        const result = await response.json();
        const analysis = result.choices[0].message.content;
        
        // 显示分析结果
        container.innerHTML = `
            <div class="ai-content">
                ${formatAnalysisText(analysis)}
            </div>
        `;
        
    } catch (error) {
        console.error('AI分析错误:', error);
        container.innerHTML = `
            <div class="ai-placeholder">
                <div class="placeholder-icon">⚠️</div>
                <p>分析失败，请稍后重试。错误信息：${error.message}</p>
            </div>
        `;
    } finally {
        // 恢复按钮
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = '生成分析报告';
    }
});

// 格式化分析文本
function formatAnalysisText(text) {
    // 将文本转换为HTML格式
    let html = text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
    
    // 处理标题（数字开头的行）
    html = html.replace(/<p>(\d+[\.\、])\s*(.+?)<\/p>/g, '<h3>$1 $2</h3>');
    
    // 处理列表项（- 或 • 开头）
    html = html.replace(/<p>[-•]\s*(.+?)<\/p>/g, '<li>$1</li>');
    
    // 包装连续的li为ul
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    
    return html;
}
