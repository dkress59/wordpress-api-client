import 'jest-specific-snapshot'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockContent = {
	rendered: '<p>Mock Content</p>',
	protected: false,
}
const mockUpdatedTitle = { rendered: 'Updated Title' }
const mockRawContent = { raw: mockContent.rendered, protected: false }
const mockRawTitle = { raw: mockTitle.rendered, protected: false }

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
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
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			const response2 = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			expect((await client.reusableBlock().find()).length > 1).toBe(true)

			await client.reusableBlock().delete(response!.id)
			await client.reusableBlock().delete(response2!.id)
		})
		it('.find (one)', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
			expect(
				(await client.reusableBlock().find(newBlockId))[0]!.slug,
			).toEqual(response!.slug)
		})
		it('.create', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
			expect(response?.title.raw).toEqual(mockRawTitle.raw)
		})
		it('.update', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			newBlockId = response!.id
			expect(
				(await client
					.reusableBlock()
					.update(
						{ title: { raw: mockUpdatedTitle.rendered } },
						newBlockId,
					))!.title,
			).toEqual({
				raw: mockUpdatedTitle.rendered,
			})
		})
		it('.delete', async () => {
			const response = await client.reusableBlock().create({
				content: mockRawContent,
				title: mockRawTitle,
				status: 'publish',
			})
			expect(
				(await client.reusableBlock().delete(response!.id))[0]!.id,
			).toEqual(response!.id)
		})
	})
})
