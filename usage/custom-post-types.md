# Custom Post Types

It does not take much to add the methods for any of your registered Custom Post Types.

```typescript
import WpApiClient, {
    EndpointCreate,
    EndpointDelete,
    EndpointFind,
    EndpointUpdate,
} from 'wordpress-api-client'
import { baseURL } from './constants'
import { WPProduct } from './types'

const EP_PRODUCTS = 'wp/v2/products'

class CmsApiClient extends WpApiClient {
    constructor() {
        super(baseURL, (message: string) => console.error(message))
    }

    public product(): {
        create: EndpointCreate<WPProduct>
        delete: EndpointDelete<WPProduct>
        find: EndpointFind<WPProduct[]>
        update: EndpointUpdate<WPProduct>
    } {
        return this.addPostType<WPProduct>(EP_PRODUCTS)
    }
}

export const CmsClient = new CmsApiClient()
```
