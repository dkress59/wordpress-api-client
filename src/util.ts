import { BlackWhiteList } from './types'
import { ERROR_MESSAGE } from './constants'
import { URLSearchParams } from 'url'

// FIXME: weird type casting issue
// eslint-disable-next-line sonarjs/cognitive-complexity
function getDataFromResponse(json: unknown, statusText: string): string {
	if (!json) return statusText
	const isJson = typeof json === 'object'
	const hasError = isJson && 'error' in (json as { error: string })
	const errorIsString =
		hasError && typeof (json as { error: string }).error === 'string'
	const hasMessage = isJson && 'message' in (json as { message: string })
	const messageIsArray =
		hasMessage && Array.isArray((json as { message: string[] }).message)
	const messageIsString =
		hasMessage && typeof (json as { message: string }).message === 'string'
	return !isJson
		? statusText
		: hasError && errorIsString
		? (json as { error: string }).error
		: hasMessage && messageIsArray
		? (json as { message: string[] }).message[0]!
		: hasMessage && messageIsString
		? (json as { message: string }).message
		: statusText
}

export async function getErrorMessage(err: Response): Promise<string> {
	const { statusText } = err
	const json = (await err.json()) as null | string | Record<string, unknown>
	const status = err.status
	const url = err.url
	const data = getDataFromResponse(json, statusText)
	return ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', url || 'UNKNOWN')
		.replace('%error%', JSON.stringify(data))
		.replace('%status%', status.toString())
}

/** returns validated baseUrl without trailing slash */
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
	P extends Partial<{
		acf: Record<string, unknown> | unknown
		content: Partial<{ raw: string; rendered: string }>
		id: number
		excerpt: Partial<{ raw: string; rendered: string }>
		title: Partial<{ raw: string; rendered: string }>
	}>,
>(
	body: Omit<P, 'id'>,
): Omit<P, 'id'> &
	Partial<{
		content: string
		excerpt: string
		fields: Record<string, unknown> | unknown
		title: string
	}> {
	const content = body.content?.rendered ?? body.content?.raw
	const excerpt = body.excerpt?.rendered ?? body.excerpt?.raw
	const title = body.title?.rendered ?? body.title?.raw
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
