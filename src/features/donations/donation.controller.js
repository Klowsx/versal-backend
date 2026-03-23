const donationService = require("./donation.service");

async function makeDonation(request, reply) {
  try {
    const { userId: donatorId } = request.user;
    const { storyId } = request.params;
    const { amount, message } = request.body;

    const result = await donationService.makeDonation(donatorId, storyId, amount, message);

    console.error("Respuesta de controller: ", result);
    if (result.error) {
      return reply.code(400).send({ success: false, message: result.error });
    }

    reply.code(201).send({ success: true, donation: result.donation });
  } catch (error) {
    console.error("Error en el controlador makeDonation:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al procesar la donación." });
  }
}

module.exports = {
  makeDonation,
};
