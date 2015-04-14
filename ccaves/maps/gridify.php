<?php

if($argc < 2){
	echo "Usage: ".$argv[0]." <map_file.gif>";
	exit;
}

$in          = imagecreatefromgif($argv[1]);
$out_width   = imagesx($in) * 4;
$out_height  = imagesy($in) * 4;
$tile_width  = 16 * 4;
$tile_height = 16 * 4;

$out = imagecreatetruecolor($out_width, $out_height);

$c_text = imagecolorallocate($out, 255, 204, 255);

imagecopyresized($out, $in, 0, 0, 0, 0, $out_width, $out_height, imagesx($in), imagesy($in));
imagedestroy($in);

for($y = 0; $y < $out_height; $y += $tile_height){
	imageline($out, 0, $y, $out_width, $y, $c_text);
}

for($x = 0; $x < $out_width; $x += $tile_width){
	imageline($out, $x, 0, $x, $out_height, $c_text);
}

for($y = 0; $y < $out_height; $y += $tile_height){
	for($x = 0; $x < $out_width; $x += $tile_width){
		imagestring($out, 7, $x + 3, $y, 
			(1 + ($x / $tile_width)).'x'.
			(1 + ($y / $tile_height)), $c_text);
	}
}

imagepng($out, strtolower($argv[1]).'.png');
imagedestroy($out);
