import { BlackWhiteList } from '.'
import { ERROR_MESSAGE } from './constants'
import { URLSearchParams } from 'url'
import { isObject } from '@tool-belt/type-predicates'
import chalk from 'chalk'

// eslint-disable-next-line sonarjs/cognitive-complexity
function getDataFromResponse(
	json: null | string | Record<string, unknown>,
	text = 'getDataFromResponse error',
): string {
	const isJson = !!json && typeof json === 'object'
	const hasError = isJson && 'error' in json
	const errorIsString = hasError && typeof json.error === 'string'
	const hasMessage = isJson && 'message' in json
	const messageIsArray = hasMessage && Array.isArray(json.message)
	const messageIsString = hasMessage && typeof json.message === 'string'
	return !isJson
		? text
		: hasError && errorIsString
		? (json.error as string)
		: hasMessage && messageIsArray
		? (json.message as string[])[0]
		: hasMessage && messageIsString
		? (json.message as string)
		: text
}

export async function handleWpError(
	error?: Response | unknown,
	onError?: (message: string) => void,
) {
	let message = ERROR_MESSAGE.GENERIC
	const isFetchResponse =
		isObject(error) &&
		Object.keys(error).includes('json') &&
		typeof (error as Response).json === 'function'

	if (isFetchResponse) {
		const err = error as Response
		const json = (await err.json()) as
			| null
			| string
			| Record<string, unknown>
		const text = await err.text()
		const status = err.status
		const url = err.url
		const data = getDataFromResponse(json, text)
		message = ERROR_MESSAGE.ERROR_RESPONSE.replace(
			'%url%',
			url || 'UNKNOWN',
		)
			.replace('%error%', JSON.stringify(data))
			.replace('%status%', status.toString())
	}

	// eslint-disable-next-line no-console
	console.error(chalk.blue(message))
	if (onError) onError(message)
	else throw new Error(message)
	return Promise.reject(message)
}

/** returns validated baseURL without trailing slash */
export function validateBaseUrl(url: string): string {
	if (!url.startsWith('http://') && !url.startsWith('https://'))
		throw new Error(ERROR_MESSAGE.INVALID_BASEURL.replace('%url%', url))
	if (url.substr(-1) === '/') return url.substr(0, url.length - 1)
	return url
}

export function getDefaultQueryList(query = new URLSearchParams()): string {
	return (
		'?' +
		new URLSearchParams({
			_embed: 'true',
			order: 'asc',
			per_page: '100',
			...Object.fromEntries(query),
		}).toString()
	)
}

export function getDefaultQuerySingle(query = new URLSearchParams()): string {
	return (
		'?' +
		new URLSearchParams({
			_embed: 'true',
			...Object.fromEntries(query),
		}).toString()
	)
}

export function postCreate<
	P extends {
		acf?: Record<string, unknown>
		content?: { rendered: string }
		excerpt?: { rendered: string }
		title?: { rendered: string }
	},
>(
	body: P,
): P & {
	content?: string
	excerpt?: string
	fields?: Record<string, unknown>
	title?: string
} {
	const content = body.content?.rendered
	const excerpt = body.excerpt?.rendered
	const title = body.title?.rendered
	const fields = body.acf
	delete body.acf
	return { ...body, content, excerpt, fields, title }
}

export function isProtected(
	url: string,
	method: 'get' | 'post' | 'delete',
	protectedRoutes: BlackWhiteList,
): boolean {
	const protectedEndPoints =
		method === 'get'
			? protectedRoutes.GET
			: method === 'delete'
			? protectedRoutes.DELETE
			: protectedRoutes.POST
	return !!protectedEndPoints.filter(uri => url.includes(uri)).length
}
