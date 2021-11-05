# Custom Post Types

It does not take much to add the methods for any of your registered Custom Post Types.

```typescript
import WpApiClient, { DefaultEndpoint } from 'wordpress-api-client'
import { baseURL } from './constants'
import { WPProduct } from './types'

const EP_PRODUCTS = 'wp/v2/products'

class CmsApiClient extends WpApiClient {
    constructor() {
        super(baseURL)
    }

    public product(): DefaultEndpoint<WPProduct> {
        return this.addPostType<WPProduct>(EP_PRODUCTS)
    }
}

export const CmsClient = new CmsApiClient()
```

If your custom post type supports revisions you can enable them on the client
like this:

```typescript
    public product(): DefaultEndpointWithRevision<WPProduct> {
        return this.addPostType<WPProduct>(EP_PRODUCTS, true)
    }
```
