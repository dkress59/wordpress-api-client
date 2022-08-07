import 'jest-specific-snapshot'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
	})

	describe('.postCategory', () => {
		let newCategoryId: number | undefined

		afterEach(async () => {
			if (newCategoryId) await client.postCategory().delete(newCategoryId)
			newCategoryId = 0
		})

		it('.create', async () => {
			const currentLength = (await client.postCategory().find()).length
			const response = await client
				.postCategory()
				.create({ name: mockTitle.rendered })
			newCategoryId = response?.id
			expect((await client.postCategory().find()).length).toBe(
				currentLength + 1,
			)
		})
		it('.delete', async () => {
			const response = await client
				.postCategory()
				.create({ name: mockTitle.rendered })
			const currentLength = (await client.postCategory().find()).length
			await client.postCategory().delete(response!.id)
			expect((await client.postCategory().find()).length).toBe(
				currentLength - 1,
			)
		})
		it('.find (all)', async () => {
			await client.postCategory().create({ name: mockTitle.rendered })
			expect((await client.postCategory().find()).length > 1).toBe(true)
		})
		it('.find (one)', async () => {
			const allCategories = await client.postCategory().find()
			expect(
				await client.postCategory().find(allCategories[0]!.id),
			).toEqual([allCategories[0]])
		})
		it('.update', async () => {
			const mockTitle2 = 'mock-title'
			const mockUpdatedTitle2 = 'mock-title-2'
			const response = await client.postCategory().create({
				name: mockTitle2,
			})
			newCategoryId = response?.id
			expect(
				(await client.postCategory().update(
					{
						name: mockUpdatedTitle2,
					},
					response!.id,
				))!.name,
			).toEqual(mockUpdatedTitle2)
		})
	})
})
