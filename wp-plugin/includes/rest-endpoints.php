<?php

namespace ClientDemo;

use WP_Error;
use WP_REST_Response;

class RESTEndpoints {

	public function __construct() {
		add_action('rest_api_init', [$this, 'add_endpoints']);
		add_action('rest_api_init', [$this, 'add_yoast_field'], 20);
		add_filter('wp_nav_menu_objects', [$this, 'nav_menu_icons'], 10, 2);
	}

	public static function get_yoast_headers(array $post): string {
		// You can easily reuse this static method
		if (function_exists('YoastSEO')) {
			$post_id     = isset($post['id']) ? (int) $post['id'] : (int) $post['ID'];
			$meta_helper = YoastSEO()->meta->for_post($post_id);
			$meta        = $meta_helper;
			$headers     = $meta->get_head();
			// You can either return a html string
			// or a proper JSON object
			// return $headers->json;
			return $headers->html;
		}
		return '';
	}

	public function add_endpoints(): void {
		register_rest_route('demo-plugin/v1', '/menu', [
			'methods'             => 'GET',
			'callback'            => [$this, 'menu_endpoint'],
			'permission_callback' => '__return_true',
		]);
	}

	public function menu_endpoint(): WP_REST_Response|WP_Error {
		if (!function_exists('get_field')) {
			return new WP_Error(500, 'get_field() not found', [
				'message' => 'Advanced Custom Fields appears to be inactive',
				'code'    => 500,
			]);
		}

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

		$response = new WP_REST_Response(
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

	public function add_yoast_field() {
		register_rest_field(
			'attachment',
			'yoastHead',
			['get_callback' => [$this, 'get_yoast_headers']],
		);
		register_rest_field(
			'post',
			'yoastHead',
			['get_callback' => [$this, 'get_yoast_headers']],
		);
		register_rest_field(
			'page',
			'yoastHead',
			['get_callback' => [$this, 'get_yoast_headers']],
		);
		register_rest_field(
			'product',
			'yoastHead',
			['get_callback' => [$this, 'get_yoast_headers']],
		);
	}

}