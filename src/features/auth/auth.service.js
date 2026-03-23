const userService = require('../users/user.service')

async function registerUser({ email, password, username, fullName }) {
  const existing = await userService.getUserByEmail(email)
  if (existing) {
    return { error: 'El email ya está en uso.' }
  }

  // userService.registerUser ya valida password y guarda
  return await userService.registerUser({ email, password, username, fullName })
}

async function loginUser({ email, password }) {
  return await userService.loginUser({ email, password })
}

module.exports = {
  registerUser,
  loginUser
}
