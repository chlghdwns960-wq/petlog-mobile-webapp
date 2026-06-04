const SELECTED_HOSPITAL_STORAGE_KEY = "petlogSelectedHospitalFromMap";

const hospitalData = {
  tuntun: {
    name: "튼튼동물 병원",
    distance: "도보 8분",
    status: "open",
    statusText: "진료중",
    review: "리뷰 128개",
    summary: "예방접종과 건강검진 진료가 가능해요",
    address: "경기도 김포시 장기동",
    phone: "032-1234-5678",
    hours: "평일 09:00 - 18:00<br />토요일 09:00 - 14:00",
    closed: "일요일",
    intro:
      "반려동물의 기본 진료부터 예방접종, 건강검진까지 편하게 진료 받을 수 있는 병원입니다.",
  },

  fm: {
    name: "FM메디컬센터",
    distance: "도보 15분",
    status: "open",
    statusText: "진료중",
    review: "리뷰 96개",
    summary: "종합검진과 예방접종 진료를 받을 수 있어요",
    address: "경기도 김포시 장기동",
    phone: "032-2222-5678",
    hours: "평일 09:30 - 19:00<br />토요일 09:30 - 15:00",
    closed: "일요일",
    intro:
      "기본 진료, 예방접종, 건강검진을 함께 볼 수 있는 동물 메디컬센터입니다.",
  },

  atti: {
    name: "아띠 동물병원",
    distance: "도보 16분",
    status: "open",
    statusText: "진료중",
    review: "리뷰 84개",
    summary: "응급진료와 건강검진 상담이 가능해요",
    address: "경기도 김포시 장기동",
    phone: "032-3333-5678",
    hours: "평일 10:00 - 19:00<br />토요일 10:00 - 14:00",
    closed: "일요일",
    intro:
      "응급진료, 건강검진, 예방접종 등 반려동물 기본 관리를 받을 수 있는 병원입니다.",
  },

  momo: {
    name: "모모 동물병원",
    distance: "자차 20분",
    status: "closed",
    statusText: "진료 종료",
    review: "리뷰 52개",
    summary: "일반 진료와 예방접종 상담이 가능해요",
    address: "경기도 김포시 운양동",
    phone: "032-4444-5678",
    hours: "평일 09:00 - 18:00<br />토요일 09:00 - 13:00",
    closed: "일요일",
    intro: "동네에서 편하게 방문할 수 있는 일반 진료 중심의 동물병원입니다.",
  },

  star: {
    name: "스타 동물병원",
    distance: "자차 20분",
    status: "closed",
    statusText: "진료 종료",
    review: "리뷰 61개",
    summary: "건강검진과 기본 진료 상담이 가능해요",
    address: "경기도 김포시 운양동",
    phone: "032-5555-5678",
    hours: "평일 10:00 - 18:30<br />토요일 10:00 - 14:00",
    closed: "일요일",
    intro:
      "기본 진료와 건강 상담을 중심으로 반려동물을 관리할 수 있는 병원입니다.",
  },
};

// 주소창에서 hospital 값을 읽어오는 함수
function getHospitalIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("hospital") || "tuntun";
}

// 주소창에서 source 값을 읽어오는 함수
function getSourceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("source") || "";
}

// 지도 화면에서 저장한 API 병원 데이터를 불러오는 함수
function getApiHospitalFromStorage() {
  const savedHospital = localStorage.getItem(SELECTED_HOSPITAL_STORAGE_KEY);

  if (!savedHospital) {
    return null;
  }

  try {
    return JSON.parse(savedHospital);
  } catch (error) {
    return null;
  }
}

// 병원 상태에 따라 배지 색상 클래스를 적용하는 함수
function updateHospitalStatusBadge(statusElement, hospital) {
  statusElement.textContent = hospital.statusText;
  statusElement.classList.remove("is-open", "is-closed");

  if (hospital.status === "closed") {
    statusElement.classList.add("is-closed");
    return;
  }

  statusElement.classList.add("is-open");
}

// 병원 상세 정보를 화면에 넣는 함수
function renderHospitalDetailData(hospital) {
  const hospitalStatus = document.getElementById("hospitalStatus");
  const phoneButton = document.getElementById("phoneButton");

  document.getElementById("hospitalName").textContent = hospital.name;
  document.getElementById("hospitalDistance").textContent = hospital.distance;
  updateHospitalStatusBadge(hospitalStatus, hospital);

  document.getElementById("hospitalReview").textContent = hospital.review;
  document.getElementById("hospitalSummary").textContent = hospital.summary;

  document.getElementById("hospitalAddress").textContent = hospital.address;
  document.getElementById("hospitalPhone").textContent = hospital.phone;
  document.getElementById("hospitalHours").innerHTML = hospital.hours;
  document.getElementById("hospitalClosed").textContent = hospital.closed;
  document.getElementById("hospitalIntro").textContent = hospital.intro;

  if (hospital.phone && hospital.phone !== "전화번호 정보 없음") {
    phoneButton.href = `tel:${hospital.phone}`;
  } else {
    phoneButton.href = "#";
  }
}

// 병원 상세 정보를 화면에 넣는 함수
function renderHospitalDetail() {
  const source = getSourceFromUrl();

  if (source === "api") {
    const apiHospital = getApiHospitalFromStorage();

    if (apiHospital) {
      renderHospitalDetailData(apiHospital);
      return;
    }
  }

  const hospitalId = getHospitalIdFromUrl();
  const hospital = hospitalData[hospitalId] || hospitalData.tuntun;

  renderHospitalDetailData(hospital);
}

// 예약 문의 버튼 클릭 시 임시 안내를 보여주는 함수
function initInquiryButton() {
  const inquiryButton = document.querySelector(".inquiry-button");

  inquiryButton.addEventListener("click", function (event) {
    event.preventDefault();
    alert("예약 문의 기능은 다음 단계에서 연결할게.");
  });
}

// 병원 상세 화면 기능을 시작하는 함수
function initHospitalDetailPage() {
  renderHospitalDetail();
  initInquiryButton();
}

window.addEventListener("load", initHospitalDetailPage);
