import Link from 'next/link';
import { siteConfig } from '../siteConfig';

type NavLink = { title: string; url: string; desc?: string };

export default function NavGrid() {
  const links: NavLink[] = siteConfig.navLinks || [];
  if (!links.length) return null;

  const cardCls =
    'group relative flex flex-col gap-1 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg p-4 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-400/60 transition-all duration-300';

  return (
    <section className="w-full">
      <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 pl-1 transition-colors duration-700">
        快捷导航
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {links.map((l) => {
          const external = /^https?:\/\//.test(l.url);
          const inner = (
            <>
              <span className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                {l.title}
                {external && (
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5v5M19 5l-9 9M19 14v5h-5M10 19H5v-5" />
                  </svg>
                )}
              </span>
              {l.desc && (
                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{l.desc}</span>
              )}
            </>
          );
          return external ? (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={cardCls}>
              {inner}
            </a>
          ) : (
            <Link key={l.url} href={l.url} className={cardCls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
