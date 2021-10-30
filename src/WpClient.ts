import { CustomPost, WPMenu, WPProduct } from './types'
import WpApiClient, {
	EndpointCreate,
	EndpointDelete,
	EndpointFind,
	EndpointUpdate,
} from 'wordpress-api-client'
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

	post<P = CustomPost>(): {
		create: EndpointCreate<P>
		delete: EndpointDelete<P>
		find: EndpointFind<P>
		update: EndpointUpdate<P>
		revision: {
			create: EndpointCreate<P>
			delete: EndpointDelete<P>
			find: EndpointFind<P>
			update: EndpointUpdate<P>
		}
	} {
		return super.post<P>() as {
			create: EndpointCreate<P>
			delete: EndpointDelete<P>
			find: EndpointFind<P>
			update: EndpointUpdate<P>
			revision: {
				create: EndpointCreate<P>
				delete: EndpointDelete<P>
				find: EndpointFind<P>
				update: EndpointUpdate<P>
			}
		}
	}

	public product(): {
		create: EndpointCreate<WPProduct>
		delete: EndpointDelete<WPProduct>
		find: EndpointFind<WPProduct>
		update: EndpointUpdate<WPProduct>
		revision: {
			create: EndpointCreate<WPProduct>
			delete: EndpointDelete<WPProduct>
			find: EndpointFind<WPProduct>
			update: EndpointUpdate<WPProduct>
		}
	} {
		return this.addPostType<WPProduct>(EP_PRODUCTS, true)
	}

	menu = this.createEndpointCustomGet<WPMenu>(EP_MENU)
}
