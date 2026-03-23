const Report = require("../../models/report.model");
const mongoose = require("mongoose");

async function createReport(reportData) {
  try {
    const { contentId, onModel } = reportData;

    const contentModel = mongoose.model(onModel);
    const content = await contentModel.findById(contentId);
    if (!content) {
      return { error: `El contenido que intentas reportar no existe.` };
    }
    const existingReport = await Report.findOne({ userId: reportData.userId, contentId });
    if (existingReport) {
      return { error: "Ya has reportado este contenido anteriormente." };
    }

    const newReport = await Report.create(reportData);

    return { report: newReport };
  } catch (error) {
    console.error("Error al crear el reporte:", error);
    if (error.name === "ValidationError") {
      return { error: `Datos del reporte inválidos: ${error.message}` };
    }
    return { error: "Ocurrió un error al enviar el reporte." };
  }
}

async function getAllReports(filters = {}) {
  try {
    const reports = await Report.find(filters)
      .sort({ createdAt: -1 })
      .populate("userId", "username email")
      .populate("contentId");

    return { reports };
  } catch (error) {
    console.error("Error al obtener los reportes:", error);
    return { error: "No se pudieron obtener los reportes." };
  }
}

async function updateReportStatus(reportId, status) {
  try {
    const allowedStatus = ["in_review", "resolved", "dismissed"];
    if (!allowedStatus.includes(status)) {
      return { error: "Estado de reporte no válido." };
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return { error: "Reporte no encontrado." };
    }

    return { report: updatedReport };
  } catch (error) {
    console.error("Error al actualizar el estado del reporte:", error);
    return { error: "Ocurrió un error al actualizar el reporte." };
  }
}

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
};
