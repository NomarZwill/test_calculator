<?php
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON);

$result = [
  'result' => '777'
];

echo json_encode($result);