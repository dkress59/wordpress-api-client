<?php
/**
 * Plugin Name:       Hide REST Date Fields
 * Description:       Hide date-related fields from REST API
 * Version:           0.0.1
 * Requires at least: 5.8.2
 * Requires PHP:      8.0
 * Author:            Damian Kress
 * Author URI:        https://www.damiankress.de/
 */

add_filter( 'rest_prepare_post', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_page', 'rest_hide_date_fields', 10, 3 );
add_filter( 'rest_prepare_attachment', 'rest_hide_date_fields', 10, 3 );
function rest_hide_date_fields( $data, $post, $request ) {
	$_data = $data->data;
	error_log(json_encode($data));
	error_log(json_encode($post));

	if (isset( $_data['date'] ) ) {
		unset( $_data['date'] );
		unset( $_data['date_gmt'] );
		unset( $_data['modified'] );
		unset( $_data['modified_gmt'] );
	}
	$data->data = $_data;

	return $data;
}