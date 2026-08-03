const assetBase = import.meta.env.BASE_URL
const image = (name: string) => `${assetBase}assets/images/${name}`
const optimized = (name: string) => `${assetBase}assets/optimized/${name}.webp`
const gif = (name: string) => `${assetBase}assets/gif/${name}`

export const images = {
  start: optimized('tela_inicio'),
  loreCampfire: image('lore_fogueira.jpg'),
  cabin: optimized('background_cabana'),
  cabinUnused: image('background_cabana1.jpg'),
  houseWithDoor: optimized('planta_casa_portainteira'),
  house: optimized('planta_casa'),
  blood: optimized('sangue'),
  endings: {
    normalVictory: optimized('vitoria_normal'),
    pathetic: optimized('patetico'),
    perfectVictory: optimized('vitoria_perfeita'),
    woundedVictory: image('vitoria_sobrevivente_machucado.png'),
    woundedArm: image('mao_machucada.jpg'),
    pidao: image('lobo_pidao.jpg'),
  },
  killers: [optimized('terrifier'), optimized('lobisomem'), optimized('ghostface')] as const,
  enemy: {
    idle: optimized('psicopata_parado'),
    preparingLeft: optimized('psicopata_preparando_esquerda'),
    preparingRight: optimized('psicopata_preparando_direita'),
    attackingLeft: optimized('psicopata_atacando_esquerda'),
    attackingRight: optimized('psicopata_atacando_direita'),
    stunned: optimized('psicopata_atordoado'),
    hit: [1, 2, 3, 4].map((step) => optimized(`psicopata_atingido${step}`)),
    defeated: optimized('psicopata_derrotado'),
  },
  survivor: {
    idle: optimized('sobrevivente_parado'),
    attacks: [1, 2, 3, 4, 5, 6].map((step) => optimized(`sobrevivente_ataque${step}`)),
    dodgeLeft: [
      optimized('sobrevivente_esquivando_esquerda'),
      optimized('sobrevivente_esquivando_esquerda1'),
    ],
    dodgeRight: [
      optimized('sobrevivente_esquivando_direita'),
      optimized('sobrevivente_esquivando_direita1'),
    ],
    hitLeft: optimized('sobrevivente_atingido_esquerda'),
    hitRight: optimized('sobrevivente_atingido_direita'),
    parryLeft: optimized('sobrevivente_parry_esquerda'),
    parryRight: optimized('sobrevivente_parry_direita'),
    victory: optimized('sobrevivente_vitoria'),
    dance: gif('rat_dance.gif'),
  },
} as const

export function preloadImages(paths: readonly string[]): void {
  paths.forEach((path) => {
    const resource = new Image()
    resource.decoding = 'async'
    resource.src = path
  })
}
