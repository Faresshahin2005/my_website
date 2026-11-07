
/* مبدل وضع النهار والليل مع حفظ اختيار الزائر */
function initThemeToggle() {
  const root = document.documentElement;
  const saved = localStorage.getItem("dalil-theme");
  const initial = saved === "dark" || saved === "light" ? saved : "light";
  root.setAttribute("data-theme", initial);
  const nav = document.querySelector(".navbar-collapse");
  if (!nav || nav.querySelector(".theme-toggle")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.textContent = initial === "dark" ? "وضع النهار" : "وضع الليل";
  button.setAttribute("aria-label", initial === "dark" ? "تفعيل وضع النهار" : "تفعيل الوضع الليلي");
  const cta = nav.querySelector(".nav-cta");
  if (cta) nav.insertBefore(button, cta); else nav.appendChild(button);
  button.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("dalil-theme", next);
    button.textContent = next === "dark" ? "وضع النهار" : "وضع الليل";
    button.setAttribute("aria-label", next === "dark" ? "تفعيل وضع النهار" : "تفعيل الوضع الليلي");
  });
}

/*  تشغيل حسب الصفحة  */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  if (document.getElementById("featuredSlider")) initHome();
  if (document.getElementById("eventsGrid")) initEventsPage();
  if (document.getElementById("eventDetails")) initDetailsPage();
});

/*  أدوات مساعدة  */
const categoryColors = {
  coding: "var(--cat-coding)", robotics: "var(--cat-robotics)",
  exhibition: "var(--cat-exhibition)", mind: "var(--cat-mind)"
};

// الفعاليات القادمة (من اليوم وطالع) مرتبة بالتاريخ
function upcomingEvents() {
  const today = todayStr();
  return events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// خلفية بثلاث طبقات: تعتيم + الصورة + تدرج احتياطي إذا الصورة ما انحملت
function bgImage(url) {
  return `linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.08)), url('${url}'), linear-gradient(135deg, #c2185b, #ffb400)`;
}

/*  الصفحة الرئيسية  */
function initHome() {
  initSlider();
  renderToday();
  renderCategories();
  renderLatest();
}

/*  السلايدر  */
function initSlider() {
  const slider = document.getElementById("featuredSlider");
  const slidesBox = document.getElementById("slides");
  const dotsBox = document.getElementById("sliderDots");
  const list = upcomingEvents().filter(e => e.featured);

  if (list.length === 0) { slider.classList.add("d-none"); return; }
  if (list.length === 1) { document.getElementById("sliderNext").hidden = true; document.getElementById("sliderPrev").hidden = true; }

  slidesBox.innerHTML = list.map(ev => {
    const cat = categories[ev.category];
    return `
      <div class="slide" style="background-image: ${bgImage(ev.image)}">
        <div class="container">
          <div class="slide-content">
            <span class="cat-badge ${cat.css}">${cat.label}</span>
            <h2>${ev.title}</h2>
            <p>التاريخ: ${formatDate(ev.date)} - ${ev.time}</p>
            <p>المكان: ${ev.place}</p>
            <a href="event.html?id=${ev.id}" class="btn btn-warning mt-2">اعرف أكثر</a>
          </div>
        </div>
      </div>`;
  }).join("");

  dotsBox.innerHTML = list
    .map((_, i) => `<button class="dot" type="button" data-i="${i}" aria-label="الشريحة ${i + 1}"></button>`)
    .join("");

  const slides = slidesBox.querySelectorAll(".slide");
  const dots = dotsBox.querySelectorAll(".dot");
  let current = 0;
  let timer = null;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === current));
    dots.forEach((d, k) => d.classList.toggle("active", k === current));
  }
  function start() { stop(); timer = setInterval(() => show(current + 1), 5000); }
  function stop() { clearInterval(timer); }

  document.getElementById("sliderNext").addEventListener("click", () => { show(current + 1); start(); });
  document.getElementById("sliderPrev").addEventListener("click", () => { show(current - 1); start(); });
  dots.forEach(d => d.addEventListener("click", () => { show(Number(d.dataset.i)); start(); }));

  // وقف التشغيل التلقائي عند مرور الماوس
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);


  show(0);
  start();
}

/*  حدث اليوم  */
function renderToday() {
  const ev = events.find(e => e.date === todayStr());
  if (!ev) return;

  const cat = categories[ev.category];
  document.getElementById("todayCard").innerHTML = `
    <div class="card today-card shadow">
      <div class="row g-0">
        <div class="col-md-5 today-img" style="background-image: url('${ev.image}'), linear-gradient(135deg, #c2185b, #ffb400)"></div>
        <div class="col-md-7">
          <div class="card-body p-4">
            <span class="cat-badge ${cat.css}">${cat.label}</span>
            <h3 class="fw-bold mt-2">${ev.title}</h3>
            <p class="event-meta mb-1">الوقت: اليوم - ${ev.time}</p>
            <p class="event-meta mb-1">المكان: ${ev.place}</p>
            <p class="event-meta">السعر: ${ev.price}</p>
            <p>${ev.description}</p>
            <a href="event.html?id=${ev.id}" class="btn btn-primary">التفاصيل والحجز</a>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById("todaySection").classList.remove("d-none");
}

/*  التصنيفات  */
function renderCategories() {
  const today = todayStr();
  document.getElementById("categoriesRow").innerHTML = Object.keys(categories).map(key => {
    const count = events.filter(e => e.category === key && e.date >= today).length;
    return `
      <div class="col-6 col-md-6 col-lg-3">
        <a href="events.html?category=${key}" class="category-tile" style="--tile-color: ${categoryColors[key]}">
          
          ${categories[key].label}
          <small>${count} فعالية</small>
        </a>
      </div>`;
  }).join("");
}

/*  أقرب الفعاليات  */
function renderLatest() {
  document.getElementById("latestEvents").innerHTML =
    upcomingEvents().slice(0, 6).map(renderEventCard).join("");
}
/*  صفحة كل الفعاليات  */
function initEventsPage() {
  const filtersBox = document.getElementById("categoryFilters");
  const dateSelect = document.getElementById("dateFilter");
  const grid = document.getElementById("eventsGrid");
  const countEl = document.getElementById("resultsCount");
  const noResults = document.getElementById("noResults");
  const searchInput = document.getElementById("eventSearch");
  const placeSelect = document.getElementById("placeFilter");

  const urlCat = new URLSearchParams(window.location.search).get("category");
  let currentCategory = categories[urlCat] ? urlCat : "all";
  let currentDate = "all";
  let currentPlace = "all";
  let currentSearch = "";

  // بناء أزرار التصنيفات
  const buttons = [{ key: "all", label: "الكل", color: "var(--dark)" }]
    .concat(Object.keys(categories).map(k => ({
      key: k,
      label: categories[k].label,
      color: categoryColors[k]
    })));

  filtersBox.innerHTML = buttons.map(b => `
    <button type="button" class="filter-btn" data-cat="${b.key}" style="--btn-color: ${b.color}">
      ${b.label}
    </button>`).join("");

  // نهاية المجال الزمني حسب اختيار التاريخ
  function dateLimit(mode) {
    if (mode === "today") return todayStr();
    if (mode === "week")  return daysFromNow(7);
    if (mode === "month") return daysFromNow(30);
    return null; 
  }

  function applyFilters() {
    const limit = dateLimit(currentDate);

    const result = upcomingEvents().filter(ev => {
      const okCat = currentCategory === "all" || ev.category === currentCategory;
      const okDate = !limit || ev.date <= limit;
      const haystack = `${ev.title} ${ev.description} ${ev.place}`.toLocaleLowerCase("ar");
      const okSearch = !currentSearch || haystack.includes(currentSearch);
      const isOnline = ev.place.includes("عن بُعد") || ev.place.includes("إلكترونية");
      const okPlace = currentPlace === "all" || (currentPlace === "online" ? isOnline : !isOnline);
      return okCat && okDate && okSearch && okPlace;
    });

    grid.innerHTML = result.map(renderEventCard).join("");
    countEl.textContent = result.length > 0 ? `عدد الفعاليات: ${result.length}` : "";
    noResults.classList.toggle("d-none", result.length > 0);

    // تمييز الزر النشط
    filtersBox.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.cat === currentCategory);
    });
  }

  // أحداث التفاعل
  filtersBox.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    currentCategory = btn.dataset.cat;
    applyFilters();
  });

  dateSelect.addEventListener("change", () => {
    currentDate = dateSelect.value;
    applyFilters();
  });
  searchInput?.addEventListener("input", () => {
    currentSearch = searchInput.value.trim().toLocaleLowerCase("ar");
    applyFilters();
  });
  placeSelect?.addEventListener("change", () => {
    currentPlace = placeSelect.value;
    applyFilters();
  });

  const resetButtons = [document.getElementById("resetFilters"), document.getElementById("resetFiltersEmpty")].filter(Boolean);
  resetButtons.forEach(resetButton => resetButton.addEventListener("click", () => {
    currentCategory = "all";
    currentDate = "all";
    currentPlace = "all";
    currentSearch = "";
    dateSelect.value = "all";
    if (placeSelect) placeSelect.value = "all";
    if (searchInput) searchInput.value = "";
    applyFilters();
  }));

  applyFilters();
}
/*  صفحة التفاصيل  */
function initDetailsPage() {
  const id = new URLSearchParams(window.location.search).get("id");
  const ev = getEventById(id);

  // الـ id غلط أو ناقص
  if (!ev) {
    document.getElementById("notFound").classList.remove("d-none");
    document.getElementById("similarSection").classList.add("d-none");
    return;
  }

  const cat = categories[ev.category];
  document.title = `${ev.title} | دليل فعاليات الجامعة الافتراضية السورية`;
  document.getElementById("breadcrumbTitle").textContent = ev.title;
  document.getElementById("modalEventTitle").textContent = ev.title;

  const isToday = ev.date === todayStr();

  document.getElementById("eventDetails").innerHTML = `
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="details-img" style="background-image: url('${ev.image}'), linear-gradient(135deg, #c2185b, #ffb400)">
          ${isToday ? '<span class="today-badge">اليوم</span>' : ""}
        </div>
      </div>
      <div class="col-lg-6">
        <div class="info-card">
          <span class="cat-badge ${cat.css}">${cat.label}</span>
          <h1>${ev.title}</h1>

          <div class="countdown" id="countdown" aria-live="polite"></div>

          <ul class="info-list">
            <li><strong>التاريخ:</strong> ${formatDate(ev.date)}</li>
            <li><strong>الوقت:</strong> ${ev.time}</li>
            <li><strong>المكان:</strong> ${ev.place}</li>
            <li><strong>السعر:</strong> ${ev.price}</li>
          </ul>

          <button type="button" class="btn btn-primary btn-lg w-100"
                  data-bs-toggle="modal" data-bs-target="#bookingModal">احجز مقعدك</button>
        </div>
      </div>
    </div>

    <div class="event-description">
      <h4 class="fw-bold">عن الفعالية</h4>
      <p class="mb-0">${ev.description}</p>
      <div class="d-flex flex-wrap gap-2 mt-4">
        <button type="button" class="btn btn-outline-primary" id="addCalendarBtn">أضف إلى التقويم</button>
        <button type="button" class="btn btn-outline-primary" id="shareEventBtn">شارك الفعالية</button>
      </div>
    </div>
    <section class="mt-4">
      <h3 class="h4 fw-bold mb-3">معرض صور الفعالية</h3>
      <div class="row g-3">
        <div class="col-4"><img class="gallery-thumb" src="${ev.image}" alt="صورة من الفعالية" loading="lazy"></div>
        <div class="col-4"><img class="gallery-thumb" src="images/event-2.jpg" alt="صورة توضيحية إضافية للفعالية" loading="lazy"></div>
        <div class="col-4"><img class="gallery-thumb" src="images/event-3.jpg" alt="صورة توضيحية إضافية للفعالية" loading="lazy"></div>
      </div>
    </section>
    <section class="mt-4">
      <h3 class="h4 fw-bold mb-3">موقع الفعالية على الخريطة</h3>
      <div class="map-frame">
        <img src="images/event-map.svg" alt="خريطة ثابتة توضيحية لموقع الفعالية">
      </div>
    </section>`;

  startCountdown(ev);
  setupBooking(ev);
  setupEventActions(ev);
  renderSimilar(ev);
}

function setupEventActions(ev) {
  const calendarBtn = document.getElementById("addCalendarBtn");
  const shareBtn = document.getElementById("shareEventBtn");
  calendarBtn?.addEventListener("click", () => {
    const start = eventStart(ev);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const stamp = d => d.toISOString().replace(/[-:]/g, "").replace(/\\.\\d{3}/, "");
    const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SVU Events Guide//AR","BEGIN:VEVENT",
      `UID:svu-event-${ev.id}@events.local`,`DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,
      `SUMMARY:${ev.title}`,`LOCATION:${ev.place}`,`DESCRIPTION:${ev.description}`,
      "END:VEVENT","END:VCALENDAR"].join("\\r\\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `svu-event-${ev.id}.ics`; a.click();
    URL.revokeObjectURL(url);
  });
  shareBtn?.addEventListener("click", async () => {
    const shareData = { title: ev.title, text: `${ev.title} — ${ev.place}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        shareBtn.textContent = "تم نسخ الرابط";
      } else {
        window.prompt("انسخ رابط الفعالية:", window.location.href);
      }
    } catch (error) {}
  });
}

/*  تحويل وقت الفعالية (نص عربي) إلى تاريخ كامل  */
function eventStart(ev) {
  let hour = 0, minute = 0;
  const m = ev.time.match(/(\\d+):(\\d+)/);
  if (m) {
    hour = Number(m[1]);
    minute = Number(m[2]);
    if (ev.time.includes("مساء") && hour < 12) hour += 12;
    if ((ev.time.includes("ظهر") || ev.time.includes("مساء")) && hour === 12) hour = 12;
  }
  const d = new Date(ev.date + "T00:00:00");
  d.setHours(hour, minute, 0, 0);
  return d;
}

/*  العدّاد التنازلي  */
function startCountdown(ev) {
  const box = document.getElementById("countdown");
  const target = eventStart(ev);

  function tick() {
    const diff = target - new Date();

    if (diff <= 0) {
      box.innerHTML = `<div class="alert alert-warning w-100 mb-0 text-center fw-bold">
        ${ev.date === todayStr() ? "بدأت الفعالية اليوم" : "انتهت هذه الفعالية"}</div>`;
      clearInterval(timer);
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    box.innerHTML = [
      [days, "يوم"], [hours, "ساعة"], [minutes, "دقيقة"], [seconds, "ثانية"]
    ].map(([n, label]) => `
      <div class="count-box">
        <span class="num">${String(n).padStart(2, "0")}</span>
        <span class="lbl">${label}</span>
      </div>`).join("");
  }

  const timer = setInterval(tick, 1000);
  tick();
}

function setupBooking(ev) {
  const modalEl = document.getElementById("bookingModal");
  const form = document.getElementById("bookingForm");
  const nameInput = document.getElementById("bookName");
  const phoneInput = document.getElementById("bookPhone");
  const ticketsSelect = document.getElementById("bookTickets");

  function mark(input, ok) {
    input.classList.toggle("is-invalid", !ok);
    input.classList.toggle("is-valid", ok);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const nameOk = nameInput.value.trim().length >= 3;
    const phone = phoneInput.value.replace(/[\s-]/g, "");
    const phoneOk = /^(\+?963|0)?9\d{8}$/.test(phone);  

    mark(nameInput, nameOk);
    mark(phoneInput, phoneOk);
    if (!nameOk || !phoneOk) return;

    bootstrap.Modal.getInstance(modalEl).hide();

    const tickets = ticketsSelect.value;
    document.getElementById("bookingAlert").innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        تم تسجيل حجزك يا <strong>${nameInput.value.trim()}</strong>:
        ${tickets} مقعد/مقاعد لفعالية "${ev.title}". رح نتواصل معك على الرقم ${phoneInput.value.trim()}.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button>
      </div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    form.reset();
    [nameInput, phoneInput].forEach(i => i.classList.remove("is-valid", "is-invalid"));
  });
}

/* ----- فعاليات مشابهة ----- */
function renderSimilar(ev) {
  const others = upcomingEvents().filter(e => e.id !== ev.id);
  const sameCat = others.filter(e => e.category === ev.category);
  const rest = others.filter(e => e.category !== ev.category);
  const list = sameCat.concat(rest).slice(0, 3);   // الأقرب بالتصنيف أولاً

  document.getElementById("similarEvents").innerHTML = list.map(renderEventCard).join("");
}
