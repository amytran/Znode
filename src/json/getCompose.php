<?php

//data is an array of nodes that contain the input class
if (isset($_POST["data"])){
    $data = $_POST["data"];
 
    // list all nodes in the passed in data array
    foreach($data as $filename){
      echo "<div class='composeFile'>" .  $filename . "</div>";
    }
}