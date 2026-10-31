const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Slide and fade page elements into view as the visitor scrolls.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Pointer movement gives the layered hero artwork a gentle 3D response.
const heroScene = document.querySelector('[data-hero-scene]');
const heroDevice = document.querySelector('[data-hero-device]');
if (heroScene && heroDevice && !reduceMotion) {
  let targetX = -9;
  let targetY = 6;
  let currentX = targetX;
  let currentY = targetY;
  let frame = 0;
  const paint = () => {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    heroDevice.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
    frame = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.05 ? requestAnimationFrame(paint) : 0;
  };
  heroScene.addEventListener('pointermove', (event) => {
    const box = heroScene.getBoundingClientRect();
    targetX = ((event.clientX - box.left) / box.width - 0.5) * 13 - 9;
    targetY = ((event.clientY - box.top) / box.height - 0.5) * -10 + 6;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  heroScene.addEventListener('pointerleave', () => {
    targetX = -9;
    targetY = 6;
    if (!frame) frame = requestAnimationFrame(paint);
  });
}

// Pin the process illustration and change its 3D angle as each phase passes.
const processSection = document.querySelector('.process-section');
const processArt = document.querySelector('.process-art');
const processChapters = [...document.querySelectorAll('.process-chapter')];
const processCounter = document.querySelector('.process-counter b');
const processProgress = document.querySelector('.process-progress span');
let processFrame = 0;
function updateProcess() {
  processFrame = 0;
  if (!processSection) return;
  const bounds = processSection.getBoundingClientRect();
  const travel = processSection.offsetHeight - window.innerHeight;
  const progress = clamp(-bounds.top / Math.max(travel, 1), 0, 1);
  const index = Math.min(processChapters.length - 1, Math.floor(progress * processChapters.length));
  processChapters.forEach((chapter, chapterIndex) => chapter.classList.toggle('is-active', chapterIndex === index));
  if (processCounter) processCounter.textContent = String(index + 1).padStart(2, '0');
  if (processProgress) processProgress.style.width = `${((index + 1) / processChapters.length) * 100}%`;
  if (processArt && !reduceMotion) processArt.style.setProperty('--process-turn', `${progress * 46 - 16}deg`);
}
function requestProcessUpdate() {
  if (!processFrame) processFrame = requestAnimationFrame(updateProcess);
}
window.addEventListener('scroll', requestProcessUpdate, { passive: true });
window.addEventListener('resize', requestProcessUpdate);
requestProcessUpdate();

// Mobile menu behavior is shared by every page.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    mainNav.classList.toggle('is-open', !open);
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mainNav.classList.remove('is-open');
  }));
}

// The contact form assembles a draft email; it does not store or transmit data.
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const subject = encodeURIComponent(`Project enquiry — ${formData.get('project')}`);
    const body = encodeURIComponent(`Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\nProject: ${formData.get('project')}\n\n${formData.get('message')}`);
    window.location.href = `mailto:rayyansalmani936@gmail.com?subject=${subject}&body=${body}`;
    const feedback = document.querySelector('[data-form-feedback]');
    if (feedback) feedback.textContent = 'Your email app should open with the draft ready.';
  });
}
