import { AUTH_TYPE } from '../src'
import { ERROR_MESSAGE } from '../src/constants'
import { URLSearchParams } from 'url'
import {
	getDefaultQueryList,
	getDefaultQuerySingle,
	getErrorMessage,
	postCreate,
	useAuth,
	validateBaseUrl,
} from '../src/util'
import { mockResponse, mockStatusText } from './util'

describe('util', () => {
	describe('getErrorMessage', () => {
		const mockError = 'mock_error'
		const error1 = undefined
		const error2 = null
		const error3 = 'null'
		const error4 = ''
		const error5 = new Error(mockError)
		const error6 = {
			error: mockError,
		}
		const error7 = {
			message: mockError,
		}
		const error8 = {
			message: [mockError],
		}
		const error9 = {
			message: undefined,
		}
		const error10 = {
			mock_key: mockError,
		}

		it('response: undefined', async () => {
			expect(await getErrorMessage(mockResponse(error1))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"' + mockStatusText + '"')
					.replace('%status%', '666'),
			)
		})
		it('response: null', async () => {
			expect(await getErrorMessage(mockResponse(error2))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"' + mockStatusText + '"')
					.replace('%status%', '666'),
			)
		})
		it('response: "null"', async () => {
			expect(await getErrorMessage(mockResponse(error3))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"' + mockStatusText + '"')
					.replace('%status%', '666'),
			)
		})
		it('response: ""', async () => {
			expect(await getErrorMessage(mockResponse(error4))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"' + mockStatusText + '"')
					.replace('%status%', '666'),
			)
		})
		it('response: new Error()', async () => {
			expect(await getErrorMessage(mockResponse(error5))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"mock_error"')
					.replace('%status%', '666'),
			)
		})
		it('response: error.error', async () => {
			expect(await getErrorMessage(mockResponse(error6))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"mock_error"')
					.replace('%status%', '666'),
			)
		})
		it('response: error.message', async () => {
			expect(await getErrorMessage(mockResponse(error7))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"mock_error"')
					.replace('%status%', '666'),
			)
		})
		it('response: error.message[0]', async () => {
			expect(await getErrorMessage(mockResponse(error8))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"mock_error"')
					.replace('%status%', '666'),
			)
		})
		it('response: boolean', async () => {
			expect(await getErrorMessage(mockResponse(error9))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"' + mockStatusText + '"')
					.replace('%status%', '666'),
			)
		})
		it('response: error.mock_key', async () => {
			expect(await getErrorMessage(mockResponse(error10))).toEqual(
				ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
					.replace('%error%', '"' + mockStatusText + '"')
					.replace('%status%', '666'),
			)
		})
	})

	describe('validateBaseUrl', () => {
		it('throws Error if protocol is invalid', () => {
			const invalidUrl = 'redis://'
			expect(() => validateBaseUrl(invalidUrl)).toThrow(
				ERROR_MESSAGE.INVALID_BASEURL.replace('%url%', invalidUrl),
			)
		})
		it('does not throw Error for http protocol', () => {
			const validUrl = 'http://some.url'
			expect(() => validateBaseUrl(validUrl)).not.toThrow()
		})
		it('does not throw Error for https protocol', () => {
			const validUrl = 'https://some.url'
			expect(() => validateBaseUrl(validUrl)).not.toThrow()
		})
		it('removes trailing slash, if provided', () => {
			const withTrailingSlash = 'http://localhost:8080/'
			expect(validateBaseUrl(withTrailingSlash)).toEqual(
				withTrailingSlash.substr(0, withTrailingSlash.length - 1),
			)
		})
		it('does not remove trailing slash, if none provided', () => {
			const noTrailingSlash = 'http://localhost:8080'
			expect(validateBaseUrl(noTrailingSlash)).toEqual(noTrailingSlash)
		})
	})

	describe('getDefaultQueryList', () => {
		it('returns default', () => {
			expect(getDefaultQueryList()).toBe(
				'?_embed=true&order=asc&per_page=100',
			)
		})
		it('has overridable defaults', () => {
			expect(
				getDefaultQueryList(new URLSearchParams({ per_page: '12' })),
			).toBe('?_embed=true&order=asc&per_page=12')
		})
		it('can be extended', () => {
			expect(
				getDefaultQueryList(
					new URLSearchParams({ mock_param: 'mock_value' }),
				),
			).toBe('?_embed=true&order=asc&per_page=100&mock_param=mock_value')
		})
	})

	describe('getDefaultQuerySingle', () => {
		it('returns default', () => {
			expect(getDefaultQuerySingle()).toBe('?_embed=true')
		})
		it('has overridable defaults', () => {
			expect(
				getDefaultQuerySingle(new URLSearchParams({ _embed: 'false' })),
			).toBe('?_embed=false')
		})
		it('can be extended', () => {
			expect(
				getDefaultQuerySingle(
					new URLSearchParams({ mock_param: 'mock_value' }),
				),
			).toBe('?_embed=true&mock_param=mock_value')
		})
	})

	describe('postCreate', () => {
		it('transforms `content.raw` into `content`', () => {
			expect(postCreate({ content: { raw: 'mock_content' } })).toEqual({
				content: 'mock_content',
				excerpt: undefined,
				fields: undefined,
				title: undefined,
			})
		})
		it('transforms `content.rendered` into `content`', () => {
			expect(
				postCreate({ content: { rendered: 'mock_content' } }),
			).toEqual({
				content: 'mock_content',
				excerpt: undefined,
				fields: undefined,
				title: undefined,
			})
		})
		it('transforms `excerpt.raw` into `excerpt`', () => {
			expect(postCreate({ excerpt: { raw: 'mock_content' } })).toEqual({
				content: undefined,
				excerpt: 'mock_content',
				fields: undefined,
				title: undefined,
			})
		})
		it('transforms `excerpt.rendered` into `excerpt`', () => {
			expect(
				postCreate({ excerpt: { rendered: 'mock_content' } }),
			).toEqual({
				content: undefined,
				excerpt: 'mock_content',
				fields: undefined,
				title: undefined,
			})
		})
		it('transforms `title.raw` into `title`', () => {
			expect(postCreate({ title: { rendered: 'mock_content' } })).toEqual(
				{
					content: undefined,
					raw: undefined,
					fields: undefined,
					title: 'mock_content',
				},
			)
		})
		it('transforms `title.rendered` into `title`', () => {
			expect(postCreate({ title: { rendered: 'mock_content' } })).toEqual(
				{
					content: undefined,
					excerpt: undefined,
					fields: undefined,
					title: 'mock_content',
				},
			)
		})
	})

	describe('useAuth', () => {
		const mockEndPoint = 'mock/v0/protected'
		const mockPublicEndPoint = 'mock/v0/public'
		const mockMixedEndPoint = 'mock/v0/mixed'
		const protectedList = {
			GET: [mockEndPoint, mockMixedEndPoint],
			POST: [mockEndPoint, mockMixedEndPoint],
			DELETE: [mockEndPoint, mockMixedEndPoint],
		}
		const publicList = {
			GET: [mockPublicEndPoint, mockMixedEndPoint],
			POST: [mockPublicEndPoint, mockMixedEndPoint],
			DELETE: [mockPublicEndPoint, mockMixedEndPoint],
		}
		const mockBaseUrl = 'http://mock.url/'
		const protectedUrl = mockBaseUrl + mockEndPoint
		const publicUrl = mockBaseUrl + mockPublicEndPoint
		const mixedUrl = mockBaseUrl + mockMixedEndPoint
		describe('basic', () => {
			const mockAuthType = AUTH_TYPE.BASIC
			describe('GET', () => {
				it('true for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
			describe('POST', () => {
				it('true for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'post',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
			describe('DELETE', () => {
				it('true for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'delete',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
		})
		describe('jwt', () => {
			const mockAuthType = AUTH_TYPE.JWT
			describe('GET', () => {
				it('false for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
			describe('POST', () => {
				it('false for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'post',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
			describe('DELETE', () => {
				it('false for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'delete',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
		})
		describe('nonce', () => {
			const mockAuthType = AUTH_TYPE.NONCE
			describe('GET', () => {
				it('true for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
			describe('POST', () => {
				it('true for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'post',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
			describe('DELETE', () => {
				it('true for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'delete',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('true for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
			})
		})
		describe('none', () => {
			const mockAuthType = AUTH_TYPE.NONE
			describe('GET', () => {
				it('false for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('false for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
			})
			describe('POST', () => {
				it('false for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'post',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('false for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
			})
			describe('DELETE', () => {
				it('false for public routes', () => {
					expect(
						useAuth(
							publicUrl,
							'delete',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
				it('true for protected routes', () => {
					expect(
						useAuth(
							protectedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(true)
				})
				it('false for mixed routes', () => {
					expect(
						useAuth(
							mixedUrl,
							'get',
							mockAuthType,
							protectedList,
							publicList,
						),
					).toBe(false)
				})
			})
		})
	})
})
