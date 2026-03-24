const authController = require("./auth.controller");
const {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  meSchema,
} = require("./auth.schema");

async function authRoutes(fastify) {
  fastify.post(
    "/auth/register",
    { schema: registerSchema },
    authController.register,
  );
  fastify.post("/auth/login", { schema: loginSchema }, authController.login);
  fastify.post(
    "/auth/forgot-password",
    { schema: forgotPasswordSchema },
    authController.forgotPassword,
  );
  fastify.post(
    "/auth/reset-password",
    { schema: resetPasswordSchema },
    authController.resetPassword,
  );
  fastify.post(
    "/auth/refresh",
    { schema: refreshSchema },
    authController.refreshToken,
  );
  fastify.post("/auth/logout", { schema: logoutSchema }, authController.logout);

  fastify.get(
    "/auth/oauth/google/callback",
    authController.oauthGoogleCallback,
  );

  fastify.get(
    "/auth/me",
    {
      schema: meSchema,
      preHandler: [fastify.authenticate],
    },
    authController.me,
  );
}

module.exports = authRoutes;
