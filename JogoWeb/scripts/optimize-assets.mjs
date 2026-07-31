import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = path.join(projectRoot, 'public', 'assets', 'images')
const outputDirectory = path.join(projectRoot, 'public', 'assets', 'optimized')
const iconSource = path.join(projectRoot, 'public', 'assets', 'android-icons', 'ic_launcher-playstore.png')
const iconDirectory = path.join(projectRoot, 'public', 'icons')
const artifactDirectory = path.join(projectRoot, '.artifacts')

await mkdir(outputDirectory, { recursive: true })
await mkdir(iconDirectory, { recursive: true })
await mkdir(artifactDirectory, { recursive: true })

const files = (await readdir(sourceDirectory)).filter((name) => name.endsWith('.png')).sort()
const report = []

function visiblePixelsAreEquivalent(source, output) {
  if (
    source.info.width !== output.info.width ||
    source.info.height !== output.info.height ||
    source.info.channels !== 4 ||
    output.info.channels !== 4
  ) {
    return false
  }

  for (let offset = 0; offset < source.data.length; offset += 4) {
    const sourceAlpha = source.data[offset + 3]
    const outputAlpha = output.data[offset + 3]
    if (sourceAlpha !== outputAlpha) return false
    if (
      sourceAlpha !== 0 &&
      (source.data[offset] !== output.data[offset] ||
        source.data[offset + 1] !== output.data[offset + 1] ||
        source.data[offset + 2] !== output.data[offset + 2])
    ) {
      return false
    }
  }

  return true
}

for (const file of files) {
  const source = path.join(sourceDirectory, file)
  const output = path.join(outputDirectory, `${path.parse(file).name}.webp`)

  await sharp(source, { failOn: 'none' })
    .webp({ lossless: true, effort: 6 })
    .toFile(output)

  const [sourcePixels, outputPixels, sourceStats, outputStats] = await Promise.all([
    sharp(source, { failOn: 'none' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    stat(source),
    stat(output),
  ])

  const equivalent = visiblePixelsAreEquivalent(sourcePixels, outputPixels)

  if (!equivalent) {
    throw new Error(`A conversão lossless alterou pixels de ${file}.`)
  }

  report.push({
    source: file,
    output: path.basename(output),
    sourceBytes: sourceStats.size,
    outputBytes: outputStats.size,
    savedBytes: sourceStats.size - outputStats.size,
    pixelEquivalent: true,
  })
}

await sharp(iconSource, { failOn: 'none' })
  .resize(192, 192)
  .png()
  .toFile(path.join(iconDirectory, 'icon-192.png'))
await sharp(iconSource, { failOn: 'none' })
  .resize(512, 512)
  .png()
  .toFile(path.join(iconDirectory, 'icon-512.png'))

const totals = report.reduce(
  (current, item) => ({
    sourceBytes: current.sourceBytes + item.sourceBytes,
    outputBytes: current.outputBytes + item.outputBytes,
  }),
  { sourceBytes: 0, outputBytes: 0 },
)

await writeFile(
  path.join(artifactDirectory, 'optimization-report.json'),
  JSON.stringify({ files: report, totals }, null, 2),
  'utf8',
)

const savedPercentage = ((1 - totals.outputBytes / totals.sourceBytes) * 100).toFixed(1)
console.log(
  `${report.length} PNGs convertidos com pixels equivalentes. Economia lossless: ${savedPercentage}%.`,
)
