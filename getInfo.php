<?php

include_once WP_CONTENT_DIR . '/themes/chromium/assets/php/db.php';

//add all ajax request functions if on page 

add_action("wp_enqueue_scripts", "js_enqueue_scripts");
add_action('wp_ajax_nopriv_get_years', 'get_years');
add_action('wp_ajax_get_years', 'get_years');
add_action('wp_ajax_nopriv_get_makes', 'get_makes');
add_action('wp_ajax_get_makes', 'get_makes');
add_action('wp_ajax_nopriv_get_models', 'get_models');
add_action('wp_ajax_get_models', 'get_models');
add_action('wp_ajax_nopriv_search_tires', 'search_tires');
add_action('wp_ajax_search_tires', 'search_tires');

//import javascript files
function load_js_assets() {
        wp_enqueue_script('my-js', '/wp-content/themes/chromium/assets/js/makes.js', array('jquery'), '', false);
}
add_action('wp_enqueue_scripts', 'load_js_assets');

//define ajax handler
function js_enqueue_scripts() {
    if( is_page( 701 ) ) {
        wp_enqueue_script ("my-ajax-handle", get_stylesheet_directory_uri() . "/assets/js/formhandler.js", array('jquery')); 
    } 
    //the_ajax_script will use to print admin-ajaxurl in custom ajax.js
    wp_localize_script('my-ajax-handle', 'the_ajax_script', array('ajaxurl' =>admin_url('admin-ajax.php')));
}

//get years 
function get_years() {
    $years =  getYears();
    echo $years;
    exit;
}

//get makes given year
function get_makes() {
    $selectYear = $_POST['selectYear'];
    if(!empty($_POST['selectYear'])){
        $makesMenu .= getMakes($selectYear);
        echo $makesMenu;
    }
    exit;
}

//get models given year and make
function get_models() {
    $selectYear = $_POST['selectYear'];
    $selectMake = $_POST['selectMake'];
    if (!empty($_POST['selectMake'] && !empty($_POST['selectYear']))){
        $modelsMenu .= getModels($selectYear, $selectMake);
        echo $modelsMenu;
    }
    exit;
}

//search action given year, make, and model
function search_tires() {
    $selectYear = $_POST['selectYear'];
    $selectMake = $_POST['selectMake'];
    $selectModel = $_POST['selectModel'];

    //get search results if year, make and model are given
    if (!empty($_POST['selectModel']) && !empty($_POST['selectMake']) && !empty($_POST['selectYear'])) {
        getFormData($selectYear, $selectMake, $selectModel);
    }
}