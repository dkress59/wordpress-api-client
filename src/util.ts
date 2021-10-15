import { AxiosError, AxiosResponse } from 'axios'
import { ERROR_MESSAGE } from './constants'
import { URLSearchParams } from 'url'
import chalk from 'chalk'

// eslint-disable-next-line sonarjs/cognitive-complexity
export function handleWpApiError(
	error: Error | AxiosError<unknown> | unknown,
	onError?: (message: string) => void,
): unknown {
	const isObject = !!error && typeof error === 'object'
	const axiosError =
		isObject &&
		'isAxiosError' in (error as Record<string, unknown>) &&
		(Reflect.get(
			error as Record<string, unknown>,
			'isAxiosError',
		) as boolean)
			? (error as AxiosError<unknown>)
			: null
	const url = axiosError?.config.url
	const obj =
		axiosError?.response?.data ??
		(isObject && 'response' in (error as Record<string, unknown>))
			? 'data' in
			  Reflect.get(error as Record<string, unknown>, 'response')
				? (Reflect.get(
						Reflect.get(
							error as Record<string, unknown>,
							'response',
						),
						'data',
				  ) as string | Record<string, string>)
				: (Reflect.get(
						error as Record<string, unknown>,
						'response',
				  ) as AxiosResponse)
			: (error as null | string | Record<string, string>)

	const message = obj
		? typeof obj === 'object'
			? (Reflect.get(obj, 'error') as string) ||
			  (Reflect.get(obj, 'message') as string)
			: typeof obj === 'string'
			? obj
			: ''
		: ''

	const errorMessage =
		message !== ''
			? ERROR_MESSAGE.ERROR_RESPONSE.replace(
					'%error%',
					JSON.stringify(message),
			  ).replace('%url%', url ?? 'UNKNOWN')
			: ERROR_MESSAGE.GENERIC

	if (onError) onError(errorMessage)
	// eslint-disable-next-line no-console
	else console.error(chalk.blue(errorMessage))

	return { data: null }
}

export function validateBaseUrl(url: string): string {
	if (!url.startsWith('http://') && !url.startsWith('https://'))
		throw new Error(ERROR_MESSAGE.INVALID_BASEURL.replace('%url%', url))
	if (url.substr(-1) === '/') return url.substr(0, url.length - 1)
	return url
}

export function getDefaultQueryList(params?: Record<string, string>): string {
	return (
		'?' +
		new URLSearchParams({
			_embed: 'true',
			order: 'asc',
			//orderby: 'menu_order',
			per_page: '100',
			...params,
		}).toString()
	)
}

export function getDefaultQuerySingle(params?: Record<string, string>): string {
	return (
		'?' +
		new URLSearchParams({
			_embed: 'true',
			...params,
		}).toString()
	)
}
