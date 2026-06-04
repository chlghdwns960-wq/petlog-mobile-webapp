const slides = document.querySelectorAll(".slide");
const textSlides = document.querySelectorAll(".text-slide");
const dots = document.querySelectorAll(".dot");
const nextButton = document.getElementById("nextButton");

let currentIndex = 0;
let slideTimer = null;
const lastIndex = slides.length - 1;
const AUTO_DELAY = 2000;

// 로그인 화면으로 이동하는 함수
function moveToLogin() {
  window.location.href = "./index3.html";
}

// 현재 슬라이드 상태를 화면에 부드럽게 반영하는 함수
function updateSlide(index) {
  window.requestAnimationFrame(function () {
    slides.forEach(function (slide, slideIndex) {
      const isActive = slideIndex === index;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    textSlides.forEach(function (textSlide, textIndex) {
      const isActive = textIndex === index;
      textSlide.classList.toggle("is-active", isActive);
      textSlide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach(function (dot, dotIndex) {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    nextButton.textContent = index === lastIndex ? "시작하기" : "다음";
  });
}

// 자동 슬라이드 타이머를 초기화하는 함수
function resetSlideTimer() {
  window.clearTimeout(slideTimer);

  slideTimer = window.setTimeout(function () {
    if (currentIndex < lastIndex) {
      currentIndex += 1;
      updateSlide(currentIndex);
      resetSlideTimer();
      return;
    }

    moveToLogin();
  }, AUTO_DELAY);
}

// 다음 버튼 클릭 시 다음 슬라이드 또는 로그인 화면으로 이동하는 함수
function handleNextButtonClick() {
  if (currentIndex < lastIndex) {
    currentIndex += 1;
    updateSlide(currentIndex);
    resetSlideTimer();
    return;
  }

  moveToLogin();
}

// 페이지네이션 점 클릭 시 해당 슬라이드로 이동하는 함수
function handleDotClick(event) {
  const targetIndex = Number(event.currentTarget.dataset.index);

  if (Number.isNaN(targetIndex)) {
    return;
  }

  currentIndex = targetIndex;
  updateSlide(currentIndex);
  resetSlideTimer();
}

// 첫 로딩 때 이미지를 미리 불러와 전환 끊김을 줄이는 함수
function preloadSlideImages() {
  slides.forEach(function (slide) {
    const image = slide.querySelector("img");

    if (!image) {
      return;
    }

    image.loading = "eager";
    image.decoding = "async";

    const preloadImage = new Image();
    preloadImage.src = image.currentSrc || image.src;
  });
}

// 온보딩 슬라이드 기능을 시작하는 함수
function initOnboarding() {
  preloadSlideImages();
  updateSlide(currentIndex);
  resetSlideTimer();

  nextButton.addEventListener("click", handleNextButtonClick);

  dots.forEach(function (dot) {
    dot.addEventListener("click", handleDotClick);
  });
}

window.addEventListener("load", initOnboarding);
