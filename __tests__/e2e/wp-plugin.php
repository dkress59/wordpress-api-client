<?php
/**
 * Plugin Name:       REST for Jest
 * Description:       Hide date- and network-related fields from the WordPress REST API
 * Version:           0.0.1
 * Requires at least: 5.8.2
 * Requires PHP:      8.0
 * Author:            Damian Kress
 * Author URI:        https://www.damiankress.de/
 */

add_filter( 'rest_prepare_application_password', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_attachment', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_autosave', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_block_type', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_comment', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_page', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_plugin', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_post', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_post_type', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_revision', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_status', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_taxonomy', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_theme', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_user', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_wp_block', 'rest_hide_date_fields', 10, 3 );
function rest_hide_date_fields( $data, $post, $request ) {
	$_data = $data->data;

	if (isset($_data['author_ip'])) {
		unset($_data['author_ip']);
	}
	if (isset($_data['date'])) {
		unset($_data['date']);
		unset($_data['date_gmt']);
		unset($_data['modified']);
		unset($_data['modified_gmt']);
	}
	$data->data = $_data;

	return $data;
}