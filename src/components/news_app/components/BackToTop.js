const BackToTop = (function () {

  // opt = {
  //   el: '#btn',
  //   scrollToShow: 500
  // }

  function _BackToTop(opt) {
    this.btn = $(opt.el);
    this.scrollToShow = opt.scrollToShow;
    this.bindBtnClick();
    this.bindWindowScroll();
  }

  _BackToTop.prototype.toggleBtn = function () {
    if (this.isBottom()) {
      this.btn.css('display', 'block');
    } else {
      this.btn.css('display', 'none');
    }
  }

  _BackToTop.prototype.isBottom = function () {
    let windowScrollTop = $(window).scrollTop();
    return windowScrollTop >= this.scrollToShow;
  }

  _BackToTop.prototype.bindBtnClick = function () {
    this.btn.click(function () {
      $(window).scrollTop(0);
    });
  }

  _BackToTop.prototype.bindWindowScroll = function () {
    $(window).scroll(() => {
      this.toggleBtn();
    });
  }

  return {
    init: function (opt) {
      new _BackToTop(opt);
    }
  }

})();

export default BackToTop;
