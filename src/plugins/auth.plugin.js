const fp = require('fastify-plugin')
const userService = require('../features/users/user.service')

async function authPlugin(fastify) {
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()

      // Validar usuario activo / no eliminado.
      const userId = request.user && request.user.userId
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      try {
        const user = await userService.getUserById({ userId })
        if (!user || user.isDeleted) {
          return reply
            .code(403)
            .send({ error: 'Cuenta de usuario eliminada o desactivada' })
        }
      } catch (err) {
        return reply
          .code(403)
          .send({ error: 'Cuenta de usuario eliminada o desactivada' })
      }
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })
}

module.exports = fp(authPlugin)
