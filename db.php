<?php

# USER SET UP:

    $userName = "cariboo";

    $password = "CAB67S";

    $licenseKey = "TT27KF71H48MYW";

    $inputLocation = "index.php";      # Use an absolute reference like "http://www.mysite.com/index.php"

    $outputLocation = "data.php";      # Use an absolute reference like "http://www.mysite.com/myscript.php"

    $cssStyle = "";

    $hostname = $_SERVER['HTTP_HOST'];





############################### DO NOT CHANGE ANYTHING BELOW THIS LINE ##########################################




    function getYears()
    {
        $data = "userName=" . $GLOBALS['userName'] . "&password=" . $GLOBALS['password'] . "&licenseKey=" . $GLOBALS['licenseKey'] . "&cssStyle=" . $GLOBALS['cssStyle'] .
                "&host=" . $GLOBALS['hostname'];
        $years = getHTML($data);
        return $years;
    } 

    function getMakes($year)
    {
        $data = "userName=" . $GLOBALS['userName'] . "&password=" . $GLOBALS['password'] . "&licenseKey=" . $GLOBALS['licenseKey'] . "&cssStyle=" . $GLOBALS['cssStyle'] .
                "&selectYear=" . $year . "&host=" . $GLOBALS['hostname'];
        $makes = getHTML($data);
        return $makes;
    }

    function getModels($year, $make)
    {
        $data = "userName=" . $GLOBALS['userName'] . "&password=" . $GLOBALS['password'] . "&licenseKey=" . $GLOBALS['licenseKey'] . "&cssStyle=" . $GLOBALS['cssStyle'] .
                "&selectYear=" . $year . "&selectMake=" . $make . "&host=" . $GLOBALS['hostname'];
        $models = getHTML($data);
        return $models;
    }

    function getFormData($year, $make, $model)
    {
        $data = "userName=" . $GLOBALS['userName'] . "&password=" . $GLOBALS['password'] . "&licenseKey=" . $GLOBALS['licenseKey'] . "&cssStyle=" . $GLOBALS['cssStyle'] .
                "&selectYear=" . $year . "&selectMake=" . $make . "&selectModel=" . $model . "&host=" . $GLOBALS['hostname'];

        $formData = getHTML($data);
        //echo form data into a proper html form
        echo '<form name="results">';
        echo $formData;
        echo '</form>';
        return;
    }

    function getHTML($data)
    {
        #  vars
        $host = 'www.plussizingguide.com';
        $uri = '/cgi-bin/ultimate_guide_online.cgi';
        $html = '';

        # compose HTTP request header
        $header = "Host: $host\r\n";
        $header .= "User-Agent: PHP Script\r\n";
        $header .= "Content-Type: application/x-www-form-urlencoded\r\n";
        $header .= "Content-Length: " . strlen($data) . "\r\n";
        $header .= "Connection: close\r\n\r\n";

        # open socket connection
        $fp = fsockopen('www.plussizingguide.com', 80, $errno, $errstr, 30);

        if (!$fp) {
            die('An error was encounterd or the service was not available, <a href="' . $inputLocation . '">click here</a> to try again');
        } else {
            fputs($fp, "POST $uri HTTP/1.1\r\n");
            fputs($fp, $header . $data);

            while (!feof($fp)) {
                $fp_result = fgets($fp, 4096);
                $pattern = "/</";
                if (preg_match($pattern, $fp_result)) {
                    $html .= $fp_result;
                }
            }

            fclose($fp);
        }
        return $html;
    }
