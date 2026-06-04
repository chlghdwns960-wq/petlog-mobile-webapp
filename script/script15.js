const CAPTURED_PHOTO_STORAGE_KEY = "petlogCapturedPhotos";
const MAX_SAVED_PHOTOS = 8;
const CAPTURE_SIZE = 1200;
const CAPTURE_QUALITY = 0.86;

const cameraVideo = document.getElementById("cameraVideo");
const capturedPreview = document.getElementById("capturedPreview");
const captureCanvas = document.getElementById("captureCanvas");
const cameraFrame = document.getElementById("cameraFrame");
const cameraMessage = document.getElementById("cameraMessage");
const cameraStatus = document.getElementById("cameraStatus");

const controlSection = document.querySelector(".control-section");

const shootButton = document.getElementById("shootButton");
const switchButton = document.getElementById("switchButton");
const retakeButton = document.getElementById("retakeButton");
const saveButton = document.getElementById("saveButton");
const galleryInput = document.getElementById("galleryInput");

let cameraStream = null;
let currentFacingMode = "environment";
let capturedImageData = "";

// 상태 문구를 변경하는 함수
function updateCameraStatus(text) {
  if (cameraStatus) {
    cameraStatus.textContent = text;
  }
}

// 안내 메시지를 변경하는 함수
function updateCameraMessage(text, hidden = false) {
  if (!cameraMessage) {
    return;
  }

  cameraMessage.textContent = text;
  cameraMessage.classList.toggle("is-hidden", hidden);
}

// 현재 날짜를 캡션용 텍스트로 만드는 함수
function getTodayCaption() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${month}.${date} · 촬영`;
}

// 현재 날짜를 정렬용 숫자로 만드는 함수
function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return Number(`${year}${month}${date}`);
}

// 기존 촬영 사진을 불러오는 함수
function getCapturedPhotos() {
  const savedPhotos = localStorage.getItem(CAPTURED_PHOTO_STORAGE_KEY);

  if (!savedPhotos) {
    return [];
  }

  try {
    return JSON.parse(savedPhotos);
  } catch (error) {
    return [];
  }
}

// 촬영 사진을 localStorage에 저장하는 함수
function saveCapturedPhoto(imageData) {
  const savedPhotos = getCapturedPhotos();

  const nextPhoto = {
    id: `captured-${Date.now()}`,
    src: imageData,
    fullSrc: imageData,
    alt: "새로 촬영한 보리 사진",
    caption: getTodayCaption(),
    dateValue: getTodayDateValue(),
    category: "bori",
    favorite: false,
  };

  const nextPhotos = [nextPhoto, ...savedPhotos].slice(0, MAX_SAVED_PHOTOS);

  localStorage.setItem(CAPTURED_PHOTO_STORAGE_KEY, JSON.stringify(nextPhotos));
}

// 카메라 스트림을 정리하는 함수
function stopCamera() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach(function (track) {
    track.stop();
  });

  cameraStream = null;
}

// 카메라를 시작하는 함수
async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    updateCameraStatus("불가");
    updateCameraMessage(
      "이 브라우저에서는 카메라를 바로 사용할 수 없어. Live Server 또는 HTTPS 환경에서 다시 열어줘.",
    );
    return;
  }

  try {
    stopCamera();

    updateCameraStatus("요청");
    updateCameraMessage("카메라 권한을 확인하고 있어요.");

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: currentFacingMode,
        },
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 1600,
        },
      },
      audio: false,
    });

    cameraVideo.srcObject = cameraStream;

    await cameraVideo.play();

    updateCameraStatus("촬영중");
    updateCameraMessage("", true);
  } catch (error) {
    console.error("[PetLog Camera Error]", error);

    updateCameraStatus("권한 필요");
    updateCameraMessage(
      "카메라를 불러오지 못했어. 주소창 왼쪽 자물쇠 아이콘 → 사이트 설정 → 카메라 → 허용으로 바꾼 뒤 새로고침해줘. 또는 갤러리에서 사진을 선택해줘.",
    );
  }
}

// 비디오 화면을 정사각형 이미지로 캡처하는 함수
function captureVideoFrame() {
  const context = captureCanvas.getContext("2d");
  const videoWidth = cameraVideo.videoWidth;
  const videoHeight = cameraVideo.videoHeight;

  if (!videoWidth || !videoHeight) {
    alert("카메라 화면을 아직 불러오는 중이야.");
    return "";
  }

  const cropSize = Math.min(videoWidth, videoHeight);
  const sourceX = (videoWidth - cropSize) / 2;
  const sourceY = (videoHeight - cropSize) / 2;

  captureCanvas.width = CAPTURE_SIZE;
  captureCanvas.height = CAPTURE_SIZE;

  context.drawImage(
    cameraVideo,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    CAPTURE_SIZE,
    CAPTURE_SIZE,
  );

  return captureCanvas.toDataURL("image/jpeg", CAPTURE_QUALITY);
}

// 갤러리 이미지를 1200px 정사각형으로 만드는 함수
function resizeGalleryImage(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.addEventListener("load", function () {
      const image = new Image();

      image.addEventListener("load", function () {
        const context = captureCanvas.getContext("2d");
        const cropSize = Math.min(image.width, image.height);
        const sourceX = (image.width - cropSize) / 2;
        const sourceY = (image.height - cropSize) / 2;

        captureCanvas.width = CAPTURE_SIZE;
        captureCanvas.height = CAPTURE_SIZE;

        context.drawImage(
          image,
          sourceX,
          sourceY,
          cropSize,
          cropSize,
          0,
          0,
          CAPTURE_SIZE,
          CAPTURE_SIZE,
        );

        resolve(captureCanvas.toDataURL("image/jpeg", CAPTURE_QUALITY));
      });

      image.addEventListener("error", reject);
      image.src = reader.result;
    });

    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

// 촬영 후 미리보기 화면으로 전환하는 함수
function showPreview(imageData) {
  capturedImageData = imageData;

  capturedPreview.src = imageData;
  cameraFrame.classList.add("is-preview");
  controlSection.classList.add("is-preview");

  updateCameraStatus("미리보기");
  updateCameraMessage("", true);
}

// 촬영 화면으로 돌아가는 함수
function showCameraMode() {
  capturedImageData = "";

  capturedPreview.src = "";
  cameraFrame.classList.remove("is-preview");
  controlSection.classList.remove("is-preview");

  updateCameraStatus("촬영중");
  updateCameraMessage("", true);
}

// 촬영 버튼을 눌렀을 때 사진을 캡처하는 함수
function handleShootButtonClick() {
  const imageData = captureVideoFrame();

  if (!imageData) {
    return;
  }

  showPreview(imageData);
}

// 전면/후면 카메라를 전환하는 함수
function switchCamera() {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";
  startCamera();
}

// 갤러리에서 선택한 이미지를 읽는 함수
async function handleGalleryChange(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  try {
    const imageData = await resizeGalleryImage(file);

    showPreview(imageData);
  } catch (error) {
    alert("이미지를 불러오지 못했어. 다른 사진으로 다시 선택해줘.");
  }
}

// 촬영 사진을 저장하고 아카이브로 이동하는 함수
function handleSaveButtonClick() {
  if (!capturedImageData) {
    alert("저장할 사진이 없어.");
    return;
  }

  try {
    saveCapturedPhoto(capturedImageData);
    window.location.href = "./index6.html";
  } catch (error) {
    alert(
      "사진 저장 공간이 부족할 수 있어. 기존 촬영 사진을 줄인 뒤 다시 시도해줘.",
    );
  }
}

// 카메라 화면 기능을 시작하는 함수
function initCameraPage() {
  shootButton.addEventListener("click", handleShootButtonClick);
  switchButton.addEventListener("click", switchCamera);
  retakeButton.addEventListener("click", showCameraMode);
  saveButton.addEventListener("click", handleSaveButtonClick);
  galleryInput.addEventListener("change", handleGalleryChange);

  startCamera();

  window.addEventListener("beforeunload", stopCamera);
}

window.addEventListener("load", initCameraPage);
