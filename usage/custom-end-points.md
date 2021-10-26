# Custom End Points

Assuming you have two [navigation menus](https://developer.wordpress.org/reference/functions/register_nav_menu/)
registered in your WordPress-Theme.

<details>
<summary>PHP Example (Click to expand)</summary>
<br />

```php
<?php

use WP_REST_Response;

class RESTEndpoints {

    public function __construct() {
        add_action('rest_api_init', [$this, 'add_endpoints']);
    }

    private function get_nav_menu_items_by_location($location, $args = []): array {
        $locations = get_nav_menu_locations();
        $menu = wp_get_nav_menu_object($locations[$location]);
        $menu_items = wp_get_nav_menu_items($menu->name, $args);
        return $menu_items ?: [];
    }

    public function add_endpoints(): void {
        register_rest_route('my-plugin/v1', '/menu', [
            'methods'             => 'GET',
            'callback'            => [$this, 'menu_endpoint'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function menu_endpoint(): WP_REST_Response {
        $primary  = $this->get_nav_menu_items_by_location('primary-menu');
        $footer   = $this->get_nav_menu_items_by_location('footer-menu');
        $response = new WP_REST_Response([
            'primary' => $primary,
            'footer'  => $footer,
        ]);
        $response->status = !empty($primary) && !empty($footer) ? 200 : 500;
        $response->header('Content-Type', 'application/json');
        return $response;
    }

}

?>
```

</details>

It is fairly easy to implement this in our WP-API Client:

```typescript
import WpApiClient from 'wordpress-api-client'
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

export class CmsClient extends WpApiClient {
    constructor() {
        super('https://my-wordpress-website.com')
    }

    menu = this.createEndpointCustomGet<WPMenu>(EP_MENU)
}
```
