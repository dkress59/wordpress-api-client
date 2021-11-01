import { CustomPost, WPMenu, WPProduct } from './types'
import WpApiClient, { DefaultEndpointWithRevision } from 'wordpress-api-client'
import axios from 'axios'

const axiosInstance = axios.create()
const authHeader = `Basic ${Buffer.from('admin:password').toString('base64')}`
axiosInstance.defaults.headers.delete['Authorization'] = authHeader
axiosInstance.defaults.headers.post['Authorization'] = authHeader

const EP_PRODUCTS = 'wp/v2/products'
const EP_MENU = 'demo-plugin/v1/menu'

export class WpClient extends WpApiClient {
	constructor() {
		super('http://localhost:8080', undefined, axiosInstance)
	}

	post<P = CustomPost>(): DefaultEndpointWithRevision<P> {
		return super.post<P>()
	}

	public product(): DefaultEndpointWithRevision<WPProduct> {
		return this.addPostType<WPProduct>(EP_PRODUCTS, true)
	}

	menu = this.createEndpointCustomGet<WPMenu>(EP_MENU)
}
