const presetButtons = document.querySelectorAll(".preset");
const customTimeForm = document.getElementById("custom-time-form");
const customMinutesInput = document.getElementById("custom-minutes");
const startPauseBtn = document.getElementById("start-pause-btn");
const resetBtn = document.getElementById("reset-btn");
const statusText = document.getElementById("status-text");
const timeLeftEl = document.getElementById("time-left");
const waxEl = document.getElementById("wax");
const candleEl = document.getElementById("candle");

let totalSeconds = 0;
let remainingSeconds = 0;
let endTime = null;
let timerId = null;
let isRunning = false;

const WAX_MAX_HEIGHT = 200;
const WAX_MIN_HEIGHT = 18;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay() {
  timeLeftEl.textContent = formatTime(remainingSeconds);

  if (totalSeconds > 0) {
    const progress = (totalSeconds - remainingSeconds) / totalSeconds;
    const waxHeight = Math.max(WAX_MIN_HEIGHT, WAX_MAX_HEIGHT * (1 - progress));
    waxEl.style.height = `${waxHeight}px`;
  } else {
    waxEl.style.height = `${WAX_MAX_HEIGHT}px`;
  }
}

function updateButtonState() {
  const hasTimerSet = totalSeconds > 0;
  startPauseBtn.disabled = !hasTimerSet;
  resetBtn.disabled = !hasTimerSet;
  startPauseBtn.textContent = isRunning ? "Pause" : "Resume";
}

function explodeCandle() {
  candleEl.classList.add("exploded");
  statusText.textContent = "Time's up! The candle blew up 💥";
}

function startTicking() {
  if (remainingSeconds <= 0) {
    return;
  }

  isRunning = true;
  endTime = Date.now() + remainingSeconds * 1000;

  clearInterval(timerId);
  timerId = setInterval(() => {
    remainingSeconds = (endTime - Date.now()) / 1000;

    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      clearInterval(timerId);
      isRunning = false;
      updateDisplay();
      updateButtonState();
      explodeCandle();
      return;
    }

    updateDisplay();
  }, 100);

  updateButtonState();
}

function setupTimer(seconds) {
  totalSeconds = seconds;
  remainingSeconds = seconds;
  isRunning = false;
  clearInterval(timerId);
  candleEl.classList.remove("exploded");
  statusText.textContent = "Timer is running...";
  updateDisplay();
  updateButtonState();
  startTicking();
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const seconds = Number(button.dataset.seconds);
    setupTimer(seconds);
  });
});

customTimeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const minutes = Number(customMinutesInput.value);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    statusText.textContent = "Please enter a custom time greater than 0 minutes.";
    return;
  }

  setupTimer(Math.round(minutes * 60));
});

startPauseBtn.addEventListener("click", () => {
  if (!totalSeconds) {
    return;
  }

  if (isRunning) {
    clearInterval(timerId);
    isRunning = false;
    statusText.textContent = "Timer paused.";
    updateButtonState();
    return;
  }

  statusText.textContent = "Timer resumed.";
  startTicking();
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerId);
  totalSeconds = 0;
  remainingSeconds = 0;
  isRunning = false;
  candleEl.classList.remove("exploded");
  statusText.textContent = "Pick a preset or enter a custom duration to begin.";
  updateDisplay();
  updateButtonState();
  startPauseBtn.textContent = "Pause";
});

updateDisplay();
updateButtonState();
