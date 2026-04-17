document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initHeroParticles();
  initScrollEffects();
  initContactForm();
  initWeChatQrPopup();
});

function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });

          if (window.innerWidth <= 768) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
          }
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

function initHeroParticles() {
  const particlesContainer = document.getElementById('heroParticles');
  if (!particlesContainer) return;

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: rgba(168, 85, 247, ${Math.random() * 0.5 + 0.2});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float-particle ${Math.random() * 20 + 15}s ease-in-out ${Math.random() * 10}s infinite;
      pointer-events: none;
    `;
    particlesContainer.appendChild(particle);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-particle {
      0%, 100% {
        transform: translate(0, 0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * -100 - 50}px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

function initScrollEffects() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  const style = document.createElement('style');
  style.textContent = `
    section.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

function initContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = contactForm.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#ff6ec7';
      } else {
        input.style.borderColor = 'rgba(168, 85, 247, 0.2)';
      }
    });

    if (isValid) {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '发送中...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = '发送成功!';
        submitBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          contactForm.reset();
        }, 2000);
      }, 1500);
    }
  });
}

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  if (hero) {
    const parallaxElements = hero.querySelectorAll('.hero-particles > div');
    parallaxElements.forEach((el, index) => {
      const speed = 0.5 + (index * 0.1);
      el.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

const gameCards = document.querySelectorAll('.game-card');
gameCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.02)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

const careerCards = document.querySelectorAll('.career-card');
careerCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
});

function initWeChatQrPopup() {
  const wechatBtn = document.getElementById('wechatBtn');
  const qrPopup = document.getElementById('wechatQrPopup');
  const qrClose = document.getElementById('qrClose');
  if (!wechatBtn || !qrPopup) return;

  function togglePopup(e) {
    e.stopPropagation();
    qrPopup.classList.toggle('active');
  }

  function closePopup() {
    qrPopup.classList.remove('active');
  }

  wechatBtn.addEventListener('click', togglePopup);
  qrClose.addEventListener('click', (e) => { e.stopPropagation(); closePopup(); });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.social-wechat-wrapper')) {
      closePopup();
    }
  });

  wechatBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      togglePopup(e);
    } else if (e.key === 'Escape') {
      closePopup();
    }
  });
}
