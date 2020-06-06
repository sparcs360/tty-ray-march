const debug = require('debug')('raymarch')

const width = process.stdout.columns
const height = process.stdout.rows * 2 - 1

const CLEAR_SCREEN = '\x1b[2J'
const CURSOR_HOME = '\x1b[1;1H'
const CURSOR_HIDE = '\x1b[?25l'
const CURSOR_SHOW = '\x1b[?25h'

const rgb = (...v) => `\x1b[38;2;${v[0]};${v[1]};${v[2]}m`
const bgRgb = (...v) => `\x1b[48;2;${v[0]};${v[1]};${v[2]}m`

process.on('SIGINT', function () {
  console.log('Caught interrupt signal')
  process.stdout.write(CURSOR_SHOW)
  process.exit()
})

const boundColour = c => {
  if (c < 0) {
    c = 0
  } else if (c > 1) {
    c = 1
  }
  return ~~(c * 255)
}
const colour = (...v) => [
  boundColour(v[0]),
  boundColour(v[1]),
  boundColour(v[2])
]

const lengthS2 = (x, y) => {
  return Math.sqrt(x * x + y * y)
}
const lengthV3 = v => {
  if (!(Array.isArray(v) && v.length == 3)) {
    throw Error('not a vector')
  }
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}
const normalise = v => {
  debug('normalise(%o)', v)
  if (!(Array.isArray(v) && v.length == 3)) {
    throw Error('not a vector')
  }

  const l = lengthV3(v)
  return [v[0] / l, v[1] / l, v[2] / l]
}
const dotProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]

//################################################################################

let t = 0

const sdfSphere = (p, x, y, z, r) =>
  lengthV3([p[0] - x, p[1] - y, p[2] - z]) - r

const sdfTorus = (p, x, y, z, r1, r2) => {
  const qx = lengthS2(p[0] - x, p[2] - z) - r1
  const qy = p[1] - y
  return lengthS2(qx, qy) - r2
}

const getDist = p => {
  if (!(Array.isArray(p) && p.length == 3)) {
    throw Error('not a vector')
  }

  const distances = []

  distances.push(p[1]) // horizontal plane at y=0;
  distances.push(sdfSphere(p, 0.25, 1, 6 + Math.sin(t), 1))

  distances.push(sdfSphere(p, -1.25, 0.5, 5 + Math.sin(t + 3.141) * 0.5, 0.5))

  distances.push(sdfSphere(p, 1.5, 0.25 + Math.abs(Math.sin(t) * 0.5), 4, 0.25))
  distances.push(
    sdfSphere(p, 2, 0.25 + Math.abs(Math.sin(t + 1) * 0.5), 4, 0.25)
  )
  distances.push(
    sdfSphere(p, 2.5, 0.25 + Math.abs(Math.sin(t + 2) * 0.5), 4, 0.25)
  )
  distances.push(
    sdfSphere(p, 3, 0.25 + Math.abs(Math.sin(t + 3) * 0.5), 4, 0.25)
  )
  distances.push(
    sdfSphere(p, 3.5, 0.25 + Math.abs(Math.sin(t + 4) * 0.5), 4, 0.25)
  )
  // distances.push(sdfTorus(p, 0, 3, 6, 5, 0.1));
  return Math.min(...distances)
}

const castRay = (origin, dir) => {
  debug('castRay(origin=%o, dir=%o)', origin, dir)
  let dist = 0

  for (let i = 0; i < 128; i++) {
    const p = [
      origin[0] + dist * dir[0],
      origin[1] + dist * dir[1],
      origin[2] + dist * dir[2]
    ]
    debug('p=%o', p)
    const marchDist = getDist(p)
    debug('marchDist=%d', marchDist)
    dist = dist + marchDist
    debug('dist=%d', dist)
    if (dist > 100) {
      debug('out of scene')
      break
    }
    if (marchDist < 0.01) {
      debug('hit')
      break
    }
  }

  return dist
}

const calcNormal = p => {
  const d = getDist(p)
  const n = [
    d - getDist([p[0] - 0.01, p[1], p[2]]),
    d - getDist([p[0], p[1] - 0.01, p[2]]),
    d - getDist([p[0], p[1], p[2] - 0.01])
  ]
  return normalise(n)
}

const getLight = p => {
  debug('getLight(%o)', p)

  const lightPos = [0, 8, 6]
  lightPos[0] = lightPos[0] - Math.sin(t)
  lightPos[2] = lightPos[2] + Math.cos(t) * 2
  const lightDirection = normalise([
    lightPos[0] - p[0],
    lightPos[1] - p[1],
    lightPos[2] - p[2]
  ])
  debug('lightDirection=%o', lightDirection)
  const hitNormal = calcNormal(p)
  debug('hitNormal=%o', hitNormal)
  let diffusion = dotProduct(hitNormal, lightDirection)
  debug('diffusion=%d', diffusion)

  const pu = [
    p[0] + 0.02 * hitNormal[0],
    p[1] + 0.02 * hitNormal[1],
    p[2] + 0.02 * hitNormal[2]
  ]
  const d = castRay(pu, lightDirection)
  if (d < 2.5) {
    diffusion = diffusion * 0.2
  }
  return diffusion
}

//################################################################################

const cameraOrigin = [0, 1.25, -2]

const shade = (u, v) => {
  debug('shade(u=%d, v=%d)', u, v)

  const cameraDirection = normalise([u, v, 1.5])
  const d = castRay(cameraOrigin, cameraDirection)
  const len = [
    d * cameraDirection[0],
    d * cameraDirection[1],
    d * cameraDirection[2]
  ]
  const p = [
    cameraOrigin[0] + len[0],
    cameraOrigin[1] + len[1],
    cameraOrigin[2] + len[2]
  ]
  const dif = getLight(p)

  return [dif, dif, dif]
}

//################################################################################

process.stdout.write(CURSOR_HIDE + CLEAR_SCREEN)

while (t < 7) {
  let buffer = CURSOR_HOME
  for (let y = height; y >= 0; y -= 2) {
    for (let x = 0; x < width; x++) {
      let u = (x - 0.5 * width) / height
      let v2 = (y - 0.5 * height) / height
      let v1 = (y + 1 - 0.5 * height) / height

      let c = colour(...shade(u, v2))
      debug('c=%o', c)
      buffer += rgb(...c)

      c = colour(...shade(u, v1))
      debug('c=%o', c)
      buffer += bgRgb(...c)
      buffer += '▄'
    }
  }
  process.stdout.write(buffer)

  t = t + 0.25
}

process.stdout.write(CURSOR_SHOW)
