<?php

// list all global variables in the MainMenu/GlobalVariables directory
foreach(glob("../MainMenu/GlobalVariables/*.json") as $filename){
  $name = preg_split("/\/GlobalVariables\//",$filename);
  $name = preg_split("/\.json/", $name[1]);
  echo "<div class='gVarFile'>" .  $name[0] . "</div>";
}