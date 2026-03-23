const authController = require('./auth.controller')
const {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema
} = require('./auth.schema')

async function authRoutes(fastify) {
  fastify.post(
    '/auth/register',
    { schema: registerSchema },
    authController.register
  )
  fastify.post('/auth/login', { schema: loginSchema }, authController.login)
  fastify.post(
    '/auth/refresh',
    { schema: refreshSchema },
    authController.refreshToken
  )
  fastify.post('/auth/logout', { schema: logoutSchema }, authController.logout)
}

module.exports = authRoutes
