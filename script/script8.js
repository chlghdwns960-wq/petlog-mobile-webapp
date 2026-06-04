const periodButtons = document.querySelectorAll(".period-button");
const statCards = document.querySelectorAll(".stat-card");
const chartTitle = document.getElementById("chartTitle");
const chartDesc = document.querySelector(".chart-desc");
const chartBars = document.querySelectorAll(".bar");

// 기간별 기록 히스토리 데이터를 관리하는 객체
const historyData = {
  "1주": {
    stats: [
      {
        count: "12회",
        desc: "지난주보다 <span>3회</span> 많아요",
      },
      {
        count: "18회",
        desc: "정상 기록이 대부분이에요",
      },
      {
        count: "7회",
        desc: "7일 연속 기록 중",
      },
      {
        count: "5회",
        desc: "최근 건강 메모가 있어요",
      },
    ],
    chartTitle: "산책 기록 패턴",
    chartDesc: "요일별 산책 기록을 확인해보세요",
    bars: [30, 52, 80, 110, 56, 70, 64],
  },

  "1개월": {
    stats: [
      {
        count: "46회",
        desc: "지난달보다 <span>8회</span> 많아요",
      },
      {
        count: "74회",
        desc: "배변 기록이 안정적이에요",
      },
      {
        count: "28회",
        desc: "한 달 동안 꾸준히 기록했어요",
      },
      {
        count: "19회",
        desc: "컨디션 메모가 자주 남았어요",
      },
    ],
    chartTitle: "월간 산책 패턴",
    chartDesc: "최근 4주 산책 기록을 요일별로 확인해보세요",
    bars: [74, 88, 96, 118, 82, 106, 92],
  },

  "3개월": {
    stats: [
      {
        count: "132회",
        desc: "이전 3개월보다 <span>15회</span> 많아요",
      },
      {
        count: "226회",
        desc: "장기 기록이 안정적으로 쌓였어요",
      },
      {
        count: "84회",
        desc: "복약 기록이 꾸준히 유지됐어요",
      },
      {
        count: "58회",
        desc: "건강 변화 메모가 충분해요",
      },
    ],
    chartTitle: "3개월 산책 패턴",
    chartDesc: "최근 3개월 산책 기록을 요일별로 비교해보세요",
    bars: [96, 110, 104, 124, 98, 120, 112],
  },
};

// 기간 버튼 active 상태를 변경하는 함수
function handlePeriodButtonClick(clickedButton) {
  periodButtons.forEach(function (button) {
    const isCurrentButton = button === clickedButton;

    button.classList.toggle("is-active", isCurrentButton);
    button.setAttribute("aria-pressed", String(isCurrentButton));
  });
}

// 선택한 기간 텍스트를 가져오는 함수
function getPeriodLabel(button) {
  return button.textContent.trim();
}

// 통계 카드 데이터를 변경하는 함수
function updateStatCards(periodData) {
  statCards.forEach(function (card, index) {
    const countElement = card.querySelector(".stat-count");
    const descElement = card.querySelector(".stat-desc");
    const statData = periodData.stats[index];

    if (!statData || !countElement || !descElement) {
      return;
    }

    countElement.textContent = statData.count;
    descElement.innerHTML = statData.desc;
  });
}

// 그래프 데이터를 변경하는 함수
function updateChart(periodData) {
  chartTitle.textContent = periodData.chartTitle;
  chartDesc.textContent = periodData.chartDesc;

  chartBars.forEach(function (bar, index) {
    const nextHeight = periodData.bars[index];

    if (!nextHeight) {
      return;
    }

    bar.style.height = `${nextHeight}px`;
  });
}

// 선택한 기간의 화면 데이터를 전체 반영하는 함수
function updateHistoryByPeriod(period) {
  const periodData = historyData[period];

  if (!periodData) {
    return;
  }

  updateStatCards(periodData);
  updateChart(periodData);
}

// 기간 토글 버튼 클릭 이벤트를 연결하는 함수
function initPeriodTabs() {
  periodButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const period = getPeriodLabel(button);

      handlePeriodButtonClick(button);
      updateHistoryByPeriod(period);
    });
  });
}

// 기록 히스토리 화면 기능을 시작하는 함수
function initHistoryPage() {
  initPeriodTabs();
  updateHistoryByPeriod("1주");
}

window.addEventListener("load", initHistoryPage);
