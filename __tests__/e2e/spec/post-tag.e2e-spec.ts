import 'jest-specific-snapshot'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockUpdatedTitle = { rendered: 'Updated Title' }

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
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
			const currentLength = (await client.postTag().find()).length
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			newTagId = response!.id
			expect((await client.postTag().find()).length).toBe(
				currentLength + 1,
			)
		})
		it('.delete', async () => {
			const response = await client.postTag().create({
				name: mockTitle.rendered,
			})
			const currentLength = (await client.postTag().find()).length
			await client.postTag().delete(response!.id)
			expect((await client.postTag().find()).length).toBe(
				currentLength - 1,
			)
		})
		it('.find (all)', async () => {
			//await client.postTag().create({ name: mockTitle.rendered })
			await client.postTag().create({ name: mockTitle.rendered })
			expect((await client.postTag().find()).length > 1).toBe(true)
		})
		it('.find (one)', async () => {
			const allTags = await client.postTag().find()
			expect(await client.postTag().find(allTags[0]!.id)).toEqual([
				allTags[0],
			])
		})
		it('.update', async () => {
			const mockName = 'mock-name-new'
			const mockUpdatedName = 'mock-updated-name-new'
			const response = await client.postTag().create({
				name: mockName,
			})
			newTagId = response?.id
			expect(
				(await client.postTag().update(
					{
						name: mockUpdatedName,
					},
					response!.id,
				))!.name,
			).toEqual(mockUpdatedName)
		})
	})
})
