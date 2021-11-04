import { FetchClient } from '../src/fetch-client'
import fetch, { Response } from 'node-fetch'

jest.mock('node-fetch', () => jest.fn())

const mockBaseURL = new URL('http://mock-website.com')

describe('FetchClient', () => {
	const mockFetch = fetch as jest.MockedFunction<typeof fetch>
	const json = jest.fn() as jest.MockedFunction<any>
	beforeEach(() => {
		json.mockResolvedValue({ status: 200 })
		mockFetch.mockResolvedValue({ ok: true, json } as Response)
	})
	describe('constructor', () => {
		it('validates baseURL', () => {
			expect(() => new FetchClient(mockBaseURL)).not.toThrow()
		})
		it('throws invalid baseURL', () => {
			expect(() => new FetchClient(new URL('invalid_url'))).toThrow()
		})
		it('can set default headers', async () => {
			const http = new FetchClient(mockBaseURL, {
				mock_key: 'mock_value',
			})
			await http.get('mock_uri')
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: { mock_key: 'mock_value' },
				method: 'get',
				hostname: mockBaseURL.toString(),
			})
		})
		it('can suppress errors with onError', async () => {
			const mockOnError = jest.fn()
			const http = new FetchClient(mockBaseURL, undefined, mockOnError)
			mockFetch.mockRejectedValueOnce('mock_error')
			await expect(http.get('mock_uri')).rejects.not.toThrow()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: {},
				method: 'get',
				hostname: mockBaseURL.toString(),
			})
		})
		it('throws if no onError', async () => {
			const http = new FetchClient(mockBaseURL)
			mockFetch.mockRejectedValueOnce('mock_error')
			await expect(http.get('mock_uri')).rejects.toThrow(
				new Error(
					'[WpApiClient Error] There was an error when calling the end point UNKNOWN: "mock_error"',
				),
			)
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: {},
				method: 'get',
				hostname: mockBaseURL.toString(),
			})
		})
	})
	describe('get', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.get('mock_uri')
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: {},
				method: 'get',
				hostname: mockBaseURL.toString(),
			})
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, {
				mock_key: 'mock_value',
			})
			await http.get('mock_uri', { mock_key: 'overridden_value' })
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: { mock_key: 'overridden_value' },
				method: 'get',
				hostname: mockBaseURL.toString(),
			})
		})
	})
	describe('post', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.post('mock_uri')
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: {},
				method: 'post',
				hostname: mockBaseURL.toString(),
			})
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, {
				mock_key: 'mock_value',
			})
			await http.post('mock_uri', { mock_key: 'overridden_value' })
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: { mock_key: 'overridden_value' },
				method: 'post',
				hostname: mockBaseURL.toString(),
			})
		})
		it('transmits body', async () => {
			const http = new FetchClient(mockBaseURL)
			const body = { mock_key: 'mock_value' }
			await http.post('mock_uri', undefined, JSON.stringify(body))
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				body: JSON.stringify(body),
				headers: {},
				method: 'post',
				hostname: mockBaseURL.toString(),
			})
		})
	})
	describe('delete', () => {
		it('fetches the correct URL', async () => {
			const http = new FetchClient(mockBaseURL)
			await http.delete('mock_uri')
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: {},
				method: 'delete',
				hostname: mockBaseURL.toString(),
			})
		})
		it('can override headers', async () => {
			const http = new FetchClient(mockBaseURL, {
				mock_key: 'mock_value',
			})
			await http.delete('mock_uri', { mock_key: 'overridden_value' })
			expect(json).toHaveBeenCalled()
			expect(fetch).toHaveBeenCalledWith('mock_uri', {
				headers: { mock_key: 'overridden_value' },
				method: 'delete',
				hostname: mockBaseURL.toString(),
			})
		})
	})
})
