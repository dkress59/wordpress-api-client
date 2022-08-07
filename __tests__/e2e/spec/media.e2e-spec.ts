import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockPng = fs.readFileSync(path.resolve(__dirname, '../png.png'))
const mockJpg = fs.readFileSync(path.resolve(__dirname, '../jpg.jpg'))

describe('End-to-end test', () => {
	const client = new WpApiClient('http://localhost:8080', {
		auth: {
			type: 'basic',
			password: 'password',
			username: 'admin',
		},
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
				expect(response.title.rendered).toEqual(
					mockFilename.split('.')[0],
				)
			})
			it('custom mime-type', async () => {
				const response = await client
					.media()
					.create(mockFilename, mockPng, mockMimeType)
				newMediaId = response.id
				expect(response.media_type).toEqual(mockMimeType.split('/')[0])
			})
			it('with update', async () => {
				const mockAlText = 'mock alt-text'
				const response = await client
					.media()
					.create(mockFilename, mockJpg, undefined, {
						alt_text: mockAlText,
						title: mockTitle,
						slug: 'mock_slug',
					})
				newMediaId = response.id
				expect(response.alt_text).toEqual(mockAlText)
			})
		})
		it('.delete', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			const deleted = await client.media().delete(response.id)
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(deleted[0].deleted).toBe(true)
		})
		it('.find (all)', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			const response2 = await client
				.media()
				.create('2' + mockFilename, mockJpg)
			newMediaId = response.id
			expect((await client.media().find()).length > 1).toBe(true)

			await client.media().delete(response2.id)
		})
		it('.find (one)', async () => {
			const response = await client.media().create(mockFilename, mockJpg)
			newMediaId = response.id
			expect((await client.media().find(response.id))[0]!.id).toEqual(
				response.id,
			)
		})
		it('.update', async () => {
			const created = await client.media().create(mockFilename, mockJpg)
			newMediaId = created.id
			const mockCaption = 'Mock Caption'
			const updated = await client
				.media()
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.update({ caption: mockCaption }, created.id)
			expect(updated!.caption.raw).toEqual(mockCaption)
		})
	})
})
