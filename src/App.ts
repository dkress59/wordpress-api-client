import { WpClient } from './WpClient'
import http from 'http'

export async function App(req: http.IncomingMessage, res: http.ServerResponse) {
	const client = new WpClient()
	res.writeHead(200, { 'Content-Type': 'application/json' })

	switch (req.url) {
		default:
			res.writeHead(200, { 'Content-Type': 'text/html' })
			res.write(req.url)
			break
		case '/create-post':
			res.write(
				JSON.stringify(
					await client.post().create({
						title: 'Created Post',
						content: '<p><strong>Demo Content</strong></p>',
						post_status: 'publish',
						fields: {
							sidebarOptions: {
								sidebar_id: 1,
								layout: 'b',
							},
						},
					}),
				),
			)
			break
		case '/menu':
			res.write(JSON.stringify(await client.menu()))
			break
	}
	res.end()
}
