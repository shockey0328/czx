// 修复每周活跃用户的渠道来源.normalized.csv文件中的乱码问题
const fs = require('fs');
const path = require('path');

// 渠道名乱码映射表（从build-embedded-b64.js中提取并补充）
const channelAlias = {
    // 锟斤拷格式的乱码
    "学锟斤拷": "学伴",
    "锟斤拷锟斤拷锟斤拷锟斤拷锟脚底诧拷锟斤拷钮": "组卷网服务号底部按钮",
    "锟斤拷锟斤拷锟斤拷锟斤拷": "其他渠道",
    "锟斤拷锟斤拷锟斤拷锟斤拷诤锟斤拷锟斤拷没锟斤拷锟斤拷锟�": "组卷网公众号新用户提醒",
    "锟斤拷锟斤拷锟斤拷锟斤拷诤诺撞锟斤拷锟脚�": "组卷网公众号底部按钮",
    "小锟斤拷锟斤拷页banner": "小卷首页banner",
    "锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟矫伙拷锟斤拷锟斤拷": "组卷网服务号新用户提醒",
    "锟斤拷平锟斤拷锟角达拷锟斤拷息锟狡硷拷锟斤拷锟睫癸拷司": "南平市智达信息科技有限公司",
    "小锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷": "小卷开屏弹窗",
    "锟斤拷锟斤拷锟斤拷锟斤拷诤锟斤拷锟斤拷锟�(i)": "组卷网公众号推文(i)",
    
    // 问号格式的乱码（UTF-8解码GBK产生的）
    "ѧ��": "学伴",
    "���������ŵײ���ť": "组卷网服务号底部按钮",
    "��������": "其他渠道",
    "��������ں����û�����": "组卷网公众号新用户提醒",
    "��������ںŵײ���ť": "组卷网公众号底部按钮",
    "С����ҳbanner": "小卷首页banner",
    "�������������û�����": "组卷网服务号新用户提醒",
    "��ƽ���Ǵ���Ϣ�Ƽ����޹�˾": "南平市智达信息科技有限公司",
    "С����������": "小卷开屏弹窗",
    "��������ں�����(i)": "组卷网公众号推文(i)",
    "ɽ���ͽ���": "马兰花开",
    "���շ�˱������洫ý���޹�˾": "江苏凤凰报刊出版传媒有限公司",
    
    // 其他可能的乱码变体
    "��������": "其他渠道",
    "��������": "马兰花开",
    "��������": "通用",
    "�����н�ί-��Сѧ": "北京市教委-京小学",
    "���ݴ�ѧ�����������": "山西和教育",
    "��������ں�����": "龙江教研在线",
    
    // 新发现的乱码映射
    "ͨ��": "通用",
    "���ݴ�ѧ������������": "山西和教育",
    "��ý������": "媒体渠道",
    "������������": "其他渠道"
};

// 读取活跃用户渠道来源文件
const filePath = path.join(__dirname, '用户增长数据看板（周度）/每周活跃用户的渠道来源.normalized.csv');
let content = fs.readFileSync(filePath, 'utf8');

// 按行处理
const lines = content.split('\n');
const fixedLines = lines.map(line => {
    if (!line.trim()) return line;
    
    const parts = line.split(',');
    if (parts.length >= 3) {
        const channelName = parts[2];
        if (channelAlias[channelName]) {
            parts[2] = channelAlias[channelName];
            console.log(`修复渠道名: "${channelName}" -> "${channelAlias[channelName]}"`);
        } else if (channelName.includes('�') || channelName.includes('锟')) {
            console.log(`发现未映射的乱码渠道名: "${channelName}"`);
        }
    }
    return parts.join(',');
});

// 写入修复后的文件
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log(`\n已修复文件: ${filePath}`);
console.log(`修复前行数: ${lines.length}`);
console.log(`修复后行数: ${fixedLines.length}`);

// 验证修复结果
const uniqueChannels = new Set();
fixedLines.forEach(line => {
    if (!line.trim()) return;
    const parts = line.split(',');
    if (parts.length >= 3) {
        uniqueChannels.add(parts[2]);
    }
});

console.log(`\n唯一渠道名列表:`);
Array.from(uniqueChannels).sort().forEach(channel => {
    console.log(`  - ${channel}`);
});