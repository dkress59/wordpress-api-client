# Custom End Points

Let's say you have two [navigation menus](https://developer.wordpress.org/reference/functions/register_nav_menu/)
registered in your WordPress-Theme's functions.php, and you have a
[custom WP-API-route](https://developer.wordpress.org/reference/functions/register_rest_route/)
registered, something like this:

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
