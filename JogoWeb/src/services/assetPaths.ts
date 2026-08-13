const assetBase = import.meta.env.BASE_URL
const image = (name: string) => `${assetBase}assets/images/${name}`
const optimized = (name: string) => `${assetBase}assets/optimized/${name}.webp`
const gif = (name: string) => `${assetBase}assets/gif/${name}`

export const images = {
  start: optimized('tela_inicio'),
  loreCampfire: image('lore_fogueira.jpg'),
  cabin: optimized('background_cabana'),
  houseWithDoor: optimized('planta_casa_portainteira'),
  house: optimized('planta_casa'),
  blood: optimized('sangue'),
  endings: {
    normalVictory: optimized('vitoria_normal'),
    pathetic: optimized('patetico'),
    perfectVictory: optimized('vitoria_perfeita'),
    woundedVictory: optimized('vitoria_sobrevivente_machucado'),
    woundedArm: image('mao_machucada.jpg'),
    pidao: image('lobo_pidao.jpg'),
  },
  killers: [optimized('terrifier'), optimized('lobisomem'), optimized('ghostface')] as const,
  enemy: {
    idle: optimized('psicopata_parado'),
    attackSequences: [
      {
        preparingLeft: optimized('psicopata_preparando_esquerda'),
        attackingLeft: optimized('psicopata_atacando_esquerda'),
        preparingRight: optimized('psicopata_preparando_direita'),
        attackingRight: optimized('psicopata_atacando_direita'),
        preparingDuration: 600,
      },
      {
        preparingLeft: optimized('psicopata_preparando_corte_lateral_esquerda'),
        attackingLeft: optimized('psicopata_corte_lateral_esquerda'),
        preparingRight: optimized('psicopata_preparando_corte_lateral_direita'),
        attackingRight: optimized('psicopata_corte_lateral_direita'),
        preparingDuration: 500,
      },
      {
        preparingLeft: optimized('psicopata_preparando_arranhada_para_cima_esquerda'),
        attackingLeft: optimized('psicopata_arranhada_para_cima_esquerda'),
        preparingRight: optimized('psicopata_preparando_arranhada_para_cima_direita'),
        attackingRight: optimized('psicopata_arranhada_para_cima_direita'),
        preparingDuration: 700,
      },
    ] as const,
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
