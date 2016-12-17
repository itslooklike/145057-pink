window.onload = function () {
  var header = document.querySelector('.header');
  var burger = document.querySelector('.header__burger-wrap');

  burger.addEventListener('click', function () {
    header.classList.toggle('active');
  });
}
