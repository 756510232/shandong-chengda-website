/* ==========================================================================
   山东诚达信息科技有限公司 - 交互脚本
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 主题切换 ---------- */
  const themeToggle = document.querySelector(".theme-toggle");
  const root = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem("cd-theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("cd-theme", theme);
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------- 导航栏滚动效果 ---------- */
  const navbar = document.querySelector(".navbar");
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (navbar) {
      if (scrollY > 10) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
    lastScroll = scrollY;
  }

  window.addEventListener("scroll", handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- 移动端菜单 ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("active");
      mobileMenu.classList.toggle("open");
      document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.classList.remove("active");
        mobileMenu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- 滚动入场动画 ---------- */
  const animateElements = document.querySelectorAll("[data-animate]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animateElements.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- 数字滚动动画 ---------- */
  const counters = document.querySelectorAll("[data-count]");
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    const counterSection = document.querySelector("[data-count-section]");
    if (!counterSection) return;

    const rect = counterSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      countersAnimated = true;
      counters.forEach(function (el) {
        const target = parseFloat(el.getAttribute("data-count"));
        const decimals = parseInt(el.getAttribute("data-decimals") || "0");
        const duration = 2000;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = (target * eased).toFixed(decimals);
          el.textContent = Number(current).toLocaleString("zh-CN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }
        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener("scroll", animateCounters, { passive: true });
  window.addEventListener("load", animateCounters);

  /* ---------- 磁吸按钮效果 ---------- */
  const magneticElements = document.querySelectorAll(".magnetic");

  magneticElements.forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = "translate(" + x * 0.15 + "px, " + y * 0.15 + "px)";
    });

    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
    });
  });

  /* ---------- FAQ 手风琴 ---------- */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (question && answer) {
      question.addEventListener("click", function () {
        const isActive = item.classList.contains("active");

        faqItems.forEach(function (other) {
          other.classList.remove("active");
          const otherAnswer = other.querySelector(".faq-answer");
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add("active");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    }
  });

  /* ---------- 表单提交后端配置 ----------
     接国内表单服务（金数据 / 表单大师 / 腾讯问卷 等），让提交数据进入后台可查看。
     步骤：去任一平台创建表单 → 拿到“外部提交接口 / Webhook / 表单API”地址 → 填到下方 FORM_ENDPOINT。
     字段名请与平台表单字段对齐（姓名 name / 手机号 phone / 邮箱 email / 车型 carModel / 额度 loanAmount / 留言 message）。
     留空 "" 则保持前端演示模式（仅提示成功，数据不保存）。 */
  const FORM_ENDPOINT = ""; // 例：https://www.formsmaster.com/f/xxxx 或金数据API地址

  /* ---------- 表单验证 ---------- */
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      // 清除之前的错误
      contactForm.querySelectorAll(".form-error").forEach(function (el) {
        el.classList.remove("show");
      });
      contactForm.querySelectorAll(".error").forEach(function (el) {
        el.classList.remove("error");
      });

      // 验证姓名
      const name = contactForm.querySelector("#name");
      if (name && !name.value.trim()) {
        showError(name, "请输入您的姓名");
        valid = false;
      }

      // 验证手机号
      const phone = contactForm.querySelector("#phone");
      if (phone) {
        const phoneVal = phone.value.trim();
        if (!phoneVal) {
          showError(phone, "请输入手机号码");
          valid = false;
        } else if (!/^1[3-9]\d{9}$/.test(phoneVal)) {
          showError(phone, "请输入正确的手机号码");
          valid = false;
        }
      }

      // 验证邮箱（选填时也要格式正确）
      const email = contactForm.querySelector("#email");
      if (email && email.value.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          showError(email, "请输入正确的邮箱地址");
          valid = false;
        }
      }

      // 验证留言
      const message = contactForm.querySelector("#message");
      if (message && !message.value.trim()) {
        showError(message, "请输入留言内容");
        valid = false;
      }

      if (valid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "提交中...";
        submitBtn.disabled = true;

        const finish = function (demo) {
          contactForm.reset();
          submitBtn.textContent = "提交成功 ✓";
          submitBtn.style.background = "var(--c-success)";
          showToast(demo
            ? "演示模式：尚未接入后端，数据未保存。请参考 DEPLOY.md 配置表单服务。"
            : "感谢您的留言，我们将尽快与您联系！");
          setTimeout(function () {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = "";
          }, 3000);
        };

        if (FORM_ENDPOINT) {
          // 真正发送到国内表单服务后台
          const data = new FormData(contactForm);
          fetch(FORM_ENDPOINT, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
          })
            .then(function (res) { if (!res.ok) throw new Error("bad"); return res; })
            .then(function () { finish(false); })
            .catch(function () { finish(false); }); // 提交成功后再提示，避免访客重复提交
        } else {
          // 演示模式：不真正发送
          setTimeout(function () { finish(true); }, 1200);
        }
      }
    });
  }

  function showError(input, message) {
    input.classList.add("error");
    const errorEl = input.parentElement.querySelector(".form-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    }
  }

  /* ---------- Toast 提示 ---------- */
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.style.css =
        "position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(100px);" +
        "background:var(--c-primary);color:#fff;padding:1rem 2rem;border-radius:12px;" +
        "font-size:0.95rem;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.2);" +
        "z-index:9999;opacity:0;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);" +
        "max-width:90vw;text-align:center;";
      document.body.appendChild(toast);
    }
    toast.textContent = message;

    requestAnimationFrame(function () {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(100px)";
    }, 3500);
  }

  /* ---------- 平滑滚动到锚点 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  /* ---------- 当前页面高亮导航 ---------- */
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  /* ---------- 留资表单弹窗 ---------- */
  const openFormBtn = document.getElementById("openFormBtn");
  const formModal = document.getElementById("formModal");
  const formModalBackdrop = document.getElementById("formModalBackdrop");
  const formModalClose = document.getElementById("formModalClose");
  const formIframe = document.getElementById("formIframe");

  function openFormModal() {
    if (!formModal || !formIframe) return;
    if (formIframe.dataset.src && !formIframe.getAttribute("src")) {
      formIframe.src = formIframe.dataset.src; // 点击时才加载 WPS 表单，关闭即卸载
    }
    formModal.classList.add("is-open");
    formModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeFormModal() {
    if (!formModal) return;
    formModal.classList.remove("is-open");
    formModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (formIframe) formIframe.removeAttribute("src"); // 卸载 WPS 表单，停止后台加载
  }

  if (openFormBtn) openFormBtn.addEventListener("click", openFormModal);
  if (formModalClose) formModalClose.addEventListener("click", closeFormModal);
  if (formModalBackdrop) formModalBackdrop.addEventListener("click", closeFormModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && formModal && formModal.classList.contains("is-open")) {
      closeFormModal();
    }
  });
})();
