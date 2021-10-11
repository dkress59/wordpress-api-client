import { AxiosInstance } from 'axios'
import { END_POINT } from '../src/constants'
import { WPCreate, WPPage, WPPost } from '../src/types'
import { WPPageFactory, WPPostFactory } from '../src/factories'
import { getDefaultQueryList, getDefaultQuerySingle } from '../src/util'
import WpApiClient from '../src'
import mockAxios from 'jest-mock-axios'

const mockPage = WPPageFactory.buildSync()
const mockPageCreate: WPCreate<WPPage> = {
	...mockPage,
	content: mockPage.content.rendered,
	excerpt: mockPage.excerpt.rendered,
	title: mockPage.title.rendered,
}

const mockPost = WPPostFactory.buildSync()
const mockPostCreate: WPCreate<WPPost> = {
	...mockPost,
	content: mockPost.content.rendered,
	excerpt: mockPost.excerpt.rendered,
	title: mockPost.title.rendered,
}

const EP_CUSTOM_GET = 'mock/custom/get'
const EP_CUSTOM_POST = 'mock/custom/post'
class MockClient extends WpApiClient {
	constructor() {
		super(
			'http://mock.url',
			undefined,
			instance as unknown as AxiosInstance,
		)
	}

	customGet = this.createEndpointCustomGet(EP_CUSTOM_GET)

	customPost = this.createEndpointCustomPost(EP_CUSTOM_POST)
}

const instance = mockAxios.create()
const client = new MockClient()

describe('WpApiClient', () => {
	describe('helper methods', () => {
		describe('createEndpointGet', () => {
			it('.findAll returns empty array if response is undefined', async () => {
				mockAxios.get.mockResolvedValueOnce({ data: null })
				expect(await client.page().findAll()).toEqual([])
			})
			it('.findAll returns data field of succesful AxiosResponse', async () => {
				const mockData = 'mock_data'
				mockAxios.get.mockResolvedValueOnce({ data: mockData })
				expect(await client.page().findAll()).toEqual(mockData)
			})
			it('.findOne returns data field of succesful AxiosResponse', async () => {
				const mockData = 'mock_data'
				mockAxios.get.mockResolvedValueOnce({ data: mockData })
				expect(await client.page().findOne(123)).toEqual(mockData)
			})
		})
		describe('createEndpointPost', () => {
			it('.create returns data field of succesful AxiosResponse', async () => {
				const mockData = 'mock_data'
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.page().create(mockPageCreate)).toEqual(
					mockData,
				)
			})
			it('.update returns data field of succesful AxiosResponse', async () => {
				const mockData = 'mock_data'
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.page().update(mockPageCreate, 123)).toEqual(
					mockData,
				)
			})
		})
		describe('createEndpointCustomGet', () => {
			it('calls the correct endpoint', () => {
				client.customGet()
				expect(mockAxios.get).toHaveBeenCalledWith(`/${EP_CUSTOM_GET}`)
			})
			it('returns data field of succesful AxiosResponse', async () => {
				const mockData = 'mock_data'
				mockAxios.get.mockResolvedValueOnce({ data: mockData })
				expect(await client.customGet()).toEqual(mockData)
			})
		})
		describe('createEndpointCustomPost', () => {
			it('calls the correct endpoint with correct body', () => {
				client.customPost('any')
				expect(mockAxios.post).toHaveBeenCalledWith(
					`/${EP_CUSTOM_POST}`,
					'any',
				)
			})
			it('returns data field of succesful AxiosResponse', async () => {
				const mockData = 'mock_data'
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.customPost('any')).toEqual(mockData)
			})
		})
	})
	describe('default methods', () => {
		describe('page', () => {
			describe('findAll', () => {
				it('calls the correct endpoint', () => {
					client.page().findAll()
					expect(mockAxios.get).toHaveBeenCalledWith(
						`/${END_POINT.PAGES}/${getDefaultQueryList()}`,
					)
				})
			})
			it('findOne calls the correct endpoint', () => {
				client.page().findOne(123)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`/${END_POINT.PAGES}/123/${getDefaultQuerySingle()}`,
				)
			})
			it('create calls the correct endpoint', () => {
				client.page().create(mockPageCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`/${END_POINT.PAGES}`,
					mockPageCreate,
				)
			})
			it('update calls the correct endpoint', () => {
				const mockPage = WPPageFactory.buildSync()
				const mockPageCreate: WPCreate<WPPage> = {
					...mockPage,
					content: mockPage.content.rendered,
					excerpt: mockPage.excerpt.rendered,
					title: mockPage.title.rendered,
				}
				client.page().update(mockPageCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`/${END_POINT.PAGES}/123`,
					mockPageCreate,
				)
			})
		})
		describe('post', () => {
			describe('findAll', () => {
				it('calls the correct endpoint', () => {
					client.post().findAll()
					expect(mockAxios.get).toHaveBeenCalledWith(
						`/${END_POINT.POSTS}/${getDefaultQueryList()}`,
					)
				})
			})
			it('findOne calls the correct endpoint', () => {
				client.post().findOne(123)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`/${END_POINT.POSTS}/123/${getDefaultQuerySingle()}`,
				)
			})
			it('create calls the correct endpoint', () => {
				client.post().create(mockPostCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`/${END_POINT.POSTS}`,
					mockPostCreate,
				)
			})
			it('update calls the correct endpoint', () => {
				const mockPost = WPPostFactory.buildSync()
				const mockPostCreate: WPCreate<WPPost> = {
					...mockPost,
					content: mockPost.content.rendered,
					excerpt: mockPost.excerpt.rendered,
					title: mockPost.title.rendered,
				}
				client.post().update(mockPostCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`/${END_POINT.POSTS}/123`,
					mockPostCreate,
				)
			})
		})
	})
})
