/* eslint-disable jest/no-disabled-tests */
import 'jest-specific-snapshot'
import { randomUUID } from 'crypto'
import WpApiClient from '../../src'
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

function fileName(name: string) {
	const snapshotPath = path.resolve(process.cwd(), './__snapshots__')
	return path.join(snapshotPath, `e2e-${name}.spec.ts.snapshot`)
}

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})

	describe('.post', () => {
		let newPostId: number | undefined

		afterEach(async () => {
			if (newPostId) await client.post().delete(newPostId)
			newPostId = 0
		})

		it('.find (all)', async () => {
			expect(await client.post().find()).toMatchSpecificSnapshot(
				fileName('post-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.post().find(1)).toMatchSpecificSnapshot(
				fileName('post-find_one'),
			)
		})
		it('.create', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('post-create'))
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
			).toMatchSpecificSnapshot(fileName('post-update'))
		})
		it('.delete', async () => {
			const response = await client.post().create({
				content: mockContent,
				title: mockTitle,
			})
			expect(
				await client.post().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('post-delete'))
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
				fileName('page-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.page().find(2)).toMatchSpecificSnapshot(
				fileName('page-find_one'),
			)
		})
		it('.create', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			newPostId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('page-create'))
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
			).toMatchSpecificSnapshot(fileName('page-update'))
		})
		it('.delete', async () => {
			const response = await client.page().create({
				content: mockContent,
				title: mockTitle,
			})
			expect(
				await client.page().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('page-delete'))
		})
	})
	describe.skip('.applicationPassword', () => {
		// FixMe: requires SSL
		it('.create', async () => {
			const appId = randomUUID()
			const userId = (await client.user().findMe()).id
			expect(
				await client
					.applicationPassword()
					.create(userId, appId, 'mock-app-name'),
			).toMatchSpecificSnapshot(fileName('applicationPassword-create'))
		})
	})
	it.skip('.blockDirectory', async () => {
		// FixMe: wp/v2/block-directory/search: "Missing parameter(s): term" (400)
		expect(await client.blockDirectory()).toMatchSpecificSnapshot(
			fileName('blockDirectory'),
		)
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
			expect(response).toMatchSpecificSnapshot(fileName('comment-create'))
		})
		it('.delete', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			expect(
				await client.comment().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('comment-delete'))
		})
		it('.find (all)', async () => {
			const response = await client.comment().create({
				content: mockContent,
				post: 1,
			})
			newCommentId = response?.id
			expect(await client.comment().find()).toMatchSpecificSnapshot(
				fileName('comment-find_all'),
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
			).toMatchSpecificSnapshot(fileName('comment-find_one'))
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
			).toMatchSpecificSnapshot(fileName('comment-update'))
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
			expect(response).toMatchSpecificSnapshot(fileName('media-create'))
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
			).toMatchSpecificSnapshot(fileName('media-delete'))
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
				fileName('media-find_all'),
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
			).toMatchSpecificSnapshot(fileName('media-find_one'))
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
			).toMatchSpecificSnapshot(fileName('media-update'))
		})
	})
	describe('.plugin', () => {
		jest.setTimeout(30 * 1000)
		it('.create', async () => {
			expect(
				await client
					.plugin()
					.create('advanced-custom-fields', 'active'),
			).toMatchSpecificSnapshot(fileName('plugin-create'))
		})
		it('.delete', async () => {
			expect(
				await client.plugin().delete('akismet/akismet'),
			).toMatchSpecificSnapshot(fileName('plugin-delete'))
		})
		it('.find (all)', async () => {
			expect(await client.plugin().find()).toMatchSpecificSnapshot(
				fileName('plugin-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.plugin().find('hello')).toMatchSpecificSnapshot(
				fileName('plugin-find_one'),
			)
		})
		it('.update', async () => {
			expect(
				await client.plugin().update('hello', 'active'),
			).toMatchSpecificSnapshot(fileName('plugin-update'))
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
				fileName('postCategory-create'),
			)
		})
		it('.delete', async () => {
			const response = await client.postCategory().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.postCategory().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('postCategory-delete'))
		})
		it('.find (all)', async () => {
			expect(await client.postCategory().find()).toMatchSpecificSnapshot(
				fileName('postCategory-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.postCategory().find(1)).toMatchSpecificSnapshot(
				fileName('postCategory-find_one'),
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
			).toMatchSpecificSnapshot(fileName('postCategory-update'))
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
			expect(response).toMatchSpecificSnapshot(fileName('postTag-create'))
		})
		it('.delete', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.postTag().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('postTag-delete'))
		})
		it('.find (all)', async () => {
			expect(await client.postTag().find()).toMatchSpecificSnapshot(
				fileName('postTag-find_all'),
			)
		})
		it('.find (one)', async () => {
			expect(await client.postTag().find(5)).toMatchSpecificSnapshot(
				fileName('postTag-find_one'),
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
			).toMatchSpecificSnapshot(fileName('postTag-update'))
		})
	})
	it('.postType', async () => {
		expect(await client.postType()).toMatchSpecificSnapshot(
			fileName('postType'),
		)
	})
	it.skip('.renderedBlock', async () => {
		// FixMe: Debug .renderedBlock in RL
		expect(
			await client.renderedBlock({
				name: 'mock-rendered-block',
				postId: 1,
			}),
		).toMatchSpecificSnapshot(fileName('renderedBlock'))
	})
	describe('.reusableBlock', () => {
		let newBlockId: number | undefined

		beforeAll(async () => {
			await client.reusableBlock().create({
				content: {
					raw: '<p>Initial Block Content</p>',
					protected: false,
				},
				title: { raw: 'Initial Block' },
			})
		})

		/* afterEach(async () => {
			if (newBlockId) await client.reusableBlock().delete(newBlockId)
			newBlockId = 0
		}) */

		it('.find (all)', async () => {
			expect(await client.reusableBlock().find()).toMatchSpecificSnapshot(
				fileName('reusableBlock-find_all'),
			)
		})
		it.skip('.find (one)', async () => {
			// FixMe: Debug .reusableBlock().find(id) in RL
			expect(
				await client.reusableBlock().find(2),
			).toMatchSpecificSnapshot(fileName('reusableBlock-find_one'))
		})
		it('.create', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
			})
			newBlockId = response?.id
			expect(response).toMatchSpecificSnapshot(
				fileName('reusableBlock-create'),
			)
		})
		it('.update', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
			})
			newBlockId = response?.id
			expect(
				await client
					.reusableBlock()
					.update(
						{ title: { raw: mockUpdatedTitle.rendered } },
						response!.id,
					),
			).toMatchSpecificSnapshot(fileName('reusableBlock-update'))
		})
		it.skip('.delete', async () => {
			// FixMe: Debug .reusableBlock().delete in RL
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
			})
			expect(
				await client.reusableBlock().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('reusableBlock-delete'))
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
		it.skip('.create', async () => {
			// FixMe: Delete this method
			const response = await client.taxonomy().create({
				name: mockTitle.rendered,
			})
			expect(response).toMatchSpecificSnapshot(
				fileName('taxonomy-create'),
			)
		})
		it.skip('.delete', async () => {
			// FixMe: Delete this method
			const response = await client.taxonomy().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.taxonomy().delete(response!.id as number),
			).toMatchSpecificSnapshot(fileName('taxonomy-delete'))
		})
		it('.find (all)', async () => {
			expect(await client.taxonomy().find()).toMatchSpecificSnapshot(
				fileName('taxonomy-find_all'),
			)
		})
		it.skip('.find (one)', async () => {
			// FixMe: "Invalid taxonomy." (404)
			expect(await client.taxonomy().find(1)).toMatchSpecificSnapshot(
				fileName('taxonomy-find_one'),
			)
		})
		it.skip('.update', async () => {
			// FixMe: Delete this method
			const response = await client.taxonomy().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.taxonomy().update(
					{
						name: mockUpdatedTitle.rendered,
					},
					response!.id as number,
				),
			).toMatchSpecificSnapshot(fileName('taxonomy-update'))
		})
	})
	it('.theme', async () => {
		expect(await client.theme()).toMatchSpecificSnapshot(fileName('theme'))
	})
	describe('.user', () => {
		let newUserId: number | undefined

		afterEach(async () => {
			if (newUserId) await client.user().delete(newUserId)
			newUserId = 0
		})

		it.skip('.create', async () => {
			// FixMe: "Missing parameter(s): username, email, password" (400)
			const response = await client.user().create({
				name: mockTitle.rendered,
			})
			newUserId = response?.id
			expect(response).toMatchSpecificSnapshot(fileName('user-create'))
		})
		it.skip('.delete', async () => {
			// FixMe: "Missing parameter(s): username, email, password" (400)
			const response = await client.user().create({
				name: mockTitle.rendered,
			})
			expect(
				await client.user().delete(response!.id),
			).toMatchSpecificSnapshot(fileName('user-delete'))
		})
		it('.find (all)', async () => {
			expect(await client.user().find()).toMatchSpecificSnapshot(
				fileName('user-find_all'),
			)
		})
		it.skip('.find (one)', async () => {
			expect(await client.user().find(5)).toMatchSpecificSnapshot(
				fileName('user-find_one'),
			)
		})
		it('.find (me)', async () => {
			expect(await client.user().findMe()).toMatchSpecificSnapshot(
				fileName('user-find_me'),
			)
		})
		it.skip('.update', async () => {
			// FixMe: "Missing parameter(s): username, email, password" (400)
			const response = await client.user().create({
				name: mockTitle.rendered,
			})
			newUserId = response?.id
			expect(
				await client.user().update(
					{
						name: mockUpdatedTitle.rendered,
					},
					response!.id,
				),
			).toMatchSpecificSnapshot(fileName('user-update'))
		})
		it.skip('.user.deleteMe', async () => {
			// FixMe: "Missing parameter(s): reassign" (400)
			expect(await client.user().deleteMe()).toMatchSpecificSnapshot(
				fileName('user-deleteMe'),
			)
		})
	})
})
