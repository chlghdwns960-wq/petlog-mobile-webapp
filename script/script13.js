const SELECTED_HOSPITAL_STORAGE_KEY = "petlogSelectedHospitalFromMap";

const DEFAULT_CENTER = {
  lat: 37.566826,
  lng: 126.9786567,
};

const SEARCH_RADIUS_METER = 3000;
const SEARCH_RADIUS_KM = 3;
const ITEMS_PER_PAGE = 10;

const REGION_CENTER_MAP = {
  서울: { lat: 37.566826, lng: 126.9786567, label: "서울" },
  서울시: { lat: 37.566826, lng: 126.9786567, label: "서울" },
  서울특별시: { lat: 37.566826, lng: 126.9786567, label: "서울" },

  강남: { lat: 37.517236, lng: 127.047325, label: "강남구" },
  강남구: { lat: 37.517236, lng: 127.047325, label: "강남구" },

  홍대: { lat: 37.557192, lng: 126.925381, label: "홍대입구" },
  마포: { lat: 37.566324, lng: 126.901491, label: "마포구" },
  마포구: { lat: 37.566324, lng: 126.901491, label: "마포구" },

  송파: { lat: 37.514544, lng: 127.106597, label: "송파구" },
  송파구: { lat: 37.514544, lng: 127.106597, label: "송파구" },

  부산: { lat: 35.179554, lng: 129.075642, label: "부산" },
  부산시: { lat: 35.179554, lng: 129.075642, label: "부산" },

  대구: { lat: 35.871435, lng: 128.601445, label: "대구" },
  인천: { lat: 37.456255, lng: 126.705206, label: "인천" },
  광주: { lat: 35.159545, lng: 126.852601, label: "광주" },
  대전: { lat: 36.350412, lng: 127.384548, label: "대전" },
  울산: { lat: 35.538377, lng: 129.31136, label: "울산" },
  세종: { lat: 36.480132, lng: 127.289021, label: "세종" },

  수원: { lat: 37.263573, lng: 127.028601, label: "수원" },
  성남: { lat: 37.420026, lng: 127.126777, label: "성남" },
  고양: { lat: 37.658359, lng: 126.83202, label: "고양" },

  김포: { lat: 37.61535, lng: 126.7156, label: "김포" },
  김포시: { lat: 37.61535, lng: 126.7156, label: "김포" },
  장기동: { lat: 37.6451, lng: 126.6673, label: "김포 장기동" },
  김포장기동: { lat: 37.6451, lng: 126.6673, label: "김포 장기동" },
};

const mapElement = document.getElementById("map");
const statusText = document.getElementById("statusText");
const hospitalCount = document.getElementById("hospitalCount");
const nearbyList = document.getElementById("nearbyList");
const locationButton = document.getElementById("locationButton");
const refreshButton = document.getElementById("refreshButton");
const mapSearchForm = document.getElementById("mapSearchForm");
const mapSearchInput = document.getElementById("mapSearchInput");

let map = null;
let userPosition = null;
let activeCenter = null;
let currentKeyword = "";
let currentLocationOverlay = null;
let markers = [];
let overlays = [];
let allSortedHospitals = [];
let currentPage = 1;

// 상태 문구를 변경하는 함수
function updateStatus(message) {
  statusText.textContent = message;
}

// 검색어 비교를 위해 공백과 대소문자를 정리하는 함수
function normalizeKeyword(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

// 두 좌표 사이 거리를 km 단위로 계산하는 함수
function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const latDistance = ((lat2 - lat1) * Math.PI) / 180;
  const lngDistance = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

// 현재 위치를 가져오는 함수
function getCurrentPosition() {
  return new Promise(function (resolve) {
    if (!navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      function () {
        resolve(DEFAULT_CENTER);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000,
      },
    );
  });
}

// 카카오 지도를 생성하는 함수
function createMap(center) {
  const mapCenter = new kakao.maps.LatLng(center.lat, center.lng);

  map = new kakao.maps.Map(mapElement, {
    center: mapCenter,
    level: 5,
  });

  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

// 현재 위치를 병원 마커가 아닌 커스텀 점으로 표시하는 함수
function renderCurrentLocationMarker(position) {
  if (currentLocationOverlay) {
    currentLocationOverlay.setMap(null);
  }

  const markerPosition = new kakao.maps.LatLng(position.lat, position.lng);

  currentLocationOverlay = new kakao.maps.CustomOverlay({
    position: markerPosition,
    yAnchor: 0.5,
    content: '<div class="current-location-dot" aria-label="현재 위치"></div>',
  });

  currentLocationOverlay.setMap(map);
}

// 기존 병원 마커와 오버레이를 제거하는 함수
function clearHospitalMarkers() {
  markers.forEach(function (marker) {
    marker.setMap(null);
  });

  overlays.forEach(function (overlay) {
    overlay.setMap(null);
  });

  markers = [];
  overlays = [];
}

// 카카오 장소 데이터를 우리 앱 병원 데이터로 변환하는 함수
function normalizeKakaoPlace(place, index) {
  return {
    id: String(place.id || `place-${index}`),
    name: place.place_name || `동물병원 ${index + 1}`,
    address: place.road_address_name || place.address_name || "주소 정보 없음",
    phone: place.phone || "전화번호 정보 없음",
    lat: Number(place.y),
    lng: Number(place.x),
    category: place.category_name || "",
    status: "정보 확인",
    source: "kakao",
  };
}

// 동물병원 관련 장소인지 확인하는 함수
function isAnimalHospitalPlace(place) {
  const text = normalizeKeyword(
    `${place.name} ${place.address} ${place.category}`,
  );

  const animalWords = [
    "동물",
    "동물병원",
    "동물의원",
    "동물의료",
    "메디컬센터",
    "펫",
    "pet",
    "반려",
    "수의",
    "고양이",
    "강아지",
  ];

  return animalWords.some(function (word) {
    return text.includes(normalizeKeyword(word));
  });
}

// 검색 중심 기준 3km 이내 병원만 남기는 함수
function filterHospitalsByDistance(hospitals, center) {
  return hospitals.filter(function (hospital) {
    if (!Number.isFinite(hospital.lat) || !Number.isFinite(hospital.lng)) {
      return false;
    }

    const distanceKm = calculateDistanceKm(
      center.lat,
      center.lng,
      hospital.lat,
      hospital.lng,
    );

    return distanceKm <= SEARCH_RADIUS_KM;
  });
}

// 중복 병원을 제거하는 함수
function removeDuplicateHospitals(hospitals) {
  const seen = new Set();

  return hospitals.filter(function (hospital) {
    const key =
      hospital.id || normalizeKeyword(`${hospital.name}-${hospital.address}`);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

// 카카오 Places 키워드 검색을 실행하는 함수
function searchPlacesByKeyword(query, options = {}) {
  return new Promise(function (resolve) {
    const places = new kakao.maps.services.Places();

    places.keywordSearch(
      query,
      function (data, status) {
        if (status === kakao.maps.services.Status.OK && Array.isArray(data)) {
          resolve(data.map(normalizeKakaoPlace));
          return;
        }

        resolve([]);
      },
      options,
    );
  });
}

// 지역명 또는 장소명을 좌표로 바꾸는 함수
function searchKeywordToPosition(keyword) {
  return new Promise(function (resolve, reject) {
    const normalizedKeyword = normalizeKeyword(keyword);
    const aliasPosition = REGION_CENTER_MAP[normalizedKeyword];

    if (aliasPosition) {
      resolve(aliasPosition);
      return;
    }

    const places = new kakao.maps.services.Places();

    places.keywordSearch(keyword, function (data, status) {
      if (status === kakao.maps.services.Status.OK && data[0]) {
        resolve({
          lat: Number(data[0].y),
          lng: Number(data[0].x),
          label: data[0].place_name || keyword,
        });
        return;
      }

      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(keyword, function (result, geocoderStatus) {
        if (geocoderStatus === kakao.maps.services.Status.OK && result[0]) {
          resolve({
            lat: Number(result[0].y),
            lng: Number(result[0].x),
            label: result[0].address_name || keyword,
          });
          return;
        }

        reject(new Error("검색 위치를 찾지 못함"));
      });
    });
  });
}

// 검색어로 사용할 병원 키워드 목록을 만드는 함수
function buildHospitalQueries(keyword = "") {
  const cleanKeyword = keyword.trim();

  if (!cleanKeyword) {
    return [
      "동물병원",
      "동물의원",
      "동물 의료센터",
      "동물 메디컬센터",
      "반려동물 병원",
      "펫 병원",
      "수의사",
    ];
  }

  return [
    `${cleanKeyword} 동물병원`,
    `${cleanKeyword} 동물의원`,
    `${cleanKeyword} 동물 병원`,
    `${cleanKeyword} 동물 의원`,
    `${cleanKeyword} 동물의료센터`,
    `${cleanKeyword} 동물 메디컬센터`,
    `${cleanKeyword} 동물메디컬센터`,
    `${cleanKeyword} 반려동물 병원`,
    `${cleanKeyword} 펫 병원`,
    `${cleanKeyword} 수의사`,
  ];
}

// 검색 중심 좌표 기준으로 카카오 병원 검색을 실행하는 함수
async function fetchHospitals(center, keyword = "") {
  const queries = buildHospitalQueries(keyword);
  const results = [];

  for (const query of queries) {
    for (let page = 1; page <= 3; page += 1) {
      const pageResults = await searchPlacesByKeyword(query, {
        location: new kakao.maps.LatLng(center.lat, center.lng),
        radius: SEARCH_RADIUS_METER,
        size: 15,
        page: page,
        sort: kakao.maps.services.SortBy.DISTANCE,
      });

      results.push(...pageResults);
    }
  }

  const uniqueHospitals = removeDuplicateHospitals(results);

  const animalHospitals = uniqueHospitals.filter(function (hospital) {
    return isAnimalHospitalPlace(hospital);
  });

  const nearbyHospitals = filterHospitalsByDistance(animalHospitals, center);

  return nearbyHospitals;
}

// 병원들을 거리순으로 정렬하는 함수
function sortHospitalsByDistance(hospitals, center) {
  return hospitals
    .filter(function (hospital) {
      return Number.isFinite(hospital.lat) && Number.isFinite(hospital.lng);
    })
    .map(function (hospital) {
      const distanceKm = calculateDistanceKm(
        center.lat,
        center.lng,
        hospital.lat,
        hospital.lng,
      );

      return {
        ...hospital,
        distanceKm: distanceKm,
      };
    })
    .sort(function (a, b) {
      return a.distanceKm - b.distanceKm;
    });
}

// 현재 페이지에 보여줄 병원만 가져오는 함수
function getCurrentPageHospitals() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  return allSortedHospitals.slice(startIndex, endIndex);
}

// 전체 페이지 수를 계산하는 함수
function getTotalPages() {
  return Math.max(1, Math.ceil(allSortedHospitals.length / ITEMS_PER_PAGE));
}

// 병원 마커를 지도에 표시하는 함수
function renderHospitalMarkers(hospitals) {
  clearHospitalMarkers();

  hospitals.forEach(function (hospital) {
    const position = new kakao.maps.LatLng(hospital.lat, hospital.lng);

    const marker = new kakao.maps.Marker({
      position: position,
      map: map,
    });

    const overlay = new kakao.maps.CustomOverlay({
      position: position,
      yAnchor: 2.4,
      content: `<div class="marker-label">${hospital.name}</div>`,
    });

    kakao.maps.event.addListener(marker, "click", function () {
      map.panTo(position);
      overlay.setMap(map);
    });

    marker.setMap(map);
    overlay.setMap(map);

    markers.push(marker);
    overlays.push(overlay);
  });
}

// 선택한 병원을 상세페이지에서 사용할 수 있게 저장하는 함수
function saveSelectedHospital(hospital, distanceText) {
  const detailData = {
    name: hospital.name,
    distance: distanceText,
    status: "open",
    statusText: hospital.status || "정보 확인",
    review: "카카오 장소검색 기반 병원 정보",
    summary: `${hospital.address}에 위치한 동물병원 정보예요`,
    address: hospital.address,
    phone: hospital.phone || "전화번호 정보 없음",
    hours: "운영시간 정보 없음",
    closed: "휴무일 정보 없음",
    intro:
      "지도에서 선택한 동물병원 정보입니다. 방문 전 전화로 운영 여부를 확인해주세요.",
  };

  localStorage.setItem(
    SELECTED_HOSPITAL_STORAGE_KEY,
    JSON.stringify(detailData),
  );
}

// 병원 상세페이지로 이동하는 함수
function goToHospitalDetail(hospital, distanceText) {
  saveSelectedHospital(hospital, distanceText);
  window.location.href = "./index12.html?source=api";
}

// 하단 주변 병원 리스트를 그리는 함수
function renderNearbyList(hospitals) {
  nearbyList.innerHTML = "";
  hospitalCount.textContent = `${allSortedHospitals.length}곳`;

  hospitals.forEach(function (hospital) {
    const distanceText =
      hospital.distanceKm < 1
        ? `${Math.round(hospital.distanceKm * 1000)}m`
        : `${hospital.distanceKm.toFixed(1)}km`;

    const item = document.createElement("li");
    item.className = "nearby-item";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `${hospital.name} 상세 보기`);

    item.innerHTML = `
      <div>
        <p class="nearby-name">${hospital.name}</p>
        <p class="nearby-address">${hospital.address}</p>
        <div class="nearby-meta">
          <span class="nearby-distance">${distanceText}</span>
          <span class="nearby-status">${hospital.status}</span>
        </div>
      </div>

      <button type="button" class="nearby-button" aria-label="${hospital.name} 상세 보기">
        ›
      </button>
    `;

    const openDetail = function () {
      goToHospitalDetail(hospital, distanceText);
    };

    item.addEventListener("click", openDetail);

    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail();
      }
    });

    nearbyList.appendChild(item);
  });
}

// 페이지네이션 영역을 찾거나 생성하는 함수
function getPaginationElement() {
  let pagination = document.getElementById("hospitalPagination");

  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "hospitalPagination";
    pagination.className = "hospital-pagination";
    nearbyList.insertAdjacentElement("afterend", pagination);
  }

  return pagination;
}

// 페이지네이션 버튼을 그리는 함수
function renderPagination() {
  const pagination = getPaginationElement();
  const totalPages = getTotalPages();

  pagination.innerHTML = "";

  if (allSortedHospitals.length <= ITEMS_PER_PAGE) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "pagination-button";
  prevButton.textContent = "이전";
  prevButton.disabled = currentPage === 1;

  prevButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage -= 1;
      renderCurrentPage();
    }
  });

  pagination.appendChild(prevButton);

  for (let page = 1; page <= totalPages; page += 1) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className =
      page === currentPage
        ? "pagination-button is-active"
        : "pagination-button";
    pageButton.textContent = page;

    pageButton.addEventListener("click", function () {
      currentPage = page;
      renderCurrentPage();
    });

    pagination.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "pagination-button";
  nextButton.textContent = "다음";
  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderCurrentPage();
    }
  });

  pagination.appendChild(nextButton);
}

// 현재 페이지 병원만 지도와 리스트에 표시하는 함수
function renderCurrentPage() {
  const pageHospitals = getCurrentPageHospitals();

  renderHospitalMarkers(pageHospitals);
  renderNearbyList(pageHospitals);
  renderPagination();

  const totalPages = getTotalPages();

  if (allSortedHospitals.length > ITEMS_PER_PAGE) {
    updateStatus(
      `3km 이내 병원 ${allSortedHospitals.length}곳 중 ${currentPage}/${totalPages}페이지를 보고 있어요`,
    );
  }
}

// 지도와 리스트에 병원 검색 결과를 표시하는 함수
async function loadHospitalsOnMap(keyword = "") {
  updateStatus("3km 이내 동물병원을 찾고 있어요");

  const hospitals = await fetchHospitals(activeCenter, keyword);
  allSortedHospitals = sortHospitalsByDistance(hospitals, activeCenter);
  currentPage = 1;

  if (allSortedHospitals.length === 0) {
    clearHospitalMarkers();
    nearbyList.innerHTML = "";
    hospitalCount.textContent = "0곳";
    renderPagination();
    updateStatus(
      "표시할 주변 동물병원이 없어. 검색 지역을 조금 더 구체적으로 입력해줘",
    );
    return;
  }

  renderCurrentPage();

  if (keyword) {
    updateStatus(
      `${keyword} 기준 3km 이내 동물병원 ${allSortedHospitals.length}곳을 찾았어요`,
    );
    return;
  }

  updateStatus(
    `현재 위치 기준 3km 이내 동물병원 ${allSortedHospitals.length}곳을 찾았어요`,
  );
}

// 검색어 기준으로 지도 위치를 이동하고 병원 검색을 실행하는 함수
async function searchHospitalsByKeyword(keyword) {
  if (!keyword.trim()) {
    updateStatus("검색어를 입력해줘");
    return;
  }

  try {
    updateStatus(`${keyword} 위치를 찾고 있어요`);

    const searchedPosition = await searchKeywordToPosition(keyword);

    activeCenter = {
      lat: searchedPosition.lat,
      lng: searchedPosition.lng,
    };

    const nextCenter = new kakao.maps.LatLng(
      activeCenter.lat,
      activeCenter.lng,
    );

    map.setCenter(nextCenter);
    map.setLevel(5);

    currentKeyword = keyword;

    await loadHospitalsOnMap(keyword);
  } catch (error) {
    console.error("[PetLog] searchHospitalsByKeyword error:", error);
    updateStatus("검색 위치를 찾지 못했어. 다른 지역명으로 다시 검색해줘");
  }
}

// 현재 위치로 지도를 이동하는 함수
function moveToCurrentPosition() {
  if (!userPosition || !map) {
    return;
  }

  activeCenter = {
    lat: userPosition.lat,
    lng: userPosition.lng,
  };

  const position = new kakao.maps.LatLng(userPosition.lat, userPosition.lng);

  map.panTo(position);
  map.setLevel(5);

  currentKeyword = "";
  loadHospitalsOnMap("");
}

// 검색 폼 기능을 연결하는 함수
function initSearchForm() {
  mapSearchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const keyword = mapSearchInput.value.trim();
    searchHospitalsByKeyword(keyword);
  });
}

// 지도 화면을 초기화하는 함수
async function initMapPage() {
  updateStatus("현재 위치를 확인하고 있어요");

  userPosition = await getCurrentPosition();

  activeCenter = {
    lat: userPosition.lat,
    lng: userPosition.lng,
  };

  createMap(activeCenter);
  renderCurrentLocationMarker(userPosition);

  initSearchForm();

  locationButton.addEventListener("click", moveToCurrentPosition);

  refreshButton.addEventListener("click", function () {
    loadHospitalsOnMap(currentKeyword);
  });

  await loadHospitalsOnMap("");
}

// 카카오 SDK가 완전히 준비된 뒤 지도 화면을 시작하는 함수
function bootKakaoMapPage() {
  if (!window.kakao || !kakao.maps) {
    updateStatus("카카오 지도 SDK를 불러오지 못했어. SDK 주소를 확인해줘");
    return;
  }

  kakao.maps.load(function () {
    if (!kakao.maps.services) {
      updateStatus("카카오 services 라이브러리를 불러오지 못했어");
      return;
    }

    initMapPage();
  });
}

window.addEventListener("load", bootKakaoMapPage);
