const PROFILE_STORAGE_KEY = "petlogProfileSettings";
const GUARDIAN_STORAGE_KEY = "petlogGuardianSettings";
const ALARM_STORAGE_KEY = "petlogAlarmSettings";

const petNameText = document.getElementById("petNameText");
const petAgeText = document.getElementById("petAgeText");
const petBreedText = document.getElementById("petBreedText");
const petWeightText = document.getElementById("petWeightText");

const guardianNameText = document.getElementById("guardianNameText");
const guardianPhoneText = document.getElementById("guardianPhoneText");
const guardianAreaText = document.getElementById("guardianAreaText");

const openPetEditButton = document.getElementById("openPetEditButton");
const openPetEditMenuButton = document.getElementById("openPetEditMenuButton");
const petEditDim = document.getElementById("petEditDim");
const petEditSheet = document.getElementById("petEditSheet");
const petEditCloseButton = document.getElementById("petEditCloseButton");
const petEditCancelButton = document.getElementById("petEditCancelButton");
const petEditSaveButton = document.getElementById("petEditSaveButton");

const petNameInput = document.getElementById("petNameInput");
const petAgeInput = document.getElementById("petAgeInput");
const petBreedInput = document.getElementById("petBreedInput");
const petWeightInput = document.getElementById("petWeightInput");

const openGuardianEditButton = document.getElementById(
  "openGuardianEditButton",
);
const guardianEditDim = document.getElementById("guardianEditDim");
const guardianEditSheet = document.getElementById("guardianEditSheet");
const guardianEditCloseButton = document.getElementById(
  "guardianEditCloseButton",
);
const guardianEditCancelButton = document.getElementById(
  "guardianEditCancelButton",
);
const guardianEditSaveButton = document.getElementById(
  "guardianEditSaveButton",
);

const guardianNameInput = document.getElementById("guardianNameInput");
const guardianPhoneInput = document.getElementById("guardianPhoneInput");
const guardianAreaInput = document.getElementById("guardianAreaInput");

const walkAlarmToggle = document.getElementById("walkAlarmToggle");
const medicineAlarmToggle = document.getElementById("medicineAlarmToggle");
const hospitalAlarmToggle = document.getElementById("hospitalAlarmToggle");

const clearMemoButton = document.getElementById("clearMemoButton");
const clearPhotoButton = document.getElementById("clearPhotoButton");
const clearRecordButton = document.getElementById("clearRecordButton");

const goSettingButton = document.getElementById("goSettingButton");
const toastMessage = document.getElementById("toastMessage");

let toastTimer = null;

// 기본 반려동물 정보를 반환하는 함수
function getDefaultProfile() {
  return {
    name: "보리",
    age: "10살",
    breed: "페키니즈",
    weight: "5.1kg",
  };
}

// 기본 보호자 정보를 반환하는 함수
function getDefaultGuardian() {
  return {
    name: "홍준",
    phone: "010-0000-0000",
    area: "김포 장기동",
  };
}

// 기본 알림 설정을 반환하는 함수
function getDefaultAlarms() {
  return {
    walk: true,
    medicine: true,
    hospital: false,
  };
}

// 토스트 메시지를 보여주는 함수
function showToast(message) {
  if (!toastMessage) {
    return;
  }

  window.clearTimeout(toastTimer);

  toastMessage.textContent = message;
  toastMessage.classList.add("is-open");

  toastTimer = window.setTimeout(function () {
    toastMessage.classList.remove("is-open");
  }, 1800);
}

// localStorage JSON 데이터를 안전하게 읽는 함수
function readStorageJson(key, fallback) {
  const savedData = localStorage.getItem(key);

  if (!savedData) {
    return fallback;
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(savedData),
    };
  } catch (error) {
    return fallback;
  }
}

// 반려동물 정보를 저장하는 함수
function saveProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

// 보호자 정보를 저장하는 함수
function saveGuardian(guardian) {
  localStorage.setItem(GUARDIAN_STORAGE_KEY, JSON.stringify(guardian));
}

// 알림 설정을 저장하는 함수
function saveAlarms(alarms) {
  localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarms));
}

// 저장된 반려동물 정보를 불러오는 함수
function getProfile() {
  return readStorageJson(PROFILE_STORAGE_KEY, getDefaultProfile());
}

// 저장된 보호자 정보를 불러오는 함수
function getGuardian() {
  return readStorageJson(GUARDIAN_STORAGE_KEY, getDefaultGuardian());
}

// 저장된 알림 설정을 불러오는 함수
function getAlarms() {
  return readStorageJson(ALARM_STORAGE_KEY, getDefaultAlarms());
}

// 반려동물 정보를 화면에 반영하는 함수
function renderProfile() {
  const profile = getProfile();

  petNameText.textContent = profile.name || "보리";
  petAgeText.textContent = profile.age || "10살";
  petBreedText.textContent = profile.breed || "페키니즈";
  petWeightText.textContent = profile.weight || "5.1kg";
}

// 보호자 정보를 화면에 반영하는 함수
function renderGuardian() {
  const guardian = getGuardian();

  guardianNameText.textContent = guardian.name || "홍준";
  guardianPhoneText.textContent = guardian.phone || "010-0000-0000";
  guardianAreaText.textContent = guardian.area || "김포 장기동";
}

// 알림 토글 상태를 화면에 반영하는 함수
function renderAlarms() {
  const alarms = getAlarms();

  walkAlarmToggle.checked = Boolean(alarms.walk);
  medicineAlarmToggle.checked = Boolean(alarms.medicine);
  hospitalAlarmToggle.checked = Boolean(alarms.hospital);
}

// 바텀시트를 여는 함수
function openSheet(dim, sheet) {
  dim.classList.add("is-open");
  sheet.classList.add("is-open");
  dim.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-sheet-open");
}

// 바텀시트를 닫는 함수
function closeSheet(dim, sheet) {
  dim.classList.remove("is-open");
  sheet.classList.remove("is-open");
  dim.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-sheet-open");
}

// 보리 정보 수정 바텀시트를 여는 함수
function openPetEditSheet() {
  const profile = getProfile();

  petNameInput.value = profile.name;
  petAgeInput.value = profile.age;
  petBreedInput.value = profile.breed;
  petWeightInput.value = profile.weight;

  openSheet(petEditDim, petEditSheet);

  window.setTimeout(function () {
    petNameInput.focus();
  }, 120);
}

// 보리 정보 수정 바텀시트를 닫는 함수
function closePetEditSheet() {
  closeSheet(petEditDim, petEditSheet);
}

// 보리 정보 수정 내용을 저장하는 함수
function savePetEdit() {
  const profile = {
    name: petNameInput.value.trim(),
    age: petAgeInput.value.trim(),
    breed: petBreedInput.value.trim(),
    weight: petWeightInput.value.trim(),
  };

  if (!profile.name) {
    alert("이름을 입력해줘.");
    petNameInput.focus();
    return;
  }

  if (!profile.age) {
    alert("나이를 입력해줘.");
    petAgeInput.focus();
    return;
  }

  if (!profile.breed) {
    alert("견종을 입력해줘.");
    petBreedInput.focus();
    return;
  }

  if (!profile.weight) {
    alert("몸무게를 입력해줘.");
    petWeightInput.focus();
    return;
  }

  saveProfile(profile);
  renderProfile();
  closePetEditSheet();
  showToast("보리 정보가 저장됐어.");
}

// 보호자 정보 수정 바텀시트를 여는 함수
function openGuardianEditSheet() {
  const guardian = getGuardian();

  guardianNameInput.value = guardian.name;
  guardianPhoneInput.value = guardian.phone;
  guardianAreaInput.value = guardian.area;

  openSheet(guardianEditDim, guardianEditSheet);

  window.setTimeout(function () {
    guardianNameInput.focus();
  }, 120);
}

// 보호자 정보 수정 바텀시트를 닫는 함수
function closeGuardianEditSheet() {
  closeSheet(guardianEditDim, guardianEditSheet);
}

// 보호자 정보 수정 내용을 저장하는 함수
function saveGuardianEdit() {
  const guardian = {
    name: guardianNameInput.value.trim(),
    phone: guardianPhoneInput.value.trim(),
    area: guardianAreaInput.value.trim(),
  };

  if (!guardian.name) {
    alert("보호자 이름을 입력해줘.");
    guardianNameInput.focus();
    return;
  }

  if (!guardian.phone) {
    alert("연락처를 입력해줘.");
    guardianPhoneInput.focus();
    return;
  }

  if (!guardian.area) {
    alert("주 이용 지역을 입력해줘.");
    guardianAreaInput.focus();
    return;
  }

  saveGuardian(guardian);
  renderGuardian();
  closeGuardianEditSheet();
  showToast("보호자 정보가 저장됐어.");
}

// 알림 토글 변경을 저장하는 함수
function handleAlarmChange() {
  const alarms = {
    walk: walkAlarmToggle.checked,
    medicine: medicineAlarmToggle.checked,
    hospital: hospitalAlarmToggle.checked,
  };

  saveAlarms(alarms);
  showToast("알림 설정이 저장됐어.");
}

// 메모 데이터를 초기화하는 함수
function clearMemoData() {
  const isConfirmed = window.confirm("메모 데이터를 초기화할까?");

  if (!isConfirmed) {
    return;
  }

  localStorage.removeItem("petlogRecordDetailMemos");
  showToast("메모 데이터가 초기화됐어.");
}

// 사진 추가 데이터를 초기화하는 함수
function clearPhotoData() {
  const isConfirmed = window.confirm("추가한 사진 데이터를 초기화할까?");

  if (!isConfirmed) {
    return;
  }

  localStorage.removeItem("petlogCapturedPhotos");
  localStorage.removeItem("petlogDeletedPhotoIds");
  showToast("사진 추가 데이터가 초기화됐어.");
}

// 산책 기록 데이터를 초기화하는 함수
function clearRecordData() {
  const isConfirmed = window.confirm("산책 기록을 기본값으로 초기화할까?");

  if (!isConfirmed) {
    return;
  }

  localStorage.removeItem("petlogWalkRecordDetail");
  localStorage.removeItem("petlogWalkRecordDeleted");
  showToast("산책 기록이 초기화됐어.");
}

// 설정 화면으로 이동하는 함수
function goSettingPage() {
  window.location.href = "./index14.html";
}

// 보리 정보 수정 이벤트를 연결하는 함수
function initPetEditor() {
  openPetEditButton.addEventListener("click", openPetEditSheet);
  openPetEditMenuButton.addEventListener("click", openPetEditSheet);

  petEditDim.addEventListener("click", closePetEditSheet);
  petEditCloseButton.addEventListener("click", closePetEditSheet);
  petEditCancelButton.addEventListener("click", closePetEditSheet);
  petEditSaveButton.addEventListener("click", savePetEdit);
}

// 보호자 정보 수정 이벤트를 연결하는 함수
function initGuardianEditor() {
  openGuardianEditButton.addEventListener("click", openGuardianEditSheet);

  guardianEditDim.addEventListener("click", closeGuardianEditSheet);
  guardianEditCloseButton.addEventListener("click", closeGuardianEditSheet);
  guardianEditCancelButton.addEventListener("click", closeGuardianEditSheet);
  guardianEditSaveButton.addEventListener("click", saveGuardianEdit);
}

// 알림 설정 이벤트를 연결하는 함수
function initAlarmSettings() {
  walkAlarmToggle.addEventListener("change", handleAlarmChange);
  medicineAlarmToggle.addEventListener("change", handleAlarmChange);
  hospitalAlarmToggle.addEventListener("change", handleAlarmChange);
}

// 데이터 초기화 이벤트를 연결하는 함수
function initDataManager() {
  clearMemoButton.addEventListener("click", clearMemoData);
  clearPhotoButton.addEventListener("click", clearPhotoData);
  clearRecordButton.addEventListener("click", clearRecordData);
}

// 마이 화면 기능을 시작하는 함수
function initMyPage() {
  renderProfile();
  renderGuardian();
  renderAlarms();

  initPetEditor();
  initGuardianEditor();
  initAlarmSettings();
  initDataManager();

  goSettingButton.addEventListener("click", goSettingPage);
}

window.addEventListener("load", initMyPage);
