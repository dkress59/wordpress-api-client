import 'jest-specific-snapshot'
import { WP_REST_API_Block_Directory_Item } from 'wp-types'
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
const mockImage =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAAsCAMAAACUu/xGAAAAq1BMVEUAAABlZVJlZVKsrJthYU+zs6Grq5ylpZazs6FlZVJfX01lZVJlZVKsrJurq5urq5xlZVKtrZ1lZVJlZVKvr52zs6GysqCoqJeqqpmzs6Grq5xlZVJgYE6zs6Gnp5mrq5yiopRjY1CRkX2rq5yzs6FlZVKRkX2goJKKineRkX2Pj3yrq5yIiHWRkX2RkX2RkX1lZVKRkX2rq5yzs6GoqJdfX02goJKHh3SHh3VrpzVsAAAAMHRSTlMAQIDHx3+Ax0Ag7qBgIA9AEFCPMLOgMO7bYKBQ24+zYNuzkY9wcAXu0oiocPFBMHYlVbK0AAAD3UlEQVRYw6SW7Y6qMBCGB0IkLfKdnB9ocFmjru7HERL03P+VnXY6bdmWjcF9f2inxjydvjMDcHy99zP693oEpTpQYjBR7W4VmzA81GoZCDn/ycrValVmYOJcKBWL1/4HnUEpupLGxOI47iQmDkfc4GEBEFyNQkClzYDKQQs3VmJBufu6G7zRWNMeUzEHUnLVWs/gy9vg4NNB4wUIPOG2h7e8NcV0HRt7QPDxfzTd4ptleB5F6ro3NtsIc7UnjMKKXyuN30ZS+PuLRMW7PN+l2vlhAZ6yqCZmcrm05stfOrwVpvEBaJWStIOpVk/gC8Rb62tjRj25Fx/fEsgqE27cluKB8GR9hDFzeX44CFbmJb9/Cn8w1ldA5tO9VD/gc8FpveTbxfi1LXWOl10Z80c0Yx7/jpyyjRtd9zuxU8ZL8FEYJjZFpg6yIfOpKsf1FJ+EUkzddKkabQ+o0zCcwMN/vZm+uLh4UmW7nptTCBVq5nUF4Y0CgBaNVip18jsPn370909cfX708/gusF3fkQfrKZHXHh45Wi8meRefvfVCfwGOZ9zx8TZ9TjWY2M6vVf4jm8e3WYrDJ1Vj4N3FHwVd6vKFCxefBMFmq7ub6UI7TMZw0SEv8ryPDVaoxPiWufhL/02zY0cm3ZH1VgxIIYa1U/nIibH/EZjjp4M/9w/x9FijbyuqdzOVH+BbWQJxHMupd4pjINhDPKVH1lslBl9g6OKb73j0wmoBHrMj691nsJ0QLn4l0/09nrIm6wv7nGdQqwjGucvPJSWjN4z8aXyBlkfK+i2gmDI/HENGjXA9uPhsUJ22p2OQFg3daaFx0/9qnWBRbOl9hHlvOw3OW/xs4Hf4rcnYzj+OeFOIHj4dtG7/2y+b3IhBGAqjUiQWQ9JI/ErDpop6gcei9z9ZIXHIhLaLSGRW8zYxIuaTZccxqsGfHDXvH4cf37Z4e3ihxVOTp5bf4E8N2u+3PWB2SP7tXsfsFl80rtOeZX/gvz6//7tmnFFzD2mkxnFgL710ToHH1eCcm/LU2aA9m027v+kBH8ipyHbACxAMWaV5I4v2ZgAzIxkUGXIqkn3xrhw4wVe8hoMmOwBmYJMiJy+lHPriNcSyrvgEgUS2h/vl1BcvSqgcZsPbbABrhgdgvhgvS6hIYsPP8MwTVR5SLZA4573xHMpCV7xGZBFmxyProfR64yNCgKh4hygjXIuvpdcbPyEayA2vsEpRHcgl6gtzr8A9ho0RlgQnBPoK4tV45gBfGQZ6KQBDqzRcjdeAqQwHUfYp+SohcQdc1/Ukm4Gw4dV6vqTkM+uQpRv8E2VPF/sPp9xSb2qlGH4AAAAASUVORK5CYII='
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
	// eslint-disable-next-line jest/no-disabled-tests
	describe.skip('.applicationPassword', () => {
		// FixMe: requires SSL
		it('.create', async () => {
			const appId = randomUUID()
			const userId = (await client.user().findMe()).id
			expect(
				await client
					.applicationPassword()
					.create(userId, appId, 'mock-app-name'),
			).toMatchSpecificSnapshot(fileName('create', 'applicationPassword'))
		})
	})
	it('.blockDirectory', async () => {
		expect(
			(
				(await client.blockDirectory(
					' ',
				)) as WP_REST_API_Block_Directory_Item[]
			).map(block => {
				// @ts-ignore
				delete block.active_installs
				// @ts-ignore
				delete block.author_block_count
				// @ts-ignore
				delete block.author_block_rating
				// @ts-ignore
				delete block.description
				// @ts-ignore
				delete block.humanized_updated
				// @ts-ignore
				delete block.last_updated
				// @ts-ignore
				delete block.rating
				// @ts-ignore
				delete block.rating_count
				return block
			}),
		).toMatchSpecificSnapshot(fileName('blockDirectory'))
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
		// FixMe: harden in RL
		let newMediaId: number | undefined

		afterEach(async () => {
			if (newMediaId) await client.media().delete(newMediaId)
			newMediaId = 0
		})

		it('.create', async () => {
			const response = await client
				.media()
				.create(
					'mock_filename.png',
					Buffer.from(mockImage, 'base64'),
					'image/png',
				)
			newMediaId = response.id
			expect(response).toMatchSpecificSnapshot(
				fileName('create', 'media'),
			)
		})
		it('.delete', async () => {
			const response = await client
				.media()
				.create(
					'mock_filename.png',
					Buffer.from(mockImage, 'base64'),
					'image/png',
				)
			expect(
				await client.media().delete(response.id),
			).toMatchSpecificSnapshot(fileName('delete', 'media'))
		})
		it('.find (all)', async () => {
			const response = await client
				.media()
				.create(
					'mock_filename.png',
					Buffer.from(mockImage, 'base64'),
					'image/png',
				)
			newMediaId = response.id
			expect(await client.media().find()).toMatchSpecificSnapshot(
				fileName('find_all', 'media'),
			)
		})
		it('.find (one)', async () => {
			const response = await client
				.media()
				.create(
					'mock_filename.png',
					Buffer.from(mockImage, 'base64'),
					'image/png',
				)
			newMediaId = response.id
			expect(
				await client.media().find(response.id),
			).toMatchSpecificSnapshot(fileName('find_one', 'media'))
		})
		it('.update', async () => {
			const response = await client
				.media()
				.create(
					'mock_filename.png',
					Buffer.from(mockImage, 'base64'),
					'image/png',
				)
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
		// FixMe: Find out what .renderedBlock actually is supposed to do
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
	it('.status', async () => {
		expect(await client.status()).toMatchSpecificSnapshot(
			fileName('status'),
		)
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
