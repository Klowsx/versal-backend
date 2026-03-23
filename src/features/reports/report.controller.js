const reportService = require("./report.service");

// Crear un reporte
async function createReport(request, reply) {
  try {
    const { userId } = request.user;
    const result = await reportService.createReport({ ...request.body, userId });

    if (result.error) {
      if (result.error.includes("anteriormente")) {
        return reply.code(409).send(result);
      }
      return reply.code(400).send(result);
    }
    reply.code(201).send(result);
  } catch (error) {
    console.error("Error en el controlador createReport:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al enviar el reporte." });
  }
}

// Controlador para que un administrador obtenga todos los reportes
async function getAllReports(request, reply) {
  try {
    const filters = request.query;
    const result = await reportService.getAllReports(filters);

    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error al obtener los reportes." });
  }
}

// Controlador para que un administrador actualice el estado de un reporte
async function updateReportStatus(request, reply) {
  try {
    const { reportId } = request.params;
    const { status } = request.body;

    const result = await reportService.updateReportStatus(reportId, status);

    if (result.error) {
      if (result.error.includes("no encontrado")) {
        return reply.code(404).send(result);
      }
      return reply.code(400).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error al actualizar el reporte." });
  }
}

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
};
