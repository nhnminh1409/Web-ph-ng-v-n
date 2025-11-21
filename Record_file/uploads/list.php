<?php
header('Content-Type: application/json');
$files = array_diff(scandir('./'), ['.', '..', 'index.php', 'list.php']);
echo json_encode(array_values($files));
?>