import 'jest-specific-snapshot'
import { randomUUID } from 'crypto'
import WpApiClient from '../../src'
import fs from 'fs'
import path from 'path'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockContent = {
	rendered: '<p>Mock Content</p>',
	protected: false,
}
const mockUpdatedTitle = { rendered: 'Updated Title' }
const mockUpdatedContent = {
	rendered: '<p>Updated Content</p>',
}
const mockPng = fs.readFileSync(path.resolve(__dirname, './png.png'))
const mockJpg = fs.readFileSync(path.resolve(__dirname, './jpg.jpg'))
const mockRawContent = { raw: mockContent.rendered, protected: false }
const mockRawTitle = { raw: mockTitle.rendered, protected: false }

const snapshotPath = path.resolve(process.cwd(), './__snapshots__')
function fileName(name: string, dir?: string) {
	const pathName = path.join(snapshotPath, dir ?? '')
	if (dir && !fs.existsSync(pathName)) fs.mkdirSync(pathName)
	return path.join(pathName, `e2e-${name}.snapshot`)
}

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})
	const noAuthClient = new WpApiClient('http://localhost:8080')

	beforeAll(() => () => {
		if (!fs.existsSync(snapshotPath)) fs.mkdirSync(snapshotPath)
	})

	describe('.post', () => {
		let newPostId: number | undefined

		afterEach(async () => {
			if (newPostId) await client.post().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			expect(await client.post().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'post'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.post().find(1)).toMatchSpecificSnapshot(
				fileName('find_one', 'post'),
			)
		})
		it('.create', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('create', 'post'))
		})
		it('.update', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(
				await client
					.post()
					.update({ title: mockUpdatedTitle }, response!.id),
			).toMatchSpecificSnapshot(fileName('update', 'post'))
		})
		it('.delete', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			expect(
				await client.post().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'post'))
		})
	})
	describe('.page', () => {
		let newPostId: number | undefined

		afterEach(async () => {
			if (newPostId) await client.page().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			expect(await client.page().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'page'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.page().find(2)).toMatchSpecificSnapshot(
				fileName('find_one', 'page'),
			)
		})
		it('.create', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('create', 'page'))
		})
		it('.update', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(
				await client
					.page()
					.update({ title: mockUpdatedTitle }, response!.id),
			).toMatchSpecificSnapshot(fileName('update', 'page'))
		})
		it('.delete', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			expect(
				await client.page().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'page'))
		})
	})
	describe('.applicationPassword', () => {
		it('.create', async () => {
			const appId = randomUUID()
			const mockAppName = 'mock-app-name'
			const userId = (await client.user().findMe()).id
			const response = await client
				.applicationPassword()
				.create(userId, appId, mockAppName)
			expect(response._links.self).toHaveLength(1)
			expect(response.name).toEqual(mockAppName)
			expect(response.last_used).toBeNull()
		})
	})
	it('.blockDirectory', async () => {
		const response = await client.blockDirectory(' ')
		expect(response.some(Boolean)).toBe(true)
	})
	it('.blockType', async () => {
		expect(await client.blockType()).toMatchSpecificSnapshot(
			fileName('blockType'),
		)
	})
	describe('.comment', () => {
		let newCommentId: number | undefined

		afterEach(async () => {
			if (newCommentId) await client.comment().delete(newCommentId)
			newCommentId = 0
		})

		it('.create', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			newCommentId = response?.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'comment'),
			)
		})
		it('.delete', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			expect(
				await client.comment().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'comment'))
		})
		it('.find (all)', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			newCommentId = response?.id
			expect(await client.comment().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'comment'),
			)
		})
		it('.find (one)', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			newCommentId = response?.id
			expect(
				await client.comment().find(response!.id),
			).toMatchSpecificSnapshot(fileName('find_one', 'comment'))
		})
		it('.update', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			newCommentId = response?.id
			expect(
				await client.comment().update(
					{
						content: mockUpdatedContent,
					},
					response!.id,
				),
			).toMatchSpecificSnapshot(fileName('update', 'comment'))
		})
	})
	describe('.media', () => {
		let newMediaId: number | undefined
		const mockFilename = 'filename.png'
		const mockMimeType = 'image/png'

		afterEach(async () => {
			if (newMediaId) await client.media().delete(newMediaId)
			newMediaId = 0
		})

		describe('.create', () => {
			it('default', async () => {
				const response = await client
					.media()
					.create(mockFilename, mockJpg)
				newMediaId = response.id
				expect(response).toMatchSpecificSnapshot(
					fileName('create', 'media'),
				)
			})
			it('custom mime-type', async () => {
				const response = await client
					.media()
					.create(mockFilename, mockPng, mockMimeType)
				newMediaId = response.id
				expect(response).toMatchSpecificSnapshot(
					fileName('create_png', 'media'),
				)
			})
			it('with update', async () => {
				const response = await client
					.media()
					.create(mockFilename, mockJpg, undefined, {
						alt_text: 'mock alt-text',
						title: mockTitle,
						slug: 'mock_slug',
					})
				newMediaId = response.id
				expect(response).toMatchSpecificSnapshot(
					fileName('create_populated', 'media'),
				)
			})
		})
		it('.delete', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			expect(
				await client.media().delete(response.id),
			).toMatchSpecificSnapshot(fileName('delete', 'media'))
		})
		it('.find (all)', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			newMediaId = response.id
			expect(await client.media().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'media'),
			)
		})
		it('.find (one)', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			newMediaId = response.id
			expect(
				await client.media().find(response.id),
			).toMatchSpecificSnapshot(fileName('find_one', 'media'))
		})
		it('.update', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			newMediaId = response.id
			expect(
				await client
					.media()
					.update(
						{ caption: { rendered: 'Mock Caption' } },
						response.id,
					),
			).toMatchSpecificSnapshot(fileName('update', 'media'))
		})
	})
	describe('.plugin', () => {
		jest.setTimeout(30 * 1000)
		it('.create', async () => {
			expect(
				await client
					.plugin()
					.create('advanced-custom-fields', 'active'),
			).toMatchSpecificSnapshot(fileName('create', 'plugin'))
		})
		it('.delete', async () => {
			expect(
				await client.plugin().delete('akismet/akismet'),
			).toMatchSpecificSnapshot(fileName('delete', 'plugin'))
		})
		it('.find (all)', async () => {
			expect(await client.plugin().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'plugin'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.plugin().find('hello')).toMatchSpecificSnapshot(
				fileName('find_one', 'plugin'),
			)
		})
		it('.update', async () => {
			expect(
				await client.plugin().update('hello', 'active'),
			).toMatchSpecificSnapshot(fileName('update', 'plugin'))
		})
	})
	describe('.postCategory', () => {
		let newCategoryId: number | undefined

		afterEach(async () => {
			if (newCategoryId) await client.postCategory().delete(newCategoryId)
			newCategoryId = 0
		})

		it('.create', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			newCategoryId = response?.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'postCategory'),
			)
		})
		it('.delete', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.postCategory().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'postCategory'))
		})
		it('.find (all)', async () => {
			expect(await client.postCategory().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'postCategory'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.postCategory().find(1)).toMatchSpecificSnapshot(
				fileName('find_one', 'postCategory'),
			)
		})
		it('.update', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			newCategoryId = response?.id
			expect(
				await client.postCategory().update(
					{
						name: mockUpdatedTitle.rendered,
					},
					response!.id,
				),
			).toMatchSpecificSnapshot(fileName('update', 'postCategory'))
		})
	})
	describe('.postTag', () => {
		let newTagId: number | undefined

		beforeAll(async () => {
			await client.postTag().create({
				name: 'Initial Tag',
			})
		})

		afterEach(async () => {
			if (newTagId) await client.postTag().delete(newTagId)
			newTagId = 0
		})

		it('.create', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			newTagId = response?.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'postTag'),
			)
		})
		it('.delete', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.postTag().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'postTag'))
		})
		it('.find (all)', async () => {
			expect(await client.postTag().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'postTag'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.postTag().find(5)).toMatchSpecificSnapshot(
				fileName('find_one', 'postTag'),
			)
		})
		it('.update', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			newTagId = response?.id
			expect(
				await client.postTag().update(
					{
						name: mockUpdatedTitle.rendered,
					},
					response!.id,
				),
			).toMatchSpecificSnapshot(fileName('update', 'postTag'))
		})
	})
	it('.postType', async () => {
		expect(await client.postType()).toMatchSpecificSnapshot(
			fileName('postType'),
		)
	})
	// eslint-disable-next-line jest/no-disabled-tests
	it.skip('.renderedBlock', async () => {
		// ToDo: Find out what .renderedBlock actually is supposed to do
		expect(
			await client.renderedBlock({
				name: 'mock-rendered-block',
				postId: 1,
			}),
		).toMatchSpecificSnapshot(fileName('renderedBlock'))
	})
	describe('.reusableBlock', () => {
		let newBlockId = 0

		beforeEach(async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
		})

		afterEach(async () => {
			if (newBlockId) await client.reusableBlock().delete(newBlockId)
			newBlockId = 0
		})

		it('.find (all)', async () => {
			expect(await client.reusableBlock().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'reusableBlock'),
			)
		})
		it('.find (one)', async () => {
			expect(
				await client.reusableBlock().find(newBlockId),
			).toMatchSpecificSnapshot(fileName('find_one', 'reusableBlock'))
		})
		it('.create', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'reusableBlock'),
			)
		})
		it('.update', async () => {
			expect(
				await client
					.reusableBlock()
					.update(
						{ title: { raw: mockUpdatedTitle.rendered } },
						newBlockId,
					),
			).toMatchSpecificSnapshot(fileName('update', 'reusableBlock'))
		})
		it('.delete', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			expect(
				await client.reusableBlock().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'reusableBlock'))
		})
	})
	it('.search', async () => {
		expect(
			await client.search('mock', { per_page: '2' }),
		).toMatchSpecificSnapshot(fileName('search'))
	})
	describe('.siteSettings', () => {
		it('.find', async () => {
			expect(await client.siteSettings().find()).toMatchSpecificSnapshot(
				fileName('siteSettings-find'),
			)
		})
		it('.update', async () => {
			expect(
				await client
					.siteSettings()
					.update({ email: 'admin@localhost.org' }),
			).toMatchSpecificSnapshot(fileName('siteSettings-update'))
		})
	})
	describe('.status', () => {
		it('unauthenticated', async () => {
			expect(await noAuthClient.status()).toMatchSpecificSnapshot(
				fileName('status'),
			)
		})
		it('authenticated', async () => {
			expect(await client.status()).toMatchSpecificSnapshot(
				fileName('status-authenticated'),
			)
		})
	})
	describe('.taxonomy', () => {
		it('.find (all)', async () => {
			expect(await client.taxonomy()).toMatchSpecificSnapshot(
				fileName('find_all', 'taxonomy'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.taxonomy('category')).toMatchSpecificSnapshot(
				fileName('find_one', 'taxonomy'),
			)
		})
	})
	it('.theme', async () => {
		expect(await client.theme()).toMatchSpecificSnapshot(fileName('theme'))
	})
	describe('.user', () => {
		let i = 0
		let newUserId = 0
		const mockUsername = 'mockuser'
		const mockEmail = 'mock@email.com'
		const mockPassword = 'Mock_Password1'

		afterEach(async () => {
			i++
			if (newUserId) await client.user().delete(1, newUserId)
			newUserId = 0
		})

		it('.create', async () => {
			const response = await client.user().create({
				email: String(i) + mockEmail,
				name: mockTitle.rendered,
				password: mockPassword,
				username: mockUsername + String(i),
			})
			newUserId = response!.id
			expect(response).toMatchSpecificSnapshot(fileName('create', 'user'))
		})
		it('.delete', async () => {
			const response = await client.user().create({
				email: String(i) + mockEmail,
				name: mockTitle.rendered,
				password: mockPassword,
				username: mockUsername + String(i),
			})
			expect(
				await client.user().delete(1, response!.id),
			).toMatchSpecificSnapshot(fileName('delete', 'user'))
		})
		it('.deleteMe', async () => {
			const password = mockPassword
			const username = mockUsername + String(i)
			await client.user().create({
				name: mockTitle.rendered,
				email: String(i) + mockEmail,
				password,
				username,
				roles: ['administrator'],
			})
			const newClient = new WpApiClient('http://localhost:8080', {
				auth: { type: 'basic', username, password },
			})
			expect(await newClient.user().deleteMe(1)).toMatchSpecificSnapshot(
				fileName('deleteMe', 'user'),
			)
		})
		it('.find (all)', async () => {
			const response = await client.user().create({
				email: String(i) + mockEmail,
				name: mockTitle.rendered,
				password: mockPassword,
				username: mockUsername + String(i),
			})
			newUserId = response!.id
			expect(await client.user().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'user'),
			)
		})
		it('.find (one)', async () => {
			const response = await client.user().create({
				email: String(i) + mockEmail,
				name: mockTitle.rendered,
				password: mockPassword,
				username: mockUsername + String(i),
			})
			newUserId = response!.id
			expect(await client.user().find(newUserId)).toMatchSpecificSnapshot(
				fileName('find_one', 'user'),
			)
		})
		it('.find (me)', async () => {
			expect(await client.user().findMe()).toMatchSpecificSnapshot(
				fileName('find_me', 'user'),
			)
		})
		it('.update', async () => {
			const response = await client.user().create({
				name: mockTitle.rendered,
				email: String(i) + mockEmail,
				password: mockPassword,
				username: mockUsername + String(i),
			})
			newUserId = response!.id
			expect(
				await client.user().update(
					{
						name: mockUpdatedTitle.rendered,
						password: mockPassword,
					},
					newUserId,
				),
			).toMatchSpecificSnapshot(fileName('update', 'user'))
		})
	})
})
