import '@hotwired/turbo-rails'
import 'controllers'

document.addEventListener('turbo:load', () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const toggleClass = () => {
    if (window.scrollY > 10) {
      nav.classList.add('navbar-shadow');
    } else {
      nav.classList.remove('navbar-shadow');
    }
  };
  toggleClass();
  window.addEventListener('scroll', toggleClass);
});
