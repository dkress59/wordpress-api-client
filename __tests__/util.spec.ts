import { ERROR_MESSAGE } from '../src/constants'
import { URLSearchParams } from 'url'
import {
	getDefaultQueryList,
	getDefaultQuerySingle,
	handleWpApiError,
	validateBaseUrl,
} from '../src/util'
import chalk from 'chalk'

const mockError = 'mock_error'
const onError = (error: string) => {
	throw new Error(error)
}

describe('util', () => {
	describe('handleWpApiError', () => {
		it('logs error to console, by default', () => {
			// eslint-disable-next-line no-console
			const originalError = console.error
			const mockConsoleError = jest.fn()
			// eslint-disable-next-line no-console
			console.error = mockConsoleError
			handleWpApiError(null)
			expect(mockConsoleError).toHaveBeenCalledWith(
				chalk.blue(ERROR_MESSAGE.GENERIC),
			)
			// eslint-disable-next-line no-console
			console.error = originalError
		})
		it('uses onError, if provided, instead of console.error', () => {
			let error = ''
			function onError(message: string) {
				error = message
			}
			expect(() =>
				handleWpApiError(() => 'return_value', onError),
			).not.toThrow()
			expect(error).toBe(ERROR_MESSAGE.GENERIC)
		})
		it('uses AxiosError, if detected', () => {
			const mockUrl = 'mock_url'
			expect(() =>
				handleWpApiError(
					{
						config: { url: mockUrl },
						isAxiosError: true,
						response: { data: { message: mockError } },
					},
					onError,
				),
			).toThrow(
				ERROR_MESSAGE.ERROR_RESPONSE.replace(
					'%error%',
					'"' + mockError + '"',
				).replace('%url%', mockUrl),
			)
		})
		it('uses generic error if no error info provided', () => {
			expect(() => handleWpApiError(null, onError)).toThrow(
				ERROR_MESSAGE.GENERIC,
			)
		})
		it('uses generic error if provided error cannot be handled', () => {
			expect(() =>
				handleWpApiError(() => 'mock_string', onError),
			).toThrow(ERROR_MESSAGE.GENERIC)
		})
		it('handles error typeof string', () => {
			expect(() => handleWpApiError(mockError, onError)).toThrow(
				mockError,
			)
		})
		it('pulls error details from AxiosResponse, if provided', () => {
			const errorObject = {
				response: {
					error: mockError,
				},
			}
			expect(() => handleWpApiError(errorObject, onError)).toThrow(
				mockError,
			)
		})
		it('pulls error details from error object, if no AxiosResponse provided', () => {
			const errorObject = {
				error: mockError,
			}
			expect(() => handleWpApiError(errorObject, onError)).toThrow(
				mockError,
			)
		})
		it('looks for message field, if no error field provided', () => {
			const errorObject = {
				message: mockError,
			}
			expect(() => handleWpApiError(errorObject, onError)).toThrow(
				mockError,
			)
		})
		it('looks into AxiosResponse for message field, if no error field provided', () => {
			const errorObject = {
				response: {
					message: mockError,
				},
			}
			expect(() => handleWpApiError(errorObject, onError)).toThrow(
				mockError,
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
})
