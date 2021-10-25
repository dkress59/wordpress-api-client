<?php
/*
Plugin Name: WP API Client Demo
Plugin URI:
Description:
Version: 0.1.3.1
Author: Damian Kress
Author URI: http://damiankress.de
Text Domain: client-demo
*/

namespace ClientDemo;

require_once 'includes/rest-endpoints.php';
new RESTEndpoints();

require_once 'includes/post-types.php';
new PostTypes();