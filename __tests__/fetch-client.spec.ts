import fetch from 'cross-fetch'

import { END_POINT_PROTECTED, ERROR_MESSAGE } from '../src/constants'
import { FetchClient } from '../src/fetch-client'
import { defaultOptions, mockResponse, mockStatusText } from './util'

jest.mock('cross-fetch', () => jest.fn())

const originalFetch = jest.requireActual('cross-fetch')
const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockJson = <jest.MockedFunction<any>>jest.fn()
const mockText = <jest.MockedFunction<any>>jest.fn()

const mockBaseURL = new URL('http://mock-website.com')

describe('FetchClient', () => {
	// eslint-disable-next-line no-console
	const originalError = console.error
	const mockError = jest.fn()
	beforeAll(() => {
		// eslint-disable-next-line no-console
		console.error = mockError
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
			headers: new originalFetch.Headers({ 'X-WP-TotalPages': '1' }),
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
						headers: { ...defaultOptions.headers, ...mockHeaders },
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
						headers: { ...defaultOptions.headers, ...mockHeaders },
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
						headers: { ...defaultOptions.headers, ...mockHeaders },
						method: 'delete',
					},
				)
			})
		})
		it('can suppress console errors with onError', async () => {
			const mockOnError = jest.fn()
			const http = new FetchClient(mockBaseURL, mockOnError)
			mockFetch.mockRejectedValueOnce(mockResponse('mock_error'))
			await expect(() => http.get('mock_uri')).rejects.toThrow(
				'[WpApiClient Error] There was an error when calling the end point UNKNOWN: "Mock Server Error" (666)',
			)
			expect(mockError).not.toHaveBeenCalled()
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
			mockFetch.mockRejectedValueOnce(mockResponse('mock_error'))
			await expect(http.get('mock_uri')).rejects.toThrow(
				new Error(
					ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
						.replace('%error%', '"' + mockStatusText + '"')
						.replace('%status%', '666'),
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
			const mockHeaders = { mock_key: 'overridden_value' }
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					headers: { ...defaultOptions.headers, ...mockHeaders },
					method: 'get',
				},
			)
		})
	})
	describe('getTotal', () => {
		it('returns total pages', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: mockJson,
				text: mockText,
				headers: new originalFetch.Headers({
					'X-WP-TotalPages': '123',
				}),
			} as Response)
			const http = new FetchClient(mockBaseURL)
			expect(await http.getTotal('mock_uri')).toBe(123)
		})
		it('returns 0 by default', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: mockJson,
				text: mockText,
				headers: new originalFetch.Headers(),
			} as Response)
			const http = new FetchClient(mockBaseURL)
			expect(await http.getTotal('mock_uri')).toBe(0)
		})
	})
	describe('getAll', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.getAll('mock_uri')
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('returns data', async () => {
			const mockResult = ['mock_item_1']
			mockJson.mockResolvedValueOnce(mockResult)
			const http = new FetchClient(mockBaseURL)
			const response = await http.getAll('mock_uri')
			expect(response).toEqual(mockResult)
		})
		it('falls back to empty array', async () => {
			mockJson.mockResolvedValueOnce(null)
			const http = new FetchClient(mockBaseURL)
			const response = await http.getAll('mock_uri')
			expect(response).toEqual([])
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, undefined, {
				mock_key: 'mock_value',
			})
			await http.getAll('mock_uri', { mock_key: 'overridden_value' })
			const mockHeaders = { mock_key: 'overridden_value' }
			expect(mockJson).toHaveBeenCalled()
			expect(mockFetch).toHaveBeenCalledWith(
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					headers: { ...defaultOptions.headers, ...mockHeaders },
					method: 'get',
				},
			)
		})
		it('does not fetch all pages if ?offset=', async () => {
			const mockUri = 'mock_uri?offset=1'
			const http = new FetchClient(mockBaseURL)
			await http.getAll(mockUri)
			expect(mockJson).toHaveBeenCalledTimes(1)
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				mockBaseURL.toString() + mockUri,
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('does not fetch all pages if &offset=', async () => {
			const mockUri = 'mock_uri&offset=1'
			const http = new FetchClient(mockBaseURL)
			await http.getAll(mockUri)
			expect(mockJson).toHaveBeenCalledTimes(1)
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				mockBaseURL.toString() + mockUri,
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('does not fetch all pages if ?page=', async () => {
			const mockUri = 'mock_uri?page=1'
			const http = new FetchClient(mockBaseURL)
			await http.getAll(mockUri)
			expect(mockJson).toHaveBeenCalledTimes(1)
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				mockBaseURL.toString() + mockUri,
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('does not fetch all pages if &page=', async () => {
			const mockUri = 'mock_uri&page=1'
			const http = new FetchClient(mockBaseURL)
			await http.getAll(mockUri)
			expect(mockJson).toHaveBeenCalledTimes(1)
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				mockBaseURL.toString() + mockUri,
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('fetches all pages', async () => {
			mockJson.mockResolvedValue(['mock_page_1', 'mock_page_2'])
			mockFetch.mockResolvedValue({
				ok: true,
				json: mockJson,
				text: mockText,
				headers: new originalFetch.Headers({ 'X-WP-TotalPages': '3' }),
			} as Response)
			const http = new FetchClient(mockBaseURL)
			await http.getAll('mock_uri')
			expect(mockJson).toHaveBeenCalledTimes(3)
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				mockBaseURL.toString() + 'mock_uri',
				{
					...defaultOptions,
					method: 'get',
				},
			)
			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				mockBaseURL.toString() + 'mock_uri&page=2',
				{
					...defaultOptions,
					method: 'get',
				},
			)
			expect(mockFetch).toHaveBeenNthCalledWith(
				3,
				mockBaseURL.toString() + 'mock_uri&page=3',
				{
					...defaultOptions,
					method: 'get',
				},
			)
		})
		it('returns all pages', async () => {
			<jest.Mock>mockJson.mockClear()
			const mockResponse1 = ['mock_page_1', 'mock_page_2']
			const mockResponse2 = ['mock_page_3', 'mock_page_4']
			const mockResponse3 = ['mock_page_5', 'mock_page_6']
			mockJson.mockResolvedValueOnce(mockResponse1)
			mockJson.mockResolvedValueOnce(mockResponse2)
			mockJson.mockResolvedValueOnce(mockResponse3)
			mockFetch.mockResolvedValue({
				ok: true,
				json: mockJson,
				text: mockText,
				headers: new originalFetch.Headers({ 'X-WP-TotalPages': '3' }),
			} as Response)
			const http = new FetchClient(mockBaseURL)
			const result = await http.getAll('mock_uri')
			expect(result).toEqual([
				mockResponse1[0],
				mockResponse1[1],
				mockResponse2[0],
				mockResponse2[1],
				mockResponse3[0],
				mockResponse3[1],
			])
		})
		it('falls back to empty array on subsequent requests', async () => {
			<jest.Mock>mockJson.mockClear()
			const mockResponse1 = ['mock_page_1', 'mock_page_2']
			const mockResponse2 = null
			const mockResponse3 = ['mock_page_5', 'mock_page_6']
			mockJson.mockResolvedValueOnce(mockResponse1)
			mockJson.mockResolvedValueOnce(mockResponse2)
			mockJson.mockResolvedValueOnce(mockResponse3)
			mockFetch.mockResolvedValue({
				ok: true,
				json: mockJson,
				text: mockText,
				headers: new originalFetch.Headers({ 'X-WP-TotalPages': '3' }),
			} as Response)
			const http = new FetchClient(mockBaseURL)
			const result = await http.getAll('mock_uri')
			expect(result).toEqual([
				mockResponse1[0],
				mockResponse1[1],
				mockResponse3[0],
				mockResponse3[1],
			])
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
					headers: {
						...defaultOptions.headers,
						mock_key: 'overridden_value',
					},
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
					headers: {
						...defaultOptions.headers,
						mock_key: 'overridden_value',
					},
					method: 'delete',
				},
			)
		})
	})
})
