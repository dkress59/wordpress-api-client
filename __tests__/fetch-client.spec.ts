import { END_POINT_PROTECTED, ERROR_MESSAGE } from '../src/constants'
import { FetchClient } from '../src/fetch-client'
import fetch from 'cross-fetch'
jest.mock('cross-fetch', () => jest.fn())

const mockBaseURL = new URL('http://mock-website.com')
const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockJson = jest.fn() as jest.MockedFunction<any>
const mockText = jest.fn() as jest.MockedFunction<any>

const defaultOptions = { body: undefined, headers: {}, method: 'get' }

describe('FetchClient', () => {
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
		mockJson.mockResolvedValue({ status: 200 })
		mockText.mockResolvedValue(JSON.stringify({ status: 200 }))
		mockFetch.mockReset()
		mockFetch.mockResolvedValue({
			ok: true,
			json: mockJson,
			text: mockText,
		} as Response)
	})
	describe('constructor', () => {
		it('validates baseUrl', () => {
			expect(() => new FetchClient(mockBaseURL)).not.toThrow()
		})
		it('throws invalid baseUrl', () => {
			expect(() => new FetchClient(new URL('invalid_url'))).toThrow()
		})
		describe('can set auth headers', () => {
			const mockHeaders = {
				Authorization: 'mock_value',
			}
			const http = new FetchClient(mockBaseURL, undefined, mockHeaders)
			it('get', async () => {
				const mockUri = END_POINT_PROTECTED.GET[0]
				await http.get(mockUri)
				expect(mockFetch).toHaveBeenCalledWith(
					mockBaseURL.toString() + mockUri,
					{
						...defaultOptions,
						headers: mockHeaders,
						method: 'get',
					},
				)
			})
			it('post', async () => {
				const mockUri = END_POINT_PROTECTED.POST[0]
				await http.post(mockUri)
				expect(mockFetch).toHaveBeenCalledWith(
					mockBaseURL.toString() + mockUri,
					{
						...defaultOptions,
						headers: mockHeaders,
						method: 'post',
					},
				)
			})
			it('delete', async () => {
				const mockUri = END_POINT_PROTECTED.DELETE[0]
				await http.delete(mockUri)
				expect(mockFetch).toHaveBeenCalledWith(
					mockBaseURL.toString() + mockUri,
					{
						...defaultOptions,
						headers: mockHeaders,
						method: 'delete',
					},
				)
			})
		})
		it('can suppress errors with onError', async () => {
			const mockOnError = jest.fn()
			const http = new FetchClient(mockBaseURL, mockOnError)
			mockFetch.mockRejectedValueOnce('mock_error')
			expect(await http.get('mock_uri')).toBeUndefined()
			expect(mockOnError).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('throws if no onError', async () => {
			const http = new FetchClient(mockBaseURL)
			mockFetch.mockRejectedValueOnce('mock_error')
			await expect(http.get('mock_uri')).rejects.toThrow(
				new Error(ERROR_MESSAGE.GENERIC),
			)
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('throws if status >= 400', async () => {
			mockJson.mockResolvedValue({ error: 'mock_error' })
			mockFetch.mockResolvedValue({
				ok: false,
				json: mockJson,
				text: mockText,
				status: 400,
				url: 'mock_uri',
			} as Response)
			const http = new FetchClient(mockBaseURL)
			await expect(http.get('mock_uri')).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'mock_uri')
						.replace('%error%', '"mock_error"')
						.replace('%status%', '400'),
				),
			)
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
	})
	describe('get', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.get('mock_uri')
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, undefined, {
				mock_key: 'mock_value',
			})
			await http.get('mock_uri', { mock_key: 'overridden_value' })
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					headers: { mock_key: 'overridden_value' },
					method: 'get',
				},
			)
		})
	})
	describe('post', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.post('mock_uri')
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'post',
				},
			)
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, undefined, {
				mock_key: 'mock_value',
			})
			await http.post('mock_uri', { mock_key: 'overridden_value' })
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					headers: { mock_key: 'overridden_value' },
					method: 'post',
				},
			)
		})
		it('transmits body', async () => {
			const http = new FetchClient(mockBaseURL)
			const body = { mock_key: 'mock_value' }
			await http.post('mock_uri', undefined, JSON.stringify(body))
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					body: JSON.stringify(body),
					method: 'post',
				},
			)
		})
	})
	describe('delete', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.delete('mock_uri')
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'delete',
				},
			)
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, undefined, {
				mock_key: 'mock_value',
			})
			await http.delete('mock_uri', { mock_key: 'overridden_value' })
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					headers: { mock_key: 'overridden_value' },
					method: 'delete',
				},
			)
		})
	})
})
