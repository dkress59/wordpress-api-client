# WordPress-API Client

The JavaScript Client for your WP-API.

## Installation

Depending on the package manager of your choice:

```bash
yarn add wp-api-client
```

```bash
npm install wp-api-client
```

## Usage

- Example
- Defaults
- Custom End Points
- Custom Post Types
- Advanced Custom Fields
- JWT-Auth for WordPress

### Basic Example

```typescript
import { EndpointCreate, EndpointUpdate, WpApiClient } from 'wp-api-client'
import { WPProduct } from './types'

const baseURL = 'https://my-wordpress-website.com'
const EP_PRODUCTS = 'my-plugin/v1/product'

class CmsApiClient extends WpApiClient {
    public static token?: string

    constructor() {
        super(baseURL, (message: string) => console.error(message))
    }

    public product(): {
        find: () => Promise<P[]>
        findOne: (id: number) => Promise<P>
        new: EndpointCreate<P>
        update: EndpointUpdate<P>
    } {
        const endpoint = this.createEndpointGet<WPProduct>(EP_PRODUCTS)
        return {
            find: endpoint as () => Promise<WPProduct[]>,
            findOne: endpoint as (id: number) => Promise<WPProduct>,
            new: this.createEndpointPost<WPProduct>(EP_PRODUCTS),
            update: this.createEndpointPost<WPProduct>(EP_PRODUCTS),
        }
    }
}

export const CmsClient = new CmsApiClient()
```

The example above will give you the following methods:

```typescript
CmsClient.post.find()
CmsClient.post.findOne(id)
CmsClient.post.create()
CmsClient.post.update(id)

CmsClient.page.find()
CmsClient.page.findOne(id)
CmsClient.page.create()
CmsClient.page.update(id)

CmsClient.product.find()
CmsClient.product.findOne(id)
CmsClient.product.create()
CmsClient.product.update(id)
```

### Defaults

### Custom End Points

### Custom Post Types

### Advanced Custom Fields

### JWT-Auth for WordPress
