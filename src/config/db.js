const mongoose = require('mongoose')

async function connectDB() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    throw new Error('MONGO_URI no está definido. Debe establecerse en .env')
  }

  try {
    await mongoose.connect(mongoUri, {})
    console.log('MongoDB conectado')
  } catch (err) {
    console.error('Error de conexion en MongoDB', err)
    process.exit(1)
  }
}

module.exports = connectDB
