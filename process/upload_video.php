<?php
// Cho phép JS gọi từ trang khác
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$uploadDir = "../Record file/uploads/";  // Nơi lưu video
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

if ($_FILES['video']['error'] === 0) {
    $ext = pathinfo($_FILES['video']['name'], PATHINFO_EXTENSION);
    $newName = "video_" . date("Ymd_His") . "_" . rand(1000,9999) . ".$ext";
    $dest = $uploadDir . $newName;

    if (move_uploaded_file($_FILES['video']['tmp_name'], $dest)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Nộp bài thành công!',
            'file' => $newName
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Lỗi lưu file']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Không nhận được video']);
}
?>