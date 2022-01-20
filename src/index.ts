import { App } from './App'
import http from 'http'

const PORT = process.env.PORT ?? 3000
const server = http.createServer()
// eslint-disable-next-line @typescript-eslint/no-misused-promises
server.on('request', App)
server.listen(PORT, () => console.log(`server listening on port ${PORT}`))
