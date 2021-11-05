import { CustomPost, WPMenu, WPProduct } from './types'
import WpApiClient, { DefaultEndpointWithRevision } from 'wordpress-api-client'

const EP_PRODUCTS = 'wp/v2/products'
const EP_MENU = 'demo-plugin/v1/menu'

export class WpClient extends WpApiClient {
	constructor() {
		super('http://localhost:8080', {
			auth: {
				type: 'basic',
				password: 'password',
				username: 'admin',
			},
		})
	}

	post<P = CustomPost>(): DefaultEndpointWithRevision<P> {
		return super.post<P>()
	}

	public product(): DefaultEndpointWithRevision<WPProduct> {
		return this.addPostType<WPProduct>(EP_PRODUCTS, true)
	}

	menu = this.createEndpointCustomGet<WPMenu>(EP_MENU)
}
