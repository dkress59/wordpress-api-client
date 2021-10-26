# Extending Default Routes

WordPress plugins, such as [Advanced Custom Fields](https://www.advancedcustomfields.com/),
can extend/modify the WP-API's response of default obects (WPPage, WPPost, …),
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
import WpApiClient, {
    EndpointCreate,
    EndpointDelete,
    EndpointFind,
    EndpointUpdate
} from 'wordpress-api-client'
import { baseURL } from './constants'
import { CustomPage } from './types'

type CustomPage = WPPage & Required<{
    menu_order: number
}>

class CmsApiClient extends WpApiClient {
    constructor() {
        super(baseURL, (message: string) => console.error(message))
    }

    public page<P = CustomPage>(): {
        create: EndpointCreate<P>
        delete: EndpointDelete<P>
        find: EndpointFind<P>
        update: EndpointUpdate<P>
    } {
        return super.page<P>()
    }
}

export const CmsClient = new CmsApiClient()
```

## ACF to REST API

When using this package for a WP installation which relies on [Advanced Custom Fields](https://www.advancedcustomfields.com),
it is highly recommended to also install [ACF to REST API](https://wordpress.org/plugins/acf-to-rest-api/):
You can then [extend the typings](#extend-default-routes) of your post types with
an `acf` field to enable __full acf support__ (GET + POST) for the WpApiClient.

_Note:_ If you have one of your ACF fields set to output a 'Post Object', the
typing of the corresponding REST API response object ist not your usual `WPPost`,
but rather an `ACFPost`, which you can imported from this library.

```typescript
import WpApiClient, {
    EndpointCreate,
    EndpointDelete,
    EndpointFind,
    EndpointUpdate,
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
        super(
            baseURL,
            (message: string) => console.error(message),
        )
    }

    public post<P = WPPost<PostFields>>(): {
        create: EndpointCreate<P>
        delete: EndpointDelete<P>
        find: EndpointFind<P>
        update: EndpointUpdate<P>
    } {
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

[ ToDo ]
