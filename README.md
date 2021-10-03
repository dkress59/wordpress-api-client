# WordPress-API Client

The last JavaScript Client for your WP-API. Super simple yet highly extensible.

ToDo:

- [X] URLSearchParams
- [ ] Categories & Tags
- [ ] Improve typings: WPPost, WPPage
- [X] Constructor Validation
- [ ] (Media Gallery)
- [ ] Jest

## Installation

Depending on the package manager of your choice:

```bash
yarn add wp-api-client
```

```bash
npm install wp-api-client
```

## Usage

- [Defaults](https://github.com/dkress59/wp-api-client#default-methods)
- [Helper Methods](https://github.com/dkress59/wp-api-client#helper-methods)
- [Custom End Points](https://github.com/dkress59/wp-api-client#custom-end-points)
- [Custom Post Types](https://github.com/dkress59/wp-api-client#custom-post-types)
- [Advanced Custom Fields](https://github.com/dkress59/wp-api-client#extend-default-routes)
- [JWT-Auth for WordPress](https://github.com/dkress59/wp-api-client#default-custom-interceptors)

### Default Methods

To instantiate a WP-API Client you need to base the base URL of your WordPress website to the constructor. You can pass an `onError`-function as the second parameter and an exisitng axiosInstance as the third parameter (more on that here: [JWT-Auth for WordPress](https://github.com/dkress59/wp-api-client#jwt-auth-for-wordpress)).
With a bare instance of WpApiClient you will get methods to retreive, add and update any post, page, post-category or post-tag.

```typescript
import { WpApiClient } from 'wp-api-client'
const CmsClient = new WpApiClient('https://my-wordpress-website.com')

// Methods:

CmsClient.post().find()
CmsClient.post().findOne(id)
CmsClient.post().create()
CmsClient.post().update(id)

CmsClient.page().find()
CmsClient.page().findOne(id)
CmsClient.page().create()
CmsClient.page().update(id)

CmsClient.postCategory().find()
CmsClient.postCategory().findOne(id)
CmsClient.postCategory().create()
CmsClient.postCategory().update(id)

CmsClient.postTag().find()
CmsClient.postTag().findOne(id)
CmsClient.postTag().create()
CmsClient.postTag().update(id)
```

The methods are also chainable:

```typescript
const data: WPUpdate<WPPage> = {
    content: 'Updated page content',
}
CmsClient.page().findOne(59).update(data)
```

### Helper Methods

[ ToDo ]

- EndpointCreate
- EndpointUpdate
- createEndpointGet
- createEndpointPost
- createEndpointCustomGet
- createEndpointCustomPost

### Custom End Points

Let's say you have two [navigation menus](https://developer.wordpress.org/reference/functions/register_nav_menu/) registered in your WordPress-Theme's functions.php, and you have a [custom WP-API-route](https://developer.wordpress.org/reference/functions/register_rest_route/) registered like so:

```php
<?php

use WP_REST_Response;

class RESTEndpoints {
    private string $restApiSlug = '/wp-json';

    public function __construct() {
        add_action('rest_api_init', [$this, 'add_endpoints']);
    }

    public function add_endpoints(): void {
        register_rest_route('my-plugin/v1', '/menu', [
            'methods'             => 'GET',
            'callback'            => [$this, 'menu_endpoint'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function menu_endpoint(): WP_REST_Response {
        $primary  = wp_get_nav_menu_items('primary-menu');
        $footer   = wp_get_nav_menu_items('footer-menu');
        $response = new WP_REST_Response([
            'primary' => $primary,
            'footer'  => $footer,
        ]);
        $response->status = !!$primary && !!$footer ? 200 : 500;
        $response->header('Content-Type', 'application/json');
        return $response;
    }
}

?>
```

It is fairly easy to implement this in our WP-API Client:

```typescript
import { WpApiClient } from 'wp-api-client'
const EP_MENU = 'my-plugin/v1/menu'

interface WPMenu {
    primary: WPMenuItem[]
    footer: WPMenuItem[]
}

interface WPMenuItem {
    attr_title: string
    classes: string[]
    ID: number
    menu_order: number
    menu_item_parent: string
    object: 'page' | 'post'
    type: 'post_type' | 'post_type_archive'
    url: string
    target: '' | '_blank'
    title: string
    // …
}

class CmsApiClient extends WpApiClient {
    constructor() {
        super(
            'https://my-wordpress-website.com',
            (message: string) => console.error(message)
        )
    }

    menu = this.createEndpointCustomGet<WPMenu>(EP_MENU) as () => Promise<WPMenu>
}

export const CmsClient = new CmsApiClient()
```

### Custom Post Types

It does not take much to add the methods for any of your registered Custom Post Types.

```typescript
import { EndpointCreate, EndpointUpdate, WpApiClient } from 'wp-api-client'
import { baseURL, EP_PRODUCTS } from './constants'
import { WPProduct } from './types'

class CmsApiClient extends WpApiClient {
    constructor() {
        super(baseURL, (message: string) => console.error(message))
    }

    public product(): {
        find: () => Promise<WPProduct[]>
        findOne: (id: number) => Promise<WPProduct>
        create: EndpointCreate<WPProduct>
        update: EndpointUpdate<WPProduct>
    } {
        const getProduct = this.createEndpointGet<WPProduct>(EP_PRODUCTS)
        const newProduct = this.createEndpointPost<WPProduct>(EP_PRODUCTS)
        const updateProduct = this.createEndpointPost<WPProduct>(EP_PRODUCTS)
        return {
            find: getProduct as () => Promise<WPProduct[]>,
            findOne: getProduct as (id: number) => Promise<WPProduct>,
            create: newProduct,
            update: updateProduct,
        }
    }
}

export const CmsClient = new CmsApiClient()
```

### Extend Default Routes

WordPress plugins, such as [Advanced Custom Fields](https://www.advancedcustomfields.com/), can extend/modify the WP-API's response of default obects (WPPage, WPPost, …), which of course needs to be reflected in the API client's responses. If you are using TypeScript, the default methods can be extended with your custom typing.

```typescript
import { WpApiClient, WPPage } from 'wp-api-client'
const CmsClient = new WpApiClient('https://my-wordpress-website.com')

interface CustomPage extends WPPage {
    acf: {
        hideTitle: boolean,
        gallery: string[],
        // …
    }
}

// The response object can be casted like this:

CmsClient.page<CustomPage>().find()
CmsClient.page<CustomPage>().findOne(id)
CmsClient.page<CustomPage>().create()
CmsClient.page<CustomPage>().update(id)
```

Or, you might prefer to do it this way:

```typescript
import { EndpointCreate, EndpointUpdate, WpApiClient } from 'wp-api-client'
import { baseURL } from './constants'
import { CustomPage } from './types'

class CmsApiClient extends WpApiClient {
    constructor() {
        super(baseURL, (message: string) => console.error(message))
    }

    public page<P = CustomPage>(): {
        find: () => Promise<P[]>
        findOne: (id: number) => Promise<P>
        create: EndpointCreate<P>
        update: EndpointUpdate<P>
    } {
        return super.page<P>()
    }
}

export const CmsClient = new CmsApiClient()
```

### Default/Custom Intercepters

[ ToDo ]
JWT-Auth
