import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const mockContent = {
	rendered: '<p>Mock Content</p>',
	protected: false,
}
const mockUpdatedContent = {
	rendered: '<p>Updated Content</p>',
}

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
})
