<template>
  <div id="tormb-app" class="col-sm-4" v-cloak>

    <h1>纪念 <br>
      <small>To Remember</small>
    </h1>

    <div id="tormb-item-container">
      <ul class="list-group" v-bind:class="{ loading: isGettingItems }">

        <!-- 纪念日 list -->
        <li
          class="tormb-item list-group-item"
          v-for="(tormbItem, index) in tormbItems"
          v-bind:key="tormbItem.tormb_id"
        >
          <div v-show="tormbItem !== editingItem">
            <span class="tormb-item-addon">{{ getDaysDiff(tormbItem) === 0 ? "今天是" : "距离" }}</span>
            <span class="tormb-item-content">{{ tormbItem.content }}</span>
            <span class="tormb-item-til" v-if="getDaysDiff(tormbItem) === 0"></span>
            <span class="tormb-item-til" v-else-if="getDaysDiff(tormbItem) < 0">已经过去</span>
            <span class="tormb-item-til" v-else>还有</span>
            <span class="tormb-item-timediff" v-if="getDaysDiff(tormbItem) === 0"></span>
            <span class="tormb-item-timediff" v-else-if="getDaysDiff(tormbItem) < 0">{{ getDaysDiff(tormbItem) * -1 }}</span>
            <span class="tormb-item-timediff" v-else>{{ getDaysDiff(tormbItem) }}</span>
            <span class="tormb-item-timeunit">{{ getDaysDiff(tormbItem) === 0 ? "" : "天" }}</span>

            <!-- 纪念日删除/编辑按钮 -->
            <span class="tormb-item-control">
              <a class="tormb-item-edit" v-on:click.prevent="editTormb(tormbItem)">
                <span class="icon fa fa-pencil"></span>
              </a>
              <a class="tormb-item-delete" v-on:click.prevent="removeItem(index)">
                <span class="icon fa fa-trash"></span>
              </a>
            </span>
          </div>

          <!-- 纪念日编辑界面 -->
          <div v-show="tormbItem === editingItem">
            <form class="form" role="form" v-on:submit.prevent>

              <!-- 内容 -->
              <div class="form-group">
                <input
                  class="form-control tormb-content"
                  type="text"
                  placeholder="要记住什么日子？"
                  v-model.trim="tormbItem.content"
                >
              </div>

              <!-- 日期 -->
              <div class="form-group input-group">
                <span class="input-group-addon"><span class="icon fa fa-calendar"></span></span>
                <input
                  class="form-control tormb-date"
                  type="text"
                  placeholder="日期"
                  v-model.trim="tormbItem.date"
                  v-on:click="handleDateEdit($event.target, tormbItem)"
                >
                <span class="input-group-addon">
                  <label>
                    <input
                      class="tormb-annual"
                      type="checkbox"
                      v-model="tormbItem.is_annual"
                    >每年提醒
                  </label>
                </span>
              </div>

              <!-- 确定/取消按钮 -->
              <button
                id="submitTormbItemEdit"
                class="btn btn-success btn-sm"
                v-on:click="doneEdit(tormbItem)"
              >
                <span class="icon fa fa-check"></span> 确定
              </button>
              <button
                id="cancelTormbItemEdit"
                class="btn btn-default btn-sm"
                v-on:click="cancelEdit(tormbItem)"
              >
                <span class="icon fa fa-close"></span> 取消
              </button>
            </form>
          </div>
        </li><!-- 结束当前纪念日 -->
      </ul>
    </div><!-- 纪念日列表容器结束 -->

    <!-- 添加新纪念日界面 -->
    <div id="tormb-add">

      <!-- 显示新纪念日编辑器的按钮 -->
      <div
        id="tormb-add-btn"
        v-show="!isAddingSeen"
        v-on:click="showAddingForm"
      >
        <span><span class="icon fa fa-plus"></span> 添加一个日子</span>
      </div>

      <!-- 新纪念日编辑器表单 -->
      <div id="tormb-add-form" v-show="isAddingSeen">
        <form class="form" role="form" v-on:submit.prevent>

          <!-- 新纪念日内容 -->
          <div class="form-group">
            <input
              class="form-control"
              id="inputNewTormbContent"
              type="text"
              placeholder="要记住什么日子？"
              autocomplete="off"
              v-model.trim="newTormb.content"
              v-on:keyup.enter="moveFocus"
              v-on:keyup.esc="cancelAdd"
            >
          </div>

          <!-- 新纪念日日期 -->
          <div class="form-group input-group">
            <span class="input-group-addon"><span class="icon fa fa-calendar"></span></span>
            <input
              class="form-control"
              id="inputNewTormbDate"
              type="text"
              placeholder="日期"
              autocomplete="off"
              v-model.trim="newTormb.date"
              v-on:click="activateNewTormbDatePicker"
              v-on:keyup.enter="addItem"
              v-on:keyup.esc="cancelAdd"
            >
            <span class="input-group-addon">
              <label>
                <input type="checkbox" v-model="newTormb.is_annual">每年提醒
              </label>
            </span>
          </div>
        </form>

        <!-- 添加/取消新纪念日按钮 -->
        <button
          class="btn btn-success"
          v-bind:disabled="isAddingItem"
          v-on:click="addItem"
        >
          <span class="icon fa fa-plus"></span> 添加
        </button>
        <button
          class="btn btn-default"
          v-on:click="cancelAdd"
        >
          <span class="icon fa fa-close"></span> 取消
        </button>
      </div>
    </div><!-- 添加新纪念日界面结束 -->

    <!-- 错误信息 -->
    <div class="alert alert-danger" role="alert" v-show="errorMsg.hasError">
      <strong>发生错误！</strong>{{ errorMsg.text }}
    </div>

  </div><!-- 纪念日应用结束 -->

</template>

<script>
  import qs from 'qs';
  import axios from 'axios';
  export default {

    name: 'tormb-app',

    data: function() {

      return {

        tormbItems: [
//          {
//            "tormb_id": 1,
//            "user_id": 1,
//            "content": '我的生日',
//            "date": "2018-01-13",
//            "is_annual": 1
//          }
        ],

        editingItem: null,

        beforeEditCache: {
          content: '',
          date: '',
          is_annual: false
        },

        newTormb: {
          tormb_id: 0,
          content: '',
          date: '',
          is_annual: false
        },

        isGettingItems: false,

        isAddingItem: false,

        isAddingSeen: false,

        STORAGE_KEY: 'tormb-app',

        errorMsg: {
          hasError: false,
          text: '',
          map: {
            // get
            101: '提交的用户ID不正确。',
            // add
            201: '找不到对应用户ID。',
            202: '无法添加该记录到数据库。',
            // edit
            301: '数据库中没有这个纪念日。',
            302: '编辑纪念日失败。',
            // recycle
            401: '数据库中没有这个纪念日',
            402: '自更新纪念日失败。',
            // remove
            501: '数据库中没有这个纪念日。',
            502: '删除纪念日失败。',
            // common
            600: '提交的数据有误。',
            // no correct response
            'nores': '服务器发生错误。',
            // 提交了空值
            'emptycontent': '没有输入纪念日',
            'emptydate': '没有输入日期',
            // 日期错误
            'invaliddate': '输入的日期不对，请检查（格式需为“2000-01-01”）',
            // other
            'other': ''
          }
        }

      }

    },

    computed: {

      isSignIned: function() {
        return this.$store.state.auth.isSignIned;
      }

    },

    watch: {
      // 纪念日数据发生变化，也就是被正确地更改后清除错误信息
      tormbItems: {
        deep: true,
        handler: function() {
          this.dismissErrorMsg();
        }
      }
    },

    methods: {

      // 获取
      getTormbItems: function() {

        if (this.isSignIned) {

          if (this.isGettingItems) {return;}

          this.isGettingItems = true;

          this.tormbItems = [];

          let requestData = {
            user_id: this.$store.state.auth.user_id
          }

          axios
          .get(
            '/api/tormb_get.php',
            {
              params: requestData
            }
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  let data = res.data.data;
                  // 把 1 转换为 true，0 转换为 false
                  if (data.tormbItems.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                      data.tormbItems[i]['is_annual'] = !!data.tormbItems[i]['is_annual'];
                    }
                    this.tormbItems = data.tormbItems;
                  }
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

        } else {
          if (!localStorage.getItem(this.STORAGE_KEY)) {
            // 未登录且没有本地记录时插入一条当天的记录
            let today = new Date();
            let YEAR = today.getFullYear();
            let MONTH = today.getMonth() + 1;
            let DATE = today.getDate();
            let defaultLocalTormbs = [
              {
                tormb_id: 1,
                content: YEAR + '年' + MONTH + '月' + DATE + '日',
                date: [YEAR, MONTH, DATE].join('-'),
                is_annual: false,
              },
              {
                tormb_id: 2,
                content: '下一个国庆节',
                date: '2017-10-01',
                is_annual: true,
              }
            ];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultLocalTormbs));
            this.tormbItems = defaultLocalTormbs;
          } else {
            this.tormbItems =  JSON.parse(localStorage.getItem(this.STORAGE_KEY));
          }
        }
      },

      // 添加
      addItem: function () {

        if (this.isAddingItem) {return;}

        if (!this.newTormb.content) {
          this.showErrorMsg('emptycontent');
          document.getElementById('inputNewTormbContent').focus();
          return;
        }

        if (!this.newTormb.date) {
          this.showErrorMsg('emptydate');
          document.getElementById('inputNewTormbDate').focus();
          return;
        }

        if (this.verifyDate(this.newTormb.date)) {

          if (this.isSignIned) {

            this.isAddingItem = true;

            let requestData = qs.stringify({
              user_id: this.$store.state.auth.user_id,
              content: this.newTormb.content,
              date: this.newTormb.date,
              is_annual: this.newTormb.is_annual === true ? 1 : 0
            });

            axios
            .post(
              '/api/tormb_add.php',
              requestData
            )
            .then(
              (res) => {
                if (res) {
                  if (res.data.status.code === 0) {
                    res.data.data['is_annual'] = !!res.data.data['is_annual'];
                    this.tormbItems.push(res.data.data);
                    this.cancelAdd();
                  } else {
                    this.showErrorMsg(res.data.status.code);
                  }
                } else {
                  this.showErrorMsg('nores');
                }
                this.isAddingItem = false;
              }
            )
            .catch(
              (error) => {
                this.isAddingItem = false;
                this.showErrorMsg('other', error);
              }
            );

          } else {

            this.newTormb.tormb_id = this.tormbItems[0] ? (this.tormbItems[this.tormbItems.length - 1]['tormb_id'] + 1) : 1;
            this.tormbItems.push(this.newTormb);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tormbItems));

            this.cancelAdd();
          }
        } else {
          this.showErrorMsg('invaliddate');
          document.getElementById('inputNewTormbDate').focus();
        }
      },

      cancelAdd: function () {
        this.newTormb = {
          tormb_id: 0,
          content: '',
          date: '',
          is_annual: false
        };
        this.isAddingSeen = false;
      },

      showAddingForm: function () {
        this.isAddingSeen = true;
        setTimeout(function () {
          document.getElementById('inputNewTormbContent').focus();
        }, 0);
      },

      // 编辑
      editTormb: function (tormb) {

        this.beforeEditCache.content = tormb.content;
        this.beforeEditCache.date = tormb.date;
        this.beforeEditCache.is_annual = tormb.is_annual;

        this.editingItem = tormb;
      },

      cancelEdit: function (tormb) {

        tormb.content = this.beforeEditCache.content;
        tormb.date = this.beforeEditCache.date;
        tormb.is_annual = this.beforeEditCache.is_annual;

        this.editingItem = null;
      },

      doneEdit: function (tormb) {

        if (!this.editingItem) {
          return;
        }
        if (!tormb.content) {
          this.showErrorMsg('emptycontent');
          return;
        }
        if (!tormb.date) {
          this.showErrorMsg('emptydate');
          return;
        }

        if (this.verifyDate(tormb.date)) {

          if (this.isSignIned) {

            let requestData = qs.stringify({
              tormb_id: this.editingItem.tormb_id,
              content: this.editingItem.content,
              date: this.editingItem.date,
              is_annual: this.editingItem.is_annual ? 1 : 0,
              user_id: this.$store.state.auth.user_id
            });

            axios
            .post(
              '/api/tormb_edit.php',
              requestData
            ).then(
              (res) => {
                if (res) {
                  if (res.data.status.code === 0) {
                    let data = res.data.data;
                    tormb.content = data.content;
                    tormb.date = data.date;
                    tormb.is_annual = !!data.is_annual;
                    this.editingItem = null;
                  } else {
//                    this.cancelEdit(tormb);
                    this.showErrorMsg(res.data.status.code);
                  }
                } else {
                  this.showErrorMsg('nores');
                }
              }
            )
            .catch(
              (error) => {
//                this.cancelEdit(tormb);
                this.showErrorMsg('other', error);
              }
            );

          } else {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tormbItems));
            this.editingItem = null;
          }
        } else {
          this.showErrorMsg('invaliddate');
        }
      },

      // 更新每年提醒的纪念日的日期
      recycleAnnualItem: function (tormb) {

        let ymdArr = tormb.date.split('-', 3);
        ymdArr[0]++;
        let newDate = ymdArr.join('-');

        if (this.isSignIned) {

          let requestData = qs.stringify({
            tormb_id: tormb.tormb_id,
            date: newDate,
            user_id: this.$store.state.auth.user_id
          });

          axios
          .post(
            '/api/tormb_recycle.php',
            requestData
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  tormb.date = newDate;
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

        } else {
          tormb.date = newDate;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tormbItems));
        }
      },

      // 删除
      removeItem: function (index) {

        if (this.isSignIned) {

          let requestData = {
            tormb_id: this.tormbItems[index]['tormb_id'],
            user_id: this.$store.state.auth.user_id
          }

          axios
          .get(
            '/api/tormb_remove.php',
            {
              params: requestData
            }
          )
          .then(
            (res) => {
              if (res) {
                if (res.data.status.code === 0) {
                  this.tormbItems.splice(index, 1);
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

        } else {
          this.tormbItems.splice(index, 1);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tormbItems));
        }
      },

      // 计算纪念日与当前时间相差天数
      getDaysDiff: function (tormb) {
        let ymdArray = tormb.date.split('-', 3);
        ymdArray[1]--;
        let itemDateMS = new Date(ymdArray[0], ymdArray[1], ymdArray[2]);
        const MILLISECOND_IN_A_DAY = 86400000;
        let diff = (Date.parse(itemDateMS) - Date.now()) / MILLISECOND_IN_A_DAY;

        if (Math.ceil(diff) < 0 && tormb.is_annual) {
          this.recycleAnnualItem(tormb);
          return this.getDaysDiff(tormb);
        }
        return Math.ceil(diff);
      },

      verifyDate: function (date) {

        const DATE_PATTERN = /^(19[0-9][0-9]|20[0-9][0-9])-(0[0-9]|1[0-2])-(0[0-9]|[1-2][0-9]|3[01])$/g;

        if (DATE_PATTERN.test(date)) {

          let ymdArr = date.split('-', 3);
          let year = ymdArr[0]
          let month = ymdArr[1]
          let day = ymdArr[2]

          if ((month === '01' || month === '03' || month === '05' || month === '07' || month === '08' || month === '10' || month === '12') && day > 31) {
            return false;
          } else if ((month === '04' || month === '06' || month === '09' || month === '11') && day > 30) {
            return false;
          } else if (month === '02') {
            let isleap = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))
            if (day > 29 || (day === '29' && !isleap)) {
              return false;
            }
          }

          return true;

        } else {
          return false;
        }
      },

      moveFocus: function () {
        document.getElementById('inputNewTormbDate').focus();
      },

      // 使 jQuery UI datepicker 正常工作的函数
      activateNewTormbDatePicker: function() {
        let $input = $('#inputNewTormbDate');
        $input.datepicker({
          onClose: this.handleNewTormbDatePick
        });
        $input.datepicker('show');
      },

      handleNewTormbDatePick: function(date) {
        this.newTormb.date = date;
      },

      handleDateEdit: function(el, tormbItem) {
        if (el) {
          $(el).datepicker({
            onClose: function (date) {
              tormbItem.date = date;
            }
          });
          $(el).datepicker('show');
        }
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

    created: function () {

      this.getTormbItems();

      // 设置 datepicker 默认设置
      $.datepicker.setDefaults({
        yearRange: "1970:2050",
        changeYear: true,
        changeMonth: true,
        closeText: "关闭",
        prevText: "&#x3C;上月",
        nextText: "下月&#x3E;",
        currentText: "今天",
        monthNames: [ "一月","二月","三月","四月","五月","六月",
          "七月","八月","九月","十月","十一月","十二月" ],
        monthNamesShort: [ "一月","二月","三月","四月","五月","六月",
          "七月","八月","九月","十月","十一月","十二月" ],
        dayNames: [ "星期日","星期一","星期二","星期三","星期四","星期五","星期六" ],
        dayNamesShort: [ "周日","周一","周二","周三","周四","周五","周六" ],
        dayNamesMin: [ "日","一","二","三","四","五","六" ],
        weekHeader: "周",
        dateFormat: "yy-mm-dd",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: "年"
      });

    }
  };
</script>

<style lang="scss" scoped>

label {
  cursor: pointer;
}

.tormb-item-control {
  float: right;
  .tormb-item-edit {
    margin-right: 10px;
  }
  a:hover {
    text-decoration: none;
  }
}

#tormb-add {

  margin-bottom: 30px;

  #tormb-add-btn {
    span:first-of-type {
      cursor: pointer;
    }
  }
  #tormb-add-form {
    label {
      cursor: pointer;
    }
  }
}

.tormb-item-control a {
  cursor: pointer;
}

.loading {
  min-height: 30px;
  background: url('../../../static/img/loading.gif') center center/30px 30px no-repeat;
}

</style>
