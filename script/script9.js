const SCHEDULE_STORAGE_KEY = "petlogSchedules";

const scheduleList = document.getElementById("scheduleList");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter-button");
const todayCount = document.getElementById("todayCount");
const weekCount = document.getElementById("weekCount");

let currentFilter = "all";

// 기본 일정 데이터를 만드는 함수
function createDefaultSchedules() {
  return [
    {
      id: "default-1",
      title: "약 먹이기",
      pet: "보리",
      category: "약",
      date: "2026.03.16",
      time: "오전 9:00",
      repeat: "반복 안함",
      reminder: "10분 전",
      status: "done",
    },
    {
      id: "default-2",
      title: "저녁 산책",
      pet: "보리",
      category: "산책",
      date: "2026.03.16",
      time: "오후 6:00",
      repeat: "반복 안함",
      reminder: "10분 전",
      status: "pending",
    },
    {
      id: "default-3",
      title: "병원 정기 검진",
      pet: "보리",
      category: "병원",
      date: "2026.03.17",
      time: "오후 2:00",
      repeat: "반복 안함",
      reminder: "30분 전",
      status: "pending",
    },
    {
      id: "default-4",
      title: "저녁 산책",
      pet: "보리",
      category: "산책",
      date: "2026.03.17",
      time: "오후 6:00",
      repeat: "반복 안함",
      reminder: "10분 전",
      status: "done",
    },
    {
      id: "default-5",
      title: "보리 목욕",
      pet: "보리",
      category: "목욕",
      date: "2026.03.20",
      time: "오전 11:00",
      repeat: "반복 안함",
      reminder: "1시간 전",
      status: "pending",
    },
  ];
}

// 저장된 일정을 불러오는 함수
function getSchedules() {
  const savedSchedules = localStorage.getItem(SCHEDULE_STORAGE_KEY);

  if (!savedSchedules) {
    const defaultSchedules = createDefaultSchedules();
    saveSchedules(defaultSchedules);
    return defaultSchedules;
  }

  try {
    return JSON.parse(savedSchedules);
  } catch (error) {
    const defaultSchedules = createDefaultSchedules();
    saveSchedules(defaultSchedules);
    return defaultSchedules;
  }
}

// 일정을 localStorage에 저장하는 함수
function saveSchedules(schedules) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
}

// 날짜 문자열을 Date 객체로 바꾸는 함수
function parseDate(dateText) {
  const [year, month, day] = dateText.split(".").map(Number);
  return new Date(year, month - 1, day);
}

// 오늘 날짜 문자열을 만드는 함수
function getTodayText() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

// 특정 날짜가 이번 주 안에 있는지 확인하는 함수
function isThisWeek(dateText) {
  const today = new Date();
  const targetDate = parseDate(dateText);

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 6;
}

// 날짜 제목을 화면용으로 바꾸는 함수
function getDateTitle(dateText) {
  const todayText = getTodayText();
  const today = parseDate(todayText);
  const targetDate = parseDate(dateText);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tomorrowText = `${tomorrow.getFullYear()}.${String(
    tomorrow.getMonth() + 1,
  ).padStart(2, "0")}.${String(tomorrow.getDate()).padStart(2, "0")}`;

  if (dateText === todayText || dateText === "2026.03.16") {
    return "오늘";
  }

  if (dateText === tomorrowText || dateText === "2026.03.17") {
    return "내일";
  }

  const [, month, day] = dateText.split(".");
  return `${Number(month)}월 ${Number(day)}일`;
}

// 시간 문자열을 정렬용 숫자로 바꾸는 함수
function getTimeValue(timeText) {
  const isAfternoon = timeText.includes("오후");
  const match = timeText.match(/(\d+):(\d+)/);

  if (!match) {
    return 0;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);

  if (isAfternoon && hour !== 12) {
    hour += 12;
  }

  if (!isAfternoon && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

// 일정 필터링을 처리하는 함수
function filterSchedules(schedules) {
  const todayText = getTodayText();

  if (currentFilter === "today") {
    return schedules.filter(
      (schedule) =>
        schedule.date === todayText || schedule.date === "2026.03.16",
    );
  }

  if (currentFilter === "pending") {
    return schedules.filter((schedule) => schedule.status === "pending");
  }

  if (currentFilter === "done") {
    return schedules.filter((schedule) => schedule.status === "done");
  }

  return schedules;
}

// 날짜별로 일정을 그룹화하는 함수
function groupSchedulesByDate(schedules) {
  return schedules.reduce(function (groups, schedule) {
    if (!groups[schedule.date]) {
      groups[schedule.date] = [];
    }

    groups[schedule.date].push(schedule);
    return groups;
  }, {});
}

// 일정 카운트를 업데이트하는 함수
function updateSummaryCounts(schedules) {
  const todayText = getTodayText();

  const todaySchedules = schedules.filter(function (schedule) {
    return schedule.date === todayText || schedule.date === "2026.03.16";
  });

  const weekSchedules = schedules.filter(function (schedule) {
    return schedule.status === "pending" && isThisWeek(schedule.date);
  });

  todayCount.textContent = todaySchedules.length;
  weekCount.textContent = weekSchedules.length;
}

// 일정 상태를 토글하는 함수
function toggleScheduleStatus(scheduleId) {
  const schedules = getSchedules();

  const nextSchedules = schedules.map(function (schedule) {
    if (schedule.id !== scheduleId) {
      return schedule;
    }

    return {
      ...schedule,
      status: schedule.status === "done" ? "pending" : "done",
    };
  });

  saveSchedules(nextSchedules);
  renderSchedulePage();
}

// 일정을 삭제하는 함수
function deleteSchedule(scheduleId) {
  const isConfirmed = window.confirm("이 일정을 삭제할까?");

  if (!isConfirmed) {
    return;
  }

  const schedules = getSchedules();
  const nextSchedules = schedules.filter(
    (schedule) => schedule.id !== scheduleId,
  );

  saveSchedules(nextSchedules);
  renderSchedulePage();
}

// 삭제 아이콘 SVG를 만드는 함수
function createDeleteIconSvg() {
  return `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 7L9 4H15L16 7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M7 7L8 20H16L17 7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `;
}

// 일정 아이템 HTML을 만드는 함수
function createScheduleItem(schedule) {
  const item = document.createElement("article");
  item.className = "schedule-item";

  const statusText = schedule.status === "done" ? "완료" : "예정";
  const statusClass = schedule.status === "done" ? "is-done" : "";

  item.innerHTML = `
    <span class="schedule-time">${schedule.time}</span>
    <strong class="schedule-title">${schedule.title}</strong>

    <button
      type="button"
      class="status-button ${statusClass}"
      aria-label="${schedule.title} 상태 변경"
      data-action="toggle"
      data-id="${schedule.id}"
    >
      ${statusText}
    </button>

    <button
      type="button"
      class="delete-button"
      aria-label="${schedule.title} 삭제"
      data-action="delete"
      data-id="${schedule.id}"
    >
      ${createDeleteIconSvg()}
    </button>
  `;

  return item;
}

// 일정 목록을 렌더링하는 함수
function renderScheduleList(schedules) {
  scheduleList.innerHTML = "";

  if (schedules.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  const groupedSchedules = groupSchedulesByDate(schedules);
  const sortedDates = Object.keys(groupedSchedules).sort(function (a, b) {
    return parseDate(a) - parseDate(b);
  });

  sortedDates.forEach(function (date) {
    const group = document.createElement("div");
    group.className = "schedule-group";

    const title = document.createElement("h2");
    title.className = "schedule-date-title";
    title.textContent = getDateTitle(date);

    group.appendChild(title);

    groupedSchedules[date]
      .sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time))
      .forEach(function (schedule) {
        group.appendChild(createScheduleItem(schedule));
      });

    scheduleList.appendChild(group);
  });
}

// 필터 버튼 active를 업데이트하는 함수
function updateFilterButtons() {
  filterButtons.forEach(function (button) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
  });
}

// 일정 목록 화면 전체를 렌더링하는 함수
function renderSchedulePage() {
  const schedules = getSchedules();
  const filteredSchedules = filterSchedules(schedules);

  updateSummaryCounts(schedules);
  updateFilterButtons();
  renderScheduleList(filteredSchedules);
}

// 필터 기능을 연결하는 함수
function initFilterTabs() {
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.dataset.filter;
      renderSchedulePage();
    });
  });
}

// 일정 목록 클릭 이벤트를 처리하는 함수
function initScheduleListActions() {
  scheduleList.addEventListener("click", function (event) {
    const actionButton = event.target.closest("button[data-action]");

    if (!actionButton) {
      return;
    }

    const scheduleId = actionButton.dataset.id;
    const action = actionButton.dataset.action;

    if (action === "toggle") {
      toggleScheduleStatus(scheduleId);
    }

    if (action === "delete") {
      deleteSchedule(scheduleId);
    }
  });
}

// 일정 목록 화면 기능을 시작하는 함수
function initScheduleListPage() {
  initFilterTabs();
  initScheduleListActions();
  renderSchedulePage();
}

window.addEventListener("load", initScheduleListPage);
