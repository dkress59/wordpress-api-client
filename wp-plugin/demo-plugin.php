<?php
/*
Plugin Name: Demo Plugin
Plugin URI:
Description: WP API Client Demo
Version: 0.1.5.1
Author: Damian Kress
Author URI: http://damiankress.de
Text Domain: client-demo
*/

namespace ClientDemo;

require_once 'includes/rest-endpoints.php';
new RESTEndpoints();

require_once 'includes/post-types.php';
new PostTypes();

require_once 'includes/user-capabilities.php';
new UserCapabilities();