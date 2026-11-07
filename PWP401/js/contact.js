document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const alertBox = document.getElementById("contactAlert");
  const fields = [...form.querySelectorAll("input, textarea")];
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;
    fields.forEach((field) => {
      const fieldValid = field.checkValidity() && (field.id !== "contactName" || field.value.trim().length >= 3) && (field.id !== "contactMessage" || field.value.trim().length >= 10);
      field.classList.toggle("is-valid", fieldValid);
      field.classList.toggle("is-invalid", !fieldValid);
      if (!fieldValid) valid = false;
    });
    if (!valid) {
      alertBox.innerHTML = '<div class="alert alert-danger" role="alert">يرجى مراجعة الحقول والتأكد من إدخال البيانات بشكل صحيح.</div>';
      form.querySelector(":invalid")?.focus();
      return;
    }
    alertBox.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert"><strong>تم تجهيز رسالتك بنجاح!</strong> هذا تأكيد تجريبي؛ لم تُرسل البيانات إلى خادم. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button></div>';
    form.reset();
    fields.forEach((field) => field.classList.remove("is-valid", "is-invalid"));
  });
  fields.forEach((field) => field.addEventListener("input", () => { if (field.classList.contains("is-invalid") && field.checkValidity()) { field.classList.remove("is-invalid"); field.classList.add("is-valid"); } }));
});
