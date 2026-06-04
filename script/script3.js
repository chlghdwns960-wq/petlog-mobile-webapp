const inputBoxes = document.querySelectorAll(".input-box");
const passwordInput = document.getElementById("userPassword");
const passwordToggle = document.querySelector(".password-toggle");
const eyeIcon = document.querySelector(".eye-icon");

// input 박스 focus 상태에 따라 테두리와 왼쪽 아이콘만 변경하는 함수
function setInputFocusState(inputBox, isFocused) {
  const inputIcon = inputBox.querySelector(".input-icon");

  inputBox.classList.toggle("is-focused", isFocused);

  if (!inputIcon) return;

  inputIcon.src = isFocused
    ? inputIcon.dataset.active
    : inputIcon.dataset.default;
}

// input focus / blur 이벤트를 연결하는 함수
function initInputFocusEvents() {
  inputBoxes.forEach(function (inputBox) {
    const input = inputBox.querySelector("input");

    input.addEventListener("focus", function () {
      setInputFocusState(inputBox, true);
    });

    input.addEventListener("blur", function () {
      setInputFocusState(inputBox, false);
    });
  });
}

// eye 버튼을 클릭해도 input focus 상태가 바뀌지 않도록 막는 함수
function preventEyeButtonFocus(event) {
  event.preventDefault();
}

// eye 버튼을 직접 클릭했을 때만 비밀번호 보기 / 숨기기를 전환하는 함수
function togglePasswordVisibility() {
  const isPasswordHidden = passwordInput.type === "password";

  passwordInput.type = isPasswordHidden ? "text" : "password";

  eyeIcon.src = isPasswordHidden ? eyeIcon.dataset.show : eyeIcon.dataset.hide;

  passwordToggle.setAttribute(
    "aria-label",
    isPasswordHidden ? "비밀번호 숨기기" : "비밀번호 보기",
  );

  // 중요:
  // 여기서 passwordInput.focus()를 쓰면 안 됨.
  // eye는 독립 기능이라 비밀번호 입력칸 활성 상태를 바꾸면 안 됨.
}

// 로그인 화면 기능을 시작하는 함수
function initLoginPage() {
  initInputFocusEvents();

  passwordToggle.addEventListener("mousedown", preventEyeButtonFocus);
  passwordToggle.addEventListener("click", togglePasswordVisibility);
}

window.addEventListener("load", initLoginPage);
