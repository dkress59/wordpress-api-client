<?php

namespace ClientDemo;

class DemoTheme {

	public function __construct() {
		$this->register_menus();
		$this->setup_theme();
	}

	private function register_menus(): void {
		register_nav_menu(
			'primary',
			'Main Menu'
		);
		register_nav_menu(
			'footer',
			'Footer Sitemap Menu'
		);
		register_nav_menu(
			'social',
			'Social Icons Menu'
		);
	}
	private function setup_theme() {
		add_filter('xmlrpc_enabled', '__return_false');
	}

}

new DemoTheme();