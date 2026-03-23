const fs = require("fs");
const util = require("util");
const path = require("path");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);
const userService = require("./user.service");

//Registro de usuario
async function register(request, reply) {
  const { email, password, username, fullName } = request.body;
  console.log("Datos de registro:", { email, username, fullName });
  const result = await userService.registerUser({ email, password, username, fullName });
  console.log("CONTROLLER Resultado de userService.registerUser:", result);
  if (result.error) {
    return reply.code(400).send({ error: result.error });
  }

  return result;
}

//Login de usuario
async function login(request, reply) {
  const { email, password } = request.body;

  const result = await userService.loginUser({ email, password });

  if (result.error) {
    return reply.code(401).send({ error: result.error });
  }

  return result;
}

// Obtener usuario actual
async function getCurrentUser(req, reply) {
  const user = await userService.getUserById({ userId: req.user.userId });
  if (!user) return reply.code(404).send({ message: "Usuario no encontrado" });
  reply.send(user);
}

// Obtener perfil de usuario por ID
async function getUserProfileById(req, reply) {
  const { id } = req.params;
  const user = await userService.getUserById({ userId: id });

  if (!user) {
    return reply.code(404).send({ message: "Usuario no encontrado" });
  }

  const publicUser = { ...user };
  delete publicUser.password;
  delete publicUser.email;
  delete publicUser.subscription;
  delete publicUser.totalCoinsReceived;

  reply.send(publicUser);
}

// Actualizar usuario
async function updateProfile(req, reply) {
  const data = {};

  const parts = req.parts();
  for await (const part of parts) {
    if (part.file) {
      const uploadDir = path.join(__dirname, `../../../uploads/avatars`);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uniqueFilename = `${Date.now()}-${part.filename}`;
      const uploadPath = path.join(uploadDir, uniqueFilename);
      await pump(part.file, fs.createWriteStream(uploadPath));

      const imageUrl = `${req.protocol}://${req.headers.host}/uploads/avatars/${uniqueFilename}`;
      data.profileImage = imageUrl;
    } else {
      data[part.fieldname] = part.value;
    }
  }

  const updatedUser = await userService.updateUser({
    userId: req.user.userId,
    data: data,
  });

  reply.send(updatedUser);
}

// Cambiar contraseña
async function changePassword(req, reply) {
  const { oldPassword, newPassword } = req.body;
  const result = await userService.changePassword({
    userId: req.user.userId,
    oldPassword,
    newPassword,
  });

  if (result.error) {
    return reply.code(400).send({ error: result.error });
  }

  reply.send({ message: result.message });
}

// Seguir usuario
async function followUser(req, reply) {
  const result = await userService.followUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// Dejar de seguir usuario
async function unfollowUser(req, reply) {
  const result = await userService.unfollowUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// Ver seguidores
async function getFollowers(req, reply) {
  const userId = req.params.id || req.user.userId;
  const followers = await userService.getFollowers({ userId });
  reply.send(followers);
}

// Ver seguidos
async function getFollowing(req, reply) {
  const userId = req.params.id || req.user.userId;
  const following = await userService.getFollowing({ userId });
  reply.send(following);
}

// Ver usuarios bloqueados
async function getBlockedUsers(req, reply) {
  const blockedUsers = await userService.getBlockedUsers({ userId: req.user.userId });
  reply.send(blockedUsers);
}

// Bloquear usuario
async function blockUser(req, reply) {
  const result = await userService.blockUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// Desbloquear usuario
async function unblockUser(req, reply) {
  const result = await userService.unblockUser({
    currentUserId: req.user.userId,
    targetUserId: req.params.id,
  });

  reply.send(result);
}

// ADMIN
async function getAllUsers(req, reply) {
  const users = await userService.getAllUsers();
  reply.send(users);
}

// Borrar usuario
async function deleteUser(req, reply) {
  const { id } = req.params;

  const result = await userService.deleteUser({ userId: id });

  if (result.error) {
    return reply.code(404).send(result);
  }

  reply.send(result);
}

// Actualizar rol de usuario
async function updateUserRole(req, reply) {
  const { userId } = req.params;
  const { role } = req.body;

  const result = await userService.updateUserRole({ userId, role });
  reply.send(result);
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserProfileById,
};
