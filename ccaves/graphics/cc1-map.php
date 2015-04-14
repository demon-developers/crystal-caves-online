<?php

$tiles        = imagecreatefrompng("cc1-tiles-debug.png");
if(!$tiles){
	echo "Failed to open cc1-tiles.png";
	exit;
}

$tile_width   = 16 * 4;
$tile_height  = 16 * 4;

$tiles_per_row = imagesx($tiles) / $tile_width;

$map_json     = file_get_contents("cc1-map.json");
if(!$map_json){
	echo "Failed to open cc1-map.json";
	exit;
}

$map_data   = json_decode($map_json);
if(!$map_data){
	echo "Invalid JSON";
	exit;
}

$map_width  = $map_data->level_width  * $tile_width;
$map_height = $map_data->level_height * $tile_height;

$map        = imagecreate($map_width, $map_height);
$c_trans    = imagecolorallocate($map, 255, 204, 255);
$c_text     = imagecolorallocate($map, 160,   0, 200);

imagecolortransparent($map, $c_trans);

imagefilledrectangle($map, 0, 0, $map_width, $map_height, $c_trans);

for($row = 0; $row < $map_data->level_height; $row++){
	for($col = 0; $col < $map_data->level_width; $col++){
		$tile_index = $map_data->level_data[$row][$col];
		$dst_x = $col * $tile_width;
		$dst_y = $row * $tile_height;
		$src_x  = intval($tile_index % $tiles_per_row) * $tile_width;
		$src_y  = intval($tile_index / $tiles_per_row) * $tile_height;
		imagecopy($map, $tiles, $dst_x, $dst_y, $src_x, $src_y, $tile_width, $tile_height);
		imagestring($map, 2, $dst_x + 3, $dst_y + 16, ($col + 1).'x'.($row + 1), $c_text);
	}
}

imagepng($map, "cc1-map-debug.png");

imagedestroy($tiles);
imagedestroy($map);
