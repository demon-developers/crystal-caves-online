<?php

$in = imagecreatefrompng("cc1-tiles.png");
if(!$in){
	echo "Failed to open cc1-tiles.png";
	exit;
}

$out_width   = imagesx($in) * 4;
$out_height  = imagesy($in) * 4;
$tile_width  = 16 * 4;
$tile_height = 16 * 4;

$out = imagecreate($out_width, $out_height);

$c_trans = imagecolorallocate($out, 255, 204, 255);
$c_text  = imagecolorallocate($out, 160,   0, 200);
imagecolortransparent($out, $c_trans);

imagecopyresized($out, $in, 0, 0, 0, 0, $out_width, $out_height, imagesx($in), imagesy($in));
imagedestroy($in);

for($y = 0; $y < $out_height; $y += $tile_height){
	imageline($out, 0, $y, $out_width, $y, $c_text);
}

for($x = 0; $x < $out_width; $x += $tile_width){
	imageline($out, $x, 0, $x, $out_height, $c_text);
}

$total = 0;
for($y = 0; $y < $out_height; $y += $tile_height){
	for($x = 0; $x < $out_width; $x += $tile_width){
		imagestring($out, 7, $x + 3, $y, $total, $c_text);
		$total++;
	}
}

imagepng($out, "cc1-tiles-debug.png");
imagedestroy($out);
