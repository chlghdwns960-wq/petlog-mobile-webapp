const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("hospitalSearch");
const searchIcon = document.querySelector(".search-icon");

const filterButtons = document.querySelectorAll(".filter-button");
const hospitalItems = document.querySelectorAll(".hospital-item");
const saveButtons = document.querySelectorAll(".save-button");

const STORAGE_KEY = "petlogHospitalListState";

// 저장된 병원 리스트 상태를 불러오는 함수
function loadHospitalState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return {
      searchValue: "",
      activeFilter: "all",
      savedHospitals: [],
    };
  }

  try {
    return JSON.parse(savedState);
  } catch (error) {
    return {
      searchValue: "",
      activeFilter: "all",
      savedHospitals: [],
    };
  }
}

// 병원 리스트 상태를 저장하는 함수
function saveHospitalState() {
  const activeFilterButton = document.querySelector(".filter-button.is-active");
  const savedHospitals = [];

  saveButtons.forEach(function (button, index) {
    if (button.classList.contains("is-saved")) {
      savedHospitals.push(index);
    }
  });

  const state = {
    searchValue: searchInput.value,
    activeFilter: activeFilterButton
      ? activeFilterButton.dataset.filter
      : "all",
    savedHospitals: savedHospitals,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 검색창 활성 상태를 적용하는 함수
function activateSearchBox() {
  searchBox.classList.add("is-active");

  if (searchIcon.dataset.active) {
    searchIcon.src = searchIcon.dataset.active;
  }
}

// 검색창 비활성 상태를 적용하는 함수
function deactivateSearchBox() {
  if (searchInput.value.trim() !== "") {
    return;
  }

  searchBox.classList.remove("is-active");

  if (searchIcon.dataset.default) {
    searchIcon.src = searchIcon.dataset.default;
  }
}

// 병원 이름과 주소 기준으로 검색 결과를 필터링하는 함수
function filterHospitalsBySearch() {
  const keyword = searchInput.value.trim().toLowerCase();

  hospitalItems.forEach(function (item) {
    const name = item.querySelector(".hospital-name").textContent.toLowerCase();
    const address = item
      .querySelector(".hospital-address")
      .textContent.toLowerCase();

    const isMatched = name.includes(keyword) || address.includes(keyword);

    item.dataset.searchMatched = String(isMatched);
  });
}

// 필터 버튼 active 상태를 변경하는 함수
function updateFilterButtons(clickedButton) {
  filterButtons.forEach(function (button) {
    const isCurrent = button === clickedButton;

    button.classList.toggle("is-active", isCurrent);
    button.setAttribute("aria-pressed", String(isCurrent));
  });
}

// 병원 필터링을 실행하는 함수
function filterHospitals(filterType) {
  hospitalItems.forEach(function (item) {
    const isOpen = item.dataset.status === "open";
    const is24h = item.dataset["24h"] === "true";
    const isEmergency = item.dataset.emergency === "true";
    const isSearchMatched = item.dataset.searchMatched !== "false";

    let shouldShowByFilter = true;

    if (filterType === "open") {
      shouldShowByFilter = isOpen;
    }

    if (filterType === "24h") {
      shouldShowByFilter = is24h;
    }

    if (filterType === "emergency") {
      shouldShowByFilter = isEmergency;
    }

    item.classList.toggle(
      "is-hidden",
      !(shouldShowByFilter && isSearchMatched),
    );
  });
}

// 현재 선택된 필터를 기준으로 화면을 다시 그리는 함수
function refreshHospitalList() {
  const activeFilterButton = document.querySelector(".filter-button.is-active");
  const filterType = activeFilterButton
    ? activeFilterButton.dataset.filter
    : "all";

  filterHospitalsBySearch();
  filterHospitals(filterType);
  saveHospitalState();
}

// 필터 버튼 클릭 이벤트를 연결하는 함수
function initFilterButtons() {
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      updateFilterButtons(button);
      refreshHospitalList();
    });
  });
}

// 병원 저장 버튼 상태를 변경하는 함수
function toggleSaveButton(button) {
  const image = button.querySelector("img");
  const isSaved = button.classList.toggle("is-saved");

  image.src = isSaved ? image.dataset.active : image.dataset.default;

  saveHospitalState();
}

// 저장 버튼 클릭 이벤트를 연결하는 함수
function initSaveButtons() {
  saveButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      toggleSaveButton(button);
    });
  });
}

// 검색창 이벤트를 연결하는 함수
function initSearchBox() {
  searchInput.addEventListener("focus", activateSearchBox);
  searchInput.addEventListener("blur", deactivateSearchBox);

  searchInput.addEventListener("input", function () {
    activateSearchBox();
    refreshHospitalList();
  });
}

// 저장된 검색어, 필터, 저장 병원 상태를 화면에 복원하는 함수
function restoreHospitalState() {
  const state = loadHospitalState();

  searchInput.value = state.searchValue;

  if (state.searchValue.trim() !== "") {
    activateSearchBox();
  }

  filterButtons.forEach(function (button) {
    const isCurrent = button.dataset.filter === state.activeFilter;

    button.classList.toggle("is-active", isCurrent);
    button.setAttribute("aria-pressed", String(isCurrent));
  });

  saveButtons.forEach(function (button, index) {
    const image = button.querySelector("img");
    const isSaved = state.savedHospitals.includes(index);

    button.classList.toggle("is-saved", isSaved);
    image.src = isSaved ? image.dataset.active : image.dataset.default;
  });

  filterHospitalsBySearch();
  filterHospitals(state.activeFilter);
}

// 병원 리스트 화면 기능을 시작하는 함수
function initHospitalListPage() {
  restoreHospitalState();
  initSearchBox();
  initFilterButtons();
  initSaveButtons();
}

window.addEventListener("load", initHospitalListPage);
