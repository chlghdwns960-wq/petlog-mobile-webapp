const filterButtons = document.querySelectorAll(".filter-button");
const sortButton = document.getElementById("sortButton");
const sortMenu = document.getElementById("sortMenu");
const sortLabel = document.getElementById("sortLabel");
const sortOptions = document.querySelectorAll(".sort-menu button");

const viewButtons = document.querySelectorAll(".view-button");
const archivePhotoGrid = document.querySelector(".archive-photo-grid");

const archiveCountStrong = document.querySelector(".archive-count strong");
const archiveDesc = document.querySelector(".archive-desc");

const openSearchButton = document.getElementById("openSearchButton");
const archiveSearchPanel = document.getElementById("archiveSearchPanel");
const archiveSearchInput = document.getElementById("archiveSearchInput");
const searchClearButton = document.getElementById("searchClearButton");
const searchCloseButton = document.getElementById("searchCloseButton");

const openAddPhotoSheetButton = document.getElementById(
  "openAddPhotoSheetButton",
);
const photoAddDim = document.getElementById("photoAddDim");
const photoAddSheet = document.getElementById("photoAddSheet");
const photoAddCloseButton = document.getElementById("photoAddCloseButton");
const archiveGalleryInput = document.getElementById("archiveGalleryInput");
const createAlbumButton = document.getElementById("createAlbumButton");

const photoViewerDim = document.getElementById("photoViewerDim");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImage = document.getElementById("photoViewerImage");
const photoViewerCaption = document.getElementById("photoViewerCaption");
const photoViewerClose = document.getElementById("photoViewerClose");
const photoViewerPrev = document.getElementById("photoViewerPrev");
const photoViewerNext = document.getElementById("photoViewerNext");
const photoViewerDeleteButton = document.getElementById(
  "photoViewerDeleteButton",
);

const CAPTURED_PHOTO_STORAGE_KEY = "petlogCapturedPhotos";
const DELETED_PHOTO_STORAGE_KEY = "petlogDeletedPhotoIds";
const ALBUM_STORAGE_KEY = "petlogPhotoAlbums";
const GALLERY_IMAGE_SIZE = 1200;
const GALLERY_IMAGE_QUALITY = 0.86;

let currentFilter = "all";
let currentSort = "최신순";
let currentView = "large";
let currentSearchKeyword = "";
let currentVisiblePhotos = [];
let currentPhotoIndex = 0;
let lastFocusedElement = null;

const baseArchivePhotos = [
  {
    id: "photo-1",
    src: "./images/06/photo1.png",
    fullSrc: "./images/06/photo1_full.png",
    alt: "03.15 산책 사진",
    caption: "03.15 · 산책",
    dateValue: 20260315,
    category: "bori",
    favorite: true,
  },
  {
    id: "photo-2",
    src: "./images/06/photo2.png",
    fullSrc: "./images/06/photo2_full.png",
    alt: "03.13 일상 사진",
    caption: "03.13 · 일상",
    dateValue: 20260313,
    category: "bori",
    favorite: true,
  },
  {
    id: "photo-3",
    src: "./images/06/photo3.png",
    fullSrc: "./images/06/photo3_full.png",
    alt: "03.11 병원 사진",
    caption: "03.11 · 병원",
    dateValue: 20260311,
    category: "care",
    favorite: false,
  },
  {
    id: "photo-4",
    src: "./images/06/photo4.png",
    fullSrc: "./images/06/photo4_full.png",
    alt: "03.11 낮잠 사진",
    caption: "03.11 · 낮잠",
    dateValue: 20260311,
    category: "bori",
    favorite: true,
  },
  {
    id: "photo-5",
    src: "./images/06/photo5.png",
    fullSrc: "./images/06/photo5_full.png",
    alt: "03.10 아침 식사 사진",
    caption: "03.10 · 아침 식사",
    dateValue: 20260310,
    category: "bori",
    favorite: false,
  },
  {
    id: "photo-6",
    src: "./images/06/photo6.png",
    fullSrc: "./images/06/photo6_full.png",
    alt: "03.09 공놀이 사진",
    caption: "03.09 · 공놀이",
    dateValue: 20260309,
    category: "bori",
    favorite: true,
  },
  {
    id: "photo-7",
    src: "./images/06/photo7.png",
    fullSrc: "./images/06/photo7_full.png",
    alt: "03.06 놀기 사진",
    caption: "03.06 · 놀기",
    dateValue: 20260306,
    category: "play",
    favorite: false,
  },
  {
    id: "photo-8",
    src: "./images/06/photo8.png",
    fullSrc: "./images/06/photo8_full.png",
    alt: "03.05 샤워 사진",
    caption: "03.05 · 샤워",
    dateValue: 20260305,
    category: "care",
    favorite: false,
  },
];

// 저장된 촬영/추가 사진을 불러오는 함수
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

// 추가 사진을 localStorage에 저장하는 함수
function saveCapturedPhotos(photos) {
  localStorage.setItem(CAPTURED_PHOTO_STORAGE_KEY, JSON.stringify(photos));
}

// 숨김 처리한 기본 사진 ID를 불러오는 함수
function getDeletedPhotoIds() {
  const savedIds = localStorage.getItem(DELETED_PHOTO_STORAGE_KEY);

  if (!savedIds) {
    return [];
  }

  try {
    return JSON.parse(savedIds);
  } catch (error) {
    return [];
  }
}

// 숨김 처리한 기본 사진 ID를 저장하는 함수
function saveDeletedPhotoIds(ids) {
  localStorage.setItem(DELETED_PHOTO_STORAGE_KEY, JSON.stringify(ids));
}

// 기본 사진인지 확인하는 함수
function isBasePhoto(photoId) {
  return baseArchivePhotos.some(function (photo) {
    return photo.id === photoId;
  });
}

// 기본 사진과 사용자가 추가한 사진을 합치는 함수
function getAllArchivePhotos() {
  const deletedPhotoIds = getDeletedPhotoIds();

  const visibleBasePhotos = baseArchivePhotos.filter(function (photo) {
    return !deletedPhotoIds.includes(photo.id);
  });

  return [...getCapturedPhotos(), ...visibleBasePhotos];
}

// 현재 날짜를 캡션 텍스트로 만드는 함수
function getTodayCaption() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${month}.${date} · 추가`;
}

// 현재 날짜를 정렬 숫자로 만드는 함수
function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return Number(`${year}${month}${date}`);
}

// 이미지 데이터를 아카이브 사진으로 저장하는 함수
function saveImageToArchive(imageData, caption = getTodayCaption()) {
  const savedPhotos = getCapturedPhotos();

  const newPhoto = {
    id: `added-${Date.now()}`,
    src: imageData,
    fullSrc: imageData,
    alt: "새로 추가한 보리 사진",
    caption: caption,
    dateValue: getTodayDateValue(),
    category: "bori",
    favorite: false,
  };

  saveCapturedPhotos([newPhoto, ...savedPhotos].slice(0, 8));
  updateArchiveSummary();
  renderPhotoGrid();
}

// 아카이브 요약 숫자를 업데이트하는 함수
function updateArchiveSummary() {
  const addedPhotos = getCapturedPhotos();
  const deletedPhotoIds = getDeletedPhotoIds();

  const deletedBasePhotos = baseArchivePhotos.filter(function (photo) {
    return deletedPhotoIds.includes(photo.id);
  });

  const deletedFavoriteCount = deletedBasePhotos.filter(function (photo) {
    return photo.favorite;
  }).length;

  const totalCount = Math.max(
    0,
    248 - deletedBasePhotos.length + addedPhotos.length,
  );
  const thisMonthCount = Math.max(
    0,
    32 - deletedBasePhotos.length + addedPhotos.length,
  );
  const favoriteCount = Math.max(0, 18 - deletedFavoriteCount);

  if (archiveCountStrong) {
    archiveCountStrong.textContent = `${totalCount}장`;
  }

  if (archiveDesc) {
    archiveDesc.textContent = `이번 달 ${thisMonthCount}장 추가 · 즐겨찾기 ${favoriteCount}장`;
  }
}

// 필터 버튼 active 상태를 변경하는 함수
function updateFilterButtonActive(clickedButton) {
  filterButtons.forEach(function (button) {
    const isCurrentButton = button === clickedButton;

    button.classList.toggle("is-active", isCurrentButton);
    button.setAttribute("aria-pressed", String(isCurrentButton));
  });
}

// 필터 조건에 맞는 사진 목록을 만드는 함수
function getFilteredPhotos() {
  const archivePhotos = getAllArchivePhotos();

  if (currentFilter === "bori") {
    return archivePhotos.filter(function (photo) {
      return photo.category === "bori";
    });
  }

  if (currentFilter === "favorite") {
    return archivePhotos.filter(function (photo) {
      return photo.favorite;
    });
  }

  if (currentFilter === "recent") {
    return [...archivePhotos]
      .sort(function (a, b) {
        return b.dateValue - a.dateValue;
      })
      .slice(0, 6);
  }

  return [...archivePhotos];
}

// 검색어에 맞는 사진 목록을 만드는 함수
function getSearchedPhotos(photos) {
  const keyword = currentSearchKeyword.trim().toLowerCase();

  if (!keyword) {
    return photos;
  }

  return photos.filter(function (photo) {
    const searchTarget =
      `${photo.alt} ${photo.caption} ${photo.category}`.toLowerCase();

    return searchTarget.includes(keyword);
  });
}

// 정렬 조건에 따라 사진 순서를 바꾸는 함수
function getSortedPhotos(photos) {
  const nextPhotos = [...photos];

  if (currentSort === "오래된순") {
    return nextPhotos.sort(function (a, b) {
      return a.dateValue - b.dateValue;
    });
  }

  if (currentSort === "즐겨찾기") {
    return nextPhotos.sort(function (a, b) {
      if (a.favorite === b.favorite) {
        return b.dateValue - a.dateValue;
      }

      return a.favorite ? -1 : 1;
    });
  }

  return nextPhotos.sort(function (a, b) {
    return b.dateValue - a.dateValue;
  });
}

// 사진 figure 요소를 만드는 함수
function createPhotoItem(photo, index) {
  const figure = document.createElement("figure");
  figure.className = "photo-item";
  figure.dataset.index = String(index);
  figure.setAttribute("role", "button");
  figure.setAttribute("tabindex", "0");
  figure.setAttribute("aria-label", `${photo.caption} 확대 보기`);

  figure.innerHTML = `
    <img src="${photo.src}" alt="${photo.alt}" />
    <figcaption>${photo.caption}</figcaption>
  `;

  return figure;
}

// 필터, 검색, 정렬 결과를 사진 그리드에 렌더링하는 함수
function renderPhotoGrid() {
  if (!archivePhotoGrid) {
    return;
  }

  const filteredPhotos = getFilteredPhotos();
  const searchedPhotos = getSearchedPhotos(filteredPhotos);

  currentVisiblePhotos = getSortedPhotos(searchedPhotos);

  archivePhotoGrid.innerHTML = "";
  archivePhotoGrid.classList.toggle("is-small", currentView === "small");

  if (currentVisiblePhotos.length === 0) {
    archivePhotoGrid.innerHTML = `
      <p class="photo-empty">표시할 사진이 없어</p>
    `;
    return;
  }

  currentVisiblePhotos.forEach(function (photo, index) {
    archivePhotoGrid.appendChild(createPhotoItem(photo, index));
  });
}

// 필터 버튼 클릭 이벤트를 연결하는 함수
function initFilterTabs() {
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.dataset.filter || "all";

      updateFilterButtonActive(button);
      renderPhotoGrid();
    });
  });
}

// 검색 패널을 여는 함수
function openSearchPanel() {
  if (!archiveSearchPanel || !openSearchButton || !archiveSearchInput) {
    return;
  }

  archiveSearchPanel.classList.add("is-open");
  openSearchButton.setAttribute("aria-expanded", "true");

  setTimeout(function () {
    archiveSearchInput.focus();
  }, 80);
}

// 검색 패널을 닫는 함수
function closeSearchPanel() {
  if (!archiveSearchPanel || !openSearchButton) {
    return;
  }

  archiveSearchPanel.classList.remove("is-open");
  openSearchButton.setAttribute("aria-expanded", "false");
}

// 검색어를 초기화하는 함수
function clearSearchKeyword() {
  currentSearchKeyword = "";

  if (archiveSearchInput) {
    archiveSearchInput.value = "";
  }

  renderPhotoGrid();
}

// 검색 기능을 시작하는 함수
function initSearchPanel() {
  if (!openSearchButton || !archiveSearchPanel || !archiveSearchInput) {
    return;
  }

  openSearchButton.addEventListener("click", function () {
    const isOpen = archiveSearchPanel.classList.contains("is-open");

    if (isOpen) {
      closeSearchPanel();
    } else {
      openSearchPanel();
    }
  });

  archiveSearchInput.addEventListener("input", function () {
    currentSearchKeyword = archiveSearchInput.value;
    renderPhotoGrid();
  });

  if (searchClearButton) {
    searchClearButton.addEventListener("click", clearSearchKeyword);
  }

  if (searchCloseButton) {
    searchCloseButton.addEventListener("click", closeSearchPanel);
  }
}

// 정렬 드롭다운을 열고 닫는 함수
function toggleSortMenu() {
  if (!sortMenu || !sortButton) {
    return;
  }

  const isOpen = sortMenu.classList.toggle("is-open");

  sortButton.setAttribute("aria-expanded", String(isOpen));
}

// 정렬 드롭다운을 닫는 함수
function closeSortMenu() {
  if (!sortMenu || !sortButton) {
    return;
  }

  sortMenu.classList.remove("is-open");
  sortButton.setAttribute("aria-expanded", "false");
}

// 정렬 옵션을 선택하는 함수
function selectSortOption(option) {
  currentSort = option.dataset.sort;
  sortLabel.textContent = currentSort;

  closeSortMenu();
  renderPhotoGrid();
}

// 정렬 드롭다운 외부 클릭을 감지하는 함수
function handleDocumentClick(event) {
  const isSortArea = event.target.closest(".sort-wrap");

  if (!isSortArea) {
    closeSortMenu();
  }
}

// 정렬 드롭다운 기능을 시작하는 함수
function initSortDropdown() {
  if (!sortButton || !sortMenu) {
    return;
  }

  sortButton.addEventListener("click", toggleSortMenu);

  sortOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      selectSortOption(option);
    });
  });

  document.addEventListener("click", handleDocumentClick);
}

// 보기 방식 버튼 active 상태를 변경하는 함수
function updateViewButtonActive(clickedButton) {
  viewButtons.forEach(function (button) {
    const isCurrentButton = button === clickedButton;

    button.classList.toggle("is-active", isCurrentButton);
    button.setAttribute("aria-pressed", String(isCurrentButton));
  });
}

// 2열/3열 보기 방식 변경 기능을 시작하는 함수
function initViewToggle() {
  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentView = button.dataset.view || "large";

      updateViewButtonActive(button);
      renderPhotoGrid();
    });
  });
}

// 사진 추가 바텀시트를 여는 함수
function openPhotoAddSheet() {
  if (!photoAddDim || !photoAddSheet) {
    return;
  }

  photoAddDim.classList.add("is-open");
  photoAddSheet.classList.add("is-open");
  photoAddDim.setAttribute("aria-hidden", "false");
}

// 사진 추가 바텀시트를 닫는 함수
function closePhotoAddSheet() {
  if (!photoAddDim || !photoAddSheet) {
    return;
  }

  photoAddDim.classList.remove("is-open");
  photoAddSheet.classList.remove("is-open");
  photoAddDim.setAttribute("aria-hidden", "true");
}

// 갤러리 이미지를 1200px 정사각형으로 줄이는 함수
function resizeImageFileToDataUrl(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.addEventListener("load", function () {
      const image = new Image();

      image.addEventListener("load", function () {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const cropSize = Math.min(image.width, image.height);
        const sourceX = (image.width - cropSize) / 2;
        const sourceY = (image.height - cropSize) / 2;

        canvas.width = GALLERY_IMAGE_SIZE;
        canvas.height = GALLERY_IMAGE_SIZE;

        context.drawImage(
          image,
          sourceX,
          sourceY,
          cropSize,
          cropSize,
          0,
          0,
          GALLERY_IMAGE_SIZE,
          GALLERY_IMAGE_SIZE,
        );

        resolve(canvas.toDataURL("image/jpeg", GALLERY_IMAGE_QUALITY));
      });

      image.addEventListener("error", reject);
      image.src = reader.result;
    });

    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

// 갤러리 이미지 선택을 처리하는 함수
async function handleGalleryInputChange(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  try {
    const imageData = await resizeImageFileToDataUrl(file);

    saveImageToArchive(imageData, getTodayCaption());
    closePhotoAddSheet();

    archiveGalleryInput.value = "";
  } catch (error) {
    alert("이미지를 불러오지 못했어. 다른 사진으로 다시 선택해줘.");
  }
}

// 새 앨범 이름을 저장하는 함수
function saveAlbumName(albumName) {
  const savedAlbums = localStorage.getItem(ALBUM_STORAGE_KEY);
  let albums = [];

  if (savedAlbums) {
    try {
      albums = JSON.parse(savedAlbums);
    } catch (error) {
      albums = [];
    }
  }

  if (!albums.includes(albumName)) {
    albums.push(albumName);
  }

  localStorage.setItem(ALBUM_STORAGE_KEY, JSON.stringify(albums));
}

// 새 앨범 만들기 기능을 처리하는 함수
function handleCreateAlbum() {
  const albumName = window.prompt(
    "새 앨범 이름을 입력해줘. 예: 산책, 병원, 일상",
  );

  if (!albumName || !albumName.trim()) {
    return;
  }

  saveAlbumName(albumName.trim());
  alert(`"${albumName.trim()}" 앨범을 만들었어.`);
  closePhotoAddSheet();
}

// 사진 추가 기능을 시작하는 함수
function initPhotoAddSheet() {
  if (!openAddPhotoSheetButton || !photoAddDim || !photoAddSheet) {
    return;
  }

  openAddPhotoSheetButton.addEventListener("click", openPhotoAddSheet);
  photoAddDim.addEventListener("click", closePhotoAddSheet);

  if (photoAddCloseButton) {
    photoAddCloseButton.addEventListener("click", closePhotoAddSheet);
  }

  if (archiveGalleryInput) {
    archiveGalleryInput.addEventListener("change", handleGalleryInputChange);
  }

  if (createAlbumButton) {
    createAlbumButton.addEventListener("click", handleCreateAlbum);
  }
}

// 클릭한 사진 정보를 확대 모달에 반영하는 함수
function updatePhotoViewer(index) {
  const targetPhoto = currentVisiblePhotos[index];

  if (!targetPhoto || !photoViewerImage || !photoViewerCaption) {
    return;
  }

  currentPhotoIndex = index;
  photoViewerImage.src = targetPhoto.fullSrc || targetPhoto.src;
  photoViewerImage.alt = targetPhoto.alt;
  photoViewerCaption.textContent = targetPhoto.caption;
}

// 사진 확대 모달을 여는 함수
function openPhotoViewer(index) {
  if (!photoViewerDim || !photoViewer || currentVisiblePhotos.length === 0) {
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

// 현재 확대된 사진을 삭제하는 함수
function deleteCurrentPhoto() {
  const targetPhoto = currentVisiblePhotos[currentPhotoIndex];

  if (!targetPhoto) {
    return;
  }

  const isConfirmed = window.confirm(`${targetPhoto.caption} 사진을 삭제할까?`);

  if (!isConfirmed) {
    return;
  }

  if (isBasePhoto(targetPhoto.id)) {
    const deletedPhotoIds = getDeletedPhotoIds();

    if (!deletedPhotoIds.includes(targetPhoto.id)) {
      deletedPhotoIds.push(targetPhoto.id);
    }

    saveDeletedPhotoIds(deletedPhotoIds);
  } else {
    const nextCapturedPhotos = getCapturedPhotos().filter(function (photo) {
      return photo.id !== targetPhoto.id;
    });

    saveCapturedPhotos(nextCapturedPhotos);
  }

  closePhotoViewer();
  updateArchiveSummary();
  renderPhotoGrid();
}

// 이전 사진으로 이동하는 함수
function showPrevPhoto() {
  if (currentVisiblePhotos.length === 0) {
    return;
  }

  const prevIndex =
    currentPhotoIndex === 0
      ? currentVisiblePhotos.length - 1
      : currentPhotoIndex - 1;

  updatePhotoViewer(prevIndex);
}

// 다음 사진으로 이동하는 함수
function showNextPhoto() {
  if (currentVisiblePhotos.length === 0) {
    return;
  }

  const nextIndex =
    currentPhotoIndex === currentVisiblePhotos.length - 1
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

// 사진 그리드 클릭으로 확대 모달을 여는 함수
function handlePhotoGridClick(event) {
  const photoItem = event.target.closest(".photo-item");

  if (!photoItem) {
    return;
  }

  openPhotoViewer(Number(photoItem.dataset.index));
}

// 사진 그리드 키보드 접근을 처리하는 함수
function handlePhotoGridKeydown(event) {
  const photoItem = event.target.closest(".photo-item");

  if (!photoItem) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  openPhotoViewer(Number(photoItem.dataset.index));
}

// 사진 확대 보기 기능을 시작하는 함수
function initPhotoViewer() {
  if (!archivePhotoGrid) {
    return;
  }

  archivePhotoGrid.addEventListener("click", handlePhotoGridClick);
  archivePhotoGrid.addEventListener("keydown", handlePhotoGridKeydown);

  if (photoViewerDim) {
    photoViewerDim.addEventListener("click", closePhotoViewer);
  }

  if (photoViewerClose) {
    photoViewerClose.addEventListener("click", closePhotoViewer);
  }

  if (photoViewerPrev) {
    photoViewerPrev.addEventListener("click", showPrevPhoto);
  }

  if (photoViewerNext) {
    photoViewerNext.addEventListener("click", showNextPhoto);
  }

  if (photoViewerDeleteButton) {
    photoViewerDeleteButton.addEventListener("click", deleteCurrentPhoto);
  }

  window.addEventListener("keydown", handlePhotoViewerKeydown);
}

// 사진 아카이브 화면 기능을 시작하는 함수
function initArchivePage() {
  updateArchiveSummary();
  initSearchPanel();
  initFilterTabs();
  initSortDropdown();
  initViewToggle();
  initPhotoAddSheet();
  initPhotoViewer();
  renderPhotoGrid();
}

window.addEventListener("load", initArchivePage);
