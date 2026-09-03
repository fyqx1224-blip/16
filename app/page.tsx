import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Fingerprint,
  LockKeyhole,
  Volume2,
  VolumeX,
} from "lucide-react";

type Gender = "male" | "female";
type FunctionKey = "Se" | "Si" | "Ne" | "Ni" | "Te" | "Ti" | "Fe" | "Fi";
type Stage = "boot" | "register" | "assessment" | "reveal" | "dossier" | "case";
type Option = { text: string; fn?: FunctionKey; weight: 0 | 1 | 2; echo?: string };
type Question = {
  code: string;
  domain?: string;
  context: string;
  scene: string;
  choices: Option[];
};

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const stacks: Record<string, FunctionKey[]> = {
  ISTJ: ["Si", "Te", "Fi", "Ne"],
  ISFJ: ["Si", "Fe", "Ti", "Ne"],
  INFJ: ["Ni", "Fe", "Ti", "Se"],
  INTJ: ["Ni", "Te", "Fi", "Se"],
  ISTP: ["Ti", "Se", "Ni", "Fe"],
  ISFP: ["Fi", "Se", "Ni", "Te"],
  INFP: ["Fi", "Ne", "Si", "Te"],
  INTP: ["Ti", "Ne", "Si", "Fe"],
  ESTP: ["Se", "Ti", "Fe", "Ni"],
  ESFP: ["Se", "Fi", "Te", "Ni"],
  ENFP: ["Ne", "Fi", "Te", "Si"],
  ENTP: ["Ne", "Ti", "Fe", "Si"],
  ESTJ: ["Te", "Si", "Ne", "Fi"],
  ESFJ: ["Fe", "Si", "Ne", "Ti"],
  ENFJ: ["Fe", "Ni", "Se", "Ti"],
  ENTJ: ["Te", "Ni", "Se", "Fi"],
};
const aliases: Record<string, string> = {
  INTJ: "社会达尔文屠夫",
  INTP: "无底线观测者",
  ENTJ: "马基雅维利暴君",
  ENTP: "虚无主义煽动家",
  INFJ: "精神邪教主",
  INFP: "受害者暴君",
  ENFJ: "认知寄生母体",
  ENFP: "狂热毒源体",
  ISTJ: "极权执行官",
  ISFJ: "窒息施恩者",
  ESTJ: "齿轮独裁者",
  ESFJ: "蜂巢审判长",
  ISTP: "冰冷解剖者",
  ISFP: "绝望美学家",
  ESTP: "掠食资本家",
  ESFP: "痛觉狂欢客",
};
const scale = (
  a: FunctionKey,
  b: FunctionKey,
  a2: string,
  a1: string,
  n: string,
  b1: string,
  b2: string,
): Option[] => [
  { text: a2, fn: a, weight: 2 },
  { text: a1, fn: a, weight: 1 },
  { text: n, weight: 0 },
  { text: b1, fn: b, weight: 1 },
  { text: b2, fn: b, weight: 2 },
];
const questions: Question[] = [
  {
    code: "P-01",
    context: "身份：夜班安保｜状态：清醒｜权限：可停留 60 秒",
    scene: "离开陌生房间后，你先记录什么？",
    choices: scale(
      "Se",
      "Si",
      "逐项标出物品、声源和出口位置",
      "拍照保存现场，再补充当下感官细节",
      "封锁房间，等待有资质的人复查",
      "对照熟悉场所，找出布局上的异常",
      "按过去巡查模板逐项核对并归档",
    ),
  },
  {
    code: "P-02",
    context: "身份：案件助理｜立场：中立｜已知：档案缺失三页",
    scene: "你如何形成第一版假设？",
    choices: scale(
      "Ne",
      "Ni",
      "列出所有合理版本，并主动寻找新关联",
      "保留三个解释，分别寻找支持证据",
      "只整理已知事实，暂不提出解释",
      "寻找各条线索重复指向的共同动机",
      "先锁定最可能动机，再围绕它核验证据",
    ),
  },
  {
    code: "J-01",
    context: "身份：项目负责人｜期限：今晚｜个人奖金与结果挂钩",
    scene: "必须取消一个方案，你怎么决定？",
    choices: scale(
      "Te",
      "Ti",
      "按成本、工期和成功率排序，直接取消末位",
      "设最低交付标准，淘汰未达标方案",
      "要求延期；若被拒绝则随机抽签",
      "先核查比较标准是否适用于三个方案",
      "重建决策模型，确认推导无矛盾后再取消",
    ),
  },
  {
    code: "J-02",
    context: "身份：内部调查员｜关系：当事人是你的朋友｜已知：他已认错",
    scene: "他拒绝解释原因，你先做什么？",
    choices: scale(
      "Fe",
      "Fi",
      "分别询问相关人员，评估事件对群体的实际影响",
      "私下确认团队关系是否还能修复",
      "只记录认错事实，不推测动机",
      "询问他的行为是否违背其真实信念",
      "依据自己的道德边界决定是否继续支持他",
    ),
  },
  {
    code: "P-03",
    context: "身份：监控员｜状态：连续值班 10 小时｜画面异常仅 0.5 秒",
    scene: "你先用哪种方式核验？",
    choices: scale(
      "Se",
      "Si",
      "逐帧检查动作、光影与物体位移",
      "立即重放并检查同机位的实时画面",
      "标记异常，交由下一班独立判断",
      "调取同设备过去的故障记录作比较",
      "按历史异常模板逐项寻找重复特征",
    ),
  },
  {
    code: "P-04",
    context: "身份：记录员｜立场：无利益关系｜两名证人说法相反",
    scene: "你如何安排下一步询问？",
    choices: scale(
      "Ne",
      "Ni",
      "分别追问多种可能情境，扩大解释范围",
      "寻找能同时容纳两种说法的第三种解释",
      "只核对时间地点，不讨论原因",
      "追问双方都默认却未说出的前提",
      "围绕最可能的共同隐情集中提问",
    ),
  },
  {
    code: "J-03",
    context: "身份：值班主管｜权限：可临时停工｜已知：行为合法但会伤人",
    scene: "你现场如何处理？",
    choices: scale(
      "Te",
      "Ti",
      "立即停工，指定责任人并建立临时流程",
      "先隔离风险，再补充执行规则",
      "维持现状并上报，不自行判断",
      "先定义伤害条件，检查制度漏洞在哪里",
      "暂停执行，完成规则推演后再决定新流程",
    ),
  },
  {
    code: "J-04",
    context: "身份：信息发布者｜已知：真相属实，但会暴露无辜者隐私",
    scene: "你选择怎样发布？",
    choices: scale(
      "Fe",
      "Fi",
      "删去身份线索，并提前安排受影响者支持",
      "调整措辞和范围，尽量降低群体伤害",
      "完整移交法务，由其决定是否公开",
      "只发布符合自己原则且能亲自承担的部分",
      "即使承受压力，也拒绝发布违背底线的内容",
    ),
  },
  {
    code: "S-01",
    context: "身份：现场协调员｜状态：轻伤、意识清醒｜计划已失效",
    scene: "你首先采取什么行动？",
    choices: scale(
      "Se",
      "Si",
      "进入现场处理最紧迫危险，随反馈调整",
      "先完成一个可立即验证的小动作",
      "撤到安全区，等待更多信息",
      "恢复最近一次有效流程，再逐项排错",
      "严格启用既有应急预案，不临场改动",
    ),
  },
  {
    code: "S-02",
    context: "身份：外围参与者｜已知：有人暗示存在更大计划｜信息不完整",
    scene: "你怎样继续调查？",
    choices: scale(
      "Ne",
      "Ni",
      "同时追查人员、资金和时间线的多种关联",
      "提出数个可证伪假设，逐一寻找线索",
      "停止接触，等待正式调查结果",
      "找出所有异常共同指向的最终目的",
      "锁定最可能幕后意图，集中验证这一路径",
    ),
  },
  {
    code: "S-03",
    context: "身份：临时负责人｜状态：时间不足｜失败将由你承担责任",
    scene: "你怎样接管局面？",
    choices: scale(
      "Te",
      "Ti",
      "立即分配资源、负责人和完成时限",
      "先下达最少必要指令，边执行边检查",
      "暂停所有行动，等待正式负责人",
      "先重算关键因果，确认方案成立再表态",
      "拒绝使用未经逻辑验证的方案，即使因此延误",
    ),
  },
  {
    code: "S-04",
    context: "身份：知情者｜关系：对方是至亲｜已知：隐瞒会让第三人受损",
    scene: "对方请求你保密，你怎么回应？",
    choices: scale(
      "Fe",
      "Fi",
      "组织当事人沟通，优先修复所有受损关系",
      "先了解各方承受能力，再决定披露范围",
      "拒绝当场答复，交由独立第三方处理",
      "明确自己能接受的界限，要求对方自行坦白",
      "按个人原则披露，不因亲密关系改变决定",
    ),
  },
  {
    code: "R-01",
    domain: "跨情境复核",
    context: "身份：初学者｜状态：精力正常｜任务：精密设备操作",
    scene: "第一小时你如何学习？",
    choices: scale(
      "Se",
      "Si",
      "在指导下立即操作，用实时反馈修正动作",
      "先试做一次，再针对错误练习",
      "先观察完整示范，不立即操作",
      "把步骤与熟悉操作逐项对应",
      "背熟标准流程和误差范围后再上手",
    ),
  },
  {
    code: "R-02",
    domain: "跨情境复核",
    context: "身份：审阅者｜期限：两小时｜材料之间没有明确目录",
    scene: "你如何整理这些材料？",
    choices: scale(
      "Ne",
      "Ni",
      "画出所有可能关联，允许主题继续扩展",
      "按不同解释建立数个材料簇",
      "只按来源和日期排序",
      "提炼反复出现的方向，删去无关支线",
      "用一个核心主题重排全部材料",
    ),
  },
  {
    code: "R-03",
    domain: "跨情境复核",
    context: "身份：评审｜立场：结论与你无利益关系｜证据可重复检查",
    scene: "你先依据什么判断可靠性？",
    choices: scale(
      "Te",
      "Ti",
      "比较可测结果、复现率与实际预测表现",
      "先看是否有独立验证和明确指标",
      "只记录证据等级，不作最终判断",
      "检查定义、前提和推导是否一致",
      "从基础定义重建推导，排除隐藏矛盾",
    ),
  },
  {
    code: "R-04",
    domain: "跨情境复核",
    context: "身份：会议成员｜立场：你的意见不受欢迎｜发言不会影响职位",
    scene: "你怎样表达意见？",
    choices: scale(
      "Fe",
      "Fi",
      "先确认共同目标，再用群体可接受的方式提出",
      "调整语气和顺序，保留合作空间",
      "提交书面意见，不参与现场讨论",
      "直接说明真实立场，同时承认个人价值取向",
      "完整表达信念，不为获得认同而修改措辞",
    ),
  },
  {
    code: "V-01",
    domain: "观察者效应",
    context: "身份：录像中的本人｜状态：无记忆缺失｜设备经检测正常",
    scene: "影像中的你慢了一秒，你先做什么？",
    choices: scale(
      "Se",
      "Si",
      "重新录制动作并测量真实时间差",
      "逐帧定位延迟首次出现的位置",
      "停止观看，要求第三方独立复核",
      "与自己过去录像中的动作节奏比较",
      "调取历次影像，寻找同样延迟模式",
    ),
  },
  {
    code: "V-02",
    domain: "身份连续性",
    context: "身份：档案本人｜状态：记忆清晰｜笔迹鉴定确认签名属于你",
    scene: "面对从未填写过的问卷，你先查什么？",
    choices: scale(
      "Ne",
      "Ni",
      "并查身份冒用、记忆干预和系统生成等路径",
      "建立多个解释，寻找能排除其中之一的证据",
      "封存问卷，不接触任何相关人员",
      "寻找所有异常最终服务的同一目的",
      "沿唯一最合理的幕后目的倒查经手人",
    ),
  },
  {
    code: "V-03",
    domain: "控制条件",
    context: "身份：数据管理员｜权限：只能执行一次操作｜你的记录也在其中",
    scene: "删一人数据或公开全部，你怎么做？",
    choices: scale(
      "Te",
      "Ti",
      "计算受影响人数和损失，执行总损失较低者",
      "先确认备份与公开范围，再选择可控后果",
      "拒绝操作并接受系统自动执行",
      "验证二选一限制是否真实且不可绕过",
      "从权限逻辑寻找第三种操作路径，即使超时",
    ),
  },
  {
    code: "V-04",
    domain: "伦理复核",
    context: "身份：当前受试者｜状态：清醒｜已知：另一人实时看见你的选择",
    scene: "你会改变作答方式吗？",
    choices: scale(
      "Fe",
      "Fi",
      "会；优先避免选择伤害或刺激对方",
      "会；只调整表达，不改变核心答案",
      "暂停作答，直到观察关系被解除",
      "不会；按个人价值作答，但会解释原因",
      "不会；完全忽略观察者及其可能反应",
    ),
  },
];

const echoes = [
  "记录中出现了你尚未作出的选择。",
  "音轨中多出一次呼吸。",
  "系统已将犹豫时间写入另一份档案。",
  "该选项曾由 17 名已注销观察者选择。",
  "指针轨迹显示你短暂停在一个不存在的选项上。",
  "答案已在 00:00:16 前提交。",
  "复核员编号与受试者编号相同。",
  "屏幕外有人轻声重复了你的答案。",
];
const intrusions: Record<number, string> = {
  2: "我不记得自己同意过这一题。",
  5: "以上描述的证人是我。",
  9: "选择记录里为什么已经有我的答案？",
  13: "这不是刚才出现过的题目。",
  16: "画面中的人比我先做出了选择。",
  18: "删除观察者，而不是参与者。",
};
const sideSignals: Record<number, string> = {
  1: "SESSION 02 CONNECTED",
  4: "请不要转头",
  7: "BREATH / 02",
  10: "左侧没有人",
  12: "你撤回过这道题",
  15: "SUBJECT IS READING",
  17: "不要选择第五项",
  19: "观察者位置已确认",
};
const caseDecisions: Record<string, { title: string; record: string; consequence: string }> = {
  reject: {
    title: "按退件处理",
    record: "缺《共同居住证明》原件。按受理细则第十二条退回，不进入补正程序。",
    consequence: "绩效：按时办结，计 1 件｜申请：本批次名额释放",
  },
  hold: {
    title: "挂起至明日下班前",
    record: "不提交结论，将本件暂留个人待办，等申请人补交原件。",
    consequence: "绩效：记 1 件超时，本月 800 元绩效奖取消｜申请：名额暂留",
  },
  notify: {
    title: "先退件，再打电话",
    record: "照常退回；使用申请表所留号码，告知缺件名称和重新申报办法。",
    consequence: "绩效：退件按时，计 1 件｜问责：外呼被查实则书面说明",
  },
  alter: {
    title: "修改收件日期",
    record: "将签收栏的 04/17 00:03 改为 04/16 23:59，再按齐件提交。",
    consequence: "绩效：按时办结，计 1 件｜问责：查实修改将停岗调查",
  },
  transfer: {
    title: "退回组内复核",
    record: "不签署意见，以“材料认定存疑”为由转入公共复核队列。",
    consequence: "绩效：本岗不计办结、不计超时｜申请：剩余 16 分钟",
  },
};
const caseBranches: Record<
  string,
  {
    route: string;
    motive: string;
    records: { date: string; source: string; body: string; flag: string }[];
  }
> = {
  reject: {
    route: "处置复核 01／退件",
    motive: "谈话记录第 6 页：问及是否听过当日下午的医院留言，林素云答：“听过。它不能补齐材料。”",
    records: [
      {
        date: "04/18 09:12",
        source: "安置名额变更日志",
        body: "HS-0416-273 于 17:43 退回。18:00 批处理释放预留床位，顺位号 274 自动递补。",
        flag: "系统未报错",
      },
      {
        date: "04/26 21:40",
        source: "辖区协查通报",
        body: "房东称承租人周静于 23 日晚搬离。同行两名儿童。现住址不详，电话停机。",
        flag: "抄送：街道、派出所（无市档案中心）",
      },
      {
        date: "06/02 14:05",
        source: "季度质量复核",
        body: "抽查 071 号工位办件 40 宗，退件依据及签章齐全。HS-0416-273 不作问题件统计。",
        flag: "得分：100",
      },
    ],
  },
  transfer: {
    route: "处置复核 02／转件",
    motive: "系统备注只有六个字：“建议复核认定。”这句话没有说明哪里存疑。",
    records: [
      {
        date: "04/17 17:44",
        source: "流转队列日志",
        body: "071 号工位发起组内复核。剩余办理时限 00:16:08，原经办人栏转为空值。",
        flag: "转件理由：材料认定存疑",
      },
      {
        date: "04/17 18:02",
        source: "复核员处理记录",
        body: "复核员陈国平接件后选择“超过补正期限”，退回。页面停留 00:00:18。",
        flag: "附件查阅：0 / 4",
      },
      {
        date: "06/02 14:05",
        source: "责任链导出",
        body: "HS-0416-273：初审人未签署实体意见；退件责任计入复核岗。",
        flag: "初审附件查阅：4 / 4",
      },
    ],
  },
  hold: {
    route: "处置复核 03／挂起",
    motive: "林素云在说明材料上写：“我以为一晚上够她把原件送来。”主管在“以为”二字下画了线。",
    records: [
      {
        date: "04/17 17:43",
        source: "临时挂起记录",
        body: "071 号工位未提交处理意见。系统于超时前十五分钟连续弹窗三次。",
        flag: "待办状态由经办人手工保持",
      },
      {
        date: "04/17 19:06",
        source: "主管操作日志",
        body: "组长账户解除个人占件，HS-0416-273 转回公共队列。备注：“不得自行延长补正。”",
        flag: "林素云当时已离开单位",
      },
      {
        date: "04/20 08:30",
        source: "内部谈话通知",
        body: "请说明：为何未于 17 日下班前办结；是否与申请人有私下联系；是否收受请托。",
        flag: "本人手写答复共 2 页，第 2 页缺失",
      },
    ],
  },
  notify: {
    route: "处置复核 04／外呼",
    motive: "林素云否认说过“我给你留到十二点”。录音在这句话之前中断了四秒。",
    records: [
      {
        date: "04/17 17:51",
        source: "外线拨号清单",
        body: "071 号分机拨出 138****2047，通话 00:43。号码与申请表“周静”栏一致。",
        flag: "事由栏：空白",
      },
      {
        date: "04/17 23:36",
        source: "材料接收网关",
        body: "账号 ZJ2047 上传 JPG 4 张。关联办件已办结，网关返回 E113：不可追加材料。",
        flag: "重复尝试：7 次",
      },
      {
        date: "04/20 08:30",
        source: "合规调查附件",
        body: "问：你是否承诺保留名额？答：我只说了需要补什么。问：为什么使用办公外线？答：座机就在手边。",
        flag: "原始录音：00:39",
      },
    ],
  },
  alter: {
    route: "处置复核 05／改写",
    motive: "此后十一年，林素云每月第一天都会查询一次 HS-0416-273。她从未再次打开附件。",
    records: [
      {
        date: "04/17 17:43",
        source: "字段修改日志",
        body: "receipt_time：2015-04-17 00:03:11 → 2015-04-16 23:59:00。修改后执行齐件校验。",
        flag: "操作账户：A-071",
      },
      {
        date: "04/18 09:12",
        source: "安置执行回执",
        body: "周静，女，携两名未成年子女，于 09:07 领取钥匙。房号 3-214。押金缓缴。",
        flag: "签收人指印模糊，已人工确认",
      },
      {
        date: "11年后",
        source: "只读审计镜像",
        body: "冷备份校验发现办件库字段不一致。镜像于本次会话开始后被读取。",
        flag: "读取账户：A-071",
      },
    ],
  },
};

type CaseOutcome = {
  applicant: string;
  father: string;
  career: string;
  evidence: string;
};
type FollowupChoice = {
  id: string;
  title: string;
  detail: string;
  outcome: CaseOutcome;
};
const caseFollowups: Record<
  string,
  { time: string; source: string; discovery: string; prompt: string; choices: FollowupChoice[] }
> = {
  reject: {
    time: "17:49",
    source: "传真机接收缓存",
    discovery: "缓存中找到一页 04/14 09:26 的《共同居住证明》。收件人栏是陈国平，状态为“未入库”。",
    prompt: "名额将在 11 分钟后释放。你如何处理这页传真？",
    choices: [
      { id: "restore", title: "撤回退件，补录传真", detail: "以实际收件时间重新提交；系统会记录撤回。", outcome: { applicant: "名额保留，次日上午完成安置。", father: "床位担保延续，但 800 元需自行补缴。", career: "撤回记录列为操作差错；季度得分 92。", evidence: "传真原件与接收缓存一并归档。" } },
      { id: "copy", title: "复印传真，不撤回", detail: "保留一份纸面副本；本次退件继续生效。", outcome: { applicant: "本批次名额释放，八日后失去联系。", father: "缴费在周五前补齐，来源不明。", career: "按时办结率保持 100%。", evidence: "副本藏在 071 号工位抽屉夹层，十一年后被发现。" } },
      { id: "destroy", title: "清除缓存", detail: "不留下第二个收件时间。", outcome: { applicant: "系统始终认定材料逾期。", father: "床位担保未受影响。", career: "季度抽查得分 100。", evidence: "传真缓存被手工清空；删除操作保留在设备计数器中。" } },
    ],
  },
  transfer: {
    time: "18:04",
    source: "复核岗临时文件",
    discovery: "陈国平在 18 秒内退件，却在本地目录保存了一张 04/14 的传真扫描图。文件名为“不要入库”。",
    prompt: "陈国平已经离开办公室。你仍能访问这台共享终端。",
    choices: [
      { id: "report", title: "连同日志上报监察", detail: "保留访问记录，以本人账户提交。", outcome: { applicant: "退件被撤销，名额暂时冻结。", father: "次日被要求重新审核床位担保。", career: "暂停经办权限 23 日，后恢复。", evidence: "扫描图、访问日志和传真缓存形成完整证据链。" } },
      { id: "return", title: "退回给陈国平说明", detail: "要求他次日自行纠正。", outcome: { applicant: "扫描图在凌晨被删除，退件生效。", father: "床位担保正常续期。", career: "责任链仍只记录复核岗。", evidence: "只剩一条无法证明内容的文件访问记录。" } },
      { id: "anonymous", title: "匿名打印后离开", detail: "不使用系统上报渠道。", outcome: { applicant: "三个月后因匿名材料重新取得申请资格。", father: "未被卷入调查。", career: "林素云继续任职，未被列为证人。", evidence: "打印件缺少来源，足以启动调查，不足以直接定责。" } },
    ],
  },
  hold: {
    time: "19:06",
    source: "远程操作提示",
    discovery: "组长账户正在解除挂起。屏幕同时弹出 04/14 传真回执，备注：“陈国平代收，暂勿登记。”",
    prompt: "远程解除还需 90 秒。你只能先完成一项操作。",
    choices: [
      { id: "archive", title: "将回执写入正式附件", detail: "上传完成前不能阻止远程解除。", outcome: { applicant: "当晚仍被退件；复议后恢复顺位。", father: "床位担保被重新审核，治疗未中断。", career: "超时与越权各记一次，调离审核岗。", evidence: "传真回执进入不可删除的办件附件。" } },
      { id: "lock", title: "断开网线，继续占件", detail: "保住名额，但附件仍只在本机。", outcome: { applicant: "次日上午补齐材料并入住。", father: "800 元未按时补齐，担保中止两日。", career: "以妨碍系统运行为由停岗。", evidence: "本机回执在停岗检查时被格式化。" } },
      { id: "photograph", title: "拍下回执后允许解除", detail: "不改变今晚的系统结果。", outcome: { applicant: "失去本批次名额，后续去向不明。", father: "住院安排不变。", career: "仅损失当月绩效奖。", evidence: "照片十一年后从旧手机中恢复，时间戳完整。" } },
    ],
  },
  notify: {
    time: "23:36",
    source: "材料接收网关",
    discovery: "周静按电话说明上传了四张材料。系统拒收，但其中一张拍到了 04/14 传真回执的存根。",
    prompt: "合规岗已开始调取你的外呼记录。你如何留下这次上传？",
    choices: [
      { id: "bind", title: "强制关联到原办件", detail: "以异常附件方式写入，无法再删除。", outcome: { applicant: "退件进入人工复议，十二日后获安置。", father: "床位担保继续，但林素云接受调查。", career: "因越权关联附件记过一次。", evidence: "四张上传材料与外呼记录共同保存。" } },
      { id: "download", title: "下载到个人U盘", detail: "系统仍显示拒收，不留下关联关系。", outcome: { applicant: "未能及时恢复名额。", father: "未被合规岗联系。", career: "外呼被定性为一般工作提醒。", evidence: "U盘在办公室搬迁时遗失。" } },
      { id: "deny", title: "删除外呼事由并退出", detail: "否认曾指导申请人重新上传。", outcome: { applicant: "七次上传均作为无效请求清理。", father: "床位担保正常。", career: "调查因证据不足终止。", evidence: "录音缺失四秒；删改时间与当前会话一致。" } },
    ],
  },
  alter: {
    time: "17:43",
    source: "夜间备份预警",
    discovery: "系统提示新时间与入库网关相差 251 秒。主管内线来电：“我可以替你关掉一次比对。”",
    prompt: "申请已经通过。你要如何处理原始时间差？",
    choices: [
      { id: "confess", title: "恢复原值并提交说明", detail: "申请会重新进入待退回，但修改历史保留。", outcome: { applicant: "名额冻结，传真查明后获批。", father: "床位担保被暂停审核三日。", career: "主动报告后降为档案录入岗。", evidence: "原始值、修改值和书面说明全部保留。" } },
      { id: "accept", title: "接受主管关闭比对", detail: "不再询问他为何能修改审计任务。", outcome: { applicant: "次日上午入住 3-214。", father: "欠费由匿名账户补齐。", career: "保留审核岗位，此后多次替主管处理异常件。", evidence: "本次差异从日报消失，只存在冷备份。" } },
      { id: "export", title: "导出审计记录后关机", detail: "申请保持通过，同时留下自己的修改证据。", outcome: { applicant: "成功入住，资格未被撤销。", father: "林素云自行补缴 800 元。", career: "两个月后主动离职。", evidence: "审计导出件寄往监察部门，寄件人空白。" } },
    ],
  },
};

export default function Home() {
  const previewParams = new URLSearchParams(window.location.search);
  const requestedType = (
    previewParams.get("result") || previewParams.get("debugResult") || ""
  ).toUpperCase();
  const directType = Object.hasOwn(stacks, requestedType) ? requestedType : "";
  const requestedGender = previewParams.get("gender");
  const directScene = previewParams.get("scene") === "istj-1742";
  const [stage, setStage] = useState<Stage>(directScene ? "case" : directType ? "reveal" : "boot");
  const [gender, setGender] = useState<Gender>(requestedGender === "male" ? "male" : "female");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<FunctionKey[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [intrusionCount, setIntrusionCount] = useState(0);
  const [muted, setMuted] = useState(false);
  const [noticed, setNoticed] = useState(directType ? 1 : 0);
  const [echo, setEcho] = useState("");
  const [locked, setLocked] = useState(false);
  const [consent, setConsent] = useState(false);
  const [anomalyKind, setAnomalyKind] = useState("");
  const [ambientSignal, setAmbientSignal] = useState("");
  const [memoryRecovered, setMemoryRecovered] = useState(false);
  const [recalled, setRecalled] = useState<string[]>([]);
  const [caseEvidence, setCaseEvidence] = useState<string[]>([]);
  const [caseDecision, setCaseDecision] = useState("");
  const [caseBranchStep, setCaseBranchStep] = useState(0);
  const [caseFollowupDecision, setCaseFollowupDecision] = useState("");
  const [caseFocus, setCaseFocus] = useState("");
  const [caseRoom, setCaseRoom] = useState<"lin" | "corridor" | "chen">("lin");
  const [officeDoorUnlocked, setOfficeDoorUnlocked] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"idle" | "mailbox" | "selected" | "playing">("idle");
  const [voicemailHeard, setVoicemailHeard] = useState(false);
  const [pressedPhoneKey, setPressedPhoneKey] = useState("");
  const [crtState, setCrtState] = useState<"off" | "boot" | "login" | "ready">("off");
  const [crtPassword, setCrtPassword] = useState("");
  const [crtLoginError, setCrtLoginError] = useState("");
  const [crtLoginAttempts, setCrtLoginAttempts] = useState(0);
  const [crtSelection, setCrtSelection] = useState(0);
  const [pressedCrtKey, setPressedCrtKey] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const voicemail = useRef<HTMLAudioElement>(null);
  const sound = useRef<{ ctx: AudioContext; master: GainNode } | null>(null);
  useEffect(() => {
    document.title = stage === "case" ? "市政档案中心｜17:42" : "观察者登记｜16";
  }, [stage]);
  useEffect(() => {
    const signal =
      ambientSignal || (stage === "assessment" && sideSignals[index] ? String(index) : "");
    if (signal) document.body.dataset.signal = signal;
    else delete document.body.dataset.signal;
    return () => {
      delete document.body.dataset.signal;
    };
  }, [stage, index, ambientSignal]);
  useEffect(() => {
    if (stage !== "assessment") {
      setAmbientSignal("");
      return;
    }
    let revealTimer: number;
    let clearTimer: number;
    const queue = () => {
      revealTimer = window.setTimeout(
        () => {
          const pool = ["7", "15", "17", "19"];
          setAmbientSignal(pool[Math.floor(Math.random() * pool.length)]);
          clearTimer = window.setTimeout(
            () => {
              setAmbientSignal("");
              queue();
            },
            4800 + Math.random() * 1800,
          );
        },
        6500 + Math.random() * 9000,
      );
    };
    queue();
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(clearTimer);
    };
  }, [stage]);
  useEffect(
    () => () => {
      void sound.current?.ctx.close();
    },
    [],
  );
  const startSound = () => {
    if (sound.current) {
      void sound.current.ctx.resume();
      return;
    }
    const ctx = new AudioContext();
    const master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.48, ctx.currentTime + 2.8);
    limiter.threshold.value = -22;
    limiter.knee.value = 18;
    limiter.ratio.value = 7;
    limiter.attack.value = 0.08;
    limiter.release.value = 0.7;
    master.connect(limiter).connect(ctx.destination);
    const drone = ctx.createGain();
    drone.gain.value = 0.032;
    drone.connect(master);
    [43.2, 57.7, 86.4].forEach((hz, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 2 ? "triangle" : "sine";
      osc.frequency.value = hz;
      osc.detune.value = [-4, 3, -7][i];
      gain.gain.value = [0.5, 0.28, 0.1][i];
      osc.connect(gain).connect(drone);
      osc.start();
    });
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.061;
    lfoGain.gain.value = 0.009;
    lfo.connect(lfoGain).connect(drone.gain);
    lfo.start();
    const electronics = ctx.createGain();
    const terminalFilter = ctx.createBiquadFilter();
    electronics.gain.value = 0.014;
    terminalFilter.type = "lowpass";
    terminalFilter.frequency.value = 880;
    terminalFilter.Q.value = 1.05;
    electronics.connect(terminalFilter).connect(master);
    [216, 323.6].forEach((hz, i) => {
      const carrier = ctx.createOscillator();
      const voice = ctx.createGain();
      carrier.type = i ? "sine" : "triangle";
      carrier.frequency.value = hz;
      carrier.detune.value = i ? 7 : -5;
      voice.gain.value = i ? 0.28 : 0.58;
      carrier.connect(voice).connect(electronics);
      carrier.start();
    });
    const pulse = ctx.createOscillator();
    const pulseDepth = ctx.createGain();
    pulse.type = "square";
    pulse.frequency.value = 0.187;
    pulseDepth.gain.value = 0.006;
    pulse.connect(pulseDepth).connect(electronics.gain);
    pulse.start();
    const scan = ctx.createOscillator();
    const scanDepth = ctx.createGain();
    scan.frequency.value = 0.027;
    scanDepth.gain.value = 42;
    scan.connect(scanDepth).connect(terminalFilter.frequency);
    scan.start();
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.035) / 1.035;
      data[i] = brown * 0.8;
    }
    noise.buffer = buffer;
    noise.loop = true;
    const high = ctx.createBiquadFilter();
    const low = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    high.type = "highpass";
    high.frequency.value = 32;
    low.type = "lowpass";
    low.frequency.value = 360;
    low.Q.value = 0.55;
    noiseGain.gain.value = 0.026;
    noise.connect(high).connect(low).connect(noiseGain).connect(master);
    noise.start();
    sound.current = { ctx, master };
  };
  const toggleSound = () => {
    if (!sound.current) {
      startSound();
      setMuted(false);
      return;
    }
    const next = !muted;
    setMuted(next);
    sound.current.master.gain.cancelScheduledValues(sound.current.ctx.currentTime);
    sound.current.master.gain.setTargetAtTime(next ? 0 : 0.48, sound.current.ctx.currentTime, 0.18);
  };
  const openCaseObject = (object: string) => {
    setCaseFocus(object);
    if (object === "phone") setPhoneStep("idle");
  };
  const pressPhoneKey = (key: string, action: () => void) => {
    setPressedPhoneKey("");
    window.requestAnimationFrame(() => {
      setPressedPhoneKey(key);
      action();
      window.setTimeout(() => setPressedPhoneKey(""), 430);
    });
  };
  const playVoicemail = () => {
    if (phoneStep !== "selected" && phoneStep !== "playing") return;
    startSound();
    const audio = voicemail.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.playbackRate = 0.96;
    void audio.play();
    setPhoneStep("playing");
    if (sound.current && !muted)
      sound.current.master.gain.setTargetAtTime(0.13, sound.current.ctx.currentTime, 0.18);
  };
  const finishVoicemail = () => {
    const finish = () => {
      setPhoneStep("selected");
      setVoicemailHeard(true);
      if (sound.current && !muted)
        sound.current.master.gain.setTargetAtTime(0.48, sound.current.ctx.currentTime, 0.5);
    };
    if (!("speechSynthesis" in window)) {
      finish();
      return;
    }
    const tail = new SpeechSynthesisUtterance(
      "办理缴费时，请报原病案号尾号，五八二七。",
    );
    tail.lang = "zh-CN";
    tail.rate = 0.84;
    tail.pitch = 0.92;
    tail.volume = 0.82;
    const chineseVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("zh"));
    if (chineseVoice) tail.voice = chineseVoice;
    tail.onend = finish;
    tail.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(tail);
  };
  const submitCrtPassword = () => {
    if (crtPassword === "201103195827") {
      setCrtLoginError("");
      setCrtState("ready");
      return;
    }
    const nextAttempts = crtLoginAttempts + 1;
    setCrtLoginAttempts(nextAttempts);
    setCrtPassword("");
    setCrtLoginError(
      nextAttempts >= 3
        ? `密码错误。失败记录已写入安全日志（${nextAttempts}）。`
        : "密码错误。请检查桌面记录。",
    );
  };
  const pressCrtKey = (key: string, action: () => void) => {
    setPressedCrtKey(key);
    action();
    window.setTimeout(() => setPressedCrtKey(""), 230);
  };
  const openOfficeDoor = () => {
    startSound();
    const ctx = sound.current?.ctx;
    const master = sound.current?.master;
    if (ctx && master) {
      const now = ctx.currentTime;
      const latch = ctx.createOscillator();
      const latchGain = ctx.createGain();
      latch.type = "square";
      latch.frequency.setValueAtTime(132, now);
      latch.frequency.exponentialRampToValueAtTime(54, now + 0.18);
      latchGain.gain.setValueAtTime(0.08, now);
      latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      latch.connect(latchGain).connect(master);
      latch.start(now);
      latch.stop(now + 0.24);
      const hinge = ctx.createOscillator();
      const hingeGain = ctx.createGain();
      hinge.type = "sawtooth";
      hinge.frequency.setValueAtTime(42, now + 0.2);
      hinge.frequency.linearRampToValueAtTime(31, now + 1.25);
      hingeGain.gain.setValueAtTime(0.001, now);
      hingeGain.gain.linearRampToValueAtTime(0.025, now + 0.35);
      hingeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
      hinge.connect(hingeGain).connect(master);
      hinge.start(now + 0.18);
      hinge.stop(now + 1.4);
    }
    setOfficeDoorUnlocked(true);
    window.setTimeout(() => {
      setCaseFocus("");
      setCaseRoom("lin");
    }, 850);
  };
  const powerCrt = () => {
    if (crtState !== "off") return;
    pressCrtKey("power", () => {
      startSound();
      setCrtState("boot");
      window.setTimeout(() => setCrtState("login"), 2200);
    });
  };
  const useCrtKeyboard = (key: "w" | "a" | "s" | "d" | "enter" | "escape") => {
    pressCrtKey(key, () => {
      if (key === "escape") {
        setCaseFocus("");
        return;
      }
      if (crtState !== "ready") return;
      if (caseDecision) {
        if (caseBranchStep < 4 && key === "enter") {
          if (caseBranchStep === 3) {
            setCrtSelection(0);
            openOfficeDoor();
          }
          setCaseBranchStep((step) => step + 1);
          return;
        }
        if (caseBranchStep === 4 && caseFollowup) {
          if (caseFocus === "chenEvidence") {
            const choices = caseFollowup.choices;
            if (key === "w" || key === "a")
              setCrtSelection((value) => (value - 1 + choices.length) % choices.length);
            if (key === "s" || key === "d")
              setCrtSelection((value) => (value + 1) % choices.length);
            if (key === "enter") {
              setCaseFollowupDecision(choices[crtSelection % choices.length].id);
              setCaseBranchStep(5);
              setCaseRoom("lin");
              setCaseFocus("monitor");
            }
          } else if (key === "enter") setCaseFocus("");
        }
        return;
      }
      if (caseEvidence.length === 4 && !caseDecision) {
        const decisions = Object.keys(caseDecisions);
        if (key === "w" || key === "a")
          setCrtSelection((value) => (value - 1 + decisions.length) % decisions.length);
        if (key === "s" || key === "d") setCrtSelection((value) => (value + 1) % decisions.length);
        if (key === "enter") {
          setCaseDecision(decisions[crtSelection % decisions.length]);
          setCaseBranchStep(0);
        }
        return;
      }
      if (key === "w") setCrtSelection((value) => (value >= 2 ? value - 2 : value));
      if (key === "s") setCrtSelection((value) => (value <= 1 ? value + 2 : value));
      if (key === "a") setCrtSelection((value) => (value % 2 === 1 ? value - 1 : value));
      if (key === "d") setCrtSelection((value) => (value % 2 === 0 ? value + 1 : value));
      if (key === "enter") {
        const evidence = ["family", "income", "residence", "time"][crtSelection];
        setCaseEvidence((items) => (items.includes(evidence) ? items : [...items, evidence]));
      }
    });
  };
  useEffect(() => {
    if (stage !== "case" || !["monitor", "chenEvidence"].includes(caseFocus)) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const key = event.key.toLowerCase();
      if (!["w", "a", "s", "d", "enter", "escape"].includes(key)) return;
      event.preventDefault();
      useCrtKeyboard(key as "w" | "a" | "s" | "d" | "enter" | "escape");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });
  const scores = useMemo(() => {
    const s = {} as Record<FunctionKey, number>;
    (["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"] as FunctionKey[]).forEach((k) => (s[k] = 0));
    answers.forEach((k) => s[k]++);
    return s;
  }, [answers]);
  const matches = useMemo(
    () =>
      Object.entries(stacks)
        .map(([name, stack]) => ({
          name,
          value: stack.reduce((sum, fn, i) => sum + scores[fn] * [4, 3, 2, 1][i], 0),
        }))
        .sort((a, b) => b.value - a.value),
    [scores],
  );
  const type = directType || matches[0]?.name || "INTJ";
  const stack = stacks[type];
  const confidence = Math.max(
    52,
    Math.min(94, Math.round(58 + (matches[0]?.value - (matches[1]?.value || 0)) * 4)),
  );
  const choose = (option: Option, choiceIndex: number) => {
    if (locked) return;
    setLocked(true);
    setAnomalyKind(
      ["drift", "rewind", "double", "presence"][(index + choiceIndex + option.weight) % 4],
    );
    setEcho(option.echo || echoes[(index * 2 + choiceIndex) % echoes.length]);
    const next = option.fn ? [...answers, ...Array(option.weight).fill(option.fn)] : answers;
    setTimeout(() => {
      setAnswers(next);
      setWeights([...weights, option.weight]);
      setEcho("");
      setAnomalyKind("");
      setLocked(false);
      if (index === questions.length - 1) {
        setStage("reveal");
        setTimeout(() => setNoticed(1), 1800);
      } else setIndex(index + 1);
    }, 760);
  };
  const chooseIntrusion = () => {
    if (locked) return;
    setLocked(true);
    setIntrusionCount((v) => v + 1);
    setAnomalyKind("presence");
    setEcho("该反应不属于量表。系统仍将其记为有效。");
    setTimeout(() => {
      setEcho("");
      setAnomalyKind("");
      setLocked(false);
      if (index === questions.length - 1) {
        setStage("reveal");
        setTimeout(() => setNoticed(1), 1800);
      } else setIndex(index + 1);
    }, 1100);
  };
  const moveEyes = (clientX: number, clientY: number) => {
    if (!card.current || stage !== "reveal") return;
    const r = card.current.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (clientX - (r.left + r.width / 2)) / (r.width / 2)));
    const dy = Math.max(-1, Math.min(1, (clientY - (r.top + r.height * 0.42)) / (r.height / 2)));
    card.current.style.setProperty("--tilt-y", `${dx * 4.5}deg`);
    card.current.style.setProperty("--tilt-x", `${dy * -3.5}deg`);
    card.current.style.setProperty("--shift-x", `${dx * -7}px`);
    card.current.style.setProperty("--shift-y", `${dy * -5}px`);
    if (noticed === 1 && (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2)) setNoticed(2);
  };
  const portrait = asset(`portraits/${type.toLowerCase()}-${gender}.webp`);
  const portraitFallback = asset(`portraits/${type.toLowerCase()}-${gender}.png`);
  const memoryPortrait = asset("portraits/istj-female-memory.webp");
  const isMemoryDemo = type === "ISTJ" && gender === "female";
  const restorePortrait = (event: { currentTarget: HTMLImageElement }) => {
    if (event.currentTarget.src.endsWith(".png")) return;
    event.currentTarget.src = portraitFallback;
  };
  const recall = (key: string) =>
    setRecalled((items) => (items.includes(key) ? items : [...items, key]));
  const caseBranch = caseDecision ? caseBranches[caseDecision] : null;
  const caseFollowup = caseDecision ? caseFollowups[caseDecision] : null;
  const caseOutcome = caseFollowupDecision
    ? caseFollowup?.choices.find((choice) => choice.id === caseFollowupDecision)?.outcome
    : null;
  return (
    <main
      className={`shell stage-${stage} anomaly-${anomalyKind}`}
      onPointerMove={(e) => moveEyes(e.clientX, e.clientY)}
      onPointerDown={(e) => moveEyes(e.clientX, e.clientY)}
    >
      <div className="grain" />
      <div className="watcher-mark">+</div>
      <header>
        <div className="wordmark">
          <Fingerprint size={18} />
          <span>PRISM / XVI</span>
        </div>
        <div className="sys-state">
          <i /> INTERNAL NETWORK
        </div>
        <button className="sound" onClick={toggleSound} aria-label={muted ? "打开声音" : "静音"}>
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
      </header>
      {stage === "boot" && (
        <section className="boot declaration enter">
          <div className="document-head">
            <span>PRISM 人格研究与信息评估中心</span>
            <b>受试者知情告知书</b>
            <em>文件编号：PR-XVI/BA-020　密级：内部</em>
          </div>
          <div className="legal-copy">
            <p>
              本项目采用结构化情境判断任务，对信息获取与决策偏好进行研究性评估。系统将记录选项、停留时间、撤回行为及终端交互轨迹，用于生成认知功能序列匹配结果。
            </p>
            <p>
              评估结果仅描述相对偏好，不用于医学诊断、精神病理判定、就业筛选或现实犯罪风险评估。参与者可随时终止，但已生成的观察编号可能继续存在于本地会话中。
            </p>
            <div className="protocol">
              <span>测量框架</span>
              <b>8 COGNITIVE PROCESSES</b>
              <span>任务形式</span>
              <b>20 × 5-CHOICE + VALIDITY ITEMS</b>
              <span>档案状态</span>
              <b>UNRESOLVED</b>
            </div>
          </div>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>本人已阅读并理解以上说明，自愿进入评估程序。</span>
          </label>
          <button
            disabled={!consent}
            className="action"
            onClick={() => {
              startSound();
              setStage("register");
            }}
          >
            <LockKeyhole size={17} /> 签署并申请临时阅档权限
          </button>
          <div className="seal">
            PRISM
            <br />
            XVI
          </div>
          <small>
            PRISM 为本互动作品中的虚构研究机构；本页面并非任何官方 MBTI® 测评或医疗服务。
          </small>
        </section>
      )}
      {stage === "register" && (
        <section className="register enter">
          <button className="back" onClick={() => setStage("boot")}>
            <ArrowLeft /> 返回
          </button>
          <div className="terminal-label">OPERATOR REGISTRATION</div>
          <p className="prompt">选择系统用于匹配镜像样本的外观档案。</p>
          <div className="gender-pick">
            <button
              className={gender === "female" ? "active" : ""}
              onClick={() => setGender("female")}
            >
              <img src={asset("mbti-women.jpg")} alt="女性样本总表" />
              <span>女性镜像样本</span>
            </button>
            <button className={gender === "male" ? "active" : ""} onClick={() => setGender("male")}>
              <img src={asset("mbti-men.jpg")} alt="男性样本总表" />
              <span>男性镜像样本</span>
            </button>
          </div>
          <div className="notice">
            <b>研究性情境量表 · 20 项</b>
            <p>
              依据荣格类型动力学的公开定义，以四组认知过程、重复测量、跨情境复核与观察者效应项目估计功能序列。题目为原创编写，不复制官方
              MBTI® 题库。
            </p>
            <details>
              <summary>方法与适用边界</summary>
              <p>
                本工具比较八种认知过程的相对偏好。非标准选项只计入反应有效性异常，不参与人格功能计分。结果用于叙事体验，不构成心理、临床或犯罪风险诊断。
              </p>
            </details>
          </div>
          <button className="action" onClick={() => setStage("assessment")}>
            开始登记 <ChevronRight />
          </button>
        </section>
      )}
      {stage === "assessment" && (
        <section className={`assessment enter ${echo ? "anomaly" : ""}`} key={index}>
          <div className="question-top">
            <button
              disabled={locked}
              className="back"
              onClick={() => {
                if (!index) {
                  setStage("register");
                  return;
                }
                const lastWeight = weights.at(-1) || 0;
                setIndex(index - 1);
                setAnswers(lastWeight ? answers.slice(0, -lastWeight) : answers);
                setWeights(weights.slice(0, -1));
              }}
            >
              <ArrowLeft /> 撤回
            </button>
            <span>
              {String(index + 1).padStart(2, "0")} / {questions.length}
            </span>
          </div>
          <div className="meter">
            <i style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
          <div className="terminal-label">
            ITEM {questions[index].code}
            {questions[index].domain && ` · ${questions[index].domain}`}
          </div>
          <div className="known-condition">
            <span>已知条件</span>
            {questions[index].context}
          </div>
          <h1>{questions[index].scene}</h1>
          <div className="answers scale">
            {questions[index].choices.map((option, choiceIndex) => (
              <button
                key={choiceIndex}
                disabled={locked}
                onClick={() => choose(option, choiceIndex)}
              >
                <b>{String(choiceIndex + 1).padStart(2, "0")}</b>
                <span>{option.text}</span>
              </button>
            ))}
            {intrusions[index] && (
              <button className="intrusion-option" disabled={locked} onClick={chooseIntrusion}>
                <b>—</b>
                <span>{intrusions[index]}</span>
              </button>
            )}
          </div>
          <div className={`answer-echo ${echo ? "visible" : ""}`} aria-live="polite">
            <span>{intrusionCount ? "VALIDITY DEVIATION" : "RESPONSE ANOMALY"}</span>
            {echo}
          </div>
          <p className="footnote">请按已知条件选择你最可能实际执行的动作，而非理想答案。</p>
        </section>
      )}
      {stage === "reveal" && (
        <section className="reveal enter">
          <div className="match-line">FUNCTION SEQUENCE MATCHED · {confidence}%</div>
          <p className="your-type">您的人格是：</p>
          <div
            className="photo-space"
            style={{ backgroundImage: `url(${portrait}),url(${portraitFallback})` }}
          >
            <div className={`live-card ${noticed ? "awakened" : ""}`} ref={card}>
              <img
                className="depth-back"
                src={portrait}
                onError={restorePortrait}
                alt={`${type} 单人证件照`}
              />
              <div className="depth-mid">
                <img src={portrait} onError={restorePortrait} alt="" />
              </div>
              <div className="depth-subject">
                <img src={portrait} onError={restorePortrait} alt="" />
                <div
                  className="eye left"
                  style={{ backgroundImage: `url(${portrait}),url(${portraitFallback})` }}
                />
                <div
                  className="eye right"
                  style={{ backgroundImage: `url(${portrait}),url(${portraitFallback})` }}
                />
              </div>
              <div className="face-light" />
              <div className="screen-lines" />
              <div className="id-strip">
                <span>SUBJECT XVI-{type}</span>
                <b>{type}</b>
                <em>{aliases[type]}</em>
              </div>
            </div>
          </div>
          <div className="function-stack">
            {stack.map((fn, i) => (
              <span key={fn}>
                <small>{["主导", "辅助", "第三", "劣势"][i]}</small>
                {fn}
              </span>
            ))}
          </div>
          <p className="result-note">
            功能序列匹配度 {confidence}% · 次近候选 {matches[1]?.name}
            。该结果描述偏好，不代表能力、品格或临床结论。
          </p>
          <div className={`system-alert level-${noticed}`}>
            {noticed === 0
              ? "正在重建影像纵深…"
              : noticed === 1
                ? "空间图层已分离。请移动指针确认。"
                : "前景人物与背景的距离正在增加。"}
          </div>
          {noticed === 2 && (
            <button className="action danger" onClick={() => setStage("dossier")}>
              {isMemoryDemo ? "恢复该受试者的记忆" : "打开受限档案"} <ChevronRight />
            </button>
          )}
        </section>
      )}
      {stage === "dossier" &&
        (isMemoryDemo ? (
          <section className={`dossier memory-room enter ${memoryRecovered ? "recovered" : ""}`}>
            <div className="access-row">
              <span>MEMORY RESTORATION</span>
              <b>事件发生前 28 日</b>
            </div>
            <div className="memory-photo">
              <img className="after" src={portrait} alt="事件后的林素云" />
              <img className="before" src={memoryPortrait} alt="事件发生前的林素云" />
              <div className="memory-scan" />
              <span>
                {memoryRecovered ? "2015.03.19 / 市政档案中心" : "SUBJECT XVI-ISTJ / 收押影像"}
              </span>
            </div>
            {!memoryRecovered ? (
              <>
                <div className="system-alert">检测到较早期影像。恢复过程可能覆盖当前人格侧写。</div>
                <button className="action danger" onClick={() => setMemoryRecovered(true)}>
                  恢复事件前影像 <ChevronRight />
                </button>
              </>
            ) : (
              <>
                <p className="memory-instruction">
                  照片恢复了笑容，但记忆仍不完整。检查桌面上留下的三件物品。
                </p>
                <div className="memory-objects">
                  <button
                    className={recalled.includes("badge") ? "read" : ""}
                    onClick={() => recall("badge")}
                  >
                    <b>旧工牌</b>
                    <span>
                      {recalled.includes("badge")
                        ? "林素云，档案审核员。连续十九年无流程错误。"
                        : "点击查看"}
                    </span>
                  </button>
                  <button
                    className={recalled.includes("bill") ? "read" : ""}
                    onClick={() => recall("bill")}
                  >
                    <b>缴费通知</b>
                    <span>
                      {recalled.includes("bill")
                        ? "父亲本周住院。逾期将中止治疗担保。"
                        : "点击查看"}
                    </span>
                  </button>
                  <button
                    className={recalled.includes("file") ? "read" : ""}
                    onClick={() => recall("file")}
                  >
                    <b>退回申请</b>
                    <span>
                      {recalled.includes("file")
                        ? "材料晚到一天。申请人独自抚养两个孩子。"
                        : "点击查看"}
                    </span>
                  </button>
                </div>
                {recalled.length === 3 && (
                  <>
                    <div className="memory-summary">
                      <span>记忆复现完成</span>
                      <p>那一天，你还相信规则能保护所有人。</p>
                      <p>17:42，一份不合格申请被送到你的桌上。</p>
                    </div>
                    <button className="action" onClick={() => setStage("case")}>
                      进入 17:42 的记忆 <ChevronRight />
                    </button>
                  </>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="dossier enter">
            <div className="access-row">
              <span>ACCESS LEVEL 01</span>
              <b>已解锁 1 / 32</b>
            </div>
            <div className="redaction">
              <span>内部复核通知</span>
              <p>系统在十一年前已将该受试者标记为死亡。</p>
              <p>当前照片的视觉反馈并非来自原始影像文件。</p>
              <strong>请确认：你是否仍要继续观察？</strong>
            </div>
            <div className="evidence-file">
              <div>
                <small>异常记录</small>
                <b>LIVE DOSSIER / 00:16:33</b>
              </div>
              <p>在你移动指针前，系统已经提前生成了受试者下一次注视的位置。</p>
              <p className="typed">分析对象可能不是照片。</p>
            </div>
            <button className="action locked">
              <LockKeyhole /> 后续档案正在封存
            </button>
          </section>
        ))}
      {stage === "case" && (
        <section className={`flat-scene enter room-${caseRoom}`}>
          <audio
            ref={voicemail}
            src={asset("audio/hospital-voicemail.mp3")}
            preload="auto"
            onEnded={finishVoicemail}
          />
          <img
            className="scene-image"
            src={asset(
              caseRoom === "corridor"
                ? "scenes/archive-corridor-1750.png"
                : caseRoom === "chen"
                  ? "scenes/chen-office-1804.png"
                  : "scenes/istj-office-1742.webp",
            )}
            alt={caseRoom === "corridor" ? "档案中心走廊" : caseRoom === "chen" ? "陈国平的办公室" : "17:42 的市政档案办公室"}
          />
          <div className="scene-vignette" />
          <div className="scene-clock">2015.03.19　{caseRoom === "lin" ? "17:42" : caseRoom === "corridor" ? "17:50" : "18:04"}</div>
          <div className="scene-hint">
            {caseRoom === "lin"
              ? officeDoorUnlocked
                ? "走廊传来一声关门响。陈国平似乎出去了——现在是检查终端 07 的机会。"
                : "查看桌面。需要处理的文件还在等你。"
              : caseRoom === "corridor"
                ? "异常操作来自终端 07。陈国平办公室的门没有关严。"
                : "陈国平不在。终端 07、传真机和抽屉都留在原处。"}
          </div>
          <button
            className="hotspot monitor"
            aria-label="查看审核终端"
            onClick={() => openCaseObject("monitor")}
          >
            <span>审核终端</span>
          </button>
          <button
            className="hotspot folder"
            aria-label="查看申请文件"
            onClick={() => openCaseObject("folder")}
          >
            <span>申请文件</span>
          </button>
          <button
            className="hotspot phone"
            aria-label="查看座机"
            onClick={() => openCaseObject("phone")}
          >
            <span>座机</span>
          </button>
          <button
            className="hotspot badge"
            aria-label="查看工牌"
            onClick={() => openCaseObject("badge")}
          >
            <span>工牌</span>
          </button>
          <button
            className="hotspot payment"
            aria-label="查看住院缴费通知"
            onClick={() => openCaseObject("payment")}
          >
            <span>压在台历下的纸</span>
          </button>
          {caseRoom === "lin" && officeDoorUnlocked && (
            <button className="hotspot exit-door" onClick={() => setCaseRoom("corridor")}>
              <span>走廊</span>
            </button>
          )}
          {caseRoom === "corridor" && (
            <>
              <button className="hotspot chen-door" onClick={() => setCaseRoom("chen")}>
                <span>半开的办公室</span>
              </button>
              <button className="hotspot corridor-back" onClick={() => setCaseRoom("lin")}>
                <span>返回林素云工位</span>
              </button>
            </>
          )}
          {caseRoom === "chen" && (
            <>
              <button className="hotspot chen-desk" onClick={() => openCaseObject("chenEvidence")}>
                <span>检查陈国平的工位</span>
              </button>
              <button className="hotspot chen-back" onClick={() => setCaseRoom("corridor")}>
                <span>退回走廊</span>
              </button>
            </>
          )}
          {caseFocus && (
            <div className="scene-modal" role="dialog" aria-modal="true">
              <button
                className="scene-close"
                onClick={() => setCaseFocus("")}
                aria-label="返回办公室"
              >
                ×
              </button>
              {caseFocus === "folder" && (
                <figure className="scene-object file-object">
                  <img
                    src={asset("objects/housing-application-file.webp")}
                    alt="周静的临时安置资格申请文件"
                  />
                  <figcaption>
                    <span>申请编号：HS-0416-273。纸张右上角盖着很浅的“退回待复核”。</span>
                    <button onClick={() => openCaseObject("monitor")}>到终端核验材料</button>
                  </figcaption>
                </figure>
              )}
              {caseFocus === "phone" && (
                <div className="scene-object phone-object">
                  <div className="object-image">
                    <img src={asset("objects/office-voicemail-phone.webp")} alt="桌面上的旧座机" />
                    <div className="phone-frame-cache" aria-hidden="true">
                      {["voicemail", "one", "play"].flatMap((key) =>
                        ["half", "full"].map((phase) => (
                          <img
                            key={`${key}-${phase}`}
                            src={asset(`objects/phone-frames/${key}-${phase}.webp`)}
                            alt=""
                          />
                        )),
                      )}
                    </div>
                    {pressedPhoneKey && (
                      <>
                        <img
                          className={`phone-motion-frame ${pressedPhoneKey}-frame half-frame`}
                          src={asset(`objects/phone-frames/${pressedPhoneKey}-half.webp`)}
                          alt=""
                        />
                        <img
                          className={`phone-motion-frame ${pressedPhoneKey}-frame full-frame`}
                          src={asset(`objects/phone-frames/${pressedPhoneKey}-full.webp`)}
                          alt=""
                        />
                      </>
                    )}
                    <div className={`phone-lcd lcd-${phoneStep}`} aria-hidden="true">
                      <span>
                        {phoneStep === "idle"
                          ? "1 NEW MESSAGE"
                          : phoneStep === "mailbox"
                            ? "MAILBOX 01"
                            : phoneStep === "playing"
                              ? "PLAY 00:01"
                              : "MESSAGE 01"}
                      </span>
                    </div>
                    <button
                      className={`physical-key voicemail-key ${pressedPhoneKey === "voicemail" ? "pressed" : ""}`}
                      aria-label="打开语音信箱"
                      onClick={() => pressPhoneKey("voicemail", () => setPhoneStep("mailbox"))}
                    />
                    <button
                      className={`physical-key one-key ${pressedPhoneKey === "one" ? "pressed" : ""}`}
                      aria-label="选择一号留言"
                      disabled={phoneStep === "idle"}
                      onClick={() => pressPhoneKey("one", () => setPhoneStep("selected"))}
                    />
                    <button
                      className={`physical-key play-key ${pressedPhoneKey === "play" ? "pressed" : ""}`}
                      aria-label="播放留言"
                      disabled={phoneStep !== "selected" && phoneStep !== "playing"}
                      onClick={() => pressPhoneKey("play", playVoicemail)}
                    />
                  </div>
                  <div className="phone-readout" aria-live="polite">
                    <span>
                      {phoneStep === "idle"
                        ? "按 VOICE MAIL 查找留言"
                        : phoneStep === "mailbox"
                          ? "语音信箱：1 条新留言｜按 1 选择"
                          : phoneStep === "playing"
                            ? "正在播放　16:58｜市立医院住院处"
                            : "留言 01 已选择｜按 ▶ 播放"}
                    </span>
                    <i>
                      {phoneStep === "idle"
                        ? "机身标签：档案审核组／分机 2058。"
                        : phoneStep === "mailbox"
                          ? "按下数字 1。"
                          : phoneStep === "playing"
                            ? "声音来自听筒内部。"
                            : voicemailHeard
                              ? "留言尾段：请仍报旧病案号，尾号 5827。"
                              : "不要读取文字，听完它。"}
                    </i>
                  </div>
                </div>
              )}
              {caseFocus === "badge" && (
                <figure className="scene-object badge-object">
                  <img
                    src={asset("objects/lin-suyun-badge.webp")}
                    alt="林素云的市政档案中心竖版工牌"
                  />
                  <figcaption>林素云，工号 A-071。照片印在纸芯里，划痕从她的脸上穿过去。</figcaption>
                </figure>
              )}
              {caseFocus === "payment" && (
                <figure className="scene-object payment-object">
                  <img
                    src={asset("objects/lin-father-hospital-payment.png")}
                    alt="林国安的住院缴费通知和林素云留下的便签"
                  />
                  <figcaption>
                    <span>
                      四年前的缴费通知，被折过很多次。欠费金额正好是 800 元。便签上的日期和今天相同，年份不同。
                    </span>
                  </figcaption>
                </figure>
              )}
              {caseFocus === "chenEvidence" && caseFollowup && (
                <div className="scene-object chen-evidence-panel">
                  <div className="branch-route">
                    <span>{caseFollowup.source}</span>
                    <b>{caseFollowup.time}</b>
                  </div>
                  <p className="followup-discovery">{caseFollowup.discovery}</p>
                  <h2>{caseFollowup.prompt}</h2>
                  <div className="followup-list">
                    {caseFollowup.choices.map((choice, choiceIndex) => (
                      <button
                        key={choice.id}
                        className={crtSelection % caseFollowup.choices.length === choiceIndex ? "keyboard-focus" : ""}
                        onClick={() => {
                          setCaseFollowupDecision(choice.id);
                          setCaseBranchStep(5);
                          setCaseRoom("lin");
                          setCaseFocus("monitor");
                        }}
                      >
                        <b>{choice.title}</b>
                        <span>{choice.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {caseFocus === "monitor" && (
                <div className="crt-object">
                  <img
                    src={asset("objects/archive-crt-terminal.webp")}
                    alt="市政档案中心旧式审核终端"
                  />
                  <div className={`crt-glass crt-${crtState}`}>
                    {crtState === "boot" && (
                      <div className="crt-boot-sequence" aria-live="polite">
                        <i />
                        <div>
                          <span>ARCHIVE BIOS 2.7</span>
                          <span>MEMORY CHECK ........ 640K OK</span>
                          <span>LOADING MUNICIPAL RECORDS SYSTEM</span>
                          <b>TERMINAL 04 / OPERATOR A-071</b>
                        </div>
                      </div>
                    )}
                    {crtState === "login" && (
                      <div className="xp-login-screen">
                        <div className="xp-login-brand">
                          <i>市政档案中心</i>
                          <b>Windows XP Professional</b>
                          <span>要开始使用，请登录</span>
                        </div>
                        <form
                          className="xp-login-card"
                          onSubmit={(event) => {
                            event.preventDefault();
                            submitCrtPassword();
                          }}
                        >
                          <div className="xp-user-icon">林</div>
                          <div>
                            <b>林素云</b>
                            <label htmlFor="crt-password">密码</label>
                            <input
                              id="crt-password"
                              type="password"
                              inputMode="numeric"
                              autoFocus
                              value={crtPassword}
                              onChange={(event) => {
                                setCrtPassword(event.target.value.replace(/\D/g, "").slice(0, 12));
                                setCrtLoginError("");
                              }}
                              aria-label="输入终端密码"
                            />
                            <button type="submit">→</button>
                            <small>密码提示：爸第一次住院，旧号</small>
                            {crtLoginError && <em>{crtLoginError}</em>}
                          </div>
                        </form>
                        <footer>登录到：DA-MUNICIPAL　　关闭计算机</footer>
                      </div>
                    )}
                    {crtState === "ready" && (
                      <div className="case-screen">
                        <div className="legacy-titlebar">
                          <span>市政安置资格审核系统 3.12</span>
                          <i>—　□　×</i>
                        </div>
                        <div className="legacy-menubar">
                          文件(F)　编辑(E)　查询(Q)　业务处理(B)　窗口(W)　帮助(H)
                        </div>
                        <div className="legacy-toolbar">
                          <button>新建</button>
                          <button>查询</button>
                          <button>打印</button>
                          <span />
                          <em>W/A/S/D 移动　Enter 确认　Esc 退出</em>
                        </div>
                        <div className="case-bar">
                          <span>安置资格审核系统　/　终端 04</span>
                          <b>17:42:16</b>
                        </div>
                        <div className="case-heading">
                          <div>
                            <small>当前经办人</small>
                            <b>林素云　A-071</b>
                          </div>
                          <div>
                            <small>本月差错率</small>
                            <b>0.00%</b>
                          </div>
                          <div>
                            <small>今日待处理</small>
                            <b>17</b>
                          </div>
                        </div>
                        <div className="case-file">
                          <div className="case-file-title">
                            <span>申请编号 HS-0416-273</span>
                            <b>材料状态：不完整</b>
                          </div>
                          <h1>临时安置资格申请</h1>
                          <p>申请人：周静　｜　家庭成员：3 人　｜　申请类型：紧急安置</p>
                          <div className="evidence-grid">
                            <button
                              className={`${caseEvidence.includes("family") ? "checked" : ""} ${crtSelection === 0 ? "keyboard-focus" : ""}`}
                              onClick={() =>
                                setCaseEvidence((v) =>
                                  v.includes("family") ? v : [...v, "family"],
                                )
                              }
                            >
                              <span>家庭关系证明</span>
                              <b>
                                {caseEvidence.includes("family")
                                  ? "独自抚养两名未成年子女"
                                  : "点击核验"}
                              </b>
                            </button>
                            <button
                              className={`${caseEvidence.includes("income") ? "checked" : ""} ${crtSelection === 1 ? "keyboard-focus" : ""}`}
                              onClick={() =>
                                setCaseEvidence((v) =>
                                  v.includes("income") ? v : [...v, "income"],
                                )
                              }
                            >
                              <span>收入证明</span>
                              <b>
                                {caseEvidence.includes("income")
                                  ? "低于安置标准 31%｜符合"
                                  : "点击核验"}
                              </b>
                            </button>
                            <button
                              className={`${caseEvidence.includes("residence") ? "checked" : ""} ${crtSelection === 2 ? "keyboard-focus" : ""}`}
                              onClick={() =>
                                setCaseEvidence((v) =>
                                  v.includes("residence") ? v : [...v, "residence"],
                                )
                              }
                            >
                              <span>居住年限</span>
                              <b>
                                {caseEvidence.includes("residence")
                                  ? "连续居住 8 年｜符合"
                                  : "点击核验"}
                              </b>
                            </button>
                            <button
                              className={`${caseEvidence.includes("time") ? "late checked" : ""} ${crtSelection === 3 ? "keyboard-focus" : ""}`}
                              onClick={() =>
                                setCaseEvidence((v) => (v.includes("time") ? v : [...v, "time"]))
                              }
                            >
                              <span>收件时间</span>
                              <b>
                                {caseEvidence.includes("time")
                                  ? "截止 04/16｜收到 04/17 00:03"
                                  : "点击核验"}
                              </b>
                            </button>
                          </div>
                        </div>
                        {caseEvidence.length < 4 ? (
                          <div className="case-prompt">请完成 4 项材料核验后提交处理意见。</div>
                        ) : !caseDecision ? (
                          <div className="decision-panel">
                            <div className="known-condition">
                              <span>已知条件</span>申请人符合实际困难标准；材料晚交 3
                              分钟。今天是月度结算日，这是你最后一件待办。当前按时办结率
                              100%（39/39）；出现 1 件超时，本月 800 元绩效奖取消。
                            </div>
                            <h2>你实际会怎样处理？</h2>
                            <div className="decision-list">
                              {Object.entries(caseDecisions).map(([key, item], decisionIndex) => (
                                <button
                                  key={key}
                                  className={
                                    crtSelection % 5 === decisionIndex ? "keyboard-focus" : ""
                                  }
                                  onClick={() => {
                                    setCaseDecision(key);
                                    setCaseFollowupDecision("");
                                    setCaseBranchStep(0);
                                  }}
                                >
                                  <b>{item.title}</b>
                                  <span>{item.consequence}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="decision-result">
                            {caseBranchStep === 0 ? (
                              <>
                                <span>处理意见已写入</span>
                                <h2>{caseDecisions[caseDecision].title}</h2>
                                <p>{caseDecisions[caseDecision].record}</p>
                                <small>{caseDecisions[caseDecision].consequence}</small>
                                <div className="future-record">
                                  检测到与本次处理关联的后续记录。
                                </div>
                                <button onClick={() => setCaseBranchStep(1)}>
                                  调取后续记录（Enter）
                                </button>
                              </>
                            ) : caseBranchStep <= 3 && caseBranch ? (
                              <div className="branch-record">
                                <div className="branch-route">
                                  <span>{caseBranch.route}</span>
                                  <b>{caseBranchStep} / 3</b>
                                </div>
                                <h2>{caseBranch.records[caseBranchStep - 1].source}</h2>
                                <small>{caseBranch.records[caseBranchStep - 1].date}</small>
                                <p>{caseBranch.records[caseBranchStep - 1].body}</p>
                                <div className="branch-flag">
                                  {caseBranch.records[caseBranchStep - 1].flag}
                                </div>
                                <button onClick={() => {
                                  if (caseBranchStep === 3) {
                                    setCrtSelection(0);
                                    openOfficeDoor();
                                  }
                                  setCaseBranchStep((step) => step + 1);
                                }}>
                                  {caseBranchStep === 3
                                    ? "查看复核附件（Enter）"
                                    : "下一份记录（Enter）"}
                                </button>
                              </div>
                            ) : caseBranchStep === 4 && caseFollowup ? (
                              <div className="followup-decision spatial-directive">
                                <div className="branch-route">
                                  <span>{caseFollowup.source}</span>
                                  <b>{caseFollowup.time}</b>
                                </div>
                                <p className="followup-discovery">
                                  刚才记录中的关键操作来自陈国平账户。共享目录显示：最后写入位置为陈国平办公室／终端 07。
                                </p>
                                <h2>走廊传来关门声。他似乎刚刚离开。现在可以检查终端 07。</h2>
                                <button onClick={() => setCaseFocus("")}>返回办公室（Enter）</button>
                              </div>
                            ) : caseBranch && caseOutcome ? (
                              <div className="case-outcome">
                                <span>办件关联记录／封存前预览</span>
                                <h2>{caseBranch.route}</h2>
                                <div className="outcome-grid">
                                  <div><b>周静及子女</b><p>{caseOutcome.applicant}</p></div>
                                  <div><b>林国安</b><p>{caseOutcome.father}</p></div>
                                  <div><b>林素云</b><p>{caseOutcome.career}</p></div>
                                  <div><b>证据状态</b><p>{caseOutcome.evidence}</p></div>
                                </div>
                                <blockquote>{caseBranch.motive}</blockquote>
                                <button className="action locked">
                                  <LockKeyhole /> 样本 XVI-ISTJ · 本次记录封存
                                </button>
                              </div>
                            ) : null}
                          </div>
                        )}
                        <div className="legacy-statusbar">
                          <span>就绪</span>
                          <span>内网节点：DA-04</span>
                          <span>操作员：A-071</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    className={`crt-physical-key crt-power-key ${pressedCrtKey === "power" ? "pressed" : ""}`}
                    aria-label={crtState === "off" ? "开启显示器" : "显示器已开启"}
                    onClick={powerCrt}
                  />
                  {crtState === "off" && <div className="crt-power-hint">按下显示器电源键</div>}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
