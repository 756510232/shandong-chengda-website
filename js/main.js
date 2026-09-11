/* ==========================================================================
   山东诚达信息科技有限公司 · 交互脚本
   保留：导航、滚动动画、数字滚动、FAQ、计算器
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 导航栏滚动 ---------- */
  var header = document.querySelector(".site-header");

  function handleNavScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  function closeMobileMenu() {
    if (!navToggle || !mobileMenu) return;
    navToggle.classList.remove("active");
    mobileMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var willOpen = !mobileMenu.classList.contains("open");
      navToggle.classList.toggle("active", willOpen);
      mobileMenu.classList.toggle("open", willOpen);
      navToggle.setAttribute("aria-expanded", String(willOpen));
      document.body.style.overflow = willOpen ? "hidden" : "";
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMobileMenu();
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  /* ---------- 当前页面高亮 ---------- */
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var hrefPage = href.split("#")[0].split("/").pop();
    if (hrefPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- 滚动入场动画 ---------- */
  var animateElements = document.querySelectorAll("[data-animate]");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    animateElements.forEach(function (el) { observer.observe(el); });
  } else {
    animateElements.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- 数字滚动 ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated || !counters.length) return;
    var counterSection = document.querySelector("[data-count-section]");
    if (!counterSection) return;

    var rect = counterSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      countersAnimated = true;
      counters.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        var duration = 1200;
        var start = performance.now();

        function update(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = target * eased;
          el.textContent = Number(current).toLocaleString("zh-CN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          });
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener("scroll", animateCounters, { passive: true });
  window.addEventListener("load", animateCounters);
  animateCounters();

  /* ---------- FAQ 手风琴 ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", function () {
      var isActive = item.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("active");
        var otherAnswer = other.querySelector(".faq-answer");
        if (otherAnswer) otherAnswer.style.maxHeight = null;
        var otherQuestion = other.querySelector(".faq-question");
        if (otherQuestion) otherQuestion.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      }
    });

    question.setAttribute("aria-expanded", "false");
  });

  /* ---------- 平滑滚动到锚点 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ---------- 车抵贷费用计算器 ---------- */
  var calculator = document.getElementById("loanCalculator");
  if (calculator) {
    var amountInput = document.getElementById("calcAmount");
    var termInput = document.getElementById("calcTerm");
    var rateSelect = document.getElementById("calcRate");
    var methodSelect = document.getElementById("calcMethod");

    var monthlyOut = document.getElementById("calcMonthly");
    var monthlyLabel = document.getElementById("calcMonthlyLabel");
    var annualOut = document.getElementById("calcAnnual");
    var interestOut = document.getElementById("calcInterest");
    var totalOut = document.getElementById("calcTotal");
    var rateLabel = document.getElementById("calcRateLabel");
    var scheduleBody = document.getElementById("calcScheduleBody");

    function money(value) {
      return Number(value).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function percent(value) {
      return (value * 100).toFixed(2) + "%";
    }

    function renderSchedule(principal, monthlyRate, periods, method) {
      if (!scheduleBody) return;
      var rows = [];
      var balance = principal;

      if (method === "equal-payment") {
        var monthly = principal * monthlyRate * Math.pow(1 + monthlyRate, periods) /
          (Math.pow(1 + monthlyRate, periods) - 1);
        for (var i = 1; i <= periods; i++) {
          var interest = balance * monthlyRate;
          var principalPart = monthly - interest;
          balance = Math.max(0, balance - principalPart);
          rows.push([i, monthly, principalPart, interest, balance]);
        }
      } else {
        var principalPart = principal / periods;
        for (var j = 1; j <= periods; j++) {
          var monthInterest = balance * monthlyRate;
          var payment = principalPart + monthInterest;
          balance = Math.max(0, balance - principalPart);
          rows.push([j, payment, principalPart, monthInterest, balance]);
        }
      }

      scheduleBody.innerHTML = rows.map(function (row) {
        return "<tr>" +
          "<td>" + row[0] + "</td>" +
          "<td>¥" + money(row[1]) + "</td>" +
          "<td>¥" + money(row[2]) + "</td>" +
          "<td>¥" + money(row[3]) + "</td>" +
          "<td>¥" + money(row[4]) + "</td>" +
          "</tr>";
      }).join("");
    }

    function calculate() {
      var amountWan = parseFloat(amountInput.value);
      var periods = parseInt(termInput.value, 10);
      var monthlyRate = parseFloat(rateSelect.value);
      var method = methodSelect.value;

      if (!amountWan || amountWan <= 0) amountWan = 10;
      if (!periods || periods < 1) periods = 24;
      if (!monthlyRate) monthlyRate = 0.0068;

      amountInput.value = amountWan;
      termInput.value = periods;

      var principal = amountWan * 10000;
      var annualNominal = monthlyRate * 12;
      var monthlyPayment;
      var totalInterest;
      var totalRepayment;
      var description;

      if (method === "equal-payment") {
        monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, periods) /
          (Math.pow(1 + monthlyRate, periods) - 1);
        totalRepayment = monthlyPayment * periods;
        totalInterest = totalRepayment - principal;
        description = "等额本息 · 每月还款固定";
        monthlyLabel.textContent = "每月还款";
      } else {
        var principalPart = principal / periods;
        monthlyPayment = principalPart + principal * monthlyRate;
        totalInterest = principal * monthlyRate * (periods + 1) / 2;
        totalRepayment = principal + totalInterest;
        description = "等额本金 · 首月最高，逐月递减";
        monthlyLabel.textContent = "首月还款";
      }

      monthlyOut.textContent = "¥" + money(monthlyPayment);
      annualOut.textContent = percent(annualNominal);
      interestOut.textContent = "¥" + money(totalInterest);
      totalOut.textContent = "¥" + money(totalRepayment);
      rateLabel.textContent = percent(monthlyRate).replace("%", "") + "% / 月";
      document.getElementById("calcMethodLabel").textContent = description;
      document.getElementById("calcPrincipalLabel").textContent = "¥" + money(principal);
      document.getElementById("calcTermLabel").textContent = periods + " 期";

      renderSchedule(principal, monthlyRate, periods, method);
    }

    [amountInput, termInput, rateSelect, methodSelect].forEach(function (el) {
      el.addEventListener("input", calculate);
      el.addEventListener("change", calculate);
    });

    var calcBtn = document.getElementById("calcBtn");
    if (calcBtn) calcBtn.addEventListener("click", calculate);

    calculate();
  }

  /* ---------- 动态版权年份 ---------- */
  var year = new Date().getFullYear();
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = String(year);
  });

})();