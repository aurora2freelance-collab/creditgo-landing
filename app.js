/* CreditGo — minimal, dependency-free page script.
   Waitlist: posts to form.dataset.endpoint when configured; otherwise records the
   signup locally and confirms, so the static page never dead-ends. */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var form = document.getElementById("waitlist-form");
  if (!form) return;
  var input = document.getElementById("email");
  var status = document.getElementById("form-status");

  function setStatus(msg, isError) {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle("error", !!isError);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var email = (input.value || "").trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      input.setAttribute("aria-invalid", "true");
      setStatus("Please enter a valid email address.", true);
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");

    var endpoint = form.getAttribute("data-endpoint");
    var submit = function () {
      try {
        var key = "creditgo_waitlist";
        var list = JSON.parse(localStorage.getItem(key) || "[]");
        if (list.indexOf(email) === -1) list.push(email);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (e) {
        /* storage may be unavailable; the confirmation still succeeds */
      }
      form.reset();
      setStatus("Thanks — you're on the list. We'll be in touch.");
    };

    if (!endpoint) { submit(); return; }

    setStatus("Submitting…", false);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, page: "landing", ts: Date.now() })
    }).then(function (res) {
      if (!res.ok) throw new Error("bad status");
      submit();
    }).catch(function () {
      setStatus("Something went wrong. Please email hello@creditgo.io.", true);
    });
  });
})();
