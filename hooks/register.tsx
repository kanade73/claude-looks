import type { Register, ThemeSetArgs } from 'claude-code'

import { CHRISTMAS_LOOK, CHRISTMAS_PROBLEMS, CHRISTMAS_SCENE } from './christmas'
import { COSMOS_LOOK, COSMOS_PROBLEMS, COSMOS_SCENE } from './cosmos'
import { OCEAN_LOOK, OCEAN_PROBLEMS, OCEAN_SCENE } from './ocean'

// テーマを増やすときはここに1行足す
const LOOKS: Record<string, { label: string; look: ThemeSetArgs; scene: string; problems: readonly string[] }> = {
  christmas: { label: 'クリスマス', look: CHRISTMAS_LOOK, scene: CHRISTMAS_SCENE, problems: CHRISTMAS_PROBLEMS },
  cosmos: { label: '宇宙', look: COSMOS_LOOK, scene: COSMOS_SCENE, problems: COSMOS_PROBLEMS },
  ocean: { label: '水族館', look: OCEAN_LOOK, scene: OCEAN_SCENE, problems: OCEAN_PROBLEMS },
}
const DEFAULT = 'christmas'
const NAMES = Object.keys(LOOKS)

function listText(current: string) {
  return NAMES.map(n => `${n === current ? '●' : '○'} ${n}（${LOOKS[n]!.label}）`).join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'look',
      description: `テーマを切り替える：${NAMES.join(' / ')}`,
      argumentHint: `[${NAMES.join('|')}]`,
      immediate: true,
    })
    const saved = await $.store.get('look')
    const name = typeof saved === 'string' && saved in LOOKS ? saved : DEFAULT
    const entry = LOOKS[name]!
    const unpainted = entry.problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(entry.look)
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    return next(e)
  })

  // あとからつないだスマホやデスクトップアプリにもテーマを送り直す
  on('session.attach', async ($, e, next) => {
    const result = await next(e)
    if (e.surface === 'desktop' || e.surface === 'mobile') {
      const saved = await $.store.get('look')
      const name = typeof saved === 'string' && saved in LOOKS ? saved : DEFAULT
      await $.theme.set(LOOKS[name]!.look)
    }
    return result
  })

  on('command.run', { command: 'look' }, async ($, e) => {
    const saved = await $.store.get('look')
    const current = typeof saved === 'string' && saved in LOOKS ? saved : DEFAULT
    const want = e.args.trim().toLowerCase()
    if (want === '') {
      return { text: `今のテーマと選べるテーマ：\n${listText(current)}\n\n/look <名前> で切り替えます。` }
    }
    const entry = LOOKS[want]
    if (entry === undefined) {
      return { text: `「${want}」というテーマはありません。\n${listText(current)}` }
    }
    await $.store.set('look', want)
    await $.theme.set(entry.look)
    return { text: `テーマを「${entry.label}」に切り替えました。` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    if (e.props.scene === 'christmas') {
      return <Svg source={CHRISTMAS_SCENE} alt="雪の降る夜、電飾のツリーと雪だるま、明かりの灯る家、空を走るソリ" isInteractive />
    }
    if (e.props.scene === 'cosmos') {
      return <Svg source={COSMOS_SCENE} alt="星がまたたき、流れ星やロケット、UFO が飛び、惑星とブラックホールが浮かぶ宇宙" isInteractive />
    }
    if (e.props.scene === 'ocean') {
      return <Svg source={OCEAN_SCENE} alt="光の差す海の中を魚の群れやフグが泳ぎ、クラゲが漂い、海藻が揺れる水族館" isInteractive />
    }
    return next(e)
  })
}
