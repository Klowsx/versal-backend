const userBase = {
  type: "object",
  properties: {
    _id: { type: "string" },
    fullName: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    profileImage: { type: "string", format: "uri", nullable: true },
    role: { type: "string", enum: ["user", "admin"] },
    bio: { type: "string", nullable: true },
    subscription: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["basic", "premium"] },
        status: { type: "string", enum: ["active", "expired"] },
        endDate: { type: "string", format: "date-time", nullable: true },
      },
      required: ["type", "status"],
    },
    totalCoinsReceived: { type: "number" },
    followers: { type: "array", items: { type: "string" } },
    following: { type: "array", items: { type: "string" } },
    blockedUsers: { type: "array", items: { type: "string" } },
  },
};

const registerUserSchema = {
  type: "object",
  required: ["email", "password", "username", "fullName"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    username: { type: "string", minLength: 3 },
    fullName: { type: "string", minLength: 3 },
  },
};

const registerResponseSchema = {
  type: "object",
  properties: {
    user: userBase,
    token: { type: "string" },
  },
  required: ["user", "token"],
};

const loginUserSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
  },
};

const loginResponseSchema = {
  type: "object",
  properties: {
    user: userBase,
    token: { type: "string" },
  },
  required: ["user", "token"],
};

const updateProfileSchema = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    username: { type: "string" },
    email: { type: "string", format: "email" },
    bio: { type: "string" },
    profileImage: { type: "string", format: "uri" },
  },
  additionalProperties: false,
};

const changePasswordSchema = {
  type: "object",
  required: ["oldPassword", "newPassword"],
  properties: {
    oldPassword: { type: "string", minLength: 8 },
    newPassword: { type: "string", minLength: 8 },
  },
  additionalProperties: false,
};

const updateRoleSchema = {
  type: "object",
  required: ["role"],
  properties: {
    role: { type: "string", enum: ["user", "admin"] },
  },
  additionalProperties: false,
};

const userIdParamSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
};

module.exports = {
  registerUserSchema,
  registerResponseSchema,
  loginResponseSchema,
  loginUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  userBase,
  userIdParamSchema,
};
