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
const mockRestBase = mockBaseURL + '/wp-json/'

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
	// eslint-disable-next-line no-console
	const originalError = console.error
	beforeAll(() => {
		// eslint-disable-next-line no-console
		console.error = jest.fn()
	})
	afterAll(() => {
		// eslint-disable-next-line no-console
		console.error = originalError
	})
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
	describe('constructor', () => {
		it('correctly sets headers for basic auth', async () => {
			const password = 'mock_password'
			const username = 'mock_username'
			const client = new WpApiClient(mockBaseURL, {
				auth: {
					type: 'basic',
					password,
					username,
				},
			})
			await client.post().delete(1)
			expect(mockFetch).toHaveBeenCalledWith(
				mockRestBase + END_POINT.POSTS + '/1',
				{
					body: undefined,
					headers: {
						Authorization: `Basic ${Buffer.from(
							username + ':' + password,
						).toString('base64')}`,
					},
					method: 'delete',
				},
			)
		})
		it('correctly sets headers for jwt auth', async () => {
			const client = new WpApiClient(mockBaseURL, {
				auth: {
					type: 'jwt',
					token: 'mock_token',
				},
			})
			await client.post().delete(1)
			expect(mockFetch).toHaveBeenCalledWith(
				mockRestBase + END_POINT.POSTS + '/1',
				{
					body: undefined,
					headers: {
						Authorization: 'Bearer mock_token',
					},
					method: 'delete',
				},
			)
		})
		it('correctly sets headers for nonce auth', async () => {
			const client = new WpApiClient(mockBaseURL, {
				auth: {
					type: 'nonce',
					nonce: 'mock_nonce',
				},
			})
			await client.post().delete(1)
			expect(mockFetch).toHaveBeenCalledWith(
				mockRestBase + END_POINT.POSTS + '/1',
				{
					body: undefined,
					headers: {
						'X-WP-Nonce': 'mock_nonce',
					},
					method: 'delete',
				},
			)
		})
		it('can set/override default headers', async () => {
			const client = new WpApiClient(mockBaseURL, {
				auth: {
					type: 'jwt',
					token: 'mock_token',
				},
				headers: {
					mock_key: 'mock_value',
				},
			})
			await client.post().delete(1)
			expect(mockFetch).toHaveBeenCalledWith(
				mockRestBase + END_POINT.POSTS + '/1',
				{
					body: undefined,
					headers: {
						Authorization: 'Bearer mock_token',
						mock_key: 'mock_value',
					},
					method: 'delete',
				},
			)
		})
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
					defaultOptions,
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
		it('.reusableBlock returns default entpoints', () => {
			expect(client.reusableBlock()).not.toBeNull()
		})
		it('.taxonomy returns default entpoints', () => {
			expect(client.taxonomy()).not.toBeNull()
		})
		describe('.media', () => {
			it('.create', async () => {
				const mockFileName = 'mock.file'
				const data = 'mock_data'
				await client.media().create(mockFileName, Buffer.from(data))
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.MEDIA,
					{
						body: data,
						headers: {
							'Content-Type': 'image/jpeg',
							'Content-Disposition':
								'application/x-www-form-urlencoded; filename="' +
								mockFileName +
								'"',
						},
						method: 'post',
					},
				)
			})
			it('throws invalid filename', async () => {
				const mockFileName = 'mock_file'
				const data = 'mock_data'
				await expect(
					client.media().create(mockFileName, Buffer.from(data)),
				).rejects.toThrow(
					new Error(
						ERROR_MESSAGE.INVALID_FILENAME.replace(
							'%fileName%',
							mockFileName,
						),
					),
				)
			})
		})
		describe('.user', () => {
			it('.findMe', async () => {
				await client.user().findMe()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.USERS_ME,
					defaultOptions,
				)
			})
			it('.deleteMe', async () => {
				await client.user().deleteMe()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.USERS_ME,
					{
						...defaultOptions,
						method: 'delete',
					},
				)
			})
		})
		describe('.siteSettings', () => {
			it('.find', async () => {
				await client.siteSettings().find()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.SETTINGS,
					defaultOptions,
				)
			})
			it('.update', async () => {
				await client.siteSettings().update({ use_smilies: false })
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.SETTINGS,
					{
						...defaultOptions,
						body: JSON.stringify({ use_smilies: false }),
						method: 'post',
					},
				)
			})
		})
		describe('.search', () => {
			it('defaults correctly', async () => {
				await client.search()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.SEARCH + '/?',
					defaultOptions,
				)
			})
			it('searches by string', async () => {
				await client.search('some string')
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.SEARCH + '/?search=some+string',
					defaultOptions,
				)
			})
			it('can modify params', async () => {
				await client.search('some string', { per_page: '10' })
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase +
						END_POINT.SEARCH +
						'/?per_page=10&search=some+string',
					defaultOptions,
				)
			})
		})
		describe('.postType', () => {
			it('list', async () => {
				await client.postType()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.TYPES,
					defaultOptions,
				)
			})
			it('by slug', async () => {
				const mockSlug = 'mock_slug'
				await client.postType(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.TYPES + '/type/' + mockSlug,
					defaultOptions,
				)
			})
		})
		describe('.status', () => {
			it('list', async () => {
				await client.status()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.STATUSES,
					defaultOptions,
				)
			})
			it('by slug', async () => {
				const mockSlug = 'mock_slug'
				await client.status(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.STATUSES + '/' + mockSlug,
					defaultOptions,
				)
			})
		})
		describe('.blockType', () => {
			it('list', async () => {
				await client.blockType()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.BLOCK_TYPES,
					defaultOptions,
				)
			})
			it('by slug', async () => {
				const mockSlug = 'mock_slug'
				await client.blockType(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.BLOCK_TYPES + '/' + mockSlug,
					defaultOptions,
				)
			})
		})
		describe('.blockDirectory', () => {
			it('list', async () => {
				await client.blockDirectory()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.BLOCK_DIRECTORY,
					defaultOptions,
				)
			})
		})
		describe('.renderedBlock', () => {
			it('create (default)', async () => {
				const mockBody = {
					name: 'mock-block',
					postId: 1,
				}
				await client.renderedBlock(mockBody)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase +
						END_POINT.BLOCK_RENDERER +
						'/' +
						mockBody.name,
					{
						...defaultOptions,
						body: JSON.stringify({
							name: mockBody.name,
							post_id: mockBody.postId,
							attributes: [],
							context: 'view',
						}),
						method: 'post',
					},
				)
			})
			it('create (custom)', async () => {
				const mockName = 'mock-block'
				const mockAttribute = 'mock_attribute'
				await client.renderedBlock({
					name: mockName,
					postId: 1,
					attributes: [mockAttribute],
					context: 'edit',
				})
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.BLOCK_RENDERER + '/' + mockName,
					{
						...defaultOptions,
						body: JSON.stringify({
							name: mockName,
							post_id: 1,
							attributes: [mockAttribute],
							context: 'edit',
						}),
						method: 'post',
					},
				)
			})
		})
		describe('.theme', () => {
			it('list', async () => {
				await client.theme()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.THEMES,
					defaultOptions,
				)
			})
		})
		describe('.plugin', () => {
			const mockSlug = 'mock-slug'
			it('.create (inactive)', async () => {
				await client.plugin().create(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS,
					{
						...defaultOptions,
						body: JSON.stringify({
							slug: mockSlug,
							status: 'inactive',
						}),
						method: 'post',
					},
				)
			})
			it('.create (active)', async () => {
				await client.plugin().create(mockSlug, 'active')
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS,
					{
						...defaultOptions,
						body: JSON.stringify({
							slug: mockSlug,
							status: 'active',
						}),
						method: 'post',
					},
				)
			})
			it('.find (list)', async () => {
				await client.plugin().find()
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS,
					{
						...defaultOptions,
						method: 'get',
					},
				)
			})
			it('.find (single)', async () => {
				await client.plugin().find(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS + '/' + mockSlug,
					{
						...defaultOptions,
						method: 'get',
					},
				)
			})
			it('.delete', async () => {
				await client.plugin().delete(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS + '/' + mockSlug,
					{
						...defaultOptions,
						method: 'delete',
					},
				)
			})
			it('.update (default)', async () => {
				await client.plugin().update(mockSlug)
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS + '/' + mockSlug,
					{
						...defaultOptions,
						body: JSON.stringify({
							context: 'view',
							status: 'inactive',
						}),
						method: 'post',
					},
				)
			})
			it('.update (custom)', async () => {
				await client.plugin().update(mockSlug, 'active', 'edit')
				expect(mockFetch).toHaveBeenCalledWith(
					mockRestBase + END_POINT.PLUGINS + '/' + mockSlug,
					{
						...defaultOptions,
						body: JSON.stringify({
							context: 'edit',
							status: 'active',
						}),
						method: 'post',
					},
				)
			})
		})
	})
})
