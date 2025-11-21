// Elements
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
const preview = document.getElementById('preview');
const playback = document.getElementById('playback');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const submitBtn = document.getElementById('submitBtn');
const retakeBtn = document.getElementById('retakeBtn');
const downloadOnlyBtn = document.getElementById('downloadOnlyBtn');
const status1 = document.getElementById('status1');
const status2 = document.getElementById('status2');
const videoList = document.getElementById('videoList');
const count = document.getElementById('count');
const refreshList = document.getElementById('refreshList');

let mediaRecorder, recordedChunks = [], finalBlob;


// TAB switching
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    if (tab.dataset.tab === 'list') loadVideoList();
  };
});


// Bắt đầu quay
startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  preview.srcObject = stream;
  recordedChunks = [];

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  // ⭐ FIX QUAN TRỌNG: Hiện video preview sau khi quay
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, {
      type: 'video/webm; codecs=vp8,opus'
    });
    finalBlob = blob;

    const videoURL = URL.createObjectURL(blob);

    // Load video chắc chắn nhất (Chrome mới yêu cầu gán src)
    playback.src = videoURL;
    playback.controls = true;

    playback.onloadeddata = () => {
      playback.pause();
    };

    // Chuyển tab Preview
    document.querySelector('[data-tab="preview"]').click();

    status2.innerHTML = 'Video đã sẵn sàng! Xem lại rồi nộp nhé ❤️';

    // Tắt camera
    if (preview.srcObject) {
      preview.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  status1.textContent = 'Đang ghi hình...';
};


// Dừng quay
stopBtn.onclick = () => {
  mediaRecorder.stop();
  if (preview.srcObject) {
    preview.srcObject.getTracks().forEach(t => t.stop());
  }
  startBtn.disabled = false;
  stopBtn.disabled = true;
};



// Upload server
submitBtn.onclick = async () => {
  if (!finalBlob) {
    status2.textContent = 'Chưa có video để nộp!';
    return;
  }

  status2.textContent = 'Đang upload...';

  const formData = new FormData();
  formData.append('video', finalBlob, `phongvan_${Date.now()}.webm`);

  try {
    const res = await fetch('../process/upload_video.php', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.status === 'success') {
      status2.innerHTML = '✅ Nộp bài thành công!';
      loadVideoList();
    } else {
      status2.textContent = 'Lỗi: ' + data.message;
    }
  } catch (e) {
    console.error(e);
    status2.textContent = 'Lỗi kết nối server';
  }
};



// Quay lại quay tiếp
retakeBtn.onclick = () => {
  document.querySelector('[data-tab="record"]').click();
};



// Tải về máy
downloadOnlyBtn.onclick = () => {
  if (!finalBlob) return;

  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phongvan_${Date.now()}.webm`;
  a.click();

  status2.textContent = 'Đã tải về máy (chưa upload)';
};


// Load danh sách video
async function loadVideoList() {
  try {
    const res = await fetch('uploads/list.php');
    const files = await res.json();

    count.textContent = files.length;
    videoList.innerHTML = '';

    files.forEach(file => {
      const div = document.createElement('div');
      div.className = 'video-item';

      div.innerHTML = `
        <video controls><source src="uploads/${file}" type="video/webm"></video>
        <p><strong>${file}</strong></p>
        <a href="uploads/${file}" download>Tải về</a>
      `;

      videoList.appendChild(div);
    });

  } catch {
    videoList.innerHTML = 'Không tải được danh sách. Kiểm tra file list.php.';
  }
}

refreshList.onclick = loadVideoList;


// Khi đổi tab mà playback có src thì load
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (playback.src) playback.load();
  });
});
