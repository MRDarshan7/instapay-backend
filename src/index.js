import express from 'express'
import { PORT } from './config.js'
import transferRoutes from './routes/transfer.js'

const app = express()
app.use(express.json())

app.use('/api', transferRoutes)

app.get('/', (_, res) => {
  res.send('InstaPay Backend – Testnet Mode')
})

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})
