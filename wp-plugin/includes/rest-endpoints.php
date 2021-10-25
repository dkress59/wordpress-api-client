<?php

namespace ClientDemo;

use WP_REST_Response;

class RESTEndpoints {

	public function __construct() {
		add_action('rest_api_init', [$this, 'add_endpoints']);
		add_filter('wp_nav_menu_objects', [$this, 'nav_menu_icons'], 10, 2);
	}

	public function add_endpoints(): void {
		register_rest_route('demo-plugin/v1', '/menu', [
			'methods'             => 'GET',
			'callback'            => [$this, 'menu_endpoint'],
			'permission_callback' => '__return_true',
		]);
	}

	public function menu_endpoint(): WP_REST_Response {
		$locations = get_nav_menu_locations();
		$primary   = !isset($locations['primary'])
			? []
			: wp_get_nav_menu_items(
				get_term($locations['primary'], 'nav_menu')->name
			);
		$footer    = !isset($locations['footer'])
			? []
			: wp_get_nav_menu_items(
				get_term($locations['footer'], 'nav_menu')->name
			);
		$social    = !isset($locations['social'])
			? []
			: wp_get_nav_menu_items(
				get_term($locations['social'], 'nav_menu')->name
			);

		$response         = new WP_REST_Response(
			[
				'primary' => $primary,
				'footer'  => $footer,
				'social'  => array_map(
					function ($item) {
						$item->icon = get_field('icon', $item) ?: null;
						return $item;
					},
					$social,
				),
			]
		);
		$response->header('Content-Type', 'application/json');

		return $response;
	}

}