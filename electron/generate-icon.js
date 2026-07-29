const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

const SIZE = 256
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 100

const BG = [10, 13, 13]
const GREEN = [74, 222, 128]
const GREEN_DIM = [40, 160, 80]

function hexVertices(cx, cy, r) {
  const verts = []
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (Math.PI / 3) * i
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return verts
}

function pointInPolygon(px, py, verts) {
  let inside = false
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i][0], yi = verts[i][1]
    const xj = verts[j][0], yj = verts[j][1]
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

function smoothstep(edge, width, dist) {
  const t = clamp((dist - edge) / width + 0.5, 0, 1)
  return t * t * (3 - 2 * t)
}

const verts = hexVertices(CX, CY, RADIUS)
const innerVerts = hexVertices(CX, CY, RADIUS * 0.85)

const pixels = new Uint8Array(SIZE * SIZE * 4)

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const idx = (y * SIZE + x) * 4
    const inside = pointInPolygon(x, y, verts)
    const inner = pointInPolygon(x, y, innerVerts)

    if (inside && !inner) {
      const d = dist(x, y, CX, CY)
      const t = (d - RADIUS * 0.85) / (RADIUS - RADIUS * 0.85)
      const r = Math.round(GREEN[0] + (GREEN_DIM[0] - GREEN[0]) * t)
      const g = Math.round(GREEN[1] + (GREEN_DIM[1] - GREEN[1]) * t)
      const b = Math.round(GREEN[2] + (GREEN_DIM[2] - GREEN[2]) * t)
      pixels[idx] = r
      pixels[idx + 1] = g
      pixels[idx + 2] = b
      pixels[idx + 3] = 255
    } else if (inner) {
      const d = dist(x, y, CX, CY)
      const glow = Math.max(0, 1 - d / (RADIUS * 0.7))
      const r = Math.round(clamp(GREEN[0] + glow * 40, 0, 255))
      const g = Math.round(clamp(GREEN[1] + glow * 30, 0, 255))
      const b = Math.round(clamp(GREEN[2] + glow * 20, 0, 255))
      pixels[idx] = r
      pixels[idx + 1] = g
      pixels[idx + 2] = b
      pixels[idx + 3] = 255
    } else {
      pixels[idx] = BG[0]
      pixels[idx + 1] = BG[1]
      pixels[idx + 2] = BG[2]
      pixels[idx + 3] = 0
    }
  }
}

function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) : (crc >>> 1)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([t, data])
  const crcVal = crc32(crcInput)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crcVal, 0)
  return Buffer.concat([len, t, data, crcBuf])
}

const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE)
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0
  for (let x = 0; x < SIZE; x++) {
    const src = (y * SIZE + x) * 4
    const dst = y * (SIZE * 4 + 1) + 1 + x * 4
    raw[dst] = pixels[src]
    raw[dst + 1] = pixels[src + 1]
    raw[dst + 2] = pixels[src + 2]
    raw[dst + 3] = pixels[src + 3]
  }
}

const compressed = zlib.deflateSync(raw)

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8
ihdr[9] = 6
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0))
])

const outPath = path.join(__dirname, 'icon.png')
fs.writeFileSync(outPath, png)
console.log('Generated icon:', outPath, `(${png.length} bytes)`)
