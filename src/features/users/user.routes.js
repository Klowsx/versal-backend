const userController = require('./user.controller')
const {
  registerUserSchema,
  registerResponseSchema,
  loginResponseSchema,
  loginUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  userIdParamSchema,
  userBase
} = require('./user.schema')

async function userRoutes(fastify) {
  // Seguidores
  fastify.get(
    '/:id/followers',
    { schema: { params: userIdParamSchema } },
    userController.getFollowers
  )

  //Seguidos
  fastify.get(
    '/:id/following',
    { schema: { params: userIdParamSchema } },
    userController.getFollowing
  )

  // Rutas protegidas
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook('onRequest', fastify.authenticate)

    // Perfil
    privateRoutes.get('/me', userController.getCurrentUser)

    // Actualizar perfil
    privateRoutes.put(
      '/me',

      userController.updateProfile
    )

    // Obtener perfil por ID
    privateRoutes.get(
      '/:id',
      {
        schema: {
          params: userIdParamSchema,
          response: {
            200: userBase
          }
        }
      },
      userController.getUserProfileById
    )

    // Cambiar contraseña
    privateRoutes.put(
      '/me/password',
      { schema: { body: changePasswordSchema } },
      userController.changePassword
    )

    // Bloqueados
    privateRoutes.get('/me/blocked', userController.getBlockedUsers)

    // Interacciones con otros usuarios
    privateRoutes.post(
      '/:id/follow',
      { schema: { params: userIdParamSchema } },
      userController.followUser
    )

    privateRoutes.post(
      '/:id/unfollow',
      { schema: { params: userIdParamSchema } },
      userController.unfollowUser
    )

    privateRoutes.post(
      '/:id/block',
      { schema: { params: userIdParamSchema } },
      userController.blockUser
    )

    privateRoutes.post(
      '/:id/unblock',
      { schema: { params: userIdParamSchema } },
      userController.unblockUser
    )
  })

  // Admin
  fastify.register(async function (adminRoutes) {
    adminRoutes.addHook('onRequest', async (req, reply) => {
      await fastify.authenticate(req, reply)
      console.log(
        'Verificando rol de usuario para acceso a rutas de administrador...'
      )
      console.log('Rol del usuario:', req.user.role)
      if (req.user.role !== 'admin') {
        return reply
          .code(403)
          .send({ error: 'Acceso denegado: solo administradores' })
      }
    })
    adminRoutes.get('/all', userController.getAllUsers)

    adminRoutes.delete(
      '/:id',
      { schema: { params: userIdParamSchema } },
      userController.deleteUser
    )
    adminRoutes.put('/:userId/role', userController.updateUserRole)
  })
}

module.exports = userRoutes
