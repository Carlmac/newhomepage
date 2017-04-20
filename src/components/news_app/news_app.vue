<template>
  <div id="news-app">

    <div class="container">

      <ul class="news-wrap">

        <!-- 每条新闻的 li -->
        <!--<li class="news-item">
          <div class="thumbnail">
            <img src="newsItem.imgSrc">
            <div class="caption">
              <h3>title</h3>
              <p>intro</p>
            </div>
          </div>
        </li>-->

        <!-- 用来计算初始宽度 -->
        <li class="news-item hidden"></li>
      </ul>

      <p class="load-notice">下滑显示更多</p>

    </div>

    <div id="btn-to-top">回到顶部</div>

  </div>
</template>

<script>
import BackToTop from './components/BackToTop';
export default {

  name: 'news-app',

  data: function() {
    return {

      requestConfig: {
        start: 1,
        newsPerRequest: 6
      },

      timer: null,

      isLoading: false,

      // 共多少列
      colLength: 3,

      colHeightArr: []

    }
  },

  methods: {

    isVisible: function($node) {
      if (!$node) return;
      let nodeOffsetTop = $node.offset().top;
      let nodeHeight = $node.outerHeight();
      let windowScrollTop = $(window).scrollTop();
      let windowHeight = $(window).height();

      if ((nodeOffsetTop - windowHeight) < windowScrollTop && windowScrollTop < (nodeOffsetTop + nodeHeight)) {
        return true;
      } else {
        return false;
      }
    },

    watchNews: function() {
      if (this.isVisible($('.load-notice')) && !this.isLoading) {
        let thisComp = this;
        this.getNews(
          function(newsArr) { // 这个匿名函数是 jsonp 的回调函数
            for (let i = 0; i < newsArr.length; i++) {
              let curNewsObj = {
                url: newsArr[i].url,
                imgSrc: newsArr[i].img_url,
                title: newsArr[i].name,
                intro: newsArr[i].short_intro
              };
              let $newsItemNode = thisComp.createNode(curNewsObj);
              (function($node) {
                $node.find('img').on('load', function() {
                  $node.appendTo($('.news-wrap'));
                  thisComp.renderWaterfall($node);
                });
              })($newsItemNode);
            }
          }
        );
      }
    },

    getNews: function(callback) {
      this.isLoading = true;
      $.ajax({
        url: 'http://platform.sina.com.cn/slide/album_tech',
        data: {
          app_key: '1271687855',
          num: this.requestConfig.newsPerRequest,
          page: this.requestConfig.start
        },
        dataType: 'jsonp',
        jsonp: 'jsoncallback'
      }).done((res) => {
        if (res && res.status.code === '0') {
          callback(res.data);             // 获取成功后调用回调函数
          this.requestConfig.start++;
          this.isLoading = false;
          this.watchNews();
        } else {
          console.log('请求新闻时发生错误');
          this.isLoading = false;
        }
      }).fail(() => {
        console.log('请求失败，请重试');
        this.isLoading = false;
      });
    },

    renderWaterfall: function($node) {
      let minColHeight = Math.min.apply(null, this.colHeightArr);
      let indexOfMinColHeight = this.colHeightArr.indexOf(minColHeight);
      $node.css({
        top: minColHeight + 'px',
        left: $node.outerWidth(true) * indexOfMinColHeight + 'px'
      });
      this.colHeightArr[indexOfMinColHeight] += $node.outerHeight(true);
      $('.news-wrap').height(Math.max.apply(null, this.colHeightArr));
    },

    createNode: function(newsObj) {
      let html = [
        '<li class="news-item">',
          '<div class="thumbnail">',
            '<a href="', newsObj.url, '" target="_blank">',
              '<img src="', newsObj.imgSrc, '"', 'alt="', newsObj.title, '"', '>',
            '</a>',
            '<div class="caption">',
              '<h3>', '<a href="', newsObj.url, '" target="_blank">', newsObj.title, '</a>', '</h3>',
              '<p>', newsObj.intro, '</p>',
            '</div>',
          '</div>',
        '</li>'
      ].join('');
      return $(html);
    },

    windowScrollHandler: function() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.watchNews();
      }, 300);
    },

    bindWindowScroll: function() {
      $(window).on('scroll', this.windowScrollHandler);
    },

    unbindWindowScroll: function() {
      $(window).off('scroll', this.windowScrollHandler);
    }

  },

  created: function() {
    // 初始化每列的高度
    for (let i = 0; i < this.colLength; i++) {
      this.colHeightArr[i] = 0;
    }

  },

  mounted: function() {

    this.bindWindowScroll();

    this.watchNews();

    BackToTop.init({
      el:'#btn-to-top',
      scrollToShow: 1000
    });

  },

  beforeDestroy: function() {
    this.unbindWindowScroll();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  .news-wrap {
    position: relative;
    max-width: 960px;
    margin: 10px auto;
  }
  .news-item {
    position: absolute;
    box-sizing: border-box;
    width: 300px;
    margin-top: 10px;
    margin-right: 20px;
    list-style: none;
  }
  .news-item a {
    text-decoration: none;
  }
  .news-item a:hover {
    text-decoration: underline;
  }
  .load-notice {
    position: absolute;
    /* footer 高度为 60px，所以 bottom 值为 60px */
    bottom: 60px;
    width: 960px;
    margin: 0 auto;
    line-height: 2;
    text-align: center;
  }
  .news-item.hidden {
    display: none;
  }
  .load-notice {
    visibility: hidden;
  }

  #btn-to-top {
    display: none;
    position: fixed;
    right: 10px; bottom: 80px;
    width: 100px;
    height: 40px;
    border-radius: 5px;
    background-color: #333;
    line-height: 40px;
    text-align: center;
    color: #fff;
    cursor: pointer;
  }

</style>
