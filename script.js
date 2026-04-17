// script.js – Cosmic Animations & Interactions | Optimised + Touch Ready
document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Detect touch device
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches || ('ontouchstart' in window);

  // ----- PRELOADER -----
  const preloader = document.getElementById('preloader');
  const counterEl = document.querySelector('.preloader__counter');
  let loadProgress = 0;

  const interval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 6) + 3;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(interval);
      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        initGSAP();
        initParticles();
      }, 500);
    }
    if (counterEl) counterEl.textContent = loadProgress + '%';
  }, 35);

  // ----- PARTICLES -----
  function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    // Fewer particles on mobile for perf
    const count = window.innerWidth < 768 ? 10 : 20;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: rgba(232, 199, 216, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: floatParticle ${Math.random() * 10 + 15}s linear infinite;
        animation-delay: ${Math.random() * -20}s;
        pointer-events: none;
      `;
      frag.appendChild(particle);
    }
    particlesContainer.appendChild(frag);
  }

  // Particle animation style
  const pStyle = document.createElement('style');
  pStyle.textContent = `
    @keyframes floatParticle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.5; }
      90% { opacity: 0.5; }
      100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
    }
  `;
  document.head.appendChild(pStyle);

  // ----- GSAP ANIMATIONS -----
  function initGSAP() {
    const touch = isTouchDevice();

    // Hero Parallax (skip on mobile for performance)
    if (!touch && window.innerWidth > 768) {
      gsap.to('.hero__card--1', {
        y: -100, rotate: 1, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      const card2 = document.querySelector('.hero__card--2');
      if (card2) {
        gsap.to(card2, {
          y: 120, rotate: -2,
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
        });
      }

      const floatingQuote = document.querySelector('.hero__floating-quote');
      if (floatingQuote) {
        gsap.to(floatingQuote, {
          x: -50,
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
        });
      }
    }

    // Section Reveals
    const revealElements = gsap.utils.toArray('.reveal-card, .stat-item, .testimonial-card');
    revealElements.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0, y: 50,
        duration: 0.85, ease: 'power3.out',
        delay: Math.min(i * 0.05, 0.3) // cap delay so mobile doesn't wait too long
      });
    });

    // Gallery Horizontal Scroll (GSAP pin — desktop only)
    if (!touch && window.innerWidth > 1024) {
      const track = document.querySelector('.gallery__track');
      const galleryHorizontal = document.querySelector('.gallery__horizontal');
      if (track && galleryHorizontal) {
        const scrollWidth = track.scrollWidth - galleryHorizontal.clientWidth;
        if (scrollWidth > 0) {
          gsap.to(track, {
            x: () => -scrollWidth,
            ease: 'none',
            scrollTrigger: {
              trigger: '.gallery',
              start: 'top top',
              end: () => '+=' + scrollWidth,
              scrub: 1.5,
              pin: '.gallery',
              anticipatePin: 1
            }
          });
        }
      }
    }

    // Stats Counter
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let triggered = false;

      ScrollTrigger.create({
        trigger: counter.closest('.stats') || counter,
        start: 'top 80%',
        onEnter: () => {
          if (triggered) return;
          triggered = true;
          let current = 0;
          const duration = 1500; // ms
          const start = performance.now();
          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
            current = Math.floor(eased * target);
            counter.textContent = current;
            if (progress < 1) requestAnimationFrame(tick);
            else counter.textContent = target;
          };
          requestAnimationFrame(tick);
        }
      });
    });

    // Magnetic Buttons (desktop only)
    if (!touch) {
      const magneticBtns = document.querySelectorAll('.magnetic');
      magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.5, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        });
      });
    }

    // Tilt Effect (desktop only)
    if (!touch) {
      const tiltCards = document.querySelectorAll('.tilt-card');
      tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rotateX = (y - rect.height / 2) / 15;
          const rotateY = (rect.width / 2 - x) / 15;
          gsap.to(card, { rotateX, rotateY, duration: 0.4, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        });
      });
    }

    // Floating card animation
    const floatingCards = document.querySelectorAll('.floating-card');
    if (floatingCards.length) {
      gsap.to(floatingCards, {
        y: -6, duration: 2, repeat: -1, yoyo: true,
        ease: 'power1.inOut', stagger: 0.2
      });
    }
  }

  // ----- CUSTOM SELECT -----
  const customSelect = document.getElementById('customSelect');
  const selectTrigger = document.getElementById('selectTrigger');
  const hiddenInput = document.getElementById('service');

  if (selectTrigger && customSelect) {
    const triggerSpan = selectTrigger.querySelector('span');

    selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      customSelect.classList.toggle('open');
    });

    // Touch support for options
    document.querySelectorAll('.custom-select__option').forEach(option => {
      const handleSelect = () => {
        const value = option.getAttribute('data-value');
        const icon = option.querySelector('i');
        if (triggerSpan && icon) {
          const iconClone = icon.cloneNode(true);
          triggerSpan.innerHTML = '';
          triggerSpan.appendChild(iconClone);
          triggerSpan.appendChild(document.createTextNode(' ' + value));
        }
        if (hiddenInput) hiddenInput.value = value;
        document.querySelectorAll('.custom-select__option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        customSelect.classList.remove('open');
      };

      option.addEventListener('click', handleSelect);
      option.addEventListener('touchend', (e) => { e.preventDefault(); handleSelect(); });
    });

    document.addEventListener('click', (e) => {
      if (customSelect && !customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
      }
    });
    document.addEventListener('touchstart', (e) => {
      if (customSelect && !customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
      }
    }, { passive: true });
  }

  // ----- MOBILE MENU -----
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const backdrop = document.getElementById('mobileBackdrop');

  function openMenu() {
    if (!menu || !backdrop) return;
    menu.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('no-scroll');
    gsap.to('.nav__toggle-bar:first-child', { rotate: 45, y: 6, duration: 0.3 });
    gsap.to('.nav__toggle-bar:last-child', { rotate: -45, y: -6, duration: 0.3 });
    gsap.to('.nav__toggle-dot', { opacity: 0, duration: 0.2 });
  }

  function closeMenu() {
    if (!menu || !backdrop) return;
    menu.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('no-scroll');
    gsap.to('.nav__toggle-bar:first-child', { rotate: 0, y: 0, duration: 0.3 });
    gsap.to('.nav__toggle-bar:last-child', { rotate: 0, y: 0, duration: 0.3 });
    gsap.to('.nav__toggle-dot', { opacity: 1, duration: 0.2 });
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (menu && menu.classList.contains('active')) closeMenu();
      else openMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
    backdrop.addEventListener('touchend', (e) => { e.preventDefault(); closeMenu(); });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && menu.classList.contains('active')) closeMenu();
  });

  // ----- ACTIVE LINKS — IntersectionObserver (accurate, nav-aware) -----
  const sections = document.querySelectorAll('section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  // Build a map of id → navLink for fast lookup
  const navLinkMap = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) navLinkMap[id] = link;
  });

  function setActiveLink(id) {
    navLinks.forEach(l => l.classList.remove('active-link'));
    if (navLinkMap[id]) navLinkMap[id].classList.add('active-link');
  }

  // Use 40% top margin so a section becomes "active" when it crosses ~40% down the viewport
  const navHeight = document.querySelector('.nav')?.offsetHeight || 70;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.getAttribute('id'));
      }
    });
  }, {
    rootMargin: `-${navHeight}px 0px -55% 0px`,
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));

  // ----- SCROLL UTILS -----
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);

    // Navbar scroll effect (throttled)
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const nav = document.querySelector('.nav');
      if (!nav) return;
      if (window.pageYOffset > 100) {
        nav.style.padding = window.innerWidth < 480 ? '0.7rem 4%' : '0.75rem 5%';
        nav.style.background = 'rgba(7, 4, 10, 0.82)';
      } else {
        nav.style.padding = window.innerWidth < 480 ? '0.8rem 4%' : '1rem 5%';
        nav.style.background = 'rgba(7, 4, 10, 0.4)';
      }
    }, 20);
  }, { passive: true });

  navLinks.forEach(link => {
    const handleNavClick = (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Immediately highlight the clicked link
        navLinks.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');

        gsap.to(window, {
          duration: 1.3,
          scrollTo: { y: targetElement, offsetY: 75 },
          ease: 'power3.inOut'
        });
      }
      closeMenu();
    };

    link.addEventListener('click', handleNavClick);
  });

  // Back to top
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.to(window, { duration: 1.2, scrollTo: 0, ease: 'power3.inOut' });
    });
    backToTopBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      gsap.to(window, { duration: 1.2, scrollTo: 0, ease: 'power3.inOut' });
    });
  }

  // ----- WHATSAPP FORM -----
  const form = document.getElementById('bookingForm');
  const phoneNumber = '1234567890';
  const fb = document.getElementById('formFeedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim() || '';
      const phone = document.getElementById('phone')?.value.trim() || '';
      const service = hiddenInput ? hiddenInput.value : '';
      const triggerSpan = selectTrigger ? selectTrigger.querySelector('span') : null;

      if (!name || !phone) {
        if (fb) { fb.textContent = '✨ please complete all cosmic fields ✨'; fb.style.color = '#ff8a8a'; }
        return;
      }
      if (!service) {
        if (fb) { fb.textContent = '🌙 select a constellation first 🌙'; fb.style.color = '#ff8a8a'; }
        return;
      }

      const message = `✨ *NEBULA NAILS · Cosmic Transmission* ✨%0A%0A` +
        `👤 *Celestial Name:* ${encodeURIComponent(name)}%0A` +
        `📱 *Frequency:* ${encodeURIComponent(phone)}%0A` +
        `💫 *Constellation:* ${encodeURIComponent(service)}%0A%0A` +
        `*Ready to align with the cosmos?* 🌌%0A` +
        `Please confirm my orbital appointment.`;

      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');

      if (fb) { fb.style.color = '#d4a0b5'; fb.textContent = '✨ transmission sent · opening whatsapp ✨'; }

      form.reset();
      if (triggerSpan) triggerSpan.innerHTML = 'choose a service';
      if (hiddenInput) hiddenInput.value = '';
      document.querySelectorAll('.custom-select__option').forEach(opt => opt.classList.remove('selected'));

      setTimeout(() => { if (fb) fb.textContent = ''; }, 4000);
    });
  }

  // ----- GALLERY DRAG (Mouse + Touch) -----
  const horiz = document.querySelector('.gallery__horizontal');
  if (horiz) {
    let isDown = false;
    let startX, scrollLeft;
    let velX = 0;
    let lastX = 0;
    let momentumFrame;

    // Mouse drag
    horiz.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - horiz.offsetLeft;
      scrollLeft = horiz.scrollLeft;
      lastX = e.pageX;
      velX = 0;
      horiz.classList.add('is-dragging');
      cancelAnimationFrame(momentumFrame);
    });
    horiz.addEventListener('mouseleave', () => { isDown = false; horiz.classList.remove('is-dragging'); applyMomentum(); });
    horiz.addEventListener('mouseup', () => { isDown = false; horiz.classList.remove('is-dragging'); applyMomentum(); });
    horiz.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - horiz.offsetLeft;
      const walk = (x - startX) * 1.6;
      velX = e.pageX - lastX;
      lastX = e.pageX;
      horiz.scrollLeft = scrollLeft - walk;
    });

    // Touch drag
    let touchStartX = 0;
    let touchScrollLeft = 0;
    let touchLastX = 0;
    let touchVelX = 0;

    horiz.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = horiz.scrollLeft;
      touchLastX = touchStartX;
      touchVelX = 0;
      cancelAnimationFrame(momentumFrame);
    }, { passive: true });

    horiz.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX;
      const walk = touchStartX - x;
      touchVelX = touchLastX - x;
      touchLastX = x;
      horiz.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });

    horiz.addEventListener('touchend', () => {
      velX = -touchVelX;
      applyMomentum();
    }, { passive: true });

    function applyMomentum() {
      if (Math.abs(velX) < 1) return;
      const decay = 0.92;
      const step = () => {
        horiz.scrollLeft -= velX;
        velX *= decay;
        if (Math.abs(velX) > 0.5) momentumFrame = requestAnimationFrame(step);
      };
      momentumFrame = requestAnimationFrame(step);
    }
  }

  // ----- SERVICE CARD HOVER (mouse only) -----
  if (!isTouchDevice()) {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -10, boxShadow: '0 30px 60px -15px rgba(212,160,181,0.2)', duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, boxShadow: '0 30px 50px -15px rgba(0,0,0,0.5)', duration: 0.4, ease: 'power2.out' });
      });
    });

    // Gallery item parallax
    const galleryItems = document.querySelectorAll('.gallery__item');
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(img, { x: x * 12, y: y * 12, duration: 0.4 });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(img, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      });
    });
  }

  // ----- VIEWPORT RESIZE (refresh ScrollTrigger) -----
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
});