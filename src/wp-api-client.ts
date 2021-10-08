import { END_POINT } from './constants.js'
import {
    EndpointCreate,
    EndpointUpdate,
    WPCreate,
    WPPage,
    WPPost,
} from './types.js'
import {
    getDefaultQueryList,
    getDefaultQuerySingle,
    handleWpApiError,
    validateBaseUrl,
} from './util.js'
import axios, { AxiosInstance, AxiosResponse } from 'axios'

export class WpApiClient {
    protected readonly axios: AxiosInstance

    constructor(
        baseURL: string,
        onError?: (message: string) => void,
        axiosInstance?: AxiosInstance,
    ) {
        this.axios = axiosInstance ?? axios.create()
        this.axios.defaults.baseURL = validateBaseUrl(baseURL)
        this.axios.interceptors.response.use(
            config => config,
            error => {
                console.error(error)
                handleWpApiError(error, onError)
            },
        )
    }

    protected createEndpointGet<P>(
        endpoint: string,
        params?: Record<string, string>,
    ): (id?: number) => Promise<P | P[]> {
        return async (id = 0) => {
            if (!id)
                return (
                    await this.axios.get<P[]>(
                        `/${endpoint}/${getDefaultQueryList(params)}`,
                    )
                ).data
            else
                return (
                    await this.axios.get<P>(
                        `/${endpoint}/${id}/${getDefaultQuerySingle(params)}`,
                    )
                ).data
        }
    }

    protected createEndpointPost<P>(
        endpoint: string,
    ): (body: WPCreate<P>, id?: number) => Promise<P> {
        return async (body: WPCreate<P>, id = 0) => {
            if (id)
                return (
                    await this.axios.post<WPCreate<P>, AxiosResponse<P>>(
                        `/${endpoint}/${id}`,
                        body,
                    )
                ).data
            else
                return (
                    await this.axios.post<WPCreate<P>, AxiosResponse<P>>(
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
            return (await this.axios.get(`/${endPoint}`)).data
        }
    }

    protected createEndpointCustomPost<T, R = null>(
        endPoint: string,
    ): (body: T) => Promise<T | R> {
        return async (body: T): Promise<T | R> => {
            return (await this.axios.post(`/${endPoint}`, body)).data
        }
    }

    public post<P = WPPost>(): {
        find: () => Promise<P[]>
        findOne: (id: number) => Promise<P>
        create: EndpointCreate<P>
        update: EndpointUpdate<P>
    } {
        const find = this.createEndpointGet<P>(END_POINT.POSTS)
        const create = this.createEndpointPost<P>(END_POINT.POSTS)
        const update = this.createEndpointPost<P>(END_POINT.POSTS)
        return {
            ...this,
            find: find as () => Promise<P[]>,
            findOne: find as (id: number) => Promise<P>,
            create,
            update,
        }
    }

    public page<P = WPPage>(): {
        find: () => Promise<P[]>
        findOne: (id: number) => Promise<P>
        create: EndpointCreate<P>
        update: EndpointUpdate<P>
    } {
        const find = this.createEndpointGet<P>(END_POINT.PAGES)
        const create = this.createEndpointPost<P>(END_POINT.PAGES)
        const update = this.createEndpointPost<P>(END_POINT.PAGES)
        return {
            ...this,
            find: find as () => Promise<P[]>,
            findOne: find as (id: number) => Promise<P>,
            create,
            update,
        }
    }
}
