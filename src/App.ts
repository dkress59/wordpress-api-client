import { PostFields } from './types'
import { URLSearchParams } from 'url'
import { WpClient } from './WpClient'
import fsPromise from 'fs/promises'
import http from 'http'
import path from 'path'

export async function App(req: http.IncomingMessage, res: http.ServerResponse) {
	const client = new WpClient()
	res.writeHead(200, { 'Content-Type': 'application/json' })

	try {
		switch (req.url) {
			default:
				res.writeHead(200, { 'Content-Type': 'text/html' })
				res.write(
					`<html>
				<head>
					<style>
					body {
						margin: 0;
						width: 100%;
						height: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						font-family: 'Helvetica', 'Arial', sans-serif;
					}
					</style>
				</head>
				<body>
					<h1>` +
						(req.url ?? '') +
						`</h1>
				</body>
				</html>`,
				)
				break

			case '/menu':
				res.write(JSON.stringify(await client.menu()))
				break

			case '/create-post':
				res.write(
					JSON.stringify(
						await client.post().create({
							title: { rendered: 'Created Post' },
							content: {
								rendered:
									'<p><strong>Demo Content</strong></p>',
								protected: false,
							},
							status: 'publish',
							acf: {
								sidebarOptions: {
									sidebar_id: 1,
									layout: 'b',
								},
							} as PostFields,
						}),
					),
				)
				break

			case '/get-posts':
				res.write(
					JSON.stringify(
						await client.post().find(
							new URLSearchParams({
								password: 'postpassword',
								status: 'publish,private,draft,trash',
							}),
						),
					),
				)
				break

			case '/get-post':
				res.write(JSON.stringify((await client.post().find(1))[0]))
				break

			case '/update-post':
				res.write(
					JSON.stringify(
						await client.post().update(
							{
								title: { rendered: 'Hello Update!' },
								slug: 'hello-update',
								status: 'publish',
							},
							1,
						),
					),
				)
				break

			case '/get-post-revisions':
				res.write(
					JSON.stringify(await client.post().revision(1).find()),
				)
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
								'github.png',
								await fsPromise.readFile(
									path.resolve(__dirname, 'github.png'),
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

			case '/get-user':
				res.write(JSON.stringify(await client.user().findMe()))
				break

			case '/block-directory':
				res.write(JSON.stringify(await client.blockDirectory('')))
				break

			case '/block-type':
				res.write(JSON.stringify(await client.blockType()))
				break

			case '/comments':
				res.write(JSON.stringify(await client.comment().find()))
				break

			case '/plugins':
				res.write(JSON.stringify(await client.plugin().find()))
				break

			case '/plugin-activate':
				res.write(
					JSON.stringify(
						await client
							.plugin()
							.update(
								'animate-wp-blocks/animate-wp-blocks',
								'active',
							),
					),
				)
				break

			case '/categories':
				res.write(JSON.stringify(await client.postCategory().find()))
				break

			case '/tags':
				res.write(JSON.stringify(await client.postTag().find()))
				break

			case '/post-types':
				res.write(JSON.stringify(await client.postType()))
				break
		}
	} catch ({ message }) {
		res.write(JSON.stringify({ message }))
	}
	res.end()
}
