<template>

  <div id="chatboard-app" class="col-sm-4" v-cloak>

    <h1>留言 <br><small>To Talk</small></h1>

    <div id="msg-box">

      <!-- 留言输入区 -->
      <form
        action=""
        method="POST"
        id="msg-form"
        v-on:submit.prevent
        v-show="isSignIned"
      >
        <div>
          <textarea
            id="input-content"
            v-model.trim="newMsgContent"
          ></textarea>
        </div>
        <div class="msg-form-control">
          <p>
            <span>
              {{ msgLengthLeft >= 0 ? '还能输入' : '已超出' }}
            </span>
            <strong
              class="counter-result-text"
              v-bind:style="{ color: msgLengthLeft >= 0 ? '' : '#FF6600' }"
            >
              {{ msgLengthLeft >= 0 ? msgLengthLeft : (msgLengthLeft * -1) }}
            </strong>
            <span>个字</span>
            <input
              class="btn btn-default"
              id="msg-submit-btn"
              type="submit"
              value="发布"
              title="快捷键 Ctrl+Enter"
              v-bind:disabled="isSubmitting"
              v-on:click.prevent="postMessage"
            >
          </p>
        </div>
        <input type="hidden" name="token" value="">
      </form>

      <!-- 未登录提醒文本 -->
      <p
        class="text-center"
        id="chatboard-unsignined-alert"
        v-show="!isSignIned"
      >
        留言功能目前只对注册用户开放
      </p>

      <!-- 留言 -->
      <div class="msg-list-wrap">
        <ul class="nav nav-tabs">
          <li class="active"><a href="javascript:void(0);">大家在说</a></li>
        </ul>
        <ul id="msg-list" class="clearfix" v-bind:class="{ loading: isGettingItems }">
          <!-- 留言 list -->
          <li
            v-for="(message, index) in messages"
            v-on:mouseenter="toggleManagementBtns($event)"
            v-on:mouseleave="toggleManagementBtns($event)"
          >
            <div class="user-avatar">
              <img v-bind:src="getAvatarURL(message)">
            </div>
            <div class="user-name">
              <a href="javascript:void(0);">{{ message.user_name }}</a>:
            </div>
            <div class="content clearfix">
              <div class="msg-content">
                {{ message.content }}
              </div>
              <div class="times">
                <span>
                  {{ message.post_time }}
                </span>
                <!-- 留言点赞功能暂时取消 -->
                <!--<a-->
                  <!--class="msg-like"-->
                  <!--v-on:click.prevent="likeMessage(message)"-->
                <!--&gt;-->
                  <!--<i class="icon fa fa-thumbs-o-up"></i>-->
                  <!--{{ message.likes }}-->
                <!--</a>-->
                <span
                  class="msg-management"
                  v-if="message.user_id === $store.state.auth.user_id || $store.state.auth.user_level === 0"
                >
                  <!-- 留言编辑功能暂时关闭 -->
                  <!--<a-->
                    <!--class="msg-edit-btn"-->
                    <!--v-bind:href="getEditURL(message)"-->
                  <!--&gt;编辑</a>-->
                  <a
                    class="msg-del-btn"
                    v-on:click.prevent="deleteMessage(message, index)"
                  >删除</a>
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div><!-- 留言结束 -->
    </div>

    <!-- 留言页码 -->
    <nav class="page-nav">
      <ul class="pagination pagination-sm">

        <!-- 上一页 -->
        <li
          v-show="(paginationData.pages > 1) && (paginationData.currentPage > 0)"
          v-on:click.prevent="getMessages(paginationData.currentPage - 1)"
        >
          <a>
            <span aria-hidden="true">
              &laquo;
            </span>
          </a>
        </li>

        <!-- 页码 -->
        <li
          v-for="(page, index) in paginationData.pages"
          v-bind:class="index === paginationData.currentPage ? 'active' : ''"
          v-on:click.prevent="getMessages(index)"
        >
          <a class="page-link">
            {{ index + 1 }}
          </a>
        </li>

        <!-- 下一页 -->
        <li
          v-show="(paginationData.pages > 1) && (paginationData.currentPage < (paginationData.pages - 1))"
          v-on:click.prevent="getMessages(paginationData.currentPage + 1)"
        >
          <a>
            <span aria-hidden="true">
              &raquo;
            </span>
          </a>
        </li>

      </ul>
    </nav>

    <!-- 错误信息 -->
    <div class="alert alert-danger" role="alert" v-show="errorMsg.hasError">
      <strong>发生错误！</strong>{{ errorMsg.text }}
    </div>

  </div>

</template>

<script>
  import qs from 'qs';
  import axios from 'axios';
  import msgPagination from './components/message_pagination';
  import msgPageSwitcher from './components/message_page_switcher';

  export default {

    name: 'chatboard-app',

    data: function() {

      return {
        // 留言队列
        messages: [
//          {
//            message_id: 2,
//            user_id: 1,
//            avatar: 'avatar',
//            user_name: 'CJ',
//            content: 'some text',
//            post_time: '2017-01-01 23:00:00'
//          }
        ],

        // textarea 中的内容
        newMsgContent: '',

        // 留言字数限制
        msgLengthLimit: 140,

        // 留言导航数据
        paginationData: {
          display: 10,       // 每次显示多少条留言
          currentPage: 0,    // 记录当前留言页码，初始值为0，即从第1页开始显示
          pages: 0           // 留言页数
        },

        isGettingItems: false,

        isSubmitting: false,

        deleteTimer: null,

        errorMsg: {
          hasError: false,
          text: '',
          map: {
            // add
            101: '找不到对应用户ID。',
            102: '无法添加该留言到数据库。',
            // remove
            201: '数据库中没有这条留言。',
            202: '删除留言失败。',
            // common
            600: '提交的数据有误。',
            // no correct response
            'nores': '服务器发生错误。',
            // 提交了空 todo
            'empty': '留言内容不能为空',
            'textoverflow': '留言超出了限制字数',
            'notsignined': '留言功能目前只对注册用户开放',
            // other
            'other': ''
          }
        }

      }

    },

    computed: {

      // 获取剩余可输入留言长度
      msgLengthLeft: function () {
        return this.msgLengthLimit - this.newMsgContent.length;
      },

      // 保存当前输入的留言长度
      msgCurrentLength: function() {
        return this.newMsgContent.length;
      },

      isSignIned: function() {
        return this.$store.state.auth.isSignIned;
      }

    },

    watch: {
      // messages 发生变化，也就是被正确地更改后清除错误信息
      messages: {
        deep: true,
        handler: function() {
          this.dismissErrorMsg();
        }
      }
    },

    methods: {

      // 获取
      getMessages: function (index) {

        // 如果要切换到的页码等于当前页码，就退出
        if (index === this.paginationData.currentPage) {
          return;
        }

        this.isGettingItems = true;

        index = index || 0;

        let requestData = {
          start: index * this.paginationData.display, // 计算数据库记录开始位置，位置=页码序号 * 每页显示留言数
          display: this.paginationData.display        // 每次请求留言的数量
        };

        axios
        .get(
          '/api/chatboard_get_msg.php',
          {
            params: requestData
          }
        )
        .then(
          (res) => {
            if (res) {
              if (res.data.status.code === 0) {
                this.messages = res.data.data.messages;
                // 更新当前页码
                this.paginationData.currentPage = index;
                // 更新页数
                this.paginationData.pages = Math.ceil(res.data.data.messages_length / this.paginationData.display);
              } else {
                this.showErrorMsg(res.data.status.code);
              }
            } else {
              this.showErrorMsg('nores');
            }
            this.isGettingItems = false;
          }
        )
        .catch(
          (error) => {
            this.isGettingItems = false;
            this.showErrorMsg('other', error);
          }
        );

      },

      // 添加
      postMessage: function () {

        if (!this.isSignIned) {
          this.showErrorMsg('notsignined');
          return;
        }

        if (this.isSubmitting) {
          return;
        }

        let inputContent = document.querySelector('#input-content');

        if (this.newMsgContent === '') {
          this.showErrorMsg('empty');
          inputContent.focus();
          return;
        }

        if (this.msgCurrentLength > this.msgLengthLimit) {
          this.showErrorMsg('textoverflow');
          inputContent.focus();
          return;
        }

        this.isSubmitting = true;

        let requestData = qs.stringify({
          user_id: this.$store.state.auth.user_id,
          content: this.newMsgContent
        });

        axios
        .post(
          '/api/chatboard_post_msg.php',
          requestData
        )
        .then(
          (res) => {
            if (res) {
              if (res.data.status.code === 0) {
                this.messages.unshift(res.data.data);
                this.newMsgContent = '';
              } else {
                this.showErrorMsg(res.data.status.code);
              }
            } else {
              this.showErrorMsg('nores');
            }
            this.isSubmitting = false;
          }
        )
        .catch(
          (error) => {
            this.isSubmitting = false;
            this.showErrorMsg('other', error);
          }
        );

      },

      // 删除
      deleteMessage: function (message, index) {

        // 检查是否登录
        if (!this.isSignIned) {
          return;
        } else {
          // 检查是否拥有删除权限：留言是该用户发布的或用户是管理员
          if (message.user_id !== this.$store.state.auth.user_id && this.$store.state.auth.user_level !== 0) {
            return;
          }
        }

        let requestData = {
          message_id: message.message_id,
          user_id: this.$store.state.auth.user_id
        };

        if (this.deleteTimer) {
          clearTimeout(this.deleteTimer);
        }
        // 在 300 毫秒内的多次点击只有最后一次有效
        this.deleteTimer = setTimeout(() => {
          axios
          .get(
            '/api/chatboard_delete_msg.php',
            {
              params: requestData
            }
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  this.messages.splice(index, 1);
                } else {
                  this.showErrorMsg(res.data.status.code);
                }
              } else {
                this.showErrorMsg('nores');
              }
            }
          )
          .catch(
            (error) => {
              this.showErrorMsg('other', error);
            }
          );
        }, 300);

      },

      // 鼠标移入移出时切换显示消息管理（编辑、删除）按钮
      toggleManagementBtns: function (event) {
        if (!this.isSignIned) {return}
        let msgManagement = event.target.querySelector('.msg-management');
        switch (event.type) {
          case 'mouseenter':
            msgManagement.classList.add('hover');
            break;
          case 'mouseleave':
            msgManagement.classList.remove('hover');
            break;
          default:
            break;
        }
      },

      getAvatarURL: function (message) {
        return './static/img/avatar/' + message.avatar + '_100.jpg';
      },

      showErrorMsg: function(errorcode, error) {
        if (!errorcode) {return;}
        this.errorMsg.hasError = true;
        if (error) {
          this.errorMsg.text = error.toString();
        } else {
          this.errorMsg.text = this.errorMsg.map[errorcode] + '(错误码：' + errorcode + ')';
        }
      },

      dismissErrorMsg: function() {
        if (this.errorMsg.hasError === false) {return;}
        this.errorMsg.hasError = false;
      }

    },

    created: function() {
      this.getMessages();
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

#msg-box {
  border-radius: 5px;

  form header {
    text-align: center;
    width: 100px;
    padding: 4px 0;
    margin: 0 auto 10px;
    color: white;
    text-shadow: -0.5px -0.5px 0.5px rgba(0, 0, 0, .8);
    position: relative;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: slateblue;
      z-index: -1;
      transform: skewX(-30deg);
      box-shadow: 5px 5px 1px rgba(0, 0, 0, .3);
    }
  }
} // end of #msg-box

#input-content {
  box-sizing: border-box;
  width: 100%;
  height: 80px;
  padding: 7px 10px;
  overflow: auto;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  color: #777;
  resize: none;
  transition: all .3s ease-in-out;

  &:focus {
    border: 1px solid rgba(106, 90, 205, 0.9);
    box-shadow: 2px 1px 4px -1px #aaa inset;
    outline: none;
  }
}

#chatboard-unsignined-alert {
  box-sizing: border-box;
  width: 100%;
  height: 80px;
  line-height: 80px;
}

#msg-box .msg-form-control {
  font-size: .8em;

  p strong.counter-result-text {
    font-size: 2em;
    padding: 0 10px;
  }

  p #msg-submit-btn {
    float: right;
  }
}

#msg-box {
  form div {
    position: relative;
    color: #999;
  }
  img {
    border-radius: 3px;
  }
  .msg-list-wrap {
    padding: 10px 0;

    ul {
      padding-left: 0;
    }
    #msg-list li {
      list-style: none;
      float: left;
      clear: both;
      box-sizing: border-box;
      width: 100%;
      padding: 5px;
      margin-top: 5px;
      -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .1));
      filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .1));
      position: relative;
      background: #fff;
      background: linear-gradient(210deg, transparent .75em, #fff 0);

      &::before {
        content: '';
        position: absolute;
        top: 0; right: 0;
        background: linear-gradient(to left bottom, transparent 50%, rgba(0, 0, 0, 0.2) 0, rgba(0, 0, 0, .3)) 100% 0 no-repeat;
        width: 0.867em;
        /* width = 1.155x */
        height: 1.5em;
        /* height = 2x */
        transform: translateY(-0.634em) rotate(-30deg);
        /* translateY = -0.845x */
        transform-origin: bottom right;
        /*border-bottoms-left-radius: 0.5em;*/
        box-shadow: -0.2em 0.2em 0.3em -0.1em rgba(0, 0, 0, 0.15);
      }

      &:hover, &.hover {
        background: #f9f5e3;
        background: linear-gradient(210deg, transparent .75em, #f9f5e3 0);
      }
    }

    .user-avatar {
      float: left;
      box-sizing: border-box;
      width: 35px;
      height: 35px;
      margin-right: 5px;
      display: inline;
      border: 1px solid #ccc;
      border-radius: 3px;

      img {
        max-width: 100%;
      }
    }

    .content {
      padding-left: 40px;
      padding-top: 20px;
      word-wrap: break-word;
    }

    .user-name {
      float: left;
      clear: right;
      a {
        color: #2b4a78;
        line-height: 1;
      }
    }

    .msg-content {
      float: left;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .times {
      float: left;
      clear: both;
      color: #889db6;
      font: .75em/1.5 Arial, sans-serif;
      margin-top: 5px;
      overflow: hidden;
      span {
        float: left;
      }
      .msg-like {
        display: inline-block;
        float: left;
        font: inherit;
        color: #889db6;
        margin-left: 10px;
        i {
          margin-right: 5px;
        }
        cursor: pointer;
      }
      .msg-management {
        display: none;
        margin-left: 20px;
        cursor: pointer;
        .msg-edit-btn {
          margin-right: 10px;
        }
        &:hover,
        &.hover {
          display: block;
        }
      }
    } // end of .times
  } // end of .msg-list-wrap
} // end of #msg-box

.page-nav {
  color: #444;
  font-size: .85em;
  margin-top: -20px;
  text-align: center;
  a:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}

.loading {
  padding: 30px 0;
  background: url('../../../static/img/loading.gif') center center/30px 30px no-repeat;
}

</style>
