const crypto = require('crypto')
const userService = require('../users/user.service')
const RefreshToken = require('../../models/refreshToken.model')

// Registra usuario usando userService.
// - Comprueba que el email no exista y no esté eliminado.
// - Devuelve objeto user (sin password) o error.
async function registerUser({ email, password, username, fullName }) {
  const existing = await userService.getUserByEmail(email, true)
  if (existing) {
    if (existing.isDeleted) {
      return {
        error:
          'El email ya estaba asociado a una cuenta eliminada. Ponte en contacto con soporte si quieres recuperarla.'
      }
    }
    return { error: 'El email ya está en uso.' }
  }

  const result = await userService.registerUser({
    email,
    password,
    username,
    fullName
  })
  if (result.error) {
    return { error: result.error }
  }

  return { user: result.user }
}

// Login de usuario.
// - Comprueba user activo (no isDeleted) y credenciales.
// - Devuelve user seguro (sin password) o error.
async function loginUser({ email, password }) {
  const result = await userService.loginUser({ email, password })
  if (result.error) {
    return result
  }

  if (!result.user || result.user.isDeleted) {
    return { error: 'Credenciales inválidas.' }
  }

  return { user: result.user }
}

// Genera hash de refresh token para almacenamiento seguro.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Guarda un refreshToken en base de datos.
async function saveRefreshToken({ token, userId, userAgent, expiresAt }) {
  const tokenHash = hashToken(token)
  await RefreshToken.create({ tokenHash, userId, userAgent, expiresAt })
}

// Verifica token de refresh: existe, no revocado y no expirado.
async function verifyRefreshToken(token) {
  const tokenHash = hashToken(token)
  const refreshToken = await RefreshToken.findOne({ tokenHash })
  if (!refreshToken) return { error: 'Refresh token inválido.' }
  if (refreshToken.revoked) return { error: 'Refresh token revocado.' }
  if (refreshToken.expiresAt < new Date())
    return { error: 'Refresh token expirado.' }

  return { userId: refreshToken.userId, token: refreshToken }
}

// Revoca refresh token de la base de datos.
async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token)
  const refreshToken = await RefreshToken.findOne({ tokenHash })
  if (!refreshToken) {
    return { error: 'Refresh token inválido para revocación.' }
  }

  refreshToken.revoked = true
  refreshToken.revokedAt = new Date()
  await refreshToken.save()

  return { success: true }
}

module.exports = {
  registerUser,
  loginUser,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken
}
