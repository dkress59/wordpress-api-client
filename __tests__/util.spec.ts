import { ERROR_MESSAGE } from '../src/constants'
import { URLSearchParams } from 'url'
import {
	getDefaultQueryList,
	getDefaultQuerySingle,
	handleWpError,
	isProtected,
	postCreate,
	validateBaseUrl,
} from '../src/util'
import chalk from 'chalk'

describe('util', () => {
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
	describe('handleWpError', () => {
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
		const mockResponse = (error: unknown) => {
			return {
				json: () => error,
				text: () => String(error),
				status: 500,
			}
		}

		it('logs error to console, by default', async () => {
			// eslint-disable-next-line no-console
			const originalError = console.error
			const mockConsoleError = jest.fn()
			// eslint-disable-next-line no-console
			console.error = mockConsoleError
			await expect(handleWpError(null)).rejects.toThrow(
				new Error(ERROR_MESSAGE.GENERIC),
			)
			expect(mockConsoleError).toHaveBeenCalledWith(
				chalk.blue(ERROR_MESSAGE.GENERIC),
			)
			// eslint-disable-next-line no-console
			console.error = originalError
		})
		it('uses onError, if provided, instead of console.error', async () => {
			let error = ''
			function onError(message: string) {
				error = message
			}
			await expect(
				handleWpError(() => 'return_value', onError),
			).rejects.not.toThrow()
			expect(error).toEqual(ERROR_MESSAGE.GENERIC)
		})

		it('response: undefined', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error1)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"undefined"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: null', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error2)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"null"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: "null"', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error3)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"null"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: ""', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error4)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '""')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: new Error()', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error5)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"mock_error"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: error.error', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error6)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"mock_error"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: error.message', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error7)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"mock_error"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: error.message[0]', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error8)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"mock_error"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: boolean', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error9)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"[object Object]"')
						.replace('%status%', '500'),
				),
			)
		})
		it('response: error.mock_key', async () => {
			await expect(
				async () => await handleWpError(mockResponse(error10)),
			).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"[object Object]"')
						.replace('%status%', '500'),
				),
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
		it('transforms `acf` into `fields`', () => {
			expect(postCreate({ acf: { rendered: 'mock_content' } })).toEqual({
				content: undefined,
				excerpt: undefined,
				fields: { rendered: 'mock_content' },
				title: undefined,
			})
		})
	})

	describe('isProtected', () => {
		const mockEndPoint = 'some/protected/route'
		const protectedList = {
			GET: [mockEndPoint],
			POST: [mockEndPoint],
			DELETE: [mockEndPoint],
		}
		describe('GET', () => {
			it('false for public routes', () => {
				expect(
					isProtected(
						'http://mock.url/some/public/route',
						'get',
						protectedList,
					),
				).toBe(false)
			})
			it('true for protected routes', () => {
				expect(
					isProtected(
						'http://mock.url/' + mockEndPoint,
						'get',
						protectedList,
					),
				).toBe(true)
			})
		})
		describe('POST', () => {
			it('false for public routes', () => {
				expect(
					isProtected(
						'http://mock.url/some/public/route',
						'post',
						protectedList,
					),
				).toBe(false)
			})
			it('true for protected routes', () => {
				expect(
					isProtected(
						'http://mock.url/' + mockEndPoint,
						'get',
						protectedList,
					),
				).toBe(true)
			})
		})
		describe('DELETE', () => {
			it('false for public routes', () => {
				expect(
					isProtected(
						'http://mock.url/some/public/route',
						'delete',
						protectedList,
					),
				).toBe(false)
			})
			it('true for protected routes', () => {
				expect(
					isProtected(
						'http://mock.url/' + mockEndPoint,
						'get',
						protectedList,
					),
				).toBe(true)
			})
		})
	})
})
