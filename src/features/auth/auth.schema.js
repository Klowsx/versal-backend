const userBase = {
  type: "object",
  properties: {
    id: { type: "string" },
    fullName: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    profileImage: { type: "string", format: "uri", nullable: true },
    role: { type: "string", enum: ["user", "admin"] },
    bio: { type: "string", nullable: true },
    isDeleted: { type: "boolean", default: false },
    deletedAt: { type: "string", format: "date-time", nullable: true },
    subscription: { type: "object", properties: {} },
    followers: { type: "array", items: { type: "string" } },
    following: { type: "array", items: { type: "string" } },
    blockedUsers: { type: "array", items: { type: "string" } },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        user: userBase,
        accessToken: { type: "string" },
      },
    },
  },
};

const registerSchema = {
  body: {
    type: "object",
    required: ["email", "password", "username", "fullName"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      username: { type: "string", minLength: 3 },
      fullName: { type: "string", minLength: 3 },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        user: userBase,
        accessToken: { type: "string" },
      },
    },
  },
};

const refreshSchema = {
  response: {
    200: { type: "object", properties: { accessToken: { type: "string" } } },
  },
};

const forgotPasswordSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
    },
  },
  response: {
    200: { type: "object", properties: { message: { type: "string" } } },
  },
};

const resetPasswordSchema = {
  body: {
    type: "object",
    required: ["email", "token", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      token: { type: "string" },
      newPassword: { type: "string", minLength: 8 },
    },
  },
  response: {
    200: { type: "object", properties: { message: { type: "string" } } },
  },
};

const meSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        user: userBase,
      },
    },
  },
};

const logoutSchema = {
  response: {
    200: { type: "object", properties: { message: { type: "string" } } },
  },
};

module.exports = {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  meSchema,
};
