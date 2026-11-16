// アプリは SVG を表示する前に style 属性を取り除くので、要素ごとの速さ・ずれは
// style 属性に書けない。決まった組をクラスとして <style> に並べ、要素はクラス名で選ぶ。
// <style> の最後に置いて、animation の一括指定（.bulb など）より後に効かせる。

export function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

/** `.{prefix}0` … `.{prefix}{n-1}`：長さ durMin〜durMax 秒、開始のずれ 0〜delayMax 秒 */
export function timingCss(prefix: string, n: number, durMin: number, durMax: number, delayMax: number, seed: number) {
  const r = rng(seed)
  let css = ''
  for (let i = 0; i < n; i++) {
    const dur = durMin + ((durMax - durMin) * (i + r())) / n
    const delay = r() * delayMax
    css += `.${prefix}${i}{animation-duration:${dur.toFixed(1)}s;animation-delay:-${delay.toFixed(1)}s}`
  }
  return css
}

/** 開始のずれだけを持つクラス（長さは元のクラスのまま） */
export function delayCss(prefix: string, n: number, delayMax: number, seed: number) {
  const r = rng(seed)
  let css = ''
  for (let i = 0; i < n; i++) {
    css += `.${prefix}${i}{animation-delay:-${(r() * delayMax).toFixed(1)}s}`
  }
  return css
}

export const pick = (prefix: string, n: number, r: () => number) => `${prefix}${Math.floor(r() * n)}`
