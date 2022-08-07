import { URLSearchParams } from 'url'

import {
	END_POINT_PROTECTED,
	END_POINT_PUBLIC,
	ERROR_MESSAGE,
	TRASHABLE,
} from './constants'
import { AUTH_TYPE, BlackWhiteList } from './types'

// ToDo: improve + make use of type-predicates
// eslint-disable-next-line sonarjs/cognitive-complexity
export function getDataFromResponse(json: unknown, statusText: string): string {
	if (!json) return statusText
	const isJson = typeof json === 'object'
	const hasError = isJson && 'error' in <{ error: string }>json
	const errorIsString =
		hasError && typeof (<{ error: string }>json).error === 'string'
	const hasMessage = isJson && 'message' in <{ message: string }>json
	const messageIsArray =
		hasMessage && Array.isArray((<{ message: string[] }>json).message)
	const messageIsString =
		hasMessage && typeof (<{ message: string }>json).message === 'string'

	if (!isJson) return statusText
	if (hasError && errorIsString) return (<{ error: string }>json).error
	if (hasMessage && messageIsArray)
		return (<{ message: string[] }>json).message.length
			? (<{ message: string[] }>json).message[0]
			: statusText
	if (hasMessage && messageIsString)
		return (<{ message: string }>json).message
	return statusText
}

export async function getErrorMessage(error?: Response): Promise<string> {
	if (!error) return ERROR_MESSAGE.ERROR_RESPONSE.replace('%url%', 'UNKNOWN')
	const statusText = error.statusText
	const json = <null | string | Record<string, unknown>>await error.json()
	const status = error.status
	const url = error.url
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
	delete body.acf
	return { ...body, content, excerpt, title }
}

export function useAuth(
	url: string,
	method: 'get' | 'post' | 'delete' | 'options',
	authType: AUTH_TYPE = AUTH_TYPE.NONE,
	protectedRoutes: BlackWhiteList = END_POINT_PROTECTED,
	publicRoutes: BlackWhiteList = END_POINT_PUBLIC,
): boolean {
	if (method === 'options') method = 'get'
	if (authType === AUTH_TYPE.BASIC || authType === AUTH_TYPE.NONCE)
		return true

	const key = <'GET' | 'POST' | 'DELETE'>method.toUpperCase()
	const isProtected = !!protectedRoutes[key].some(uri => url.includes(uri))
	const isPublic = !!publicRoutes[key].some(uri => url.includes(uri))

	if (authType === AUTH_TYPE.JWT) return isProtected
	return (isProtected && !isPublic) || false
}

export function getDeleteUri(
	endpoint: string,
	id: number,
	params?: URLSearchParams,
	trashable: string[] = TRASHABLE,
): string {
	const useForce = !trashable.includes(endpoint) && !params?.has('force')
	const defaultParams = params ? '/?' + params.toString() : ''
	const forceParam = (params ? '&' : '/?') + 'force=true'
	return `${endpoint}/${id}${defaultParams}${useForce ? forceParam : ''}`
}
