/*  أدوات التاريخ  */
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;       
}

function todayStr() { return daysFromNow(0); }

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ar-SY-u-nu-latn", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

/*  التصنيفات  */
const categories = {
  coding:     { label: "برمجة",          css: "cat-coding" },
  robotics:   { label: "روبوتيك",        css: "cat-robotics" },
  exhibition: { label: "معارض",          css: "cat-exhibition" },
  mind:       { label: "ألعاب ذهنية",    css: "cat-mind" }
};

/*  الفعاليات التجريبية  */
const events = [
  {
    id: 1, title: "المسابقة البرمجية للجامعات السورية", category: "coding",
    date: daysFromNow(0), time: "10:00 صباحاً", place: "منصة المسابقات البرمجية - عن بُعد",
    price: "مجاني", featured: true, image: "images/event-1.jpg",
    description: "مسابقة برمجية تجمع فرقاً من طلاب الجامعات السورية لحل مسائل خوارزمية خلال وقت محدد، مع جوائز وشهادات تقدير للفرق المتفوقة."
  },
  {
    id: 2, title: "معرض مشاريع التخرج", category: "exhibition",
    date: daysFromNow(2), time: "10:00 صباحاً", place: "قاعة المعارض الافتراضية للجامعة",
    price: "مجاني", featured: true, image: "images/event-2.jpg",
    description: "معرض يعرض أبرز مشاريع تخرج طلاب الجامعة في مجالات التقانة والبرمجة والإدارة، مع شرح مباشر من أصحاب المشاريع."
  },
  {
    id: 3, title: "بطولة SVU للشطرنج الإلكتروني", category: "mind",
    date: daysFromNow(4), time: "5:00 مساءً", place: "منصة الشطرنج الإلكترونية - عن بُعد",
    price: "1000 ل.س", featured: true, image: "images/event-3.jpg",
    description: "بطولة أونلاين مفتوحة لجميع طلاب الجامعة بنظام خروج المغلوب، مع جوائز رمزية للفائزين."
  },
  {
    id: 4, title: "مسابقة الروبوتيك الوطنية", category: "robotics",
    date: daysFromNow(6), time: "9:00 صباحاً", place: "مقر الجامعة الافتراضية السورية",
    price: "مجاني", featured: false, image: "images/event-4.jpg",
    description: "مسابقة وطنية تتنافس فيها فرق طلابية بروبوتات من تصميمها في مهام التتبع وتجاوز العقبات، أمام لجنة تحكيم من المختصين."
  },
  {
    id: 5, title: "معرض الدرونات المتقدم", category: "exhibition",
    date: daysFromNow(8), time: "11:00 صباحاً", place: "مقر الجامعة الافتراضية السورية",
    price: "2000 ل.س", featured: true, image: "images/event-5.jpg",
    description: "معرض يستعرض أحدث الطائرات المسيّرة وتطبيقاتها في التصوير والزراعة والمسح، مع عروض طيران مباشرة وورشات تعريفية."
  }
];

/*  دوال مشتركة  */
function getEventById(id) {
  return events.find(e => e.id === Number(id));
}

// بطاقة فعالية جاهزة (Bootstrap Card)  
function renderEventCard(ev) {
  const cat = categories[ev.category];
  const isToday = ev.date === todayStr();
  return `
    <div class="col-12 col-md-6 col-lg-4 event-item" data-category="${ev.category}" data-date="${ev.date}">
      <div class="card event-card">
        <div class="event-img-wrap">
          <img src="${ev.image}" alt="${ev.title}" loading="lazy" onerror="this.style.display='none'">
          ${isToday ? '<span class="today-badge">اليوم</span>' : ""}
        </div>
        <div class="card-body d-flex flex-column">
          <span class="cat-badge ${cat.css} align-self-start">${cat.label}</span>
          <h5 class="card-title">${ev.title}</h5>
          <p class="event-meta mb-0">التاريخ: ${formatDate(ev.date)}</p>
          <p class="event-meta">المكان: ${ev.place}</p>
          <a href="event.html?id=${ev.id}" class="btn btn-primary mt-auto">التفاصيل</a>
        </div>
      </div>
    </div>`;
}