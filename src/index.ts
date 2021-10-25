import { App } from './App'
import http from 'http'

const PORT = process.env.PORT ?? 5959
const server = http.createServer()
// eslint-disable-next-line @typescript-eslint/no-misused-promises
server.on('request', App)
server.listen(5959, () => console.log(`server listening on port ${PORT}`))
