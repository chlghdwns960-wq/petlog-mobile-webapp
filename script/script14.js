const PROFILE_STORAGE_KEY = "petlogProfileSettings";
const CONDITION_STORAGE_KEY = "petlogBoriCondition";
const NOTIFICATION_READ_STORAGE_KEY = "petlogReadNotifications";
const SETTING_TOGGLE_STORAGE_KEY = "petlogSettingToggles";
const THEME_STORAGE_KEY = "petlogTheme";

const petNameInput = document.getElementById("petNameInput");
const petAgeInput = document.getElementById("petAgeInput");
const petBreedInput = document.getElementById("petBreedInput");
const petWeightInput = document.getElementById("petWeightInput");

const previewName = document.getElementById("previewName");
const previewInfo = document.getElementById("previewInfo");

const saveProfileButton = document.getElementById("saveProfileButton");
const toggleRows = document.querySelectorAll(".toggle-row");
const themeButtons = document.querySelectorAll(".theme-button");
const resetDataButton = document.getElementById("resetDataButton");

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

// 프로필 미리보기를 업데이트하는 함수
function updateProfilePreview(profile) {
  previewName.textContent = profile.name;
  previewInfo.textContent = `${profile.age} · ${profile.breed} · ${profile.weight}`;
}

// 프로필 입력값을 화면에 반영하는 함수
function renderProfileForm() {
  const profile = getSavedProfile();

  petNameInput.value = profile.name;
  petAgeInput.value = profile.age;
  petBreedInput.value = profile.breed;
  petWeightInput.value = profile.weight;

  updateProfilePreview(profile);
}

// 프로필 정보를 저장하는 함수
function saveProfile() {
  const profile = {
    name: petNameInput.value.trim() || "보리",
    age: petAgeInput.value.trim() || "10살",
    breed: petBreedInput.value.trim() || "페키니즈",
    weight: petWeightInput.value.trim() || "5.1kg",
  };

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  updateProfilePreview(profile);

  alert("프로필이 저장됐어.");
}

// 저장된 알림 토글 상태를 불러오는 함수
function getSavedToggles() {
  const savedToggles = localStorage.getItem(SETTING_TOGGLE_STORAGE_KEY);

  if (!savedToggles) {
    return {
      routine: true,
      schedule: true,
      health: false,
    };
  }

  try {
    return JSON.parse(savedToggles);
  } catch (error) {
    return {
      routine: true,
      schedule: true,
      health: false,
    };
  }
}

// 알림 토글 상태를 저장하는 함수
function saveToggles(toggles) {
  localStorage.setItem(SETTING_TOGGLE_STORAGE_KEY, JSON.stringify(toggles));
}

// 알림 토글 UI를 업데이트하는 함수
function renderToggles() {
  const toggles = getSavedToggles();

  toggleRows.forEach(function (row) {
    const key = row.dataset.toggle;
    const isActive = Boolean(toggles[key]);
    const stateText = row.querySelector("em");

    row.classList.toggle("is-active", isActive);
    stateText.textContent = isActive ? "ON" : "OFF";
  });
}

// 알림 토글 클릭 기능을 연결하는 함수
function initToggleRows() {
  toggleRows.forEach(function (row) {
    row.addEventListener("click", function () {
      const key = row.dataset.toggle;
      const toggles = getSavedToggles();

      toggles[key] = !toggles[key];

      saveToggles(toggles);
      renderToggles();
    });
  });
}

// 저장된 테마를 불러오는 함수
function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || "warm";
}

// 테마 버튼 active 상태를 업데이트하는 함수
// 선택된 테마를 실제 화면에 적용하는 함수
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// 테마 버튼 active 상태를 업데이트하는 함수
function renderThemeButtons() {
  const savedTheme = getSavedTheme();

  applyTheme(savedTheme);

  themeButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.theme === savedTheme);
  });
}

// 테마 선택 기능을 연결하는 함수
function initThemeButtons() {
  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      localStorage.setItem(THEME_STORAGE_KEY, button.dataset.theme);
      renderThemeButtons();
    });
  });
}

// 테스트 저장 데이터를 초기화하는 함수
function resetSavedData() {
  const isConfirmed = window.confirm(
    "저장된 프로필, 컨디션, 알림 확인 상태를 초기화할까?",
  );

  if (!isConfirmed) {
    return;
  }

  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(CONDITION_STORAGE_KEY);
  localStorage.removeItem(NOTIFICATION_READ_STORAGE_KEY);
  localStorage.removeItem(SETTING_TOGGLE_STORAGE_KEY);
  localStorage.removeItem(THEME_STORAGE_KEY);

  renderProfileForm();
  renderToggles();
  renderThemeButtons();

  alert("저장 데이터가 초기화됐어.");
}

// 설정 화면 기능을 시작하는 함수
function initSettingsPage() {
  renderProfileForm();
  renderToggles();
  renderThemeButtons();

  saveProfileButton.addEventListener("click", saveProfile);
  resetDataButton.addEventListener("click", resetSavedData);

  initToggleRows();
  initThemeButtons();

  [petNameInput, petAgeInput, petBreedInput, petWeightInput].forEach(
    function (input) {
      input.addEventListener("input", function () {
        updateProfilePreview({
          name: petNameInput.value.trim() || "보리",
          age: petAgeInput.value.trim() || "10살",
          breed: petBreedInput.value.trim() || "페키니즈",
          weight: petWeightInput.value.trim() || "5.1kg",
        });
      });
    },
  );
}

window.addEventListener("load", initSettingsPage);
