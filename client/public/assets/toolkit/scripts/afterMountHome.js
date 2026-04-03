document.addEventListener("DOMContentLoaded", function () {
  if (window.$ && $.fn && $.fn.chosen) {
    $(".chosen-select").chosen();
  }
});
