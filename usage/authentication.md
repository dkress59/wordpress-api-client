# Authentication

If you would like to use any method to create, update or delete content, or if
you would like to retrieve content which is [restricted](#user-role-restriction)
to certain user roles, you will need to authenticate your client with WordPress.

?> When using the `basic` and the `nonce` auth option **all** requests made by
your WordPress client will be using the generated authentication headers. With
the `jwt` option your client will only use its authentication headers when necessary
(e.g. to create or update posts or retrieve a list of used plugins). This dictionary
of protected end points can be controlled with the `protected option`:

```typescript
const client = new WpApiClient({
	auth: {
		type: 'jwt',
		token: 'my-token',
	},
	protected: {
		GET: [],
		DELETE: [],
		POST: [],
	},
})
```

## Password-Protected Content

WordPress post types such as Posts and Pages have a visibility option that can be
set in the admin interface, which allows posts to be protected by password.
These posts will appear as published posts in the REST API results, but certain
fields, such as `content`, `excerpt` and `title` have empty strings as values for
their `rendered` subfields, and their `protected`-subfield will be set to `true`.

Example Response:

```json
[
  {
    "id": 123.
    "content": {
      "protected": false,
      "rendered": "<p>Some rendered html-content.</p>"
    },
    "title": {
      "protected": false,
      "rendered": "Some Post Title"
    },
    ...
  },
  {
    "id": 124.
    "content": {
      "protected": true,
      "rendered": ""
    },
    "title": {
      "protected": true,
      "rendered": ""
    },
    ...
  },
  ...
]
```

In order to gain access to the restricted content, the password must be passed as
the `password` query parameter, e.g.:
`await client.post().find(new URLSearchParams({ password: 'post-password' }), 124)`
.

## WP-Nonce

The WP-Nonce is a WordPress built-in which you can utilise to authenticate your
client. This authentication option works best in the wp-admin context, for example
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

Basic Authentication can be enabled for your WordPress installation with the plugin
[WP-API/Basic-Auth](https://github.com/WP-API/Basic-Auth ':crossorgin'). This is
arguably the most insecure authentication method you could choose, so it should
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
authentication can be configured with the [protected](#blacklisting-whitelisting)
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

There is no example, yet, for WP with OAuth. Please report an [issue](https://github.com/dkress59/wordpress-api-client/issues),
if you really need one!

---

## Blacklisting / Whitelisting

Routes which require authentication can be set with the `protected` option.
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

Methods/end points which require authentication usually are also restricted by
user role. For example, the `.page().create()` method is available to (authenticated)
administrators, but it will throw an error for users with the role of 'subscriber'.

It is also possible to restrict GET requests (e.g. to list posts of a custom
post type) by user role. Here is an example of a custom post type which can only
be requested by authenticated users ('minimum' default WP user role is 'subscriber'),
and can only be edited by administrators:

<!-- // ToDo: Example CPT "Change Log" -->

Even if authenticated, as demonstrated above, some methods/end points still might
not be available. In your theme/plugin, make sure that the paramenter 'show_in_rest'
is set to true in your `register_post_type()` function's arguments.