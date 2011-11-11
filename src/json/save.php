<?php

if (isset($_POST["data"])){
  $data = stripslashes($_POST["data"]);
  //is $_POST["name" gets the name from the files.php?
  //when opening the file, set it to have write permission?
  //commented out the die("error"), but don't see any error message.
  //however, if the die statement is not commented out, after a save,
  //the save button stays selected and prevents open to be processed.
  $file = fopen("../files/" . $_POST["name"] . ".json", "w"); // or die("error");
  fwrite($file, $data);
  fclose($file);
  echo "saved";
}