<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $type = $_POST["type"] ?? 'UNKNOWN';
  $price = $_POST["price"] ?? '0';
  $time = $_POST["time"] ?? date('H:i:s');

  $line = "$time - $type @ $price\n";
  file_put_contents("log_signals.txt", $line, FILE_APPEND);
  echo "OK";
} else {
  echo "Invalid request.";
}
?>

