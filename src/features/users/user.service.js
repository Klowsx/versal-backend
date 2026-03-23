const User = require('../../models/user.model')
const bcrypt = require('bcrypt')

// Validación de contraseña
function isValidPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/
  return regex.test(password)
}

// Registro de usuario
async function registerUser({ email, password, username, fullName }) {
  console.log('Datos de registro en service:', { email, username, fullName })
  if (!isValidPassword(password)) {
    return {
      error:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.'
    }
  }

  const existing = await User.findOne({ email })
  if (existing) return { error: 'El email ya esta en uso' }

  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, password: hash, username, fullName })

  return { user }
}

// Login de usuario
async function loginUser({ email, password }) {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return { error: 'Credenciales inválidas.' }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { error: 'Credenciales inválidas.' }
    }

    const userObject = user.toObject()
    delete userObject.password

    return { user: userObject }
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    return { error: 'Error interno del servidor al iniciar sesión.' }
  }
}

// Obtener perfil
async function getUserById({ userId }) {
  const user = await User.findById(userId)
    .select('-password')
    .select(
      'fullName username email profileImage role bio subscription following followers blockedUsers coins'
    )
    .lean()
  if (!user) throw new Error('Usuario no encontrado')
  console.log('Usuario encontrado:', user)
  return user
}

// Obtener usuario por email
async function getUserByEmail(email) {
  return await User.findOne({ email })
}

// Editar perfil
async function updateUser({ userId, data }) {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true }
  ).select('-password')
  return updatedUser
}

// Cambiar contraseña
async function changePassword({ userId, oldPassword, newPassword }) {
  if (!isValidPassword(newPassword)) {
    return { error: 'La nueva contraseña no cumple con los requisitos.' }
  }

  const user = await User.findById(userId)
  if (!user) return { error: 'Usuario no encontrado' }

  const isValid = await bcrypt.compare(oldPassword, user.password)
  if (!isValid) return { error: 'Contraseña antigua incorrecta' }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  return { message: 'Contraseña actualizada correctamente' }
}

// Ver seguidores
async function getFollowers({ userId }) {
  const user = await User.findById(userId).populate(
    'followers',
    'username profileImage'
  )
  if (!user) throw new Error('Usuario no encontrado')
  return user.followers
}

// Ver seguidos
async function getFollowing({ userId }) {
  const user = await User.findById(userId).populate(
    'following',
    'username profileImage'
  )
  if (!user) throw new Error('Usuario no encontrado')
  return user.following
}

// Seguir usuario
async function followUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new Error('No puedes seguirte a ti mismo')
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ])

  if (!targetUser) throw new Error('Usuario no encontrado')
  if (currentUser.following.includes(targetUserId)) {
    throw new Error('Ya sigues a este usuario')
  }

  currentUser.following.push(targetUserId)
  targetUser.followers.push(currentUserId)

  await Promise.all([currentUser.save(), targetUser.save()])

  return { success: true, message: 'Usuario seguido correctamente' }
}

// Dejar de seguir
async function unfollowUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new Error('No puedes dejar de seguirte a ti mismo')
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ])

  if (!targetUser) throw new Error('Usuario no encontrado')
  if (!currentUser.following.includes(targetUserId)) {
    throw new Error('No sigues a este usuario')
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId.toString()
  )
  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== currentUserId.toString()
  )

  await Promise.all([currentUser.save(), targetUser.save()])

  return {
    success: true,
    message: 'Dejaste de seguir al usuario correctamente'
  }
}

// Bloquear usuario
async function blockUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new Error('No puedes bloquearte a ti mismo')
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ])

  if (!targetUser) throw new Error('Usuario no encontrado')
  if (currentUser.blockedUsers.includes(targetUserId)) {
    throw new Error('Ya has bloqueado a este usuario')
  }

  currentUser.blockedUsers.push(targetUserId)
  await currentUser.save()

  return { success: true, message: 'Usuario bloqueado correctamente' }
}

// Desbloquear usuario
async function unblockUser({ currentUserId, targetUserId }) {
  if (currentUserId === targetUserId) {
    throw new Error('No puedes desbloquearte a ti mismo')
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ])

  if (!targetUser) throw new Error('Usuario no encontrado')
  if (!currentUser.blockedUsers.includes(targetUserId)) {
    throw new Error('No has bloqueado a este usuario')
  }

  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== targetUserId.toString()
  )
  await currentUser.save()

  return { success: true, message: 'Usuario desbloqueado correctamente' }
}

// Obtener bloqueados
async function getBlockedUsers({ userId }) {
  const user = await User.findById(userId).populate(
    'blockedUsers',
    'username email'
  )
  if (!user) throw new Error('Usuario no encontrado')
  return user.blockedUsers
}

// ADMIN
async function getAllUsers() {
  return await User.find().select('-password')
}

async function deleteUser({ userId }) {
  const user = await User.findByIdAndDelete(userId)
  if (!user) throw new Error('Usuario no encontrado')
  return { message: 'Usuario eliminado correctamente' }
}

async function updateUserRole({ userId, role }) {
  if (!['user', 'admin'].includes(role)) {
    throw new Error('Rol inválido')
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password')

  if (!user) throw new Error('Usuario no encontrado')
  return user
}

module.exports = {
  registerUser,
  loginUser,
  getUserByEmail,
  getUserById,
  updateUser,
  changePassword,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getAllUsers,
  deleteUser,
  updateUserRole
}
