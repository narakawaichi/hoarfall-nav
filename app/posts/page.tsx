import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';

function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  if (!fs.existsSync(postsDirectory)) return [];
  const filenames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'));
  return filenames
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(postsDirectory, f), 'utf8');
      const { data, content } = matter(raw);
      const body = content.replace(/^---[\s\S]*?---/, '').trim();
      const excerpt = body.replace(/[#>*`~\-\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
      return {
        slug,
        title: data.title || '无标题',
        date: data.date || '',
        tags: data.tags && Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover || siteConfig.defaultPostCover,
        excerpt: excerpt + (body.length > 80 ? '…' : ''),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function PostsIndex() {
  const posts = getPosts();
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main className="w-[95%] md:w-[90%] max-w-6xl mx-auto mt-24 md:mt-28 relative z-10">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-700">
              文章
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 transition-colors duration-700">
              {siteConfig.authorName} 的折腾记录
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-20">暂无文章</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/posts/${p.slug}`}
                  className="group block bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-2">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.excerpt}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{p.date}</span>
                      {p.tags.slice(0, 3).map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </PageTransition>
    </div>
  );
}
