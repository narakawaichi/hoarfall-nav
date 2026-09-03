"use client";

// ===== 站点清单：我的自建服务生态（按需增删，域名 / 图标 / 状态标签改这里即可）=====
type Site = {
  name: string;
  domain: string;
  url: string | null; // null = 尚未上线，只展示不跳转
  icon: string; // Font Awesome 类名，经 cdnjs.hoarfall.cn 镜像加载
  tag?: string; // 状态小标签，如 待完善 / 名字未定 / 规划中
};

const SITES: Site[] = [
  { name: '霜落网盘', domain: 'pan.hoarfall.cn', url: 'https://pan.hoarfall.cn', icon: 'fa-solid fa-cloud' },
  { name: '霜落图床', domain: 'img.hoarfall.cn', url: 'https://img.hoarfall.cn', icon: 'fa-solid fa-image' },
  { name: 'R2 存储管理', domain: 'r2.hoarfall.cn', url: 'https://r2.hoarfall.cn', icon: 'fa-solid fa-database' },
  { name: '图片社区', domain: 'ani.hoarfall.cn', url: 'https://ani.hoarfall.cn', icon: 'fa-solid fa-images', tag: '名字未定' },
  { name: '小站', domain: 'www.hoarfall.cn', url: 'https://www.hoarfall.cn', icon: 'fa-solid fa-globe', tag: '待完善' },
  { name: '私人仓库', domain: 'stash.hoarfall.cn', url: 'https://stash.hoarfall.cn', icon: 'fa-solid fa-code-branch' },
  { name: '私人桶', domain: 'download.hoarfall.cn', url: 'https://download.hoarfall.cn', icon: 'fa-solid fa-bucket' },
  { name: '自建镜像', domain: 'cdnjs.hoarfall.cn', url: 'https://cdnjs.hoarfall.cn', icon: 'fa-solid fa-box-archive' },
  { name: '图片审核接口', domain: 'nsfwjs.hoarfall.cn', url: 'https://nsfwjs.hoarfall.cn', icon: 'fa-solid fa-shield-halved' },
  { name: '个人生态接口', domain: 'api.hoarfall.cn', url: null, icon: 'fa-solid fa-plug', tag: '规划中' },
];

// ===== 社交链接：头像区之外的“联系我”通道（全是真跳转）=====
type Social = {
  icon: string;
  label: string;
  value: string;
  href: string; // http(s) / mailto: 等
  newTab?: boolean; // 默认新窗口；mailto 等协议不新开
};

const SOCIALS: Social[] = [
  { icon: 'fa-brands fa-github', label: 'GitHub', value: 'narakawaichi', href: 'https://github.com/narakawaichi/' },
  { icon: 'fa-brands fa-bilibili', label: 'Bilibili', value: 'UID 471386968', href: 'https://space.bilibili.com/471386968' },
  // QQ：跳官方临时会话页（装了 QQ 会唤起客户端会话）
  { icon: 'fa-brands fa-qq', label: 'QQ', value: '3454863428', href: 'https://wpa.qq.com/msgrd?v=3&uin=3454863428&site=qq&menu=yes' },
  // 邮箱：唤起系统邮件客户端
  { icon: 'fa-solid fa-envelope', label: '邮箱', value: 'narakawaichi@hoarfall.cn', href: 'mailto:narakawaichi@hoarfall.cn', newTab: false },
];

export default function SiteLinksCard() {

  return (
    <section className="w-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 sm:p-7 transition-all duration-700 hover:shadow-indigo-500/10">
      {/* 卡片头部 */}
      <div className="flex items-center gap-3 sm:gap-4 mb-5">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <i className="fa-solid fa-sitemap text-base sm:text-lg" aria-hidden="true"></i>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wider leading-snug truncate transition-colors duration-700">
            我的网站
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 truncate transition-colors duration-700">
            把能自建的服务全都自建了——从网盘到 API
          </p>
        </div>
      </div>

      {/* 站点网格：手机 2 列，桌面 5 列 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {SITES.map((site) => {
          const inner = (
            <>
              <span className="w-9 h-9 rounded-xl bg-indigo-500/15 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <i className={`${site.icon} text-sm`} aria-hidden="true"></i>
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="flex items-center gap-1 min-w-0">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate transition-colors duration-700">
                    {site.name}
                  </span>
                  {site.tag && (
                    <span className="shrink-0 text-[9px] font-bold px-1 py-px rounded bg-amber-400/25 text-amber-600 dark:text-amber-300">
                      {site.tag}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate transition-colors duration-700">
                  {site.domain}
                </span>
              </span>
            </>
          );

          const cls =
            'flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-white/60 dark:border-white/10 p-2.5 sm:p-3 min-w-0 transition-all duration-300 hover:bg-indigo-500/10 hover:border-indigo-400/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';

          if (site.url) {
            return (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" title={`${site.name} ${site.domain}`} className={cls}>
                {inner}
              </a>
            );
          }
          return (
            <div
              key={site.name}
              title={`${site.name}（${site.tag}，敬请期待）`}
              aria-disabled="true"
              className={`${cls} opacity-60 cursor-default hover:bg-transparent hover:border-white/60 dark:hover:border-white/10 hover:-translate-y-0`}
            >
              {inner}
            </div>
          );
        })}
      </div>

      {/* 底部：社交 / 联系方式 */}
      <div className="mt-5 pt-4 border-t border-white/40 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {SOCIALS.map((item) => {
            const pill = (
              <>
                <span className="w-8 h-8 rounded-xl bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <i className={`${item.icon} text-sm`} aria-hidden="true"></i>
                </span>
                <span className="flex flex-col min-w-0 leading-tight text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate transition-colors duration-300 max-w-[130px] sm:max-w-[180px]">
                    {item.value}
                  </span>
                </span>
              </>
            );
            const pillCls =
              'flex items-center gap-2.5 pl-2 pr-3.5 sm:pr-4 py-1.5 rounded-2xl bg-white/50 dark:bg-slate-700/50 border border-white/60 dark:border-white/10 shadow-sm transition-all duration-300 hover:bg-indigo-500 hover:border-indigo-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';

            return (
              <a
                key={item.label}
                href={item.href}
                target={item.newTab === false ? undefined : '_blank'}
                rel={item.newTab === false ? undefined : 'noopener noreferrer'}
                title={item.value}
                className={pillCls}
              >
                {pill}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
