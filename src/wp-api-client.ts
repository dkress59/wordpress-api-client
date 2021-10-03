import { EP_PAGES, EP_POSTS } from './constants'
import { WPCreate, WPPage, WPPost } from './types'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

export type EndpointCreate<B> = (body: WPCreate<B>) => Promise<B | null>
export type EndpointUpdate<B> = (
    body: WPCreate<B>,
    id: number,
) => Promise<B | null>

export class WpApiClient {
    protected readonly axios: AxiosInstance

    constructor(
        baseURL: string,
        onError?: (message: string) => void,
        axiosInstance?: AxiosInstance,
    ) {
        this.axios = axiosInstance ?? axios.create()
        this.axios.defaults.baseURL = baseURL
        this.axios.interceptors.response.use(
            config => config,
            error => {
                const obj =
                    error && typeof error === 'object' && 'response' in error
                        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                          (error.response.data as Record<string, string>)
                        : (error as null | string | Record<string, string>)
                const message = !obj
                    ? 'WpApiClient error.'
                    : typeof obj === 'object'
                    ? (Reflect.get(obj, 'error') as string) ||
                      (Reflect.get(obj, 'message') as string)
                    : typeof obj === 'string'
                    ? obj
                    : 'WpApiClient error.'
                if (onError) onError(message)
                else throw new Error(message)
            },
        )
    }

    protected createEndpointGet<W>(
        endpoint: string,
        params = '?_embed&per_page=100&orderby=menu_order&order=asc',
    ): (id?: number) => Promise<W | W[]> {
        return async (id = 0) => {
            if (!id)
                return (await this.axios.get<W[]>(`/${endpoint}/${params}`))
                    .data
            else
                return (await this.axios.get<W>(`/${endpoint}/${id}?_embed`))
                    .data
        }
    }

    protected createEndpointPost<W>(
        endpoint: string,
    ): (body: WPCreate<W>, id?: number) => Promise<W> {
        return async (body: WPCreate<W>, id = 0) => {
            if (id)
                return (
                    await this.axios.post<WPCreate<W>, AxiosResponse<W>>(
                        `/${endpoint}/${id}`,
                        body,
                    )
                ).data
            else
                return (
                    await this.axios.post<WPCreate<W>, AxiosResponse<W>>(
                        `/${endpoint}`,
                        body,
                    )
                ).data
        }
    }

    protected createEndpointCustomGet<T, R = null>(
        endPoint: string,
    ): (body: T) => Promise<T | R> {
        return async (): Promise<T | R> => {
            return this.axios
                .get(`/${endPoint}`)
                .then((response: AxiosResponse<T>) => response.data)
        }
    }

    protected createEndpointCustomPost<T, R = null>(
        endPoint: string,
    ): (body: T) => Promise<T | R> {
        return async (body: T): Promise<T | R> => {
            return this.axios
                .post(`/${endPoint}`, body)
                .then((response: AxiosResponse<T>) => response.data)
        }
    }

    public post<P = WPPost>(): {
        find: () => Promise<P[]>
        findOne: (id: number) => Promise<P>
        new: EndpointCreate<P>
        update: EndpointUpdate<P>
    } {
        const endpoint = this.createEndpointGet<P>(EP_POSTS)
        return {
            ...this,
            find: endpoint as () => Promise<P[]>,
            findOne: endpoint as (id: number) => Promise<P>,
            new: this.createEndpointPost<P>(EP_POSTS),
            update: this.createEndpointPost<P>(EP_POSTS),
        }
    }

    public page<P = WPPage>(): {
        find: () => Promise<P[]>
        findOne: (id: number) => Promise<P>
        new: EndpointCreate<P>
        update: EndpointUpdate<P>
    } {
        const endpoint = this.createEndpointGet<P>(EP_PAGES)
        return {
            ...this,
            find: endpoint as () => Promise<P[]>,
            findOne: endpoint as (id: number) => Promise<P>,
            new: this.createEndpointPost<P>(EP_PAGES),
            update: this.createEndpointPost<P>(EP_PAGES),
        }
    }
}
