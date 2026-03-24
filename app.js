// Versal/backend/app.js
const dotenv = require('dotenv')
dotenv.config()

const fastify = require('fastify')()
const cors = require('@fastify/cors')
const jwt = require('@fastify/jwt')
const path = require('path')

const fastifyMultipart = require('@fastify/multipart')
const fastifyStatic = require('@fastify/static')
const fastifyCookie = require('@fastify/cookie')
const fastifyRawBody = require('fastify-raw-body')

const connectDB = require('./src/config/db')
const storyRoutes = require('./src/features/stories/story.routes')
const authPlugin = require('./src/plugins/auth.plugin')
const userRoutes = require('./src/features/users/user.routes')
const transactionRoutes = require('./src/features/transactions/transaction.routes')
const interactionRoutes = require('./src/features/interactions/interaction.routes')
const chapterRoutes = require('./src/features/chapters/chapter.routes')
const favoriteRoutes = require('./src/features/favorites/favorite.routes')
const reportRoutes = require('./src/features/reports/report.routes')
const donationRoutes = require('./src/features/donations/donation.routes')
const authRoutes = require('./src/features/auth/auth.routes')

// Conectar a la base de datos
connectDB()

// Plugins de Fastify
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('JWT_SECRET no está definido. Debe establecerse en .env')
}
fastify.register(jwt, { secret: jwtSecret })
fastify.register(authPlugin)

// Google OAuth2 
fastify.register(require('@fastify/oauth2'), {
  name: 'googleOAuth2',
  scope: ['openid', 'email', 'profile'],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET
    },
    auth: {
      authorizeHost: 'https://accounts.google.com',
      authorizePath: '/o/oauth2/v2/auth',
      tokenHost: 'https://oauth2.googleapis.com',
      tokenPath: '/token'
    }
  },
  // Ruta para iniciar OAuth
  startRedirectPath: '/api/auth/oauth/google',
})

fastify.register(fastifyCookie)

fastify.register(fastifyMultipart)

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/'
})

fastify.register(fastifyRawBody, {
  field: 'rawBody',
  global: false,
  encoding: 'utf8'
})

fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

// Rutas de auth
fastify.register(authRoutes, { prefix: '/api' })

// Rutas de usuario
fastify.register(userRoutes, { prefix: '/api/users' })

// Rutas de las historias
fastify.register(storyRoutes, { prefix: '/api/stories' })

//Rutas de interacciones
fastify.register(interactionRoutes, { prefix: '/api/interactions' })

// Rutas de transacciones
fastify.register(transactionRoutes, { prefix: '/api' })

// Rutas de capítulos
fastify.register(chapterRoutes, { prefix: '/api' })

// Rutas de favoritos
fastify.register(favoriteRoutes, { prefix: '/api' })

// Rutas de reportes
fastify.register(reportRoutes, { prefix: '/api' })

// Rutas de donaciones
fastify.register(donationRoutes, { prefix: '/api' })

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`🚀 Server ejecutándose en ${address}`)
})
