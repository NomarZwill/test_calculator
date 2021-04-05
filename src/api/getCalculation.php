<?php
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON);

function calculate($inputString)
{
  $inputList = explode(' ', trim($inputString));

  if (count($inputList) != 3){
    return [
      'state' => 'input error, too few arguments',
      'result' => 0,
    ];
  }

  if ($inputList[1] === '/' && $inputList[2] === '0'){
    return [
      'state' => 'input error, division by zero',
      'result' => 0,
    ];
  }

  return [
    'state' => 'success',
    'result' => eval('return ' . $inputString . ';'),
  ];
}

echo json_encode(calculate($input->inputString));