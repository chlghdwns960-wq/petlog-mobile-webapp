const quickItems = document.querySelectorAll(".quick-item");

const CONDITION_STORAGE_KEY = "petlogBoriCondition";
const PROFILE_STORAGE_KEY = "petlogProfileSettings";
const NOTIFICATION_READ_STORAGE_KEY = "petlogReadNotifications";

const conditionBadge = document.getElementById("conditionBadge");
const conditionDim = document.getElementById("conditionDim");
const conditionSheet = document.getElementById("conditionSheet");
const conditionCloseButton = document.getElementById("conditionCloseButton");
const conditionOptionButtons = document.querySelectorAll("[data-condition]");

const profileName = document.getElementById("profileName");
const profileAge = document.getElementById("profileAge");
const profileBreed = document.getElementById("profileBreed");
const profileWeight = document.getElementById("profileWeight");

const notificationButton = document.getElementById("notificationButton");
const notificationDim = document.getElementById("notificationDim");
const notificationSheet = document.getElementById("notificationSheet");
const notificationCloseButton = document.getElementById(
  "notificationCloseButton",
);
const notificationList = document.getElementById("notificationList");
const notificationClearButton = document.getElementById(
  "notificationClearButton",
);

const settingsButton = document.getElementById("settingsButton");

const photoGridImages = document.querySelectorAll(".photo-grid img");
const photoViewerDim = document.getElementById("photoViewerDim");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImage = document.getElementById("photoViewerImage");
const photoViewerCaption = document.getElementById("photoViewerCaption");
const photoViewerClose = document.getElementById("photoViewerClose");
const photoViewerPrev = document.getElementById("photoViewerPrev");
const photoViewerNext = document.getElementById("photoViewerNext");

let currentPhotoIndex = 0;
let lastFocusedElement = null;

const notificationData = [
  {
    id: "today-walk",
    type: "미완료",
    title: "산책 기록이 아직 남았어요",
    desc: "오늘 기록 2/4 완료 상태예요. 산책과 배변 기록을 확인해줘요.",
  },
  {
    id: "today-schedule",
    type: "예정",
    title: "오후 7:00 저녁식사 및 약 챙기기",
    desc: "저녁 루틴을 놓치지 않게 확인해보세요.",
  },
  {
    id: "health-memo",
    type: "건강",
    title: "최근 메모를 확인해보세요",
    desc: "컨디션 변화가 있으면 메모로 남겨두면 좋아요.",
  },
];

// 간편 기록 버튼의 체크 상태를 변경하는 함수
function toggleQuickRecord(item) {
  const checkIcon = item.querySelector(".quick-check");

  if (!checkIcon) {
    return;
  }

  const isChecked = item.dataset.checked === "true";
  const nextCheckedState = !isChecked;

  item.dataset.checked = String(nextCheckedState);
  item.classList.toggle("is-checked", nextCheckedState);
  item.setAttribute("aria-pressed", String(nextCheckedState));

  checkIcon.src = nextCheckedState
    ? checkIcon.dataset.on
    : checkIcon.dataset.off;
}

// 간편 기록 버튼 클릭 이벤트를 연결하는 함수
function initQuickRecords() {
  quickItems.forEach(function (item) {
    item.addEventListener("click", function () {
      toggleQuickRecord(item);
    });
  });
}

// 저장된 프로필 정보를 불러오는 함수
function getSavedProfile() {
  const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!savedProfile) {
    return {
      name: "보리",
      age: "10살",
      breed: "페키니즈",
      weight: "5.1kg",
    };
  }

  try {
    return JSON.parse(savedProfile);
  } catch (error) {
    return {
      name: "보리",
      age: "10살",
      breed: "페키니즈",
      weight: "5.1kg",
    };
  }
}

// 홈 화면에 저장된 프로필 정보를 반영하는 함수
function applySavedProfile() {
  const profile = getSavedProfile();

  if (profileName) {
    profileName.textContent = profile.name || "보리";
  }

  if (profileAge) {
    profileAge.textContent = profile.age || "10살";
  }

  if (profileBreed) {
    profileBreed.textContent = profile.breed || "페키니즈";
  }

  if (profileWeight) {
    profileWeight.textContent = profile.weight || "5.1kg";
  }
}

// 저장된 컨디션을 불러오는 함수
function getSavedCondition() {
  return localStorage.getItem(CONDITION_STORAGE_KEY) || "기분 좋아요";
}

// 컨디션 문구를 화면에 반영하는 함수
function updateConditionText(condition) {
  if (!conditionBadge) {
    return;
  }

  conditionBadge.textContent = `컨디션 : ${condition}`;
}

// 컨디션 옵션 active 상태를 변경하는 함수
function updateConditionActive(condition) {
  conditionOptionButtons.forEach(function (button) {
    const isActive = button.dataset.condition === condition;
    button.classList.toggle("is-active", isActive);
  });
}

// 컨디션 바텀시트를 여는 함수
function openConditionSheet() {
  if (!conditionDim || !conditionSheet) {
    return;
  }

  conditionDim.classList.add("is-open");
  conditionSheet.classList.add("is-open");
  conditionDim.setAttribute("aria-hidden", "false");
}

// 컨디션 바텀시트를 닫는 함수
function closeConditionSheet() {
  if (!conditionDim || !conditionSheet) {
    return;
  }

  conditionDim.classList.remove("is-open");
  conditionSheet.classList.remove("is-open");
  conditionDim.setAttribute("aria-hidden", "true");
}

// 컨디션을 저장하고 화면에 반영하는 함수
function saveCondition(condition) {
  localStorage.setItem(CONDITION_STORAGE_KEY, condition);
  updateConditionText(condition);
  updateConditionActive(condition);
  closeConditionSheet();
}

// 컨디션 span 키보드 접근을 처리하는 함수
function handleConditionKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  openConditionSheet();
}

// 컨디션 선택 기능을 연결하는 함수
function initConditionSelector() {
  if (!conditionBadge || !conditionDim || !conditionSheet) {
    return;
  }

  const savedCondition = getSavedCondition();

  updateConditionText(savedCondition);
  updateConditionActive(savedCondition);

  conditionBadge.addEventListener("click", openConditionSheet);
  conditionBadge.addEventListener("keydown", handleConditionKeydown);

  conditionDim.addEventListener("click", closeConditionSheet);

  if (conditionCloseButton) {
    conditionCloseButton.addEventListener("click", closeConditionSheet);
  }

  conditionOptionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      saveCondition(button.dataset.condition);
    });
  });
}

// 읽은 알림 ID 목록을 불러오는 함수
function getReadNotificationIds() {
  const savedIds = localStorage.getItem(NOTIFICATION_READ_STORAGE_KEY);

  if (!savedIds) {
    return [];
  }

  try {
    return JSON.parse(savedIds);
  } catch (error) {
    return [];
  }
}

// 읽은 알림 ID 목록을 저장하는 함수
function saveReadNotificationIds(ids) {
  localStorage.setItem(NOTIFICATION_READ_STORAGE_KEY, JSON.stringify(ids));
}

// 읽지 않은 알림이 있는지 확인하는 함수
function hasUnreadNotifications() {
  const readIds = getReadNotificationIds();

  return notificationData.some(function (item) {
    return !readIds.includes(item.id);
  });
}

// 알림 점 상태를 업데이트하는 함수
function updateNotificationDot() {
  if (!notificationButton) {
    return;
  }

  notificationButton.classList.toggle("has-unread", hasUnreadNotifications());
}

// 알림 목록을 화면에 그리는 함수
function renderNotificationList() {
  if (!notificationList) {
    return;
  }

  const readIds = getReadNotificationIds();

  notificationList.innerHTML = "";

  notificationData.forEach(function (item) {
    const isRead = readIds.includes(item.id);

    const button = document.createElement("button");
    button.type = "button";
    button.className = isRead
      ? "notification-item is-read"
      : "notification-item";
    button.dataset.id = item.id;

    button.innerHTML = `
      <span class="notification-type">${item.type}</span>
      <span class="notification-content">
        <strong>${item.title}</strong>
        <small>${item.desc}</small>
      </span>
    `;

    notificationList.appendChild(button);
  });
}

// 알림 바텀시트를 여는 함수
function openNotificationSheet() {
  if (!notificationDim || !notificationSheet) {
    return;
  }

  renderNotificationList();

  notificationDim.classList.add("is-open");
  notificationSheet.classList.add("is-open");
  notificationDim.setAttribute("aria-hidden", "false");
}

// 알림 바텀시트를 닫는 함수
function closeNotificationSheet() {
  if (!notificationDim || !notificationSheet) {
    return;
  }

  notificationDim.classList.remove("is-open");
  notificationSheet.classList.remove("is-open");
  notificationDim.setAttribute("aria-hidden", "true");
}

// 특정 알림을 읽음 처리하는 함수
function markNotificationAsRead(notificationId) {
  const readIds = getReadNotificationIds();

  if (!readIds.includes(notificationId)) {
    readIds.push(notificationId);
  }

  saveReadNotificationIds(readIds);
  renderNotificationList();
  updateNotificationDot();
}

// 모든 알림을 읽음 처리하는 함수
function markAllNotificationsAsRead() {
  const allIds = notificationData.map(function (item) {
    return item.id;
  });

  saveReadNotificationIds(allIds);
  renderNotificationList();
  updateNotificationDot();
}

// 알림 기능을 연결하는 함수
function initNotifications() {
  if (!notificationButton || !notificationDim || !notificationSheet) {
    return;
  }

  notificationButton.addEventListener("click", openNotificationSheet);
  notificationDim.addEventListener("click", closeNotificationSheet);

  if (notificationCloseButton) {
    notificationCloseButton.addEventListener("click", closeNotificationSheet);
  }

  if (notificationClearButton) {
    notificationClearButton.addEventListener(
      "click",
      markAllNotificationsAsRead,
    );
  }

  if (notificationList) {
    notificationList.addEventListener("click", function (event) {
      const item = event.target.closest(".notification-item");

      if (!item) {
        return;
      }

      markNotificationAsRead(item.dataset.id);
    });
  }

  updateNotificationDot();
}

// 설정 화면으로 이동하는 기능을 연결하는 함수
function initSettingsLink() {
  if (!settingsButton) {
    return;
  }

  settingsButton.addEventListener("click", function () {
    window.location.href = "./index14.html";
  });
}

// 클릭한 사진 정보를 확대 모달에 반영하는 함수
function updatePhotoViewer(index) {
  const targetImage = photoGridImages[index];

  if (!targetImage || !photoViewerImage || !photoViewerCaption) {
    return;
  }

  currentPhotoIndex = index;

  photoViewerImage.src = targetImage.dataset.full || targetImage.src;
  photoViewerImage.alt = targetImage.alt || "확대된 최근 사진";
  photoViewerCaption.textContent = targetImage.alt || `최근 사진 ${index + 1}`;
}

// 사진 확대 모달을 여는 함수
function openPhotoViewer(index) {
  if (!photoViewerDim || !photoViewer || photoGridImages.length === 0) {
    return;
  }

  lastFocusedElement = document.activeElement;

  updatePhotoViewer(index);

  photoViewerDim.classList.add("is-open");
  photoViewer.classList.add("is-open");
  photoViewerDim.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-photo-viewer-open");

  if (photoViewerClose) {
    photoViewerClose.focus();
  }
}

// 사진 확대 모달을 닫는 함수
function closePhotoViewer() {
  if (!photoViewerDim || !photoViewer) {
    return;
  }

  photoViewerDim.classList.remove("is-open");
  photoViewer.classList.remove("is-open");
  photoViewerDim.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-photo-viewer-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

// 이전 사진으로 이동하는 함수
function showPrevPhoto() {
  if (photoGridImages.length === 0) {
    return;
  }

  const prevIndex =
    currentPhotoIndex === 0
      ? photoGridImages.length - 1
      : currentPhotoIndex - 1;

  updatePhotoViewer(prevIndex);
}

// 다음 사진으로 이동하는 함수
function showNextPhoto() {
  if (photoGridImages.length === 0) {
    return;
  }

  const nextIndex =
    currentPhotoIndex === photoGridImages.length - 1
      ? 0
      : currentPhotoIndex + 1;

  updatePhotoViewer(nextIndex);
}

// 키보드로 사진 모달을 제어하는 함수
function handlePhotoViewerKeydown(event) {
  if (!photoViewer || !photoViewer.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closePhotoViewer();
  }

  if (event.key === "ArrowLeft") {
    showPrevPhoto();
  }

  if (event.key === "ArrowRight") {
    showNextPhoto();
  }
}

// 최근 사진 확대 보기 기능을 시작하는 함수
function initPhotoViewer() {
  if (!photoViewerDim || !photoViewer || photoGridImages.length === 0) {
    return;
  }

  photoGridImages.forEach(function (image, index) {
    image.setAttribute("role", "button");
    image.setAttribute("tabindex", "0");

    image.addEventListener("click", function () {
      openPhotoViewer(index);
    });

    image.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openPhotoViewer(index);
    });
  });

  photoViewerDim.addEventListener("click", closePhotoViewer);

  if (photoViewerClose) {
    photoViewerClose.addEventListener("click", closePhotoViewer);
  }

  if (photoViewerPrev) {
    photoViewerPrev.addEventListener("click", showPrevPhoto);
  }

  if (photoViewerNext) {
    photoViewerNext.addEventListener("click", showNextPhoto);
  }

  window.addEventListener("keydown", handlePhotoViewerKeydown);
}

// 홈 화면 기능을 시작하는 함수
function initHomePage() {
  applySavedProfile();
  initQuickRecords();
  initConditionSelector();
  initNotifications();
  initSettingsLink();
  initPhotoViewer();
}

window.addEventListener("load", initHomePage);
