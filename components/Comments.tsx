"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type RenderComment = {
  id: string;
  nickname: string;
  emailMasked: string;
  content: string;
  createdAt: number;
};

type CommentsProps = {
  id?: string; // 显式评论区 ID（说说/实验室用）；缺省按当前路径自动生成
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const sameDay = d.toDateString() === now.toDateString();
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (sameDay) return `今天 ${hm}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${hm}`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}`;
}

export default function Comments({ id }: CommentsProps) {
  const pathname = usePathname();
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageKey = (id || pathname.replace(/\/+$/, '') || '/').slice(0, 200);

  const [comments, setComments] = useState<RenderComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [captchaExpr, setCaptchaExpr] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [posting, setPosting] = useState(false);
  // 内联状态提示（组件自包含，不依赖全局 ToastProvider）
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const notify = (type: 'ok' | 'error', text: string) => {
    setStatus({ type, text });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(null), 3500);
  };

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await fetch('/api/comments/captcha');
      const data = await res.json();
      if (data?.token && data?.expr) {
        setCaptchaToken(data.token);
        setCaptchaExpr(data.expr);
        setCaptchaAnswer('');
      }
    } catch {
      setCaptchaExpr('');
    }
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?page=${encodeURIComponent(pageKey)}`);
      const data = await res.json();
      if (data?.ok) setComments(data.comments || []);
    } catch {
      /* 静默失败：留言区为空也不至于报错 */
    } finally {
      setLoaded(true);
    }
  }, [pageKey]);

  useEffect(() => {
    setLoaded(false);
    setComments([]);
    fetchComments();
    refreshCaptcha();
  }, [fetchComments, refreshCaptcha]);

  const handleSubmit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      notify('error', '请填写正确的邮箱地址');
      return;
    }
    if (!content.trim()) {
      notify('error', '留言内容不能为空');
      return;
    }
    if (!captchaAnswer.trim()) {
      notify('error', '请先完成验证码');
      return;
    }
    setPosting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pageKey,
          nickname: nickname.trim(),
          email: email.trim(),
          content: content.trim(),
          token: captchaToken,
          answer: captchaAnswer.trim(),
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setComments((prev) => [...prev, data.comment]);
        setContent('');
        setCaptchaAnswer('');
        notify('ok', '留言成功喵~');
        refreshCaptcha();
      } else {
        notify('error', data?.error || '提交失败，请稍后再试');
        refreshCaptcha();
      }
    } catch {
      notify('error', '网络异常，留言失败');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="w-full mt-14 relative">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
        {/* 标题行 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-comment-dots text-indigo-500 dark:text-indigo-400 text-base" aria-hidden="true"></i>
            留言
          </h3>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {loaded ? `${comments.length} 条` : ''}
          </span>
        </div>

        {/* 留言表单 */}
        <div className="rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-white/60 dark:border-white/10 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="昵称（可空，默认用邮箱前缀）"
              maxLength={20}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱（必填，仅用于展示与联系）"
              type="email"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all"
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="想说的话…（支持换行，最长 500 字）"
            rows={3}
            maxLength={500}
            className="w-full px-3.5 py-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all resize-y"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
            {/* 算术验证码 */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-300/40 dark:border-indigo-400/20 text-sm font-black text-indigo-600 dark:text-indigo-300 select-none">
                {captchaExpr || '...'}
              </span>
              <button
                type="button"
                onClick={refreshCaptcha}
                title="换一题"
                aria-label="换一道验证码"
                className="w-9 h-9 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:border-indigo-300 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-rotate" aria-hidden="true"></i>
              </button>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold shrink-0">=</span>
              <input
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="?"
                inputMode="numeric"
                maxLength={3}
                className="w-16 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-sm text-center text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={posting}
              className="sm:ml-auto px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className={`fa-solid ${posting ? 'fa-circle-notch animate-spin' : 'fa-paper-plane'}`} aria-hidden="true"></i>
              {posting ? '发送中…' : '留 言'}
            </button>
          </div>

          {status && (
            <p
              className={`mt-2 text-xs font-bold ${
                status.type === 'ok'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              <i
                className={`fa-solid mr-1.5 ${status.type === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}
                aria-hidden="true"
              ></i>
              {status.text}
            </p>
          )}
        </div>

        {/* 留言列表 */}
        {loaded && comments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
            <i className="fa-regular fa-comment text-2xl mb-2 block opacity-60" aria-hidden="true"></i>
            还没有留言，来抢个沙发吧
          </div>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="flex gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-white/60 dark:border-white/10"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-sm font-black flex items-center justify-center flex-shrink-0 select-none">
                  {(c.nickname || '客')[0].toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.nickname}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.emailMasked}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                    {c.content}
                  </p>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{fmtTime(c.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
