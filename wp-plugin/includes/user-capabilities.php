<?php

namespace ClientDemo;

use WP_Role;

class UserCapabilities {

	public function __construct() {
		register_activation_hook(
			dirname(__DIR__) . '/demo-plugin.php',
			[$this, 'add_roles_and_capabilities']
		);
	}

	public function add_roles_and_capabilities(): void {
		$admin = get_role('administrator');
		$this->give_products_capabilities($admin);

		$product_manager = add_role(
							   'product-manager',
							   'Product Manager'
						   ) ?? get_role('product-manager');
		$product_manager->add_cap('read');
		$product_manager->add_cap('upload_files');

		$this->give_products_capabilities($product_manager);
		$this->give_posts_capabilities($product_manager);
	}

	public function give_products_capabilities(WP_Role $role) {
		$role->add_cap('edit_products');
		$role->add_cap('edit_others_products');
		$role->add_cap('edit_private_products');
		$role->add_cap('edit_published_products');
		$role->add_cap('publish_products');
		$role->add_cap('delete_private_products');
		$role->add_cap('delete_published_products');
		$role->add_cap('delete_others_products');
	}

	public function give_posts_capabilities(WP_Role $role) {
		$role->add_cap('edit_posts');
		$role->add_cap('edit_others_posts');
		$role->add_cap('edit_private_posts');
		$role->add_cap('edit_published_posts');
		$role->add_cap('publish_posts');
		$role->add_cap('delete_private_posts');
		$role->add_cap('delete_published_posts');
		$role->add_cap('delete_others_posts');
	}

	public function give_pages_capabilities(WP_Role $role) {
		$role->add_cap('edit_pages');
		$role->add_cap('edit_others_pages');
		$role->add_cap('edit_private_pages');
		$role->add_cap('edit_published_pages');
		$role->add_cap('publish_pages');
		$role->add_cap('delete_private_pages');
		$role->add_cap('delete_published_pages');
		$role->add_cap('delete_others_pages');
	}

}