# Authentification

If you would like to use any method to create, update or delete content, or if
you would like to retrieve content which is [restricted](#user-role-restriction)
to certain user roles, you will need to authenticate your client with WordPress.

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

		// enqueue your compiled JS/TS SPA
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
import { baseURL } from './constants'

const nonce = global.window?.userData?.nonce

export const CmsClient = new WpApiClient(
    baseURL,
	{
		auth: {
			type: 'nonce',
			nonce: nonce,
		},
	}
)
```

## WP Basic-Auth

Basic Authentification can be enabled for your WordPress installation with the plugin
[WP-API/Basic-Auth](https://github.com/WP-API/Basic-Auth ':crossorgin'). This is
arguably the most insecure authentification method you could choose, so it should
exclusively be used **for development purposes**.

!> **Be considerate**, my friend!

```typescript
import WpApiClient from 'wordpress-api-client'
import { baseURL } from './constants'

export const CmsClient = new WpApiClient(
    baseURL,
	{
		auth: {
			type: 'basic',
			password: 'admin_password',
			username: 'admin',
		},
	}
)
```

## JWT-Auth for WordPress

[JWT-Auth for WordPress](https://wordpress.org/plugins/jwt-auth/ ':crossorgin')
relies on the jsonwebtoken technology, which is a whole other deal in terms of
security and therefore needs to be set up quite a bit more carefully. Always keep
in mind that you can whitelist any end point of your WP REST API via PHP
("Whitelisting Endpoints" in the plugin's documentation). The routes which need
authentification can be configured with the [protected](#blacklisting-whitelisting)
option.

```typescript
import WpApiClient from 'wordpress-api-client'
import { baseURL } from './constants'

export const CmsClient = new WpApiClient(
    baseURL,
	{
		auth: {
			type: 'jwt',
			token: 'my_jsonwebtoken',
		},
	}
)
```

## OAuth

There is now example, yet, for WP+OAuth. Please report an [issue](https://github.com/dkress59/wordpress-api-client/issues),
if you really need one!

## Blacklisting / Whitelisting

Routes, which require authentification can be set with the `protected` option.
You can extend and/or filter the defaults, like this:

```typescript
import WpApiClient from 'wordpress-api-client'
import { END_POINT_PROTECTED } from 'wordpress-api-client/constants'

export const CmsClient = new WpApiClient(
    baseURL,
	{
		auth: {
			type: 'jwt',
			token: 'my_jsonwebtoken',
		},
		protected: {
			GET: [ ...END_POINT_PROTECTED.GET, 'wp/v2/orders' ],
			POST: [ ...END_POINT_PROTECTED.POST, 'wp/v2/orders' ],
			DELETE: [ ...END_POINT_PROTECTED.DELETE, 'wp/v2/orders' ],
		}
	}
)
```

## User Role Restriction

Methods/end points which require authentification usually are also restricted by
user role. For example, the `.page().create()` method is available to (authenticated)
administrators, but it will throw an error for users with the role of 'subscriber'.

In the examples above authentification is set globally on the AxiosInstance,
for all POST and DELETE methods. It might be the case, though, that you have a
REST route registered in WordPress which accepts POST requests and does not
require authentification. In this case you need to configure a
custom [Axios Interceptor](https://axios-http.com/docs/interceptors).

It is also possible to restrict GET requests (e.g. to list posts of a custom
post type) by user role. Here is an example of a custom post type which can only
be requested by authenticated users ('minimum' default WP user role is 'subscriber'),
and can only be edited by administrators:

[ ToDo: Example CPT "Change Log" ]

Even if authenticated, as demonstrated above, some methods/end points still might
not be available. In your theme/plugin, make sure that the paramenter 'show_in_rest'
is set to true in your `register_post_type()` function's arguments.
