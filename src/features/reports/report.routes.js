const reportController = require("./report.controller");
const {
  createReportSchema,
  getAllReportsSchema,
  updateReportStatusSchema,
} = require("./report.schema");

async function adminAuthHook(request, reply) {
  if (request.user.role !== "admin") {
    return reply.code(403).send({ error: "Acceso denegado. Se requiere rol de administrador." });
  }
}

async function reportRoutes(fastify) {
  fastify.register(async function (userRoutes) {
    userRoutes.addHook("onRequest", fastify.authenticate);

    userRoutes.post("/reports", { schema: createReportSchema }, reportController.createReport);
  });

  fastify.register(async function (adminRoutes) {
    adminRoutes.addHook("onRequest", fastify.authenticate);
    adminRoutes.addHook("onRequest", adminAuthHook);

    adminRoutes.get(
      "/admin/reports",
      { schema: getAllReportsSchema },
      reportController.getAllReports
    );

    adminRoutes.patch(
      "/admin/reports/:reportId",
      { schema: updateReportStatusSchema },
      reportController.updateReportStatus
    );
  });
}

module.exports = reportRoutes;
