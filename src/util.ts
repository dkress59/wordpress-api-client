import { AxiosResponse } from 'axios'
import { ERROR_MESSAGE } from './constants.js'
import { URLSearchParams } from 'url'

export function handleWpApiError(
    error: unknown,
    onError?: (message: string) => void,
): void {
    const obj =
        error && typeof error === 'object' && 'response' in error
            ? (Reflect.get(error, 'response') as AxiosResponse)
            : (error as null | string | Record<string, string>)

    const message = obj
        ? typeof obj === 'object'
            ? (Reflect.get(obj, 'error') as string) ||
              (Reflect.get(obj, 'message') as string)
            : typeof obj === 'string'
            ? obj
            : ''
        : ''
    const errorMessage = message
        ? ERROR_MESSAGE.DETAILED.replace('%error%', JSON.stringify(message))
        : ERROR_MESSAGE.GENERIC

    if (onError) onError(errorMessage)
    else throw new Error(errorMessage)
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
            //order: 'asc',
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
