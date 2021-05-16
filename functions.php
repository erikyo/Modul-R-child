<?php

$modul_r_defaults = array(
	'colors' => array(
		'primary' => '#17bebb',
		'secondary' => '#33658A',
		'white' => '#ffffff',
		'white-smoke' => '#f6f6f6',
		'gray-light' => '#e3e3e3',
		'gray' => '#888888',
		'gray-dark' => '#4e4e4e',
		'black' => '#222222',
	),
	'style' => array(
		'background' => 'white-smoke',
		'title-color' => 'black',
		'text-color' => 'black',
		'header-color' => 'white',
		'header-text-color' => 'black',
		'footer-color' => 'gray-light',
		'footer-bottom-color' => 'primary',
		'footer-text-color' => 'gray-dark',
	),
	'social_media_enabled' => array( 'Facebook', 'Instagram', 'Twitter', 'Linkedin', 'YouTube', 'www' )
);

require_once( get_stylesheet_directory() . '/inc/mimetypes.php' );
require_once( get_stylesheet_directory() . '/inc/clean.php' );
require_once( get_stylesheet_directory() . '/inc/masonry.php' );
require_once( get_stylesheet_directory() . '/inc/enqueue-scripts.php' );