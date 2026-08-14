const audioBase = import.meta.env.BASE_URL
const audio = (name: string) => `${audioBase}assets/audio/${name}.mp3`

export const audioCatalog = {
  menuTheme: audio('musica_tema'),
  tenseMusic: audio('musica_tensa'),
  centerTheme: audio('fnaf2_theme'),
  footsteps: audio('psicopata_passos'),
  buttonClick: audio('clique_botao'),
  doorBreak: audio('porta_sendo_quebrada'),
  hideWin: audio('win_hide'),
  hideLose: audio('lose_hide'),
  battleMusic: audio('musica_batalha'),
  berserkScream: audio('grito_berserk'),
  berserkMusic: audio('musica_modo_berserk'),
  ratDanceMusic: audio('rat_dance_music'),
  pidaoEnding: audio('final_pidao'),
  perfectEnding: audio('sopa_lobo_audio'),
  punch: audio('soco'),
  strongPunch: audio('soco_forte'),
  parry: audio('parry'),
  enemyAttack: audio('lobisomem_ataque'),
  enemyAttackUnused: audio('lobisomem_ataque1'),
  death1: audio('morte1'),
  death2: audio('morte2'),
  death3: audio('morte3'),
  death4: audio('morte4'),
  death5: audio('morte5'),
  death6: audio('morte6'),
  death7: audio('morte7'),
  death8: audio('morte8'),
} as const

export type SoundKey = keyof typeof audioCatalog

export const deathSounds = [
  'death1',
  'death2',
  'death3',
  'death4',
  'death5',
  'death6',
  'death7',
  'death8',
] as const satisfies readonly SoundKey[]

export const androidPreloadedSounds = (
  Object.keys(audioCatalog) as SoundKey[]
).filter((key) => key !== 'enemyAttackUnused')
