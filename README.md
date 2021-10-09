# WordPress-API Client

[![npm version](https://badge.fury.io/js/wordpress-api-client.svg)](https://badge.fury.io/js/wordpress-api-client)

The last JavaScript Client for your WP-API. Super simple yet highly extensible.

ToDo:

- [ ] try: wp-types
- [X] URLSearchParams
- [ ] Categories & Tags
- [ ] Create-Update-Return-Types
- [X] Improve typings: WPPost, WPPage
- [X] Constructor Validation
- [X] Media Gallery
- [ ] Catch 404s
- [X] PickRename
- [X] /wp-json
- [ ] Jest

## Installation

Depending on the package manager of your choice:

```bash
yarn add wordpress-api-client
```

```bash
npm install wordpress-api-client
```

## Usage

- [Defaults](#default-methods)
- [Helper Methods](#helper-methods)
- [Custom Post Types](#custom-post-types)
- [Custom End Points](#custom-end-points)
- [Advanced Custom Fields](#extend-default-routes)
- [JWT-Auth for WordPress](#default-custom-interceptors)

---

### Default Methods

To instantiate a WP-API Client you need to base the base URL of your WordPress website to the constructor. You can pass an `onError`-function as the second parameter and an exisitng axiosInstance as the third parameter (more on that here: [JWT-Auth for WordPress](#jwt-auth-for-wordpress)).
With a bare instance of WpApiClient you will get methods to retreive, add and update any post, page, post-category or post-tag.

```typescript
import { WpApiClient } from 'wordpress-api-client'
const CmsClient = new WpApiClient('https://my-wordpress-website.com')

// Methods:

CmsClient.post().findAll()
CmsClient.post().findOne(id)
CmsClient.post().create()
CmsClient.post().update(id)

CmsClient.page().findAll()
CmsClient.page().findOne(id)
CmsClient.page().create()
CmsClient.page().update(id)

CmsClient.postCategory().findAll()
CmsClient.postCategory().findOne(id)
CmsClient.postCategory().create()
CmsClient.postCategory().update(id)

CmsClient.postTag().findAll()
CmsClient.postTag().findOne(id)
CmsClient.postTag().create()
CmsClient.postTag().update(id)
```

---

### Helper Methods

The WpApiClient class uses three utility types and four helper methods:

- WPCreate
- EndpointCreate
- EndpointUpdate
- createEndpointGet
- createEndpointPost
- createEndpointCustomGet
- createEndpointCustomPost

To understand `createEndpointGet` and `createEndpointPost`, one needs to know a few things about the WordPress API itself: To retreive a list of posts, one needs to GET-request the route `/posts`. For a specific post the route that needs to be requested `/posts/{id}`. The same goes for pages; `/pages`, `/pages/{id}`.

To update a specific post or page, a POST request must be sent to `/posts{id}` or `/pages/{id}`, for a new post/page the POST request goes directly to `/posts`/`/pages`. This schema is valid for all WordPress-built-ins (Posts, Pages, Post-Categories, Post-Tags, Media), and also for all registered [Custom Post Types](https://developer.wordpress.org/reference/functions/register_post_type/) and [Custom Taxonomies](https://developer.wordpress.org/reference/functions/register_taxonomy/).

For this recurring schema the WpApiClient class (and any sub-class) can use the methods `createEndpointGet` and `createEndpointPost`. Both methods responses' type can be casted on the respective method, and both methods need the path to your end point (starting after `/wp-json`) as parameter. See the [next chapter](#custom-post-types) for an example. The two POST-Methods use a utility type, `WPCreate`, because the output format of the `post_content` and `post_title` fields is an object (`{ rendered: string }`), but the input format for these fields must be a plain string.

The utility type `EndpointCreate` will strip the `id` field from any type (e.g. POST to `/pages`), in accordance to the WP-API requirements. The `EndpointUpdate` utility type simply turns any type into a `Partial`, so that selective fields of any post type can be updated (e.g POST to. `/posts/{id}`)

Of course, your are free to extend the WpApiClient class in any which way that suits you – but there are two more helpers that you can use, if you need to add methods for __custom__ wp-api end points. `createEndpointCustomGet` and `createEndpointCustomPost` also work very similarly; they both only take the respective path to the end point as a single, required argument, but they can be given up to two type arguments: The response type as the first, and a fallback type for errors as the second argument. You can find an [example here](#custom-end-points).

---

### Custom Post Types

It does not take much to add the methods for any of your registered Custom Post Types.

```typescript
import { EndpointCreate, EndpointUpdate, WpApiClient } from 'wordpress-api-client'
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

---

### Custom End Points

Let's say you have two [navigation menus](https://developer.wordpress.org/reference/functions/register_nav_menu/) registered in your WordPress-Theme's functions.php, and you have a [custom WP-API-route](https://developer.wordpress.org/reference/functions/register_rest_route/) registered, something like this:

```php
<?php

use WP_REST_Response;

class RESTEndpoints {

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
import { WpApiClient } from 'wordpress-api-client'
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

    menu = this.createEndpointCustomGet<WPMenu>(EP_MENU)
}

export const CmsClient = new CmsApiClient()
```

---

### Extend Default Routes

WordPress plugins, such as [Advanced Custom Fields](https://www.advancedcustomfields.com/), can extend/modify the WP-API's response of default obects (WPPage, WPPost, …), which of course needs to be reflected in the API client's responses. If you are using TypeScript, the default methods can be extended with your custom typing.

```typescript
import { WpApiClient, WPPage } from 'wordpress-api-client'
const CmsClient = new WpApiClient('https://my-wordpress-website.com')

interface CustomPage extends WPPage {
    acf: {
        hideTitle: boolean,
        gallery: string[],
        // …
    }
}

// The response object can be casted like this:

CmsClient.page<CustomPage>().findAll()
CmsClient.page<CustomPage>().findOne(id)
CmsClient.page<CustomPage>().create()
CmsClient.page<CustomPage>().update(id)
```

Or, you might prefer to do it this way:

```typescript
import { EndpointCreate, EndpointUpdate, WpApiClient } from 'wordpress-api-client'
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

#### ACF to REST API

[ ToDo ]

#### Yoast SEO (wordpress-seo)

[ ToDo ]

---

### Default and Custom Interceptors

[ ToDo ]

#### WP-Basic-Auth

[ ToDo ]

#### JWT-Auth for WordPress

[ ToDo ]
