const crypto = require("crypto");
const prisma = require("../../config/prisma");
const userService = require("../users/user.service");
const RefreshToken = require("../../models/refreshToken.model");

// Registra usuario usando userService.
// - Comprueba que el email no exista y no esté eliminado.
// - Devuelve objeto user (sin password) o error.
async function registerUser({ email, password, username, fullName }) {
  const existing = await userService.getUserByEmail(email, true);
  if (existing) {
    if (existing.isDeleted) {
      return {
        error:
          "El email ya estaba asociado a una cuenta eliminada. Ponte en contacto con soporte si quieres recuperarla.",
      };
    }
    return { error: "El email ya está en uso." };
  }

  const result = await userService.registerUser({
    email,
    password,
    username,
    fullName,
  });
  if (result.error) {
    return { error: result.error };
  }

  return { user: result.user };
}

// Login de usuario.
// - Comprueba user activo (no isDeleted) y credenciales.
// - Devuelve user seguro (sin password) o error.
async function loginUser({ email, password }) {
  const result = await userService.loginUser({ email, password });
  if (result.error) {
    return result;
  }

  if (!result.user || result.user.isDeleted) {
    return { error: "Credenciales inválidas." };
  }

  return { user: result.user };
}
async function findOrCreateOAuthUser({
  email,
  fullName,
  profileImage,
  provider,
  oauthId,
}) {
  const result = await userService.findOrCreateOAuthUser({
    email,
    fullName,
    profileImage,
    provider,
    oauthId,
  });

  if (result.error) {
    return { error: result.error };
  }

  return { user: result.user };
}
// Genera hash de refresh token para almacenamiento seguro.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Guarda un refreshToken en base de datos.
async function saveRefreshToken({ token, userId, userAgent, expiresAt }) {
  const tokenHash = hashToken(token);
  await RefreshToken.create({ tokenHash, userId, userAgent, expiresAt });
}

// Verifica token de refresh: existe, no revocado y no expirado.
async function verifyRefreshToken(token) {
  const tokenHash = hashToken(token);
  const refreshToken = await RefreshToken.findOne({ tokenHash });
  if (!refreshToken) return { error: "Refresh token inválido." };
  if (refreshToken.revoked) return { error: "Refresh token revocado." };
  if (refreshToken.expiresAt < new Date())
    return { error: "Refresh token expirado." };

  return { userId: refreshToken.userId, token: refreshToken };
}

// Revoca refresh token de la base de datos.
async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  const refreshToken = await RefreshToken.findOne({ tokenHash });
  if (!refreshToken) {
    return { error: "Refresh token inválido para revocación." };
  }

  refreshToken.revoked = true;
  refreshToken.revokedAt = new Date();
  await refreshToken.save();

  return { success: true };
}

// Envía token de cambio de contraseña por email (simulado o real)
async function requestPasswordReset({ email }) {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return { error: "No se encontró el usuario." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  // TODO: enviar email real; por ahora devolvemos token para testing.
  console.log(`Password reset token for ${email}: ${token}`);

  return {
    message: "Reset password token generated. Revisa tu email.",
    token,
  };
}

async function resetPassword({ email, token, newPassword }) {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return { error: "No se encontró el usuario." };
  }

  const tokenHash = hashToken(token);
  const resetEntry = await prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetEntry) {
    return { error: "Token inválido o expirado." };
  }

  if (!isValidPassword(newPassword)) {
    return {
      error:
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.",
    };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.update({
    where: { id: resetEntry.id },
    data: { usedAt: new Date() },
  });

  return { message: "Contraseña restablecida correctamente." };
}

module.exports = {
  registerUser,
  loginUser,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  requestPasswordReset,
  resetPassword,
};
