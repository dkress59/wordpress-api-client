import { END_POINT, ERROR_MESSAGE } from '../src/constants'
import { POST_TYPE_MAP, WPPageFactory, WPPostFactory } from '../src/factories'
import {
	WPCategory,
	WPCreate,
	WPMedia,
	WPPage,
	WPPost,
	WPTag,
} from '../src/types'
import { WP_Post_Type_Name } from 'wp-types'
import { getDefaultQueryList } from '../src/util'
import WpApiClient from '../src'
import axios, { AxiosInstance } from 'axios'
import mockAxios from 'jest-mock-axios'

const mockData = {
	content: 'mock_data',
	title: 'mock_data',
	type: WP_Post_Type_Name.post,
}
const mockData2 = { ...mockData, title: mockData.title + '2' }

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

const mockPostCategoryCreate: WPCreate<WPCategory> = {
	description: 'mock_description',
}
const mockPostTagCreate: WPCreate<WPTag> = {
	description: 'mock_description',
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

	customGetMethod = this.createEndpointCustomGet(EP_CUSTOM_GET)

	customPostMethod = this.createEndpointCustomPost(EP_CUSTOM_POST)
}

const instance = mockAxios.create()
const client = new MockClient()

describe('WpApiClient', () => {
	describe('consctructor', () => {
		it('uses custom AxiosInstance, if provided', () => {
			const mockInstance = axios.create() as unknown as AxiosInstance
			class TestClient extends WpApiClient {
				constructor() {
					super('http://mock-base.url', undefined, mockInstance)
					expect(this.axios).toBe(mockInstance)
				}
			}
			new TestClient()
		})
		it('falls back to new AxiosInstance', () => {
			class TestClient extends WpApiClient {
				constructor() {
					super('http://mock-base.url')
					expect(this.axios).not.toBeNull()
				}
			}
			new TestClient()
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
			mockAxios.get.mockResolvedValueOnce({ data: [mockData] })
			await new MockClient().post().find()
			mockAxios.get.mockResolvedValue({ data: mockData })
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
			mockAxios.get.mockResolvedValue({ data: mockData })
			await new MockClient().post().find(2, 3)
			MockClient.clearCollection()
			expect(MockClient.collect(WP_Post_Type_Name.post)).toEqual([])
		})
		it('can be cleared partially', async () => {
			mockAxios.get.mockResolvedValue({ data: mockData })
			mockAxios.get.mockResolvedValueOnce({
				data: { ...mockData, type: WP_Post_Type_Name.page },
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
		describe('.createEndpointGet', () => {
			it('.find returns data field of successful AxiosResponse', async () => {
				mockAxios.get.mockResolvedValueOnce({ data: [mockData] })
				expect(await client.page().find()).toEqual([mockData])
			})
			it('.find returns data fields of multiple successful AxiosResponses', async () => {
				mockAxios.get.mockResolvedValueOnce({ data: mockData })
				mockAxios.get.mockResolvedValueOnce({
					data: mockData2,
				})
				expect(await client.page().find(1, 2)).toEqual([
					mockData,
					mockData2,
				])
			})
			it('.find returns empty array, if response without ID is undefined', async () => {
				mockAxios.get.mockResolvedValueOnce({ data: null })
				expect(await client.page().find()).toEqual([])
			})
			// eslint-disable-next-line jest/no-disabled-tests
			it.skip('.find returns array containing null, if request with ID throws', async () => {
				const request = client.page().find(123)
				mockAxios.mockError({ data: 'mock_html' })
				expect(await request).toEqual([null])
				mockAxios.reset()
			})
			describe('.revision', () => {
				it('.find returns data field of successful AxiosResponse', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: [mockData] })
					expect(await client.page().revision.find()).toEqual([
						mockData,
					])
				})
				it('.find returns data fields of multiple successful AxiosResponses', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: mockData })
					mockAxios.get.mockResolvedValueOnce({
						data: mockData2,
					})
					expect(await client.page().revision.find(1, 2)).toEqual([
						mockData,
						mockData2,
					])
				})
				it('.find returns empty array, if response without ID is undefined', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: null })
					expect(await client.page().revision.find()).toEqual([])
				})
			})
		})
		describe('.createEndpointPost', () => {
			it('.create returns data field of successful AxiosResponse', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.page().create(mockPageCreate)).toEqual(
					mockData,
				)
			})
			it('.update returns data field of successful AxiosResponse', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.page().update(mockPageCreate, 123)).toEqual(
					mockData,
				)
			})
		})
		describe('.createEndpointDelete', () => {
			it('.create returns data field of successful AxiosResponse', async () => {
				mockAxios.delete.mockResolvedValueOnce({ data: mockData })
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
				expect(mockAxios.get).toHaveBeenCalledWith(`${EP_CUSTOM_GET}`)
			})
			it('returns data field of successful AxiosResponse', async () => {
				mockAxios.get.mockResolvedValueOnce({ data: mockData })
				expect(await client.customGetMethod()).toEqual(mockData)
			})
		})
		describe('.createEndpointCustomPost', () => {
			it('calls the correct endpoint with correct body', () => {
				client.customPostMethod('any')
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${EP_CUSTOM_POST}`,
					'any',
				)
			})
			it('returns data field of successful AxiosResponse', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.customPostMethod('any')).toEqual(mockData)
			})
		})
	})
	describe('default methods', () => {
		describe('.page', () => {
			it('.find calls the correct endpoint', () => {
				client.page().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.PAGES}/${getDefaultQueryList()}`,
				)
			})
			it('.create calls the correct endpoint', () => {
				client.page().create(mockPageCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.PAGES}`,
					mockPageCreate,
				)
			})
			it('.update calls the correct endpoint', () => {
				const mockPage = WPPageFactory.buildSync()
				const mockPageCreate: WPCreate<WPPage> = {
					...mockPage,
					content: mockPage.content.rendered,
					excerpt: mockPage.excerpt.rendered,
					title: mockPage.title.rendered,
				}
				client.page().update(mockPageCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.PAGES}/123`,
					mockPageCreate,
				)
			})
		})
		describe('.post', () => {
			it('.find calls the correct endpoint', () => {
				client.post().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.POSTS}/${getDefaultQueryList()}`,
				)
			})
			it('.create calls the correct endpoint', () => {
				client.post().create(mockPostCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.POSTS}`,
					mockPostCreate,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.post().update(mockPostCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.POSTS}/123`,
					mockPostCreate,
				)
			})
		})
		describe('.media', () => {
			const mockFile = Buffer.from(JSON.stringify(mockData))
			const mockFileName = 'mock_file.name'

			describe('.find', () => {
				it('calls the correct endpoint', () => {
					client.media().find()
					expect(mockAxios.get).toHaveBeenCalledWith(
						`${END_POINT.MEDIA}/${getDefaultQueryList()}`,
					)
				})
				it('returns data field of successful AxiosResponse', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: mockData })
					expect(await client.media().find()).toEqual(mockData)
				})
			})
			describe('.create', () => {
				it('calls the correct endpoint', () => {
					client.media().create(mockFileName, mockFile)
					expect(mockAxios.post).toHaveBeenCalledWith(
						`${END_POINT.MEDIA}`,
						mockFile,
						{
							headers: {
								'Content-Disposition': `application/x-www-form-urlencoded; filename="${mockFileName}"`,
								'Content-Type': 'image/jpeg',
							},
						},
					)
				})
				it('returns data field of successful AxiosResponse', async () => {
					mockAxios.post.mockResolvedValueOnce({ data: mockData })
					expect(
						await client.media().create(mockFileName, mockFile),
					).toEqual(mockData)
				})
				it('throws error if fileName is missing a file extension', async () => {
					const invalidFileName = 'invalid'
					await expect(
						client.media().create(invalidFileName, mockFile),
					).rejects.toThrow(
						ERROR_MESSAGE.INVALID_FILENAME.replace(
							'%fileName%',
							invalidFileName,
						),
					)
				})
				it('can assign a mimeType', () => {
					const mockMimeType = 'test/mock'
					client.media().create(mockFileName, mockFile, mockMimeType)
					expect(mockAxios.post).toHaveBeenCalledWith(
						`${END_POINT.MEDIA}`,
						mockFile,
						{
							headers: {
								'Content-Disposition': `application/x-www-form-urlencoded; filename="${mockFileName}"`,
								'Content-Type': mockMimeType,
							},
						},
					)
				})
			})
			describe('update', () => {
				it('calls the correct endpoint', () => {
					const mockMediaUpdate: WPCreate<WPMedia> = {
						description: 'mock_description',
					}
					client.media().update(mockMediaUpdate, 123)
					expect(mockAxios.post).toHaveBeenCalledWith(
						`${END_POINT.MEDIA}/123`,
						mockMediaUpdate,
					)
				})
				it('returns data field of successful AxiosResponse', async () => {
					mockAxios.post.mockResolvedValueOnce({ data: mockData })
					expect(
						await client.media().create(mockFileName, mockFile),
					).toEqual(mockData)
				})
			})
		})
		describe('.postCategory', () => {
			it('.find calls the correct endpoint', () => {
				client.postCategory().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.CATEGORIES}/${getDefaultQueryList()}`,
				)
			})
			it('.create calls the correct endpoint', () => {
				client.postCategory().create(mockPostCategoryCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.CATEGORIES}`,
					mockPostCategoryCreate,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.postCategory().update(mockPostCategoryCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.CATEGORIES}/123`,
					mockPostCategoryCreate,
				)
			})
		})
		describe('.comment', () => {
			it('.find calls the correct endpoint', () => {
				client.comment().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.COMMENTS}/${getDefaultQueryList()}`,
				)
			})
			it('.create calls the correct endpoint', () => {
				client.comment().create(mockPostTagCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.COMMENTS}`,
					mockPostTagCreate,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.comment().update(mockPostTagCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.COMMENTS}/123`,
					mockPostTagCreate,
				)
			})
		})
		describe('.postTag', () => {
			it('.find calls the correct endpoint', () => {
				client.postTag().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.TAGS}/${getDefaultQueryList()}`,
				)
			})
			it('.create calls the correct endpoint', () => {
				client.postTag().create(mockPostTagCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.TAGS}`,
					mockPostTagCreate,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.postTag().update(mockPostTagCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.TAGS}/123`,
					mockPostTagCreate,
				)
			})
		})
		describe('.user', () => {
			it('.find calls the correct endpoint', () => {
				client.user().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.USERS}/${getDefaultQueryList()}`,
				)
			})
			it('.findMe calls the correct endpoint', () => {
				client.user().findMe()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.USERS}/me`,
				)
			})
			it('.deleteMe calls the correct endpoint', () => {
				client.user().deleteMe()
				expect(mockAxios.delete).toHaveBeenCalledWith(
					`${END_POINT.USERS}/me`,
				)
			})
			it('.deleteMe returns data field of successful AxiosResponse', async () => {
				mockAxios.delete.mockResolvedValueOnce({ data: mockData })
				expect(await client.user().deleteMe()).toEqual(mockData)
			})
			it('.create calls the correct endpoint', () => {
				client.user().create(mockPostTagCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.USERS}`,
					mockPostTagCreate,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.user().update(mockPostTagCreate, 123)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.USERS}/123`,
					mockPostTagCreate,
				)
			})
		})
		describe('.siteSettings', () => {
			it('.find calls the correct endpoint', () => {
				client.siteSettings().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.SETTINGS}`,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.siteSettings().update(mockPostTagCreate)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.SETTINGS}`,
					mockPostTagCreate,
				)
			})
		})
		describe('.postType', () => {
			it('calls the correct endpoint by default', () => {
				client.postType()
				expect(mockAxios.get).toHaveBeenCalledWith(`${END_POINT.TYPES}`)
			})
			it('calls the correct endpoint for specific postType', () => {
				const postType = 'mock_post_type'
				client.postType(postType)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.TYPES}/type/${postType}`,
				)
			})
		})
		describe('.blockType', () => {
			it('calls the correct endpoint by default', () => {
				client.blockType()
				expect(mockAxios.get).toHaveBeenCalledWith(`${END_POINT.BLOCK_TYPES}`)
			})
			it('calls the correct endpoint for specific blockType', () => {
				const blockType = 'mock_block_type'
				client.blockType(blockType)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.BLOCK_TYPES}/${blockType}`,
				)
			})
		})
		describe('.blockDirectory', () => {
			it('calls the correct endpoint', () => {
				client.blockDirectory()
				expect(mockAxios.get).toHaveBeenCalledWith(`${END_POINT.BLOCK_DIRECTORY}`)
			})
		})
		describe('.status', () => {
			it('calls the correct endpoint by default', () => {
				client.status()
				expect(mockAxios.get).toHaveBeenCalledWith(`${END_POINT.STATUSES}`)
			})
			it('calls the correct endpoint for specific status', () => {
				const status = 'mock_status'
				client.status(status)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.STATUSES}/${status}`,
				)
			})
		})
		describe('.search', () => {
			it('calls the correct endpoint', () => {
				client.search()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.SEARCH}/?`,
				)
			})
			it('uses custom params', () => {
				client.search(undefined, {
					per_page: '100',
					mock_custom_param: 'value',
				})
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.SEARCH}/?per_page=100&mock_custom_param=value`,
				)
			})
			it('searches for correct string', () => {
				const searchString = 'url-unsafe search string'
				client.search(searchString)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.SEARCH}/?search=${searchString.replace(
						/\s/g,
						'+',
					)}`,
				)
			})
		})
	})
})
