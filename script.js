// script.js – GSAP animations, parallax, counter, preloader, smooth scroll
document.addEventListener('DOMContentLoaded', () => {
  // ----- PRELOADER -----
  const preloader = document.getElementById('preloader');
  const counterEl = document.querySelector('.preloader__counter');
  let loadProgress = 0;
  const interval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 8) + 2;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        // init scroll animations after load
        initGSAP();
      }, 400);
    }
    counterEl.textContent = loadProgress + '%';
  }, 40);

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  
  function initGSAP() {
    // parallax hero
    gsap.to('.hero__card--1', {
      y: -80,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
    
    const card2 = document.querySelector('.hero__card--2');
    if (card2) {
      gsap.to(card2, {
        y: 100, rotate: 2,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    }

    // section reveals
    gsap.utils.toArray('.service-card, .stat-item, .testimonial-card').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0, y: 40, duration: 0.9, ease: 'power3.out'
      });
    });

    // horizontal scroll animation on gallery
    const track = document.querySelector('.gallery__track');
    const galleryHorizontal = document.querySelector('.gallery__horizontal');
    if (track && galleryHorizontal) {
      gsap.to(track, {
        x: () => -(track.scrollWidth - galleryHorizontal.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery',
          start: 'top top',
          end: () => '+=' + (track.scrollWidth - window.innerWidth),
          scrub: 1.2,
          pin: '.gallery',
          anticipatePin: 1
        }
      });
    }

    // stats counter
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let current = 0;
      let animationFrame;
      const updateCounter = () => {
        const increment = target / 40;
        if (current < target) { 
          current += increment; 
          counter.textContent = Math.floor(current); 
          animationFrame = requestAnimationFrame(updateCounter); 
        }
        else { 
          counter.textContent = target; 
          cancelAnimationFrame(animationFrame);
        }
      };
      ScrollTrigger.create({
        trigger: '.stats',
        start: 'top 70%',
        onEnter: () => updateCounter(),
        once: true
      });
    });
  }

  // ----- CUSTOM SELECT DROPDOWN -----
  const customSelect = document.getElementById('customSelect');
  const selectTrigger = document.getElementById('selectTrigger');
  const selectOptions = document.getElementById('selectOptions');
  const hiddenInput = document.getElementById('service');
  const triggerSpan = selectTrigger.querySelector('span');
  
  selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    customSelect.classList.toggle('open');
  });
  
  document.querySelectorAll('.custom-select__option').forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      triggerSpan.textContent = value;
      hiddenInput.value = value;
      
      // Update selected state
      document.querySelectorAll('.custom-select__option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      
      customSelect.classList.remove('open');
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove('open');
    }
  });

  // ----- NAVBAR active & sticky, mobile toggle -----
  const sections = document.querySelectorAll('section, .hero');
  const navLinks = document.querySelectorAll('.nav__link');
  const navbar = document.getElementById('navbar');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      const sectionTop = s.offsetTop - 150;
      if (scrollY >= sectionTop) current = s.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active-link');
    });
    
    // back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 600);
    }
  });

  // smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        gsap.to(window, { duration: 1.2, scrollTo: { y: targetElement, offsetY: 70 }, ease: 'power3.inOut' });
      }
      document.getElementById('navMenu').classList.remove('active');
      mobileMenuClose.classList.remove('active');
    });
  });

  // mobile toggle
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  
  toggle.addEventListener('click', () => {
    menu.classList.add('active');
    mobileMenuClose.classList.add('active');
  });
  
  mobileMenuClose.addEventListener('click', () => {
    menu.classList.remove('active');
    mobileMenuClose.classList.remove('active');
  });
  
  // Close menu when clicking on overlay/outside
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('active') && 
        !menu.contains(e.target) && 
        !toggle.contains(e.target) &&
        !mobileMenuClose.contains(e.target)) {
      menu.classList.remove('active');
      mobileMenuClose.classList.remove('active');
    }
  });

  // back to top
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.to(window, { duration: 1, scrollTo: 0, ease: 'power3.inOut' });
    });
  }

  // ----- WHATSAPP FORM SUBMISSION -----
  const form = document.getElementById('bookingForm');
  const whatsappFloat = document.getElementById('whatsappFloat');
  const phoneNumber = '1234567890'; // Replace with actual WhatsApp number
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = hiddenInput.value;
    const fb = document.getElementById('formFeedback');
    
    if (!name || !phone) {
      fb.textContent = 'please complete all fields';
      fb.style.color = '#ff6b6b';
      return;
    }
    
    if (!service) {
      fb.textContent = 'please select a service';
      fb.style.color = '#ff6b6b';
      return;
    }
    
    // Create WhatsApp message
    const message = `✨ *NEBULA NAILS Booking Request* ✨%0A%0A` +
                   `👤 *Name:* ${name}%0A` +
                   `📱 *Phone:* ${phone}%0A` +
                   `💅 *Service:* ${service}%0A%0A` +
                   `Please confirm my appointment. Thank you! 🙏`;
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    fb.style.color = '#d9a7b4';
    fb.textContent = '✨ opening whatsapp... ✨';
    
    // Reset form
    form.reset();
    triggerSpan.textContent = 'select service';
    hiddenInput.value = '';
    document.querySelectorAll('.custom-select__option').forEach(opt => opt.classList.remove('selected'));
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      fb.textContent = '';
    }, 3000);
  });

  // Drag to scroll for gallery
  const horiz = document.querySelector('.gallery__horizontal');
  if (horiz) {
    let isDown = false, startX, scrollLeft;
    horiz.addEventListener('mousedown', (e) => { 
      isDown = true; 
      startX = e.pageX - horiz.offsetLeft; 
      scrollLeft = horiz.scrollLeft;
      horiz.style.cursor = 'grabbing';
    });
    horiz.addEventListener('mouseleave', () => { 
      isDown = false; 
      horiz.style.cursor = 'grab';
    });
    horiz.addEventListener('mouseup', () => { 
      isDown = false; 
      horiz.style.cursor = 'grab';
    });
    horiz.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - horiz.offsetLeft;
      const walk = (x - startX) * 1.5;
      horiz.scrollLeft = scrollLeft - walk;
    });
  }

  // additional micro-interactions
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(c => c.addEventListener('mouseenter', () => gsap.to(c, { y: -8, duration: 0.3 })));
  cards.forEach(c => c.addEventListener('mouseleave', () => gsap.to(c, { y: 0, duration: 0.3 })));
  
  // Gallery items hover effect
  const galleryItems = document.querySelectorAll('.gallery__item');
  galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, { scale: 1.02, duration: 0.3 });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { scale: 1, duration: 0.3 });
    });
  });
});