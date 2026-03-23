const { PrismaClient } = require('@prisma/client')

const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' }
    ]
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

prisma.$on('query', (e) => {
  // Desactivar o ajustar en producción si es demasiado verboso
  console.log(`Prisma query: ${e.query} params: ${e.params}`)
})

module.exports = prisma
