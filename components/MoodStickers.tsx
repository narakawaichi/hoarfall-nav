"use client";

import { useEffect, useState } from 'react';
import { useToast } from './ToastProvider';

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 根据当前小时计算"当前在干"的图标与文案
function activityByHour(): { icon: string; msg: string } {
  const h = new Date().getHours();
  if (h >= 6 && h < 12)  return { icon: 'fa-solid fa-mug-hot',     msg: '早安~正在和代码搏斗' };
  if (h >= 12 && h < 18) return { icon: 'fa-solid fa-laptop-code', msg: '午后的咖啡续命中，勿扰' };
  if (h >= 18 && h < 22) return { icon: 'fa-solid fa-music',       msg: '晚上的听歌时间' };
  return                          { icon: 'fa-solid fa-bed',    msg: '夜深了…该睡觉啦' };
}

type Sticker = {
  label: string;        // 按钮 tooltip（hover 提示）
  icon: string;         // 默认 FA 图标
  title: string;        // 顶部标题
  msgs: string[];       // 随机文案池（点击后从里抽一条 toast）
  copy?: string[];      // 若存在，则点击复制（并 toast），不读 msgs
  pulse?: boolean;      // 是否给图标加 animate-pulse
  dynamicIcon?: () => { icon: string; msg: string }; // 特殊：当前在干（按小时变化）
};

const STICKERS: Sticker[] = [
  {
    label: '今日心情',
    icon: 'fa-solid fa-face-smile',
    title: '今日心情',
    msgs: [
      '心情好得可以变成猫！',
      '想被摸头…',
      '偶尔忧郁的喵呜',
      '开心到打滚',
      '今天也是元气满满',
    ],
  },
  {
    label: '当前在干',
    icon: 'fa-solid fa-mug-hot',
    title: '当前在干',
    dynamicIcon: activityByHour,
    msgs: [],
  },
  {
    label: '看板娘',
    icon: 'fa-solid fa-heart',
    title: '看板娘状态',
    pulse: true,
    msgs: [
      '喵呜~在呢在呢',
      '这里是依岸归喵娘',
      '呼噜呼噜…',
      '尾巴摇了摇',
      '今天也在认真营业',
    ],
  },
  {
    label: '在线',
    icon: 'fa-solid fa-circle-dot',
    title: '在线状态',
    pulse: true,
    msgs: [
      '在呢喵~有事请说',
      '今日正常营业',
      '喵，ready',
      '请随时呼叫',
    ],
  },
  {
    label: '今日份甜',
    icon: 'fa-solid fa-cookie',
    title: '今日份甜',
    msgs: [
      '你是甜的~',
      '今天也要开开心心的哦',
      '喂你一口甜甜',
      '抱抱~',
      '心都化了',
    ],
  },
  {
    label: '今日格言',
    icon: 'fa-solid fa-quote-right',
    title: '今日格言',
    msgs: [],
    copy: [
      '把每一个平凡的日子都过得不平凡',
      '心怀热爱，慢一点也没关系',
      '代码与猫，皆不可辜负',
      '世上无难事，只怕喵喵喵',
      '愿你眼里的星星，永不熄灭',
    ],
  },
];

export default function MoodStickers() {
  const { showToast } = useToast();
  // 当前在干 的图标按小时变化——水合安全：第一帧用默认占位，挂载后用真实活动
  const [dynamicIcon, setDynamicIcon] = useState<string>('fa-solid fa-mug-hot');

  useEffect(() => {
    const updater = () => setDynamicIcon(activityByHour().icon);
    updater();
    // 每 10 分钟刷新一次图标（跨时段）
    const t = setInterval(updater, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const handleClick = (s: Sticker) => {
    if (s.copy) {
      const text = pick(s.copy);
      navigator.clipboard.writeText(text).then(() => {
        showToast(`「${text}」已复制到剪贴板`, 'success');
      });
      return;
    }
    if (s.dynamicIcon) {
      showToast(activityByHour().msg, 'info');
      return;
    }
    showToast(pick(s.msgs), 'info');
  };

  return (
    <div
      className="flex gap-2 md:gap-3 flex-wrap justify-center md:justify-end w-full md:w-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {STICKERS.map((s) => {
        const iconClass = s.dynamicIcon ? dynamicIcon : s.icon;
        return (
          <button
            key={s.label}
            type="button"
            onClick={() => handleClick(s)}
            title={s.title}
            aria-label={s.title}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/50 dark:bg-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-300 border border-white/40 dark:border-white/10 shadow-sm"
          >
            <i
              className={`${iconClass} w-4 h-4 md:w-5 md:h-5 ${s.pulse ? 'animate-pulse' : ''}`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}