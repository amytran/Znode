<?php

// list all files in the source directory
foreach(glob("../source/*.js") as $filename){
  $name = preg_split("/\//",$filename);
  $name = preg_split("/\.js/", $name[2]);
  echo "<div class='classFile'>" .  $name[0] . "</div>";
}