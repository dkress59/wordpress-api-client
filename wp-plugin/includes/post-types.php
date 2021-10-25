<?php

namespace ClientDemo;

class PostTypes {

	public function __construct() {
		add_action('init', [$this, 'register_custom_post_types']);
		add_action('init', [$this, 'register_custom_taxonomies']);
	}

	public function register_custom_post_types() {
		register_post_type('product', [
			//'capability_type' => ['product', 'products'],
			'has_archive'  => true,
			'labels'       => [
				'name'          => __('Products', 'client-demo'),
				'singular_name' => __('Product', 'client-demo'),
			],
			//'map_meta_cap'    => true,
			'menu_icon'    => 'dashicons-tag',
			'public'       => true,
			'rewrite'      => ['slug' => 'collection'],
			'show_in_rest' => true,
			'supports'     => [
				'title',
				'editor',
				'excerpt',
				'thumbnail',
				'revisions',
				'page-attributes',
			],
		]);
	}

	public function register_custom_taxonomies() {
		register_taxonomy('product_category', 'product', [
			'hierarchical'      => true,
			'labels'            => [
				'name'          => __('Categories', 'client-demo'),
				'singular_name' => __('Category', 'client-demo'),
			],
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'query_var'         => true,
			'rest_base'         => 'product-category',
			'rewrite'           => ['slug' => 'product-category'],
		]);
		register_taxonomy('product_tag', 'product', [
			'hierarchical'      => false,
			'labels'            => [
				'name'          => __('Tags', 'client-demo'),
				'singular_name' => __('Tag', 'client-demo'),
			],
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'query_var'         => true,
			'rest_base'         => 'product-tag',
			'rewrite'           => ['slug' => 'product-tag'],
		]);
	}

	/*private function setup_capabilities() {
		$this->give_products_capabilities(get_role('administrator'));
	}

	private function give_products_capabilities(WP_Role $role) {
		$role->add_cap('edit_products');
		$role->add_cap('edit_others_products');
		$role->add_cap('edit_private_products');
		$role->add_cap('edit_published_products');
		$role->add_cap('publish_products');
		$role->add_cap('delete_private_products');
		$role->add_cap('delete_published_products');
		$role->add_cap('delete_others_products');
	}*/

}