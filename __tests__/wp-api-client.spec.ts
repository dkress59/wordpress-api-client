import { END_POINT, ERROR_MESSAGE } from '../src/constants'
import { POST_TYPE_MAP, WPPageFactory, WPPostFactory } from '../src/factories'
import {
	RenderedBlockDto,
	WPCategory,
	WPCreate,
	WPMedia,
	WPPage,
	WPPost,
	WPTag,
} from '../src/types'
import { URLSearchParams } from 'url'
import { WP_Post_Type_Name } from 'wp-types'
import { getDefaultQueryList, getDefaultQuerySingle } from '../src/util'
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
			mockAxios.get.mockResolvedValue({ data: mockData })
			mockAxios.get.mockResolvedValueOnce({ data: [mockData] })
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
		describe('.addPostType', () => {
			it('can set default URLSearchParams', async () => {
				class SearchParamsClient extends WpApiClient {
					constructor() {
						super(
							'http://mock.url',
							undefined,
							instance as unknown as AxiosInstance,
						)
					}

					public post<P = WPPost>() {
						return {
							...this.addPostType<P>(
								END_POINT.POSTS,
								true,
								new URLSearchParams({
									mock_param: 'mock_value',
									per_page: '10',
								}),
							),
						}
					}
				}
				const mockClient = new SearchParamsClient()
				await mockClient.post().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					'wp/v2/posts/?_embed=true&order=asc&per_page=10&mock_param=mock_value',
				)
			})
		})
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
			it('.find default URLSearchParams can be modified', async () => {
				await client
					.page()
					.find(new URLSearchParams({ mock_param: 'mock_value' }))
				expect(mockAxios.get).toHaveBeenCalledWith(
					'wp/v2/pages/?_embed=true&order=asc&per_page=100&mock_param=mock_value',
				)
			})
			it('.find (one or many) default URLSearchParams can be modified', async () => {
				await client
					.page()
					.find(new URLSearchParams({ mock_param: 'mock_value' }), 59)
				expect(mockAxios.get).toHaveBeenCalledWith(
					'wp/v2/pages/59/?_embed=true&mock_param=mock_value',
				)
			})
			describe('.revision', () => {
				it('.find calls the correct endpoint', () => {
					client.post().revision(1).find()
					expect(mockAxios.get).toHaveBeenCalledWith(
						`${
							END_POINT.POSTS
						}/1/revisions/${getDefaultQueryList()}`,
					)
				})
				it('.find (one or many) calls the correct endpoint', () => {
					client.post().revision(1).find(12, 23)
					expect(mockAxios.get).toHaveBeenCalledWith(
						`${
							END_POINT.POSTS
						}/1/revisions/12/${getDefaultQuerySingle()}`,
					)
					expect(mockAxios.get).toHaveBeenCalledWith(
						`${
							END_POINT.POSTS
						}/1/revisions/23/${getDefaultQuerySingle()}`,
					)
				})
				it('.find returns data field of successful AxiosResponse', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: [mockData] })
					expect(await client.page().revision(1).find()).toEqual([
						mockData,
					])
				})
				it('.find returns data fields of multiple successful AxiosResponses', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: mockData })
					mockAxios.get.mockResolvedValueOnce({
						data: mockData2,
					})
					expect(await client.page().revision(1).find(1, 2)).toEqual([
						mockData,
						mockData2,
					])
				})
				it('.find returns empty array, if response without ID is undefined', async () => {
					mockAxios.get.mockResolvedValueOnce({ data: null })
					expect(await client.page().revision(1).find()).toEqual([])
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
				const mockPageId = 123
				const mockPage = WPPageFactory.buildSync()
				const mockPageCreate: WPCreate<WPPage> = {
					...mockPage,
					content: mockPage.content.rendered,
					excerpt: mockPage.excerpt.rendered,
					title: mockPage.title.rendered,
				}
				client.page().update(mockPageCreate, mockPageId)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.PAGES}/${mockPageId}`,
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
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.BLOCK_TYPES}`,
				)
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
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.BLOCK_DIRECTORY}`,
				)
			})
		})
		describe('.status', () => {
			it('calls the correct endpoint by default', () => {
				client.status()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.STATUSES}`,
				)
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
		describe('.plugin', () => {
			const mockPlugin = 'mock_plugin'
			it('.find calls the correct endpoint by default', () => {
				client.plugin().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.PLUGINS}`,
				)
			})
			it('.find calls the correct endpoint for specific plugin', () => {
				client.plugin().find(mockPlugin)
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.PLUGINS}/${mockPlugin}`,
				)
			})
			it('.create calls the correct endpoint', () => {
				client.plugin().create(mockPlugin)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.PLUGINS}`,
					{ plugin: mockPlugin, status: 'inactive' },
				)
			})
			it('.create can activate plugins', () => {
				client.plugin().create(mockPlugin, 'active')
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.PLUGINS}`,
					{ plugin: mockPlugin, status: 'active' },
				)
			})
			it('.create returns data field of successful AxiosResponse', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.plugin().create(mockPlugin)).toEqual(
					mockData,
				)
			})
			it('.update calls the correct endpoint', () => {
				client.plugin().update(mockPlugin)
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.PLUGINS}/${mockPlugin}`,
					{ context: 'view', status: 'inactive' },
				)
			})
			it('.update returns data field of successful AxiosResponse', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(await client.plugin().update(mockPlugin)).toEqual(
					mockData,
				)
			})
			it('.delete calls the correct endpoint', () => {
				client.plugin().delete(mockPlugin)
				expect(mockAxios.delete).toHaveBeenCalledWith(
					`${END_POINT.PLUGINS}/${mockPlugin}`,
				)
			})
			it('.delete returns data field of successful AxiosResponse', async () => {
				mockAxios.delete.mockResolvedValueOnce({ data: mockData })
				expect(await client.plugin().delete(mockPlugin)).toEqual(
					mockData,
				)
			})
		})
		describe('.reusableBlock', () => {
			it('.find calls the correct endpoint', () => {
				client.reusableBlock().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.EDITOR_BLOCKS}/${getDefaultQueryList()}`,
				)
			})
		})
		describe('.taxonomy', () => {
			it('.find calls the correct endpoint', () => {
				client.taxonomy().find()
				expect(mockAxios.get).toHaveBeenCalledWith(
					`${END_POINT.TAXONOMIES}/${getDefaultQueryList()}`,
				)
			})
		})
		describe('.renderedBlock', () => {
			const mockBlockName = 'mock_block_name'
			const mockPostId = 123
			it('calls the correct endpoint', () => {
				client.renderedBlock({
					name: mockBlockName,
					postId: mockPostId,
				})
				expect(mockAxios.post).toHaveBeenCalledWith(
					`${END_POINT.BLOCK_RENDERER}/${mockBlockName}`,
					{
						attributes: [],
						context: 'view',
						name: mockBlockName,
						post_id: mockPostId,
					},
				)
			})
			it('returns data field of successful AxiosResponse', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				expect(
					await client.renderedBlock({
						name: mockBlockName,
						postId: mockPostId,
					}),
				).toEqual(mockData)
			})
			it('takes arguments', async () => {
				mockAxios.post.mockResolvedValueOnce({ data: mockData })
				const body: RenderedBlockDto = {
					name: mockBlockName,
					postId: mockPostId,
					attributes: ['some_attribute'],
					context: 'edit',
				}
				await client.renderedBlock(body)
				// @ts-ignore
				body.post_id = body.postId
				delete (body as { postId?: number }).postId
				expect(mockAxios.post).toHaveBeenCalledWith(
					END_POINT.BLOCK_RENDERER + '/mock_block_name',
					body,
				)
			})
		})
		describe('.theme', () => {
			it('calls the correct endpoint', () => {
				client.theme()
				expect(mockAxios.get).toHaveBeenCalledWith(END_POINT.THEMES)
			})
			it('returns data field of successful AxiosResponse', async () => {
				mockAxios.get.mockResolvedValueOnce({ data: [mockData] })
				expect(await client.theme()).toEqual([mockData])
			})
		})
	})
})
