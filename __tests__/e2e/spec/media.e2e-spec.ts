import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockPng = fs.readFileSync(path.resolve(__dirname, '../png.png'))
const mockJpg = fs.readFileSync(path.resolve(__dirname, '../jpg.jpg'))

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
})
