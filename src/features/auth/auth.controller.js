const authService = require("./auth.service");
const userService = require("../users/user.service");

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

async function register(request, reply) {
  const { email, password, username, fullName } = request.body;

  const result = await authService.registerUser({
    email,
    password,
    username,
    fullName,
  });
  if (result.error) {
    return reply.code(400).send({ error: result.error });
  }

  const user = result.user;
  const payload = { userId: user.id, role: user.role };

  const accessToken = request.jwtSign(payload, { expiresIn: "15m" });
  const refreshToken = request.jwtSign(payload, { expiresIn: "30d" });

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    })
    .code(201)
    .send({ user, accessToken });
}

async function login(request, reply) {
  const { email, password } = request.body;

  const result = await authService.loginUser({ email, password });
  if (result.error) {
    return reply.code(401).send({ error: result.error });
  }

  const user = result.user;
  const payload = { userId: user.id, role: user.role };

  const accessToken = request.jwtSign(payload, { expiresIn: "15m" });
  const refreshToken = request.jwtSign(payload, { expiresIn: "30d" });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await authService.saveRefreshToken({
    token: refreshToken,
    userId: user.id,
    userAgent: request.headers["user-agent"] || "unknown",
    expiresAt,
  });

  reply
    .setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    })
    .send({ user, accessToken });
}

async function refreshToken(request, reply) {
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    return reply.code(401).send({ error: "No refresh token provided." });
  }

  const verification = await authService.verifyRefreshToken(refreshToken);
  if (verification.error) {
    return reply.code(401).send({ error: verification.error });
  }

  try {
    const decoded = await request.jwtVerify({ token: refreshToken });
    const payload = { userId: decoded.userId, role: decoded.role };
    const accessToken = request.jwtSign(payload, { expiresIn: "15m" });

    return reply.send({ accessToken });
  } catch (err) {
    return reply.code(401).send({ error: "Refresh token inválido." });
  }
}

async function logout(request, reply) {
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }

  reply
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: "/" })
    .send({ message: "Logged out" });
}

async function me(request, reply) {
  const userId = request.user && request.user.userId;
  if (!userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {
    const user = await userService.getUserById({ userId });
    return reply.send({ user });
  } catch (err) {
    return reply.code(404).send({ error: "Usuario no encontrado" });
  }
}

async function forgotPassword(request, reply) {
  const { email } = request.body;

  const result = await authService.requestPasswordReset({ email });
  if (result.error) {
    return reply.code(400).send({ error: result.error });
  }

  // TODO
  // en producción no devolver token en respuesta
  return reply.code(200).send({ message: result.message });
}

async function resetPassword(request, reply) {
  const { email, token, newPassword } = request.body;

  const result = await authService.resetPassword({ email, token, newPassword });
  if (result.error) {
    return reply.code(400).send({ error: result.error });
  }

  return reply.code(200).send({ message: result.message });
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  me,
  forgotPassword,
  resetPassword,
};
