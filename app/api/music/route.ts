import { NextRequest, NextResponse } from 'next/server'

// 网易云音乐官方接口（2026-09 实测可用）
// - 旧版 api/song/detail 已被网易限流下线（返回 405 操作频繁），改为 api/v3/song/detail
// - 音频地址不再拼接 media/outer/url 外链（已失效 302），改用 api/song/enhance/player/url 动态获取直链

const NET_EASE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
}

type SongResult = {
  id: string
  name?: string
  artist?: string
  author?: string
  cover?: string
  pic?: string
  url?: string
  lrc?: string
  error?: string
}

// 歌词接口一直可用，保留原逻辑
async function fetchLrc(songId: string): Promise<string> {
  try {
    const res = await fetch(`https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`, {
      headers: NET_EASE_HEADERS,
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data?.lrc?.lyric || ''
  } catch {
    return ''
  }
}

// 新版详情接口：https://music.163.com/api/v3/song/detail?c=[{"id":x}]
async function fetchDetail(songId: string) {
  const c = JSON.stringify([{ id: Number(songId) }])
  const res = await fetch(
    `https://music.163.com/api/v3/song/detail?c=${encodeURIComponent(c)}`,
    { headers: NET_EASE_HEADERS, signal: AbortSignal.timeout(6000) },
  )
  const data = await res.json()
  return data?.songs?.[0] || null
}

// 动态获取播放直链：免费歌返回真实 CDN 地址（http://，需转 https 防混合内容）
async function fetchSongUrl(songId: string): Promise<string> {
  // 从高音质往下逐级尝试，直到拿到地址（VIP/需登录的歌可能全部为 null）
  const bitrates = [320000, 128000, 999000]
  for (const br of bitrates) {
    try {
      const res = await fetch(
        `https://music.163.com/api/song/enhance/player/url?ids=[${songId}]&br=${br}`,
        { headers: NET_EASE_HEADERS, signal: AbortSignal.timeout(6000) },
      )
      const data = await res.json()
      const item = data?.data?.[0]
      if (item?.url) {
        return item.url.replace(/^http:\/\//, 'https://')
      }
    } catch {
      /* 尝试下一档 */
    }
  }
  return ''
}

// 模块级轻量缓存：同一批 ids 5 分钟内不重复打网易（避免触发限流）
const cache = new Map<string, { t: number; data: SongResult[] }>()
const CACHE_TTL = 5 * 60 * 1000

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
  }
  const songIds = ids.split(',').map((id) => id.trim()).filter(Boolean)
  const cacheKey = songIds.join(',')

  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.t < CACHE_TTL) {
    return NextResponse.json(hit.data)
  }

  const results: SongResult[] = await Promise.all(
    songIds.map(async (songId): Promise<SongResult> => {
      try {
        const [song, url, lrcText] = await Promise.all([
          fetchDetail(songId),
          fetchSongUrl(songId),
          fetchLrc(songId),
        ])

        if (!song || !song.id) {
          return { id: songId, error: 'not_found' }
        }
        if (!url) {
          return { id: songId, name: song.name, error: 'no_url' }
        }

        const artistName = song.artists?.[0]?.name || song.ar?.[0]?.name || '未知歌手'
        const cover = song.album?.picUrl || song.al?.picUrl || ''

        return {
          id: songId,
          name: song.name,
          artist: artistName,
          author: artistName,
          cover,
          pic: cover,
          url,
          lrc: lrcText,
        }
      } catch (error) {
        console.error(`[api/music] 获取歌曲 ${songId} 失败:`, error)
        return { id: songId, error: String(error) }
      }
    }),
  )

  cache.set(cacheKey, { t: Date.now(), data: results })
  return NextResponse.json(results)
}
