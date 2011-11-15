<?php

// list all files in the files directory
foreach(glob("../files/*.js") as $filename){
  $name = preg_split("/\//",$filename);
  $name = preg_split("/\.js/", $name[2]);
  echo "<div class='class'>" .  $name[0] . "</div>";
}