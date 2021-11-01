import { URLSearchParams } from 'url'
import { WpClient } from './WpClient'
import fsPromise from 'fs/promises'
import http from 'http'
import path from 'path'

export async function App(req: http.IncomingMessage, res: http.ServerResponse) {
	const client = new WpClient()
	res.writeHead(200, { 'Content-Type': 'application/json' })

	switch (req.url) {
		default:
			res.writeHead(200, { 'Content-Type': 'text/html' })
			res.write(req.url)
			break

		case '/menu':
			res.write(JSON.stringify(await client.menu()))
			break

		case '/create-post':
			res.write(
				JSON.stringify(
					await client.post().create({
						title: 'Created Post',
						content: '<p><strong>Demo Content</strong></p>',
						status: 'publish',
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

		case '/get-posts':
			res.write(JSON.stringify(await client.post().find()))
			break

		case '/get-post':
			res.write(JSON.stringify((await client.post().find(1))[0]))
			break

		case '/update-post':
			res.write(
				JSON.stringify(
					await client.post().update(
						{
							title: 'Hello Update!',
							slug: 'hello-update',
							status: 'publish',
						},
						1,
					),
				),
			)
			break

		case '/get-post-revisions':
			res.write(JSON.stringify(await client.post().revision(1).find()))
			break

		case '/delete-post':
			res.write(JSON.stringify(await client.post().delete(1)))
			break

		case '/query-params':
			res.write(
				JSON.stringify(
					await client.post().find(
						new URLSearchParams({
							per_page: '1',
							order: 'desc',
						}),
					),
				),
			)
			break

		case '/upload-media':
			res.write(
				JSON.stringify(
					await client
						.media()
						.create(
							'github-icon.png',
							await fsPromise.readFile(
								path.resolve(
									__dirname,
									'icons8-github-960.png',
								),
							),
							'image/png',
						),
				),
			)
			break

		case '/install-plugin':
			res.write(
				JSON.stringify(
					await client.plugin().create('antispam-bee', 'active'),
				),
			)
			break

		// ToDo https://github.com/dkress59/wordpress-api-client/projects/1#card-70917987
		case '/get-user':
			res.write(JSON.stringify(await client.user().findMe()))
			break
	}
	res.end()
}
