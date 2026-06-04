const recordSection = document.getElementById("recordSection");
const reportSection = document.getElementById("reportSection");
const memoSection = document.getElementById("memoSection");
const actionSection = document.getElementById("actionSection");
const deletedRecordSection = document.getElementById("deletedRecordSection");
const restoreRecordButton = document.getElementById("restoreRecordButton");

const moreButton = document.getElementById("recordMoreButton");
const recordCard = document.getElementById("recordCard");
const statusToggleButton = document.getElementById("statusToggleButton");

const recordDateText = document.getElementById("recordDateText");
const recordDateValue = document.getElementById("recordDateValue");
const recordDurationValue = document.getElementById("recordDurationValue");
const recordDistanceValue = document.getElementById("recordDistanceValue");
const recordPoopValue = document.getElementById("recordPoopValue");
const recordConditionValue = document.getElementById("recordConditionValue");

const activityScore = document.getElementById("activityScore");
const scoreBarFill = document.getElementById("scoreBarFill");
const reportSummary = document.getElementById("reportSummary");
const reportCompare = document.getElementById("reportCompare");
const reportCare = document.getElementById("reportCare");

const recordMenuDim = document.getElementById("recordMenuDim");
const recordMenuSheet = document.getElementById("recordMenuSheet");
const recordMenuCloseButton = document.getElementById("recordMenuCloseButton");
const openRecordEditButton = document.getElementById("openRecordEditButton");
const menuStatusButton = document.getElementById("menuStatusButton");
const deleteRecordButton = document.getElementById("deleteRecordButton");

const recordEditDim = document.getElementById("recordEditDim");
const recordEditSheet = document.getElementById("recordEditSheet");
const recordEditCloseButton = document.getElementById("recordEditCloseButton");
const recordEditCancelButton = document.getElementById(
  "recordEditCancelButton",
);
const recordEditSaveButton = document.getElementById("recordEditSaveButton");

const editDateInput = document.getElementById("editDateInput");
const editTimeInput = document.getElementById("editTimeInput");
const editDurationInput = document.getElementById("editDurationInput");
const editDistanceInput = document.getElementById("editDistanceInput");
const editPoopSelect = document.getElementById("editPoopSelect");
const editConditionSelect = document.getElementById("editConditionSelect");

const MEMO_STORAGE_KEY = "petlogRecordDetailMemos";
const RECORD_STORAGE_KEY = "petlogWalkRecordDetail";
const RECORD_DELETED_STORAGE_KEY = "petlogWalkRecordDeleted";

const openMemoAddButton = document.getElementById("openMemoAddButton");
const memoList = document.getElementById("memoList");
const memoEmpty = document.getElementById("memoEmpty");
const memoCount = document.getElementById("memoCount");

const memoDim = document.getElementById("memoDim");
const memoSheet = document.getElementById("memoSheet");
const memoSheetTitle = document.getElementById("memoSheetTitle");
const memoTextInput = document.getElementById("memoTextInput");
const memoSaveButton = document.getElementById("memoSaveButton");
const memoCancelButton = document.getElementById("memoCancelButton");
const memoCloseButton = document.getElementById("memoCloseButton");

let editingMemoId = null;

const defaultRecord = {
  date: "2026-03-16",
  time: "18:20",
  duration: 42,
  distance: 2.1,
  poop: "있음",
  condition: "아주 좋음",
  status: "완료",
};

// 산책 기록 기본값을 복사해서 반환하는 함수
function getDefaultRecord() {
  return { ...defaultRecord };
}

// 저장된 산책 기록을 불러오는 함수
function getRecord() {
  const savedRecord = localStorage.getItem(RECORD_STORAGE_KEY);

  if (!savedRecord) {
    const record = getDefaultRecord();
    saveRecord(record);
    return record;
  }

  try {
    return {
      ...getDefaultRecord(),
      ...JSON.parse(savedRecord),
    };
  } catch (error) {
    const record = getDefaultRecord();
    saveRecord(record);
    return record;
  }
}

// 산책 기록을 저장하는 함수
function saveRecord(record) {
  localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(record));
}

// 기록 삭제 여부를 확인하는 함수
function isRecordDeleted() {
  return localStorage.getItem(RECORD_DELETED_STORAGE_KEY) === "true";
}

// 기록 삭제 상태를 저장하는 함수
function setRecordDeleted(isDeleted) {
  localStorage.setItem(RECORD_DELETED_STORAGE_KEY, String(isDeleted));
}

// 날짜를 2026.03.16 형태로 바꾸는 함수
function formatDateDot(dateValue) {
  return dateValue.replaceAll("-", ".");
}

// 시간을 오후 6:20 형태로 바꾸는 함수
function formatTimeKorean(timeValue) {
  const [hourText, minuteText] = timeValue.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const period = hour >= 12 ? "오후" : "오전";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${period} ${displayHour}:${String(minute).padStart(2, "0")}`;
}

// 산책 기록을 화면에 반영하는 함수
function renderRecord() {
  const record = getRecord();
  const formattedDate = formatDateDot(record.date);
  const formattedTime = formatTimeKorean(record.time);

  recordDateText.textContent = `${formattedDate} ${formattedTime}`;
  recordDateValue.textContent = formattedDate;
  recordDurationValue.textContent = `${record.duration}분`;
  recordDistanceValue.textContent = `${record.distance} km`;
  recordPoopValue.textContent = record.poop;
  recordConditionValue.textContent = record.condition;

  statusToggleButton.textContent = record.status;
  statusToggleButton.classList.toggle("is-pending", record.status === "예정");

  renderReport(record);
}

// 산책 기록 상태에 따라 삭제/복구 화면을 반영하는 함수
function renderRecordVisibility() {
  const deleted = isRecordDeleted();

  deletedRecordSection.classList.toggle("is-open", deleted);

  recordSection.style.display = deleted ? "none" : "block";
  reportSection.style.display = deleted ? "none" : "block";
  memoSection.style.display = deleted ? "none" : "block";
  actionSection.style.display = deleted ? "none" : "block";
}

// 산책 기록 기반 활동 점수를 계산하는 함수
function calculateActivityScore(record) {
  let score = 55;

  if (record.duration >= 40) {
    score += 18;
  } else if (record.duration >= 30) {
    score += 12;
  } else if (record.duration >= 20) {
    score += 6;
  }

  if (record.distance >= 2) {
    score += 15;
  } else if (record.distance >= 1.2) {
    score += 10;
  } else if (record.distance >= 0.7) {
    score += 5;
  }

  if (record.poop === "있음") {
    score += 5;
  }

  if (record.condition === "아주 좋음") {
    score += 7;
  } else if (record.condition === "좋음") {
    score += 5;
  } else if (record.condition === "피곤함") {
    score -= 6;
  }

  return Math.max(35, Math.min(score, 100));
}

// 산책 리포트 문구를 만드는 함수
function createReportText(record, score) {
  const averageDuration = 34;
  const durationDiff = record.duration - averageDuration;

  let summary = "오늘 산책량이 적당해요";
  let compare = "평소와 비슷하게 걸었어요";
  let care = "오늘은 평소 루틴대로 관리해도 좋아요";

  if (score >= 90) {
    summary = "오늘 산책량이 충분해요";
  } else if (score >= 75) {
    summary = "오늘 활동량이 안정적이에요";
  } else if (score >= 60) {
    summary = "오늘은 조금 가볍게 움직였어요";
  } else {
    summary = "오늘은 활동량이 낮은 편이에요";
  }

  if (durationDiff >= 8) {
    compare = `평소보다 ${durationDiff}분 더 걸었어요`;
  } else if (durationDiff <= -8) {
    compare = `평소보다 ${Math.abs(durationDiff)}분 짧게 걸었어요`;
  }

  if (record.condition === "아주 좋음") {
    care = "오늘은 가벼운 간식만 추천해요";
  } else if (record.condition === "좋음") {
    care = "수분 보충만 잘 챙겨줘도 좋아요";
  } else if (record.condition === "보통") {
    care = "내일은 30분 정도 가볍게 걸어줘";
  } else if (record.condition === "피곤함") {
    care = "오늘은 휴식 위주로 봐주는 게 좋아요";
  }

  return {
    summary,
    compare,
    care,
  };
}

// 산책 리포트 카드를 업데이트하는 함수
function renderReport(record) {
  const score = calculateActivityScore(record);
  const reportText = createReportText(record, score);

  activityScore.textContent = String(score);
  scoreBarFill.style.width = `${score}%`;
  reportSummary.textContent = reportText.summary;
  reportCompare.textContent = reportText.compare;
  reportCare.textContent = reportText.care;
}

// 완료/예정 상태를 변경하는 함수
function toggleRecordStatus() {
  const record = getRecord();

  record.status = record.status === "완료" ? "예정" : "완료";

  saveRecord(record);
  renderRecord();
}

// 기록 관리 메뉴를 여는 함수
function openRecordMenu() {
  recordMenuDim.classList.add("is-open");
  recordMenuSheet.classList.add("is-open");
  recordMenuDim.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-sheet-open");
}

// 기록 관리 메뉴를 닫는 함수
function closeRecordMenu() {
  recordMenuDim.classList.remove("is-open");
  recordMenuSheet.classList.remove("is-open");
  recordMenuDim.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-sheet-open");
}

// 기록 수정 바텀시트를 여는 함수
function openRecordEditSheet() {
  const record = getRecord();

  editDateInput.value = record.date;
  editTimeInput.value = record.time;
  editDurationInput.value = String(record.duration);
  editDistanceInput.value = String(record.distance);
  editPoopSelect.value = record.poop;
  editConditionSelect.value = record.condition;

  closeRecordMenu();

  recordEditDim.classList.add("is-open");
  recordEditSheet.classList.add("is-open");
  recordEditDim.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-sheet-open");
}

// 기록 수정 바텀시트를 닫는 함수
function closeRecordEditSheet() {
  recordEditDim.classList.remove("is-open");
  recordEditSheet.classList.remove("is-open");
  recordEditDim.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-sheet-open");
}

// 입력값을 검증하고 산책 기록을 저장하는 함수
function saveEditedRecord() {
  const duration = Number(editDurationInput.value);
  const distance = Number(editDistanceInput.value);

  if (!editDateInput.value || !editTimeInput.value) {
    alert("날짜와 시간을 입력해줘.");
    return;
  }

  if (!duration || duration < 1) {
    alert("산책시간을 1분 이상으로 입력해줘.");
    editDurationInput.focus();
    return;
  }

  if (Number.isNaN(distance) || distance < 0) {
    alert("산책 거리를 올바르게 입력해줘.");
    editDistanceInput.focus();
    return;
  }

  const currentRecord = getRecord();

  const nextRecord = {
    ...currentRecord,
    date: editDateInput.value,
    time: editTimeInput.value,
    duration: duration,
    distance: Number(distance.toFixed(1)),
    poop: editPoopSelect.value,
    condition: editConditionSelect.value,
  };

  saveRecord(nextRecord);
  renderRecord();
  closeRecordEditSheet();
}

// 현재 산책 기록을 삭제 처리하는 함수
function deleteRecord() {
  const isConfirmed = window.confirm("이 산책 기록을 삭제할까?");

  if (!isConfirmed) {
    return;
  }

  setRecordDeleted(true);
  closeRecordMenu();
  renderRecordVisibility();
}

// 삭제된 산책 기록을 복구하는 함수
function restoreRecord() {
  setRecordDeleted(false);
  renderRecord();
  renderRecordVisibility();
}

// 기록 관리 기능을 시작하는 함수
function initRecordManager() {
  moreButton.addEventListener("click", openRecordMenu);
  recordMenuDim.addEventListener("click", closeRecordMenu);
  recordMenuCloseButton.addEventListener("click", closeRecordMenu);

  statusToggleButton.addEventListener("click", toggleRecordStatus);

  openRecordEditButton.addEventListener("click", openRecordEditSheet);

  menuStatusButton.addEventListener("click", function () {
    toggleRecordStatus();
    closeRecordMenu();
  });

  deleteRecordButton.addEventListener("click", deleteRecord);

  recordEditDim.addEventListener("click", closeRecordEditSheet);
  recordEditCloseButton.addEventListener("click", closeRecordEditSheet);
  recordEditCancelButton.addEventListener("click", closeRecordEditSheet);
  recordEditSaveButton.addEventListener("click", saveEditedRecord);

  restoreRecordButton.addEventListener("click", restoreRecord);

  renderRecord();
  renderRecordVisibility();
}

// 기본 메모 데이터를 만드는 함수
function createDefaultMemos() {
  return [
    {
      id: "default-memo-1",
      text: "오늘은 컨디션이 좋아서 평소보다 오래 산책했어",
      createdAt: Date.now(),
    },
  ];
}

// 저장된 메모를 불러오는 함수
function getMemos() {
  const savedMemos = localStorage.getItem(MEMO_STORAGE_KEY);

  if (savedMemos === null) {
    const defaultMemos = createDefaultMemos();

    saveMemos(defaultMemos);
    return defaultMemos;
  }

  try {
    return JSON.parse(savedMemos);
  } catch (error) {
    const defaultMemos = createDefaultMemos();

    saveMemos(defaultMemos);
    return defaultMemos;
  }
}

// 메모를 localStorage에 저장하는 함수
function saveMemos(memos) {
  localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
}

// 메모 바텀시트를 여는 함수
function openMemoSheet(mode, memoId = null) {
  const memos = getMemos();
  const targetMemo = memos.find(function (memo) {
    return memo.id === memoId;
  });

  editingMemoId = mode === "edit" && targetMemo ? memoId : null;

  memoSheetTitle.textContent = editingMemoId ? "메모 수정" : "메모 추가";
  memoSaveButton.textContent = editingMemoId ? "수정 완료" : "저장";

  memoTextInput.value = targetMemo ? targetMemo.text : "";

  memoDim.classList.add("is-open");
  memoSheet.classList.add("is-open");
  memoDim.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-sheet-open");

  window.setTimeout(function () {
    memoTextInput.focus();
  }, 120);
}

// 메모 바텀시트를 닫는 함수
function closeMemoSheet() {
  editingMemoId = null;
  memoTextInput.value = "";

  memoDim.classList.remove("is-open");
  memoSheet.classList.remove("is-open");
  memoDim.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-sheet-open");
}

// 새 메모를 추가하는 함수
function addMemo(text) {
  const memos = getMemos();

  const newMemo = {
    id: `memo-${Date.now()}`,
    text: text,
    createdAt: Date.now(),
  };

  memos.push(newMemo);
  saveMemos(memos);
}

// 기존 메모를 수정하는 함수
function updateMemo(memoId, text) {
  const memos = getMemos();

  const nextMemos = memos.map(function (memo) {
    if (memo.id !== memoId) {
      return memo;
    }

    return {
      ...memo,
      text: text,
    };
  });

  saveMemos(nextMemos);
}

// 메모를 삭제하는 함수
function deleteMemo(memoId) {
  const isConfirmed = window.confirm("이 메모를 삭제할까?");

  if (!isConfirmed) {
    return;
  }

  const memos = getMemos();
  const nextMemos = memos.filter(function (memo) {
    return memo.id !== memoId;
  });

  saveMemos(nextMemos);
  renderMemoList();
}

// 메모 저장 버튼을 눌렀을 때 추가/수정을 처리하는 함수
function handleMemoSave() {
  const text = memoTextInput.value.trim();

  if (!text) {
    alert("메모 내용을 입력해줘.");
    memoTextInput.focus();
    return;
  }

  if (editingMemoId) {
    updateMemo(editingMemoId, text);
  } else {
    addMemo(text);
  }

  closeMemoSheet();
  renderMemoList();
}

// 메모 아이템 HTML을 만드는 함수
function createMemoItem(memo) {
  const memoItem = document.createElement("div");

  memoItem.className = "memo-item";

  memoItem.innerHTML = `
    <p class="memo-item-text">${memo.text}</p>

    <div class="memo-item-actions">
      <button
        type="button"
        class="memo-action-button"
        data-action="edit"
        data-id="${memo.id}"
      >
        수정
      </button>

      <button
        type="button"
        class="memo-action-button is-delete"
        data-action="delete"
        data-id="${memo.id}"
      >
        삭제
      </button>
    </div>
  `;

  return memoItem;
}

// 메모 목록을 화면에 렌더링하는 함수
function renderMemoList() {
  const memos = getMemos();

  memoList.innerHTML = "";
  memoCount.textContent = `${memos.length}개`;

  if (memos.length === 0) {
    memoEmpty.style.display = "block";
    return;
  }

  memoEmpty.style.display = "none";

  memos.forEach(function (memo) {
    memoList.appendChild(createMemoItem(memo));
  });
}

// 메모 목록의 수정/삭제 버튼 클릭을 처리하는 함수
function handleMemoListClick(event) {
  const actionButton = event.target.closest("button[data-action]");

  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;
  const memoId = actionButton.dataset.id;

  if (action === "edit") {
    openMemoSheet("edit", memoId);
  }

  if (action === "delete") {
    deleteMemo(memoId);
  }
}

// 메모 기능을 시작하는 함수
function initMemoManager() {
  openMemoAddButton.addEventListener("click", function () {
    openMemoSheet("add");
  });

  memoSaveButton.addEventListener("click", handleMemoSave);
  memoCancelButton.addEventListener("click", closeMemoSheet);
  memoCloseButton.addEventListener("click", closeMemoSheet);
  memoDim.addEventListener("click", closeMemoSheet);
  memoList.addEventListener("click", handleMemoListClick);

  renderMemoList();
}

// 기록 상세 화면 기능을 시작하는 함수
function initRecordDetailPage() {
  initRecordManager();
  initMemoManager();
}

window.addEventListener("load", initRecordDetailPage);
