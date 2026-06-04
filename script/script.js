const SPLASH_DURATION = 2300;

// 스플래시 화면에서 온보딩 화면으로 이동하는 함수
function moveToOnboarding() {
  window.location.href = "./index2.html";
}

// 스플래시 이미지들을 미리 불러와 첫 화면 끊김을 줄이는 함수
function preloadSplashImages() {
  const imageSources = ["./images/01/logo.png", "./images/01/img.png"];

  imageSources.forEach(function (src) {
    const image = new Image();
    image.src = src;
  });
}

// 스플래시 등장 애니메이션을 시작하는 함수
function startSplashAnimation() {
  const app = document.querySelector(".app");

  if (!app) {
    return;
  }

  window.requestAnimationFrame(function () {
    app.classList.add("is-loaded");
  });
}

// 페이지 로드 후 지정 시간 뒤 온보딩 화면으로 자동 이동하는 함수
function startSplashTimer() {
  window.setTimeout(moveToOnboarding, SPLASH_DURATION);
}

// 스플래시 화면 기능을 시작하는 함수
function initSplashPage() {
  preloadSplashImages();
  startSplashAnimation();
  startSplashTimer();
}

window.addEventListener("load", initSplashPage);
