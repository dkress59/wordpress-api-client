import 'jest-specific-snapshot'

import fs from 'fs'
import path from 'path'

import WpApiClient from '../../../src'

const mockTitle = {
	rendered: 'Mock Title',
}
const mockUpdatedTitle = { rendered: 'Updated Title' }

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
