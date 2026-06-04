const SCHEDULE_STORAGE_KEY = "petlogSchedules";

const scheduleTitleInput = document.getElementById("scheduleTitle");
const selectedDateElement = document.getElementById("selectedDate");
const selectedTimeElement = document.getElementById("selectedTime");
const selectedReminderElement = document.getElementById("selectedReminder");

const petButtons = document.querySelectorAll("[data-pet]");
const categoryButtons = document.querySelectorAll("[data-category]");
const repeatButtons = document.querySelectorAll("[data-repeat]");

const openDateTimePickerButton = document.getElementById("openDateTimePicker");
const dateTimeSheet = document.getElementById("dateTimeSheet");
const sheetDim = document.getElementById("sheetDim");
const closeSheetButton = document.getElementById("closeSheetButton");

const dateTabButtons = document.querySelectorAll("[data-date-tab]");
const yearPanel = document.getElementById("yearPanel");
const monthPanel = document.getElementById("monthPanel");
const dayPanel = document.getElementById("dayPanel");

const yearOptions = document.getElementById("yearOptions");
const monthOptions = document.getElementById("monthOptions");
const dayOptions = document.getElementById("dayOptions");

const meridiemOptions = document.getElementById("meridiemOptions");
const hourOptions = document.getElementById("hourOptions");
const minuteOptions = document.getElementById("minuteOptions");

const reminderSelect = document.getElementById("reminderSelect");
const reminderOptions = document.getElementById("reminderOptions");

const saveScheduleButton = document.getElementById("saveScheduleButton");

let selectedPet = "보리";
let selectedCategory = "목욕";
let selectedRepeat = "반복 안함";

let selectedYear = 2026;
let selectedMonth = 3;
let selectedDay = 16;

let selectedMeridiem = "오전";
let selectedHour = 9;
let selectedMinute = 0;

let selectedReminder = "10분 전";

// 저장된 일정을 불러오는 함수
function getSchedules() {
  const savedSchedules = localStorage.getItem(SCHEDULE_STORAGE_KEY);

  if (!savedSchedules) {
    return [];
  }

  try {
    return JSON.parse(savedSchedules);
  } catch (error) {
    return [];
  }
}

// 일정을 localStorage에 저장하는 함수
function saveSchedules(schedules) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
}

// 숫자를 두 자리 문자열로 바꾸는 함수
function padNumber(number) {
  return String(number).padStart(2, "0");
}

// 선택된 날짜를 2026.03.16 형식으로 만드는 함수
function getSelectedDateText() {
  return `${selectedYear}.${padNumber(selectedMonth)}.${padNumber(selectedDay)}`;
}

// 선택된 시간을 오전 9:00 형식으로 만드는 함수
function getSelectedTimeText() {
  return `${selectedMeridiem} ${selectedHour}:${padNumber(selectedMinute)}`;
}

// 선택된 날짜/시간을 화면에 반영하는 함수
function updateSelectedDateTimeText() {
  selectedDateElement.textContent = getSelectedDateText();
  selectedTimeElement.textContent = getSelectedTimeText();
}

// 해당 년/월의 마지막 날짜를 계산하는 함수
function getLastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// 선택된 날짜가 현재 월의 마지막 날짜를 넘지 않도록 보정하는 함수
function adjustSelectedDay() {
  const lastDay = getLastDayOfMonth(selectedYear, selectedMonth);

  if (selectedDay > lastDay) {
    selectedDay = lastDay;
  }
}

// 날짜 탭 active를 변경하는 함수
function switchDateTab(tabName) {
  dateTabButtons.forEach(function (button) {
    button.classList.toggle("is-active", button.dataset.dateTab === tabName);
  });

  yearPanel.classList.toggle("is-active", tabName === "year");
  monthPanel.classList.toggle("is-active", tabName === "month");
  dayPanel.classList.toggle("is-active", tabName === "day");
}

// 날짜 탭 기능을 연결하는 함수
function initDateTabs() {
  dateTabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      switchDateTab(button.dataset.dateTab);
    });
  });
}

// 년도 선택 옵션을 생성하는 함수
function createYearOptions() {
  yearOptions.innerHTML = "";

  const startYear = 2025;
  const endYear = 2030;

  for (let year = startYear; year <= endYear; year += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${year}`;
    button.dataset.year = String(year);

    if (year === selectedYear) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", function () {
      selectedYear = year;
      adjustSelectedDay();
      createYearOptions();
      createDayOptions();
      updateSelectedDateTimeText();
      switchDateTab("month");
    });

    yearOptions.appendChild(button);
  }
}

// 월 선택 옵션을 생성하는 함수
function createMonthOptions() {
  monthOptions.innerHTML = "";

  for (let month = 1; month <= 12; month += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${month}월`;
    button.dataset.month = String(month);

    if (month === selectedMonth) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", function () {
      selectedMonth = month;
      adjustSelectedDay();
      createMonthOptions();
      createDayOptions();
      updateSelectedDateTimeText();
      switchDateTab("day");
    });

    monthOptions.appendChild(button);
  }
}

// 일 선택 옵션을 생성하는 함수
function createDayOptions() {
  dayOptions.innerHTML = "";

  const lastDay = getLastDayOfMonth(selectedYear, selectedMonth);

  for (let day = 1; day <= lastDay; day += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${day}일`;
    button.dataset.day = String(day);

    if (day === selectedDay) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", function () {
      selectedDay = day;
      createDayOptions();
      updateSelectedDateTimeText();
    });

    dayOptions.appendChild(button);
  }
}

// 날짜 선택 옵션을 초기화하는 함수
function initDatePickerOptions() {
  createYearOptions();
  createMonthOptions();
  createDayOptions();
  initDateTabs();
}

// 오전/오후 선택 active를 업데이트하는 함수
function updateMeridiemActive() {
  const buttons = meridiemOptions.querySelectorAll("button");

  buttons.forEach(function (button) {
    button.classList.toggle(
      "is-active",
      button.dataset.meridiem === selectedMeridiem,
    );
  });
}

// 오전/오후 선택 기능을 연결하는 함수
function initMeridiemOptions() {
  meridiemOptions.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-meridiem]");

    if (!button) {
      return;
    }

    selectedMeridiem = button.dataset.meridiem;
    updateMeridiemActive();
    updateSelectedDateTimeText();
  });
}

// 시간 선택 옵션을 생성하는 함수
function createHourOptions() {
  hourOptions.innerHTML = "";

  for (let hour = 1; hour <= 12; hour += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${hour}시`;
    button.dataset.hour = String(hour);

    if (hour === selectedHour) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", function () {
      selectedHour = hour;
      createHourOptions();
      updateSelectedDateTimeText();
    });

    hourOptions.appendChild(button);
  }
}

// 분 선택 옵션을 생성하는 함수
function createMinuteOptions() {
  minuteOptions.innerHTML = "";

  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  minutes.forEach(function (minute) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${padNumber(minute)}분`;
    button.dataset.minute = String(minute);

    if (minute === selectedMinute) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", function () {
      selectedMinute = minute;
      createMinuteOptions();
      updateSelectedDateTimeText();
    });

    minuteOptions.appendChild(button);
  });
}

// 시간 선택 옵션을 초기화하는 함수
function initTimePickerOptions() {
  initMeridiemOptions();
  createHourOptions();
  createMinuteOptions();
}

// 단일 선택 버튼 active를 처리하는 함수
function updateSingleSelect(buttons, targetButton, dataKey) {
  buttons.forEach(function (button) {
    button.classList.remove("is-active");
  });

  targetButton.classList.add("is-active");

  if (dataKey === "pet") {
    selectedPet = targetButton.dataset.pet;
  }

  if (dataKey === "category") {
    selectedCategory = targetButton.dataset.category;
  }

  if (dataKey === "repeat") {
    selectedRepeat = targetButton.dataset.repeat;
  }
}

// 선택 버튼 이벤트를 연결하는 함수
function initSelectButtons() {
  petButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      updateSingleSelect(petButtons, button, "pet");
    });
  });

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      updateSingleSelect(categoryButtons, button, "category");
    });
  });

  repeatButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      updateSingleSelect(repeatButtons, button, "repeat");
    });
  });
}

// 바텀시트를 여는 함수
function openSheet() {
  sheetDim.classList.add("is-open");
  dateTimeSheet.classList.add("is-open");
  sheetDim.setAttribute("aria-hidden", "false");
}

// 바텀시트를 닫는 함수
function closeSheet() {
  sheetDim.classList.remove("is-open");
  dateTimeSheet.classList.remove("is-open");
  sheetDim.setAttribute("aria-hidden", "true");
}

// 날짜/시간 선택 기능을 연결하는 함수
function initDateTimePicker() {
  initDatePickerOptions();
  initTimePickerOptions();

  openDateTimePickerButton.addEventListener("click", openSheet);
  closeSheetButton.addEventListener("click", closeSheet);
  sheetDim.addEventListener("click", closeSheet);
}

// 알림 옵션 active를 업데이트하는 함수
function updateReminderActive() {
  const buttons = reminderOptions.querySelectorAll("button");

  buttons.forEach(function (button) {
    button.classList.toggle(
      "is-active",
      button.dataset.reminder === selectedReminder,
    );
  });
}

// 알림 설정 드롭다운 기능을 연결하는 함수
function initReminderSelect() {
  reminderSelect.addEventListener("click", function () {
    reminderOptions.classList.toggle("is-open");
  });

  reminderOptions.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-reminder]");

    if (!button) {
      return;
    }

    selectedReminder = button.dataset.reminder;
    selectedReminderElement.textContent = selectedReminder;

    updateReminderActive();
    reminderOptions.classList.remove("is-open");
  });
}

// 일정 제목 유효성을 확인하는 함수
function validateScheduleTitle() {
  const title = scheduleTitleInput.value.trim();

  if (!title) {
    alert("일정 제목을 입력해줘.");
    scheduleTitleInput.focus();
    return false;
  }

  return true;
}

// 새 일정 객체를 만드는 함수
function createScheduleData() {
  return {
    id: `schedule-${Date.now()}`,
    title: scheduleTitleInput.value.trim(),
    pet: selectedPet,
    category: selectedCategory,
    date: getSelectedDateText(),
    time: getSelectedTimeText(),
    repeat: selectedRepeat,
    reminder: selectedReminder,
    status: "pending",
  };
}

// 일정을 저장하는 함수
function saveNewSchedule() {
  if (!validateScheduleTitle()) {
    return;
  }

  const schedules = getSchedules();
  const newSchedule = createScheduleData();

  schedules.push(newSchedule);
  saveSchedules(schedules);

  alert("일정이 저장됐어.");
  window.location.href = "./index9.html";
}

// 저장 버튼 기능을 연결하는 함수
function initSaveButton() {
  saveScheduleButton.addEventListener("click", saveNewSchedule);
}

// 일정 추가 화면 기능을 시작하는 함수
function initScheduleAddPage() {
  initSelectButtons();
  initDateTimePicker();
  initReminderSelect();
  initSaveButton();

  updateSelectedDateTimeText();
  selectedReminderElement.textContent = selectedReminder;
}

window.addEventListener("load", initScheduleAddPage);
