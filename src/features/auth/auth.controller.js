const authService = require('./auth.service')

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken'

async function register(request, reply) {
  const { email, password, username, fullName } = request.body

  const result = await authService.registerUser({
    email,
    password,
    username,
    fullName
  })
  if (result.error) {
    return reply.code(400).send({ error: result.error })
  }

  const user = result.user
  const payload = { userId: user._id, role: user.role }

  const accessToken = request.jwtSign(payload, { expiresIn: '15m' })
  const refreshToken = request.jwtSign(payload, { expiresIn: '30d' })

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    })
    .code(201)
    .send({ user, accessToken })
}

async function login(request, reply) {
  const { email, password } = request.body

  const result = await authService.loginUser({ email, password })
  if (result.error) {
    return reply.code(401).send({ error: result.error })
  }

  const user = result.user
  const payload = { userId: user._id, role: user.role }

  const accessToken = request.jwtSign(payload, { expiresIn: '15m' })
  const refreshToken = request.jwtSign(payload, { expiresIn: '30d' })

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    })
    .send({ user, accessToken })
}

async function refreshToken(request, reply) {
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME]
  if (!refreshToken) {
    return reply.code(401).send({ error: 'No refresh token provided.' })
  }

  try {
    const decoded = await request.jwtVerify({ token: refreshToken })
    const payload = { userId: decoded.userId, role: decoded.role }
    const accessToken = request.jwtSign(payload, { expiresIn: '15m' })

    return reply.send({ accessToken })
  } catch (err) {
    return reply.code(401).send({ error: 'Refresh token invalid.' })
  }
}

async function logout(request, reply) {
  reply
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' })
    .send({ message: 'Logged out' })
}

module.exports = {
  register,
  login,
  refreshToken,
  logout
}
