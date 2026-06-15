// ===============================
// Context-Aware Smart Exam
// Fitur:
// 1. Page Visibility API untuk deteksi pindah tab
// 2. Idle Detector melalui mousemove, keydown, click, scroll
// 3. Timer ujian, skor, dan log perilaku
// ===============================

const questions = [
  {
    question: "Apa yang dimaksud dengan komputasi pervasif?",
    options: [
      "Komputer yang hanya berjalan secara offline",
      "Teknologi yang menyatu dengan aktivitas sehari-hari dan sadar konteks",
      "Sistem yang hanya dipakai untuk bermain game",
      "Aplikasi yang tidak membutuhkan internet"
    ],
    answer: 1
  },
  {
    question: "API JavaScript apa yang digunakan untuk mendeteksi pengguna pindah tab?",
    options: [
      "Canvas API",
      "Page Visibility API",
      "Payment API",
      "Audio API"
    ],
    answer: 1
  },
  {
    question: "Apa arti AFK dalam konteks aplikasi ujian?",
    options: [
      "Away From Keyboard",
      "Automatic File Keeper",
      "Advanced Form Key",
      "Active Fast Keyboard"
    ],
    answer: 0
  },
  {
    question: "Contoh aktivitas yang bisa digunakan untuk mendeteksi pengguna aktif adalah...",
    options: [
      "Warna background berubah",
      "Gerakan mouse dan tekanan tombol keyboard",
      "Ukuran monitor",
      "Merek laptop"
    ],
    answer: 1
  },
  {
    question: "Apa aksi pervasif yang cocok saat peserta meninggalkan tab ujian?",
    options: [
      "Memberi peringatan dan mencatat log pelanggaran",
      "Menghapus semua soal",
      "Mematikan komputer",
      "Mengganti nama peserta"
    ],
    answer: 0
  }
];

const EXAM_DURATION = 5 * 60; // 5 menit dalam detik
const IDLE_LIMIT = 20; // 20 detik
const MAX_TAB_VIOLATION = 3;

let studentName = "";
let studentId = "";
let timeLeft = EXAM_DURATION;
let timerInterval = null;
let idleInterval = null;
let lastActivity = Date.now();
let isIdle = false;
let tabSwitchCount = 0;
let totalIdleSeconds = 0;
let examLocked = false;
let examStarted = false;
let logs = [];

const startPage = document.getElementById("startPage");
const examPage = document.getElementById("examPage");
const resultPage = document.getElementById("resultPage");

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");

const studentNameInput = document.getElementById("studentName");
const studentIdInput = document.getElementById("studentId");
const studentInfo = document.getElementById("studentInfo");

const timerText = document.getElementById("timer");
const questionForm = document.getElementById("questionForm");
const warningBox = document.getElementById("warningBox");
const tabCountText = document.getElementById("tabCount");
const userStatusText = document.getElementById("userStatus");
const idleTotalText = document.getElementById("idleTotal");
const connectionStatus = document.getElementById("connectionStatus");

function addLog(message) {
  const now = new Date();
  const time = now.toLocaleTimeString("id-ID");
  logs.push(`[${time}] ${message}`);
}

function showWarning(message) {
  warningBox.textContent = message;
  warningBox.classList.remove("hidden");
}

function hideWarning() {
  warningBox.textContent = "";
  warningBox.classList.add("hidden");
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderQuestions() {
  questionForm.innerHTML = "";

  questions.forEach((item, index) => {
    const questionBox = document.createElement("div");
    questionBox.className = "question";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${item.question}`;
    questionBox.appendChild(title);

    item.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `question_${index}`;
      radio.value = optionIndex;

      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      questionBox.appendChild(label);
    });

    questionForm.appendChild(questionBox);
  });
}

function startExam() {
  studentName = studentNameInput.value.trim();
  studentId = studentIdInput.value.trim();

  if (!studentName || !studentId) {
    alert("Nama dan NIM wajib diisi.");
    return;
  }

  examStarted = true;
  examLocked = false;
  timeLeft = EXAM_DURATION;
  tabSwitchCount = 0;
  totalIdleSeconds = 0;
  logs = [];
  lastActivity = Date.now();
  isIdle = false;

  studentInfo.textContent = `${studentName} | ${studentId}`;
  timerText.textContent = formatTime(timeLeft);
  tabCountText.textContent = "0";
  userStatusText.textContent = "Aktif";
  idleTotalText.textContent = "0 detik";
  connectionStatus.textContent = "Monitoring";

  renderQuestions();

  startPage.classList.add("hidden");
  resultPage.classList.add("hidden");
  examPage.classList.remove("hidden");

  addLog("Ujian dimulai.");
  startTimer();
  startIdleDetector();
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    // Timer dijeda saat AFK
    if (!isIdle && !examLocked) {
      timeLeft--;
      timerText.textContent = formatTime(timeLeft);
    }

    if (timeLeft <= 0) {
      addLog("Waktu ujian habis.");
      finishExam("Waktu Habis");
    }
  }, 1000);
}

function startIdleDetector() {
  clearInterval(idleInterval);

  idleInterval = setInterval(() => {
    if (!examStarted || examLocked) return;

    const inactiveSeconds = Math.floor((Date.now() - lastActivity) / 1000);

    if (inactiveSeconds >= IDLE_LIMIT) {
      if (!isIdle) {
        isIdle = true;
        userStatusText.textContent = "AFK";
        connectionStatus.textContent = "AFK";
        showWarning("Anda terdeteksi AFK. Timer ujian sedang dijeda.");
        addLog(`Pengguna terdeteksi AFK setelah ${IDLE_LIMIT} detik tanpa aktivitas.`);
      }

      totalIdleSeconds++;
      idleTotalText.textContent = `${totalIdleSeconds} detik`;
    }
  }, 1000);
}

function markUserActive() {
  if (!examStarted || examLocked) return;

  lastActivity = Date.now();

  if (isIdle) {
    isIdle = false;
    userStatusText.textContent = "Aktif";
    connectionStatus.textContent = "Monitoring";
    hideWarning();
    addLog("Pengguna kembali aktif. Timer dilanjutkan.");
  }
}

// Deteksi aktivitas user
["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(eventName => {
  document.addEventListener(eventName, markUserActive);
});

// Deteksi pindah tab menggunakan Page Visibility API
document.addEventListener("visibilitychange", () => {
  if (!examStarted || examLocked) return;

  if (document.hidden) {
    tabSwitchCount++;
    tabCountText.textContent = tabSwitchCount;
    addLog(`Pelanggaran: pengguna berpindah tab (${tabSwitchCount}/${MAX_TAB_VIOLATION}).`);
    showWarning(`Peringatan! Anda berpindah tab sebanyak ${tabSwitchCount} kali.`);

    if (tabSwitchCount >= MAX_TAB_VIOLATION) {
      examLocked = true;
      addLog("Ujian dikunci otomatis karena terlalu sering berpindah tab.");
      finishExam("Terkunci karena pelanggaran tab");
    }
  } else {
    addLog("Pengguna kembali ke tab ujian.");
  }
});

function calculateScore() {
  let score = 0;

  questions.forEach((item, index) => {
    const selected = document.querySelector(`input[name="question_${index}"]:checked`);
    if (selected && Number(selected.value) === item.answer) {
      score++;
    }
  });

  return score;
}

function finishExam(status = "Selesai") {
  clearInterval(timerInterval);
  clearInterval(idleInterval);

  examStarted = false;

  const score = calculateScore();

  document.getElementById("resultName").textContent = studentName;
  document.getElementById("resultNim").textContent = studentId;
  document.getElementById("scoreText").textContent = `${score}/${questions.length}`;
  document.getElementById("finalStatus").textContent = status;

  if (logs.length === 0) {
    addLog("Tidak ada pelanggaran tercatat.");
  }

  addLog(`Ringkasan: pindah tab ${tabSwitchCount} kali, total AFK ${totalIdleSeconds} detik.`);

  const behaviorLog = document.getElementById("behaviorLog");
  behaviorLog.innerHTML = "";

  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = log;
    behaviorLog.appendChild(li);
  });

  examPage.classList.add("hidden");
  resultPage.classList.remove("hidden");
  connectionStatus.textContent = "Finished";
}

function restartExam() {
  location.reload();
}

startBtn.addEventListener("click", startExam);
submitBtn.addEventListener("click", () => finishExam("Selesai"));
restartBtn.addEventListener("click", restartExam);
