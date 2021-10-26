# Authentification

If you would like to use any method to create or update content, or if you would
like to retrieve content which is restricted to certain user roles, you will need
to authentificate you client with WordPress.

## WP-Nonce

The WP-Nonce is a WordPress built-in which you can utilise to authenticate your
client. This authentification option works best in the wp-admin context, for example
if you are developing a __JS/TS SPA for a designated options page__ inside the
WordPress Admin.

<details>
<summary>PHP Example (Click to expand)</summary>
<br />

```php
<?php

namespace DemoPlugin;

class OrdersDashboard {
	public function __construct() {
		add_action('acf/init', [$this, 'register_orders_dashboard']);
		add_action('admin_enqueue_scripts', [$this, 'load_react_scripts']);
	}

	public function register_orders_dashboard() {
		if (function_exists('acf_add_options_page')) {
			// https://www.advancedcustomfields.com/resources/options-page/
			acf_add_options_page([
				'capability' => 'promote_users',
				'icon_url'   => 'dashicons-cart',
				'menu_slug'  => 'orders-dashboard',
				'menu_title' => __('Orders'),
				'page_title' => __('Orders Dashboard'),
				'position'   => '12.2',
				'post_id'    => 'orders',
			]);
		}
	}

	public function load_react_scripts() {
		$screen = get_current_screen();
		if (!$screen || $screen->id !== 'toplevel_page_orders-dashboard') return;

		// enqueue your compiled JS/TS PWA
		wp_enqueue_script(
			'orders-dashboard-vendors',
			plugin_dir_url(__DIR__) . 'assets/dashboard/vendors.js'
		);
		wp_enqueue_script(
			'orders-dashboard-react',
			plugin_dir_url(__DIR__) . 'assets/dashboard/dashboard.js',
            ['orders-dashboard-vendors'],
            uniqid(),
			true
		);

		// localize the id and a nonce for the current user
		wp_localize_script(
			'orders-dashboard-react', // the script which requires this data
			'userData', [ // will be available as window.userData 
				'id'    => get_current_user_id(),
				'nonce' => wp_create_nonce('wp_rest'),
			]
		);
	}
}
new OrdersDashboard();
```

</details>
<br />

```typescript
import WpApiClient from 'wordpress-api-client'
import axios from 'axios'
import { baseURL } from './constants'

const nonce = global.window?.userData?.nonce

const axiosInstance = axios.create()
axiosInstance.defaults.headers.post['X-WP-Nonce'] = nonce

export const CmsClient = new WpApiClient(
    baseURL,
    (message: string) => console.error(message),
    axiosInstance,
)
```

## WP Basic-Auth

Basic Authentification can be enabled for your WordPress installation with the plugin
[WP-API/Basic-Auth](https://github.com/WP-API/Basic-Auth). This is arguably the most
insecure authentification method you could choose, so it should exclusively be used
for development purposes.

!> **Be careful**, my friend!

```typescript
import WpApiClient from 'wordpress-api-client'
import axios from 'axios'
import { baseURL } from './constants'

const axiosInstance = axios.create()
axiosInstance.defaults.headers.post['Authorization'] = `Basic ${Buffer.from(
    'my-username:my-password',
).toString('base64')}`

export const CmsClient = new WpApiClient(
    baseURL,
    (message: string) => console.error(message),
    axiosInstance,
)
```

## JWT-Auth for WordPress

[JWT-Auth for WordPress](https://wordpress.org/plugins/jwt-auth/) relies on the
jsonwebtoken technology, which is a whole other deal in terms of security and
therefore needs to be set up quite a bit more carefully. Always keep in mind that
you can whitelist any end point of your WP REST API via PHP ("Whitelisting Endpoints"
in the plugin's documentation).

[ ToDo ]

## OAuth

[ ToDo ]
