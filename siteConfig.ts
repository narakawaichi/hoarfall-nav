// siteConfig.ts - 你的全站“控制中心”

export const siteConfig = {
  // 1. 网站标题与博主信息
  title: "依落霜 の 精品宝藏",
  faviconUrl: "https://img.hoarfall.cn/A/6a97d317825b4.ico",
  authorName: "依岸归",
  bio: "是喵娘！",

  // ===== SEO 配置（canonical / sitemap / OG 基准）=====
  baseUrl: "https://nav.hoarfall.cn", // 无尾斜杠
  seo: {
    defaultTitle: "依落霜 の 精品宝藏",
    defaultDescription: "是喵娘！依落霜的个人博客 —— 记录代码、学术、提瓦特与泰拉大陆的碎片时光。",
    defaultKeywords: ["依落霜", "XingHuiSama", "个人博客", "前端", "摄影", "杂谈"],
    ogImage: "https://bu.dusays.com/2026/03/24/69c1e38b346cb.jpg",
    // 按页面类型分规则；列表页配 title（由根 template 追加 " | 站点名"），动态页留空由 frontmatter 覆盖
    pages: {
      home:          { title: "依落霜 の 精品宝藏", description: "是喵娘！记录代码、学术、提瓦特与泰拉大陆的碎片时光。", keywords: ["依落霜", "首页"] },
      posts:         { title: "文章",  description: "依落霜 的折腾记录与原创文章", keywords: ["文章", "博客"] },
      post:          { description: "", keywords: [] },
      chatter:       { title: "杂谈",  description: "代码、学术、提瓦特与泰拉大陆的碎片记录", keywords: ["杂谈", "记录"] },
      chatterDetail: { description: "", keywords: [] },
      moments:       { title: "说说",  description: "生活动态与瞬间记录", keywords: ["说说", "动态", "朋友圈"] },
      photowall:     { title: "照片墙", description: "定格时间，封存泰拉与现实的每一次心跳", keywords: ["照片", "摄影", "相册"] },
      music:         { title: "音乐馆", description: "在代码的缝隙中寻找灵魂的共鸣", keywords: ["音乐", "播放器"] },
      friends:       { title: "友链",  description: "赛博空间里的有趣灵魂", keywords: ["友链", "朋友"] },
      projects:      { title: "项目矩阵", description: "开源项目与代码仓库展示", keywords: ["项目", "开源"] },
      timeline:      { title: "归档与探索", description: "文章归档与标签探索", keywords: ["归档", "标签"] },
      about:         { title: "关于我", description: "关于博主 依落霜 的介绍", keywords: ["关于", "博主"] },
      tree:          { title: "创作工坊", description: "我的创作工坊与时间线", keywords: ["创作", "工坊"] },
    },
  },

  navTitle: "依落霜",

  //  【新增】导航栏中间的那个后缀/分隔符（默认是 の）
  navSuffix: "の",

  navAfter: "精品宝藏",

  // 2. 头像设置 (支持网络链接，或将图片放入 public 文件夹后使用 "/me.jpg")
  avatarUrl: "https://img.hoarfall.cn/A/6a97d38d19988.png",

  // 3. 网站背景设置 (二选一)
  // 如果想用纯图片背景，请在下面 bgImage 写路径，并将 useGradient 设为 false
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"], // 呼吸流动的颜色组合
// 修改这里：变成图片数组
  bgImages: ["https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4acdb5.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4d9486.jpg", "https://img.hoarfall.cn/A/6a934c43535ca.jpg", "https://img.hoarfall.cn/A/6a934c43bb1ea.jpg", "https://img.hoarfall.cn/A/6a934c4240f01.jpg", "https://img.hoarfall.cn/A/6a934c47805ba.jpg"],

  // 4. 文章默认封面图 (当 Markdown 没写 cover 时显示)
  defaultPostCover: "https://bu.dusays.com/2026/03/24/69c1e38b346cb.jpg",

  // 5. 首页照片墙预览图
  photoWallImage: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",
  cloudMusicIds: ["3398249541", "2092324876", "3326907142", "2609896241", "1973665667", "34723470"],
  social: {
    github: "https://github.com/narakawaichi",
    gitee: "",
    google: "mailto:narakawaichi@hoarfall.cn",
    email: "3454863428@qq.com",
    qq: "3454863428",
    wechat: "narakawacihi",
  },
  counts: {
    photos: 128, // 照片墙数量可以手动写死或动态计算
  },
  chatterTitle: "云端杂谈", // 你可以改成任何你喜欢的名字
  chatterDescription: "代码、学术、提瓦特与泰拉大陆的碎片记录",


  //  【新增】：全局背景弹幕配置
  danmakuList: ["在干嘛呢？", "有笨蛋嘛？", "前方高能反应！", "GROMACS 跑起来了吗？", "MD 模拟什么时候才能出图啊", "Graph Neural Networks 炼丹中...", "BUG 修复进度 99%", "今天背单词了吗？", "Tailwind CSS 拯救前端", "写算法中", "睡大觉中", "到底在干嘛？"],
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },
  buildDate: "2026-09-03T00:00:00", // 建站日期
  footerBadges: [],
  icpConfig: {
    name: "萌ICP备 20260240号",
    link: "https://icp.gov.moe/?keyword=20260240",
  },
  friendLinkApplyFormat: "名称：XingHuiSamaの宝藏之地\n简介：今天我也要学习吗\n链接：https://www.xinghuisama.top\n头像：https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  enableLevelSystem: false,
  // 📄 页首/页尾 HTML 注入（用于统计代码、自定义脚本、备案信息等）
  // headerHtml —— 注入到 <head> 内（如百度统计、第三方 CDN 脚本、meta）
  // footerHtml —— 注入到 </body> 前（如 JS 统计代码）
  headerHtml: "",
  footerHtml: "",
};