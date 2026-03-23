const userBase = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    fullName: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    profileImage: { type: 'string', format: 'uri', nullable: true },
    role: { type: 'string', enum: ['user', 'admin'] },
    bio: { type: 'string', nullable: true },
    subscription: { type: 'object', properties: {} },
    followers: { type: 'array', items: { type: 'string' } },
    following: { type: 'array', items: { type: 'string' } },
    blockedUsers: { type: 'array', items: { type: 'string' } }
  }
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        user: userBase,
        accessToken: { type: 'string' }
      }
    }
  }
}

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'username', 'fullName'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      username: { type: 'string', minLength: 3 },
      fullName: { type: 'string', minLength: 3 }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        user: userBase,
        accessToken: { type: 'string' }
      }
    }
  }
}

const refreshSchema = {
  response: {
    200: { type: 'object', properties: { accessToken: { type: 'string' } } }
  }
}
const logoutSchema = {
  response: {
    200: { type: 'object', properties: { message: { type: 'string' } } }
  }
}

module.exports = {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema
}
