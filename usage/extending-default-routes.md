# Extending Default Routes

WordPress plugins, such as [Advanced Custom Fields](https://www.advancedcustomfields.com/),
can extend/modify the WP-API's response of default objects (WPPage, WPPost, …),
which of course needs to be reflected in the API client's responses. If you are
using TypeScript, the default methods can be extended with your custom typing.

```typescript
import { WpApiClient, WPPage } from 'wordpress-api-client'
const CmsClient = new WpApiClient('https://my-wordpress-website.com')

interface CustomPage extends WPPage {
    menu_order: number
}

// The response object can be casted like this:

CmsClient.page<CustomPage>().create()
CmsClient.page<CustomPage>().delete()
CmsClient.page<CustomPage>().find()
CmsClient.page<CustomPage>().update()
```

Or, you might prefer to do it this way:

```typescript
import WpApiClient, { DefaultEndpointWithRevision } from 'wordpress-api-client'
import { baseURL } from './constants'
import { CustomPage } from './types'

type CustomPage = WPPage & {
    menu_order: number
}

export class CmsClient extends WpApiClient {
    constructor() {
        super(baseURL)
    }

    public page<P = CustomPage>(): DefaultEndpointWithRevision<P> {
        return super.page<P>()
    }
}
```

## ACF to REST API

When using this package for a WP installation which relies on
 [Advanced Custom Fields](https://www.advancedcustomfields.com ':crossorgin'),
 you can easily [extend the typings](usage/extending-default-routes.md) of your post
types with an `acf` field to enable __full acf support__ (GET + POST) for the WpApiClient.

?> Up to v0.2.3 this package used to rely on
 [ACF to REST API](https://wordpress.org/plugins/acf-to-rest-api/ ':crossorgin'),
 but since ACF v5.11.1 and WpApiClient v0.3.0 this is no longer required!

```typescript
import WpApiClient, {
    DefaultEndpointWithRevision,
    WPPost,
} from 'wordpress-api-client'
import { baseURL } from './constants'

interface PostFields {
    additional_info: string
    sidebar_options: {
        sidebar_id: number
        layout: 'a' | 'b' | 'c'
    }
}

export class CmsClient extends WpApiClient {
    constructor() {
        super(baseURL)
    }

    public post<P = WPPost<PostFields>>(): DefaultEndpointWithRevision<P> {
        return super.post<P>()
    }
}
```

As you can see in the Example above, the WP typings from this package can be used
as Generics:

```typescript
import { WPPost } from 'wordpress-api-client'

// your acf fields of post_type 'post'
interface PostFields {
    additional_info: string
    sidebar_options: {
        sidebar_id: number
        layout: 'a' | 'b' | 'c'
    }
}

// can be implemented like this
export type CustomPost = WPPost<Postfields>

// which translates to
export interface CustomPost extends WPPost {
    acf: PostFields
}
```

## Yoast SEO (wordpress-seo)

If you are familiar with WordPress and SEO, you probably know
[Yoast! SEO](https://wordpress.org/plugins/wordpress-seo).
Since v17.x, Yoast's generated meta-tags are available via the REST API by default
for Posts, Pages, Categories, Tags, Media and Users. The output for these content
types, as well as the output for custom post types and taxonomies can be controlled
via Yoast's UI. The typings for the "Yoast Head" are already included in this package,
but the WordPress plugin itself must, of course, be installed and active.

```typescript
import WpApiClient, { WPPage, YoastBase } from 'wordpress-api-client'

const EP_PORTFOLIO = 'wp/v2/portfolio'

type WPPortfolio = WPPage & YoastBase & {
	gallery: string[]
} 

class CmsClient extends WpApiClient {
	__constructor() {
		super('https://mywebsite.com')
	}

	portfolio = this.addPostType<WPPortfolio>(EP_PORTFOLIO)
}

export const cmsClient = new CmsClient()
```
