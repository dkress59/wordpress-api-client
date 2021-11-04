import { END_POINT, ERROR_MESSAGE } from '../src/constants'
import { POST_TYPE_MAP, WPPageFactory } from '../src/factories'
import { URLSearchParams } from 'url'
import { WPPost } from '../src/types'
import { WP_Post_Type_Name } from 'wp-types'
import { getDefaultQueryList, getDefaultQuerySingle } from '../src/util'
import WpApiClient from '../src'
import fetch from 'cross-fetch'
jest.mock('cross-fetch', () => jest.fn())

const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockJson = jest.fn() as jest.MockedFunction<any>
const mockText = jest.fn() as jest.MockedFunction<any>

const defaultOptions = { body: undefined, headers: {}, method: 'get' }
const mockBaseURL = 'http://mock.url'

const mockData = {
	content: 'mock_data',
	title: 'mock_data',
	type: WP_Post_Type_Name.post,
}
const mockData2 = { ...mockData, title: mockData.title + '2' }

const mockPage = WPPageFactory.buildSync()

const EP_CUSTOM_GET = 'mock/custom/get'
const EP_CUSTOM_POST = 'mock/custom/post'
class MockClient extends WpApiClient {
	constructor() {
		super(mockBaseURL)
	}

	customGetMethod = this.createEndpointCustomGet(EP_CUSTOM_GET)
	customPostMethod = this.createEndpointCustomPost(EP_CUSTOM_POST)
}

const client = new MockClient()

describe('WpApiClient', () => {
	beforeEach(() => {
		mockJson.mockResolvedValue(mockData)
		mockText.mockResolvedValue(JSON.stringify(mockData))
		mockFetch.mockReset()
		mockFetch.mockResolvedValue({
			ok: true,
			json: mockJson,
			text: mockText,
		} as Response)
	})
	describe('collection', () => {
		beforeEach(() => {
			MockClient.clearCollection()
		})
		it('sets up correctly', () => {
			POST_TYPE_MAP.forEach(postType =>
				expect(MockClient.collect(postType)).toEqual([]),
			)
		})
		it('is extendable', () => {
			MockClient.addCollection('order', 'product')
			expect(MockClient.collect('order')).toEqual([])
			expect(MockClient.collect('product')).toEqual([])
			expect(MockClient.collect('undefined')).toBeUndefined()
		})
		it('is stored correctly', async () => {
			mockJson.mockResolvedValueOnce([mockData])
			await new MockClient().post().find()
			await new MockClient().post().find(1)
			await new MockClient().post().find(2, 3)
			expect(MockClient.collect(WP_Post_Type_Name.post)).toEqual([
				mockData,
				mockData,
				mockData,
				mockData,
			])
			expect(MockClient.collect(WP_Post_Type_Name.attachment)).toEqual([])
		})
		it('can be cleared', async () => {
			await new MockClient().post().find(2, 3)
			MockClient.clearCollection()
			expect(MockClient.collect(WP_Post_Type_Name.post)).toEqual([])
		})
		it('can be cleared partially', async () => {
			mockJson.mockResolvedValueOnce({
				...mockData,
				type: WP_Post_Type_Name.page,
			})
			await new MockClient().post().find(1)
			await new MockClient().page().find(2)
			MockClient.clearCollection(WP_Post_Type_Name.page)
			expect(MockClient.collect(WP_Post_Type_Name.post)).toEqual([
				mockData,
			])
			expect(MockClient.collect(WP_Post_Type_Name.page)).toEqual([])
		})
	})
	describe('helper methods', () => {
		describe('.addPostType', () => {
			it('can set default URLSearchParams', async () => {
				class SearchParamsClient extends WpApiClient {
					constructor() {
						super(mockBaseURL)
					}

					public post<P = WPPost>() {
						return this.addPostType<P>(
							END_POINT.POSTS,
							true,
							new URLSearchParams({
								mock_param: 'mock_value',
								per_page: '10',
							}),
						)
					}
				}
				const mockClient = new SearchParamsClient()
				await mockClient.post().revision(1).find()
				expect(mockFetch).toHaveBeenCalledWith(
					mockBaseURL +
						`/wp-json/${END_POINT.POSTS}/1/revisions/?_embed=true&order=asc&per_page=10&mock_param=mock_value`,
					{ ...defaultOptions, method: 'get' },
				)
			})
		})
		describe('.createEndpointGet', () => {
			it('.find returns empty array, if response without ID is undefined', async () => {
				mockJson.mockResolvedValueOnce(null)
				expect(await client.page().find()).toEqual([])
			})
			it('.find default URLSearchParams can be modified', async () => {
				await client
					.page()
					.find(new URLSearchParams({ mock_param: 'mock_value' }))
				expect(mockFetch).toHaveBeenCalledWith(
					mockBaseURL +
						`/wp-json/${END_POINT.PAGES}/?_embed=true&order=asc&per_page=100&mock_param=mock_value`,
					{ ...defaultOptions, method: 'get' },
				)
			})
			it('.find (one or many) default URLSearchParams can be modified', async () => {
				await client
					.page()
					.find(new URLSearchParams({ mock_param: 'mock_value' }), 59)
				expect(mockFetch).toHaveBeenCalledWith(
					mockBaseURL +
						`/wp-json/${END_POINT.PAGES}/59/?_embed=true&mock_param=mock_value`,
					{ ...defaultOptions, method: 'get' },
				)
			})
			describe('.revision', () => {
				it('.find calls the correct endpoint', () => {
					client.post().revision(1).find()
					expect(mockFetch).toHaveBeenCalledWith(
						`${mockBaseURL}/wp-json/${
							END_POINT.POSTS
						}/1/revisions/${getDefaultQueryList()}`,
						{ ...defaultOptions, method: 'get' },
					)
				})
				it('.find (one or many) calls the correct endpoint', () => {
					client.post().revision(1).find(12, 23)
					expect(mockFetch).toHaveBeenCalledWith(
						`${mockBaseURL}/wp-json/${
							END_POINT.POSTS
						}/1/revisions/12/${getDefaultQuerySingle()}`,
						{ ...defaultOptions, method: 'get' },
					)
					expect(mockFetch).toHaveBeenCalledWith(
						`${mockBaseURL}/wp-json/${
							END_POINT.POSTS
						}/1/revisions/23/${getDefaultQuerySingle()}`,
						{ ...defaultOptions, method: 'get' },
					)
				})
				it('.find returns empty array, if response without ID is undefined', async () => {
					mockJson.mockResolvedValueOnce(null)
					expect(await client.page().revision(1).find()).toEqual([])
				})
			})
		})
		describe('.createEndpointPost', () => {
			it('.create returns data field of successful AxiosResponse', async () => {
				expect(await client.page().create(mockPage)).toEqual(mockData)
			})
			it('.update returns data field of successful AxiosResponse', async () => {
				expect(await client.page().update(mockPage, 123)).toEqual(
					mockData,
				)
			})
		})
		describe('.createEndpointDelete', () => {
			it('.create returns data field of successful AxiosResponse', async () => {
				expect(await client.page().delete(1)).toEqual([mockData])
			})
			it('throws if no ID provided', async () => {
				await expect(client.page().delete()).rejects.toThrow(
					ERROR_MESSAGE.ID_REQUIRED,
				)
			})
		})
		describe('.createEndpointCustomGet', () => {
			it('calls the correct endpoint', () => {
				client.customGetMethod()
				expect(mockFetch).toHaveBeenCalledWith(
					`${mockBaseURL}/wp-json/${EP_CUSTOM_GET}`,
					{ ...defaultOptions, headers: undefined },
				)
			})
			it('returns data field of successful AxiosResponse', async () => {
				expect(await client.customGetMethod()).toEqual(mockData)
			})
		})
		describe('.createEndpointCustomPost', () => {
			it('calls the correct endpoint with correct body', () => {
				client.customPostMethod(mockData)
				expect(mockFetch).toHaveBeenCalledWith(
					`${mockBaseURL}/wp-json/${EP_CUSTOM_POST}`,
					{
						...defaultOptions,
						headers: undefined,
						method: 'post',
						body: JSON.stringify(mockData),
					},
				)
			})
			it('returns data field of successful AxiosResponse', async () => {
				expect(await client.customPostMethod(mockData)).toEqual(
					mockData,
				)
			})
		})
	})

	describe('default methods', () => {
		it('.comment returns default entpoints', () => {
			expect(client.comment()).not.toBeNull()
		})
		it('.postCategory returns default entpoints', () => {
			expect(client.postCategory()).not.toBeNull()
		})
		it('.postTag returns default entpoints', () => {
			expect(client.postTag()).not.toBeNull()
		})
		it('.media returns default entpoints', () => {
			expect(client.media()).not.toBeNull()
		})
	})
})
