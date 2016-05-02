<?php 

	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);

	$file = "../examples/".$request->file.".json";

	$open = fopen($file, "w");
	//echo $request->data;
	fwrite($open, $request->data);
	fclose($open);
	//echo $request->data;
?>