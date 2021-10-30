<?php

namespace ClientDemo;

class DemoTheme {

	public function __construct() {
		add_filter('xmlrpc_enabled', '__return_false');
		$this->extend_theme_json();
		$this->setup_theme();
	}

	private function setup_theme() {
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

	public function extend_theme_json() {
		add_theme_support('title-tag');
		add_theme_support('post-formats', [
			'aside',
			'image',
			'gallery',
			'video',
			'audio',
			'link',
			'quote',
			'status',
		]);
		add_theme_support('post-thumbnails', ['post', 'page', 'product']);
		add_theme_support('html5', [
			'comment-list',
			'comment-form',
			'search-form',
			'gallery',
			'caption',
		]);
		add_theme_support('custom-background', [
			'default-image'      => '',
			'default-preset'     => 'default',
			'default-size'       => 'cover',
			'default-repeat'     => 'no-repeat',
			'default-attachment' => 'scroll',
		]);
		add_theme_support('custom-logo', [
			'height'      => 60,
			'width'       => 400,
			'flex-height' => true,
			'flex-width'  => true,
			'header-text' => ['site-title', 'site-description'],
		]);
	}

}

new DemoTheme();