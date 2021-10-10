import { ERROR_MESSAGE } from '../src'
import {
	getDefaultQueryList,
	getDefaultQuerySingle,
	handleWpApiError,
	validateBaseUrl,
} from '../src/util'
const mockError = 'mock_error'

describe('util', () => {
	describe('handleWpApiError', () => {
		it('uses onError, if provided, instead of throwing', () => {
			let error = ''
			function onError(message: string) {
				error = message
			}
			expect(() =>
				handleWpApiError(() => 'return_value', onError),
			).not.toThrow()
			expect(error).toBe(ERROR_MESSAGE.GENERIC)
		})
		it('throws generic error if no error provided', () => {
			expect(() => handleWpApiError(null)).toThrow(ERROR_MESSAGE.GENERIC)
		})
		it('throws generic error if provided error cannot be handled', () => {
			expect(() => handleWpApiError(() => 'return_value')).toThrow(
				ERROR_MESSAGE.GENERIC,
			)
		})
		it('handles error typeof string', () => {
			expect(() => handleWpApiError(mockError)).toThrow(mockError)
		})
		it('pulls error details from AxiosResponse, if provided', () => {
			const errorObject = {
				response: {
					error: mockError,
				},
			}
			expect(() => handleWpApiError(errorObject)).toThrow(mockError)
		})
		it('pulls error details from error object, if no AxiosResponse provided', () => {
			const errorObject = {
				error: mockError,
			}
			expect(() => handleWpApiError(errorObject)).toThrow(mockError)
		})
		it('looks for message field, if no error field provided', () => {
			const errorObject = {
				message: mockError,
			}
			expect(() => handleWpApiError(errorObject)).toThrow(mockError)
		})
		it('looks into AxiosResponse for message field, if no error field provided', () => {
			const errorObject = {
				response: {
					message: mockError,
				},
			}
			expect(() => handleWpApiError(errorObject)).toThrow(mockError)
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
			const validUrl = 'http://'
			expect(() => validateBaseUrl(validUrl)).not.toThrow()
		})
		it('does not throw Error for https protocol', () => {
			const validUrl = 'https://'
			expect(() => validateBaseUrl(validUrl)).not.toThrow()
		})
		it('removes trailing slash, if provided', () => {
			const withTrailingSlash = 'http://localhost:8080/'
			expect(validateBaseUrl(withTrailingSlash)).toBe(
				withTrailingSlash.substr(0, withTrailingSlash.length - 1),
			)
		})
		it('does not remove trailing slash, if none provided', () => {
			const noTrailingSlash = 'http://localhost:8080'
			expect(validateBaseUrl(noTrailingSlash)).toBe(noTrailingSlash)
		})
	})

	describe('getDefaultQueryList', () => {
		it('returns default', () => {
			expect(getDefaultQueryList()).toBe(
				'?_embed=true&order=asc&orderby=menu_order&per_page=100',
			)
		})
		it('has overridable defaults', () => {
			expect(getDefaultQueryList({ per_page: '12' })).toBe(
				'?_embed=true&order=asc&orderby=menu_order&per_page=12',
			)
		})
	})

	describe('getDefaultQuerySingle', () => {
		it('returns default', () => {
			expect(getDefaultQuerySingle()).toBe('?_embed=true')
		})
		it('has overridable defaults', () => {
			expect(getDefaultQuerySingle({ _embed: 'false' })).toBe(
				'?_embed=false',
			)
		})
	})
})
