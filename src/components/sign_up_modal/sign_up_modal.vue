<template>
  <div id="register-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">注册</h4>
        </div>
        <!-- modal body -->
        <div class="modal-body">

          <!-- 错误信息 -->
          <div class="alert alert-danger text-center" role="alert" v-show="errorMsg.hasError">
            {{ errorMsg.text }}
          </div>

          <form
            class="form-horizontal"
            id="register-form"
            v-show="!isRegisterSucceeded"
            v-on:submit.prevent
          >
            <!-- input email -->
            <div class="form-group" v-bind:class="registerData.email.validationState">
              <label for="input-register-email" class="col-sm-2 control-label">邮箱</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="input-register-email"
                  type="email"
                  name="email"
                  required="required"
                  maxlength="50"
                  autocomplete="off"
                  v-model="registerData.email.value"
                  v-on:input="verifyEmail(true)"
                >
              </div>
              <div class="help" v-bind:class="registerData.email.validationState">
                <!-- the first span below is to indent the help block -->
                <span class="col-sm-2"></span>
                <span class="col-sm-10 help-block">请输入正确的邮箱</span>
              </div>
            </div>
            <!-- input username -->
            <div class="form-group" v-bind:class="registerData.username.validationState">
              <label for="input-register-username" class="col-sm-2 control-label">昵称</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="input-register-username"
                  type="text"
                  name="user_name"
                  required="required"
                  maxlength="12"
                  v-model="registerData.username.value"
                  v-on:input="verifyUsername(true)"
                >
              </div>
              <div class="help" v-bind:class="registerData.username.validationState">
                <!-- the first span below is to indent the help block -->
                <span class="col-sm-2"></span>
                <span class="col-sm-10 help-block">正确的昵称为2至8位的汉字、字母、数字和“-”</span>
              </div>
            </div>
            <!-- input password -->
            <div class="form-group" v-bind:class="registerData.password_first.validationState">
              <label for="input-register-pass" class="col-sm-2 control-label">密码</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="input-register-pass"
                  type="password"
                  name="pass_first"
                  required="required"
                  maxlength="16"
                  v-model="registerData.password_first.value"
                  v-on:input="verifyPasswordFirst(true)"
                >
              </div>
              <div class="help" v-bind:class="registerData.password_first.validationState">
                <!-- the first span below is to indent the help block -->
                <span class="col-sm-2"></span>
                <span class="col-sm-10 help-block">正确的密码为6至16的字母、数字和下划线</span>
              </div>
            </div>
            <!-- confirm password -->
            <div class="form-group" v-bind:class="registerData.password_second.validationState">
              <label for="input-register-confirmation-pass" class="col-sm-2 control-label">确认密码</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="input-register-confirmation-pass"
                  type="password"
                  name="pass_second"
                  required="required"
                  maxlength="16"
                  v-model="registerData.password_second.value"
                  v-on:input="verifyPasswordSecond(true)"
                >
              </div>
              <div class="help" v-bind:class="registerData.password_second.validationState">
                <!-- the first span below is to indent the help block -->
                <span class="col-sm-2"></span>
                <span class="col-sm-10 help-block">两次输入的密码不一样</span>
              </div>
            </div>
            <!-- input full name -->
            <div class="form-group">
              <label for="input-lastname" class="col-sm-2 control-label">姓名</label>
              <div class="col-sm-5">
                <div class="input-group" v-bind:class="registerData.lastname.validationState">
                  <input
                    class="form-control"
                    id="input-lastname"
                    type="text"
                    name="last_name"
                    placeholder="姓氏"
                    maxlength="12"
                    v-model="registerData.lastname.value"
                    v-on:input="verifyLastname(true)"
                  >
                  <div class="input-group-addon">选填</div>
                </div>
              </div>
              <div class="col-sm-5">
                <div class="input-group" v-bind:class="registerData.firstname.validationState">
                  <input
                    class="form-control"
                    id="input-firstname"
                    type="text"
                    name="first_name"
                    placeholder="名字"
                    maxlength="12"
                    v-model="registerData.firstname.value"
                    v-on:input="verifyFirstname(true)"
                  >
                  <div class="input-group-addon">选填</div>
                </div>
              </div>
              <div class="help"
                   v-bind:class="verifyFullName() ? '' : 'has-error'"
              >
                <!-- the first span below is to indent the help block -->
                <span class="col-sm-2"></span>
                <span class="col-sm-10 help-block">正确的姓氏和名字各为1至12位汉字、字母和“-”，需全填或全空</span>
              </div>
            </div>
            <!-- choose avatar -->
            <div class="avatar-box">
              <p>请选择头像</p>
              <img
                v-for="avatar in avatarData.avatars"
                v-bind:class="avatar === avatarSelected ? 'selected': ''"
                v-bind:src="avatarData.baseURL + avatar + '_50.jpg'"
                v-bind:title="avatar"
                v-on:click.prevent="selectAvatar(avatar)"
              >
            </div>
            <input
              id="input-avatar-url"
              type="hidden"
              name="avatar_url"
              v-model="registerData.avatar.value"
            >
          </form>
          <!-- 注册成功的提示 -->
          <!--<p class="text-center" v-show="isRegisterSucceeded"><strong>注册成功</strong><br>2 秒后自动用注册信息登入</p>-->
          <div class="alert alert-success" role="alert" v-show="isRegisterSucceeded">
            <strong>注册成功</strong>&nbsp;&nbsp;2 秒后自动用注册信息登入
          </div>
        </div><!-- modal body -->

        <div class="modal-footer" v-show="!isRegisterSucceeded">
          <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
          <button
            class="btn btn-primary"
            id="register-submit-btn"
            type="button"
            v-bind:disabled="isSubmitting"
            v-on:click.prevent="submitRegisterForm"
          >
            注册
          </button>
        </div>
      </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->
</template>

<script>
import qs from 'qs';
import axios from 'axios';
export default {
  name: 'sign-up-modal',

  data: function() {
    return {

      registerData: {
        email: {
          value: '',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: /^[a-z][a-z0-9_]{1,30}@.+(\.[a-z]{2,3})+$/,
          timer: null
        },
        username: {
          value: '',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: /^[\u4e00-\u9fa5a-zA-z0-9-]{2,8}$/,
          timer: null
        },
        password_first: {
          value: '',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: /^[a-zA-Z0-9_]{6,16}$/,
          timer: null
        },
        password_second: {
          value: '',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: /^[a-zA-Z0-9_]{6,16}$/,
          timer: null
        },
        lastname: {
          value: '',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: /^[\u4e00-\u9fa5a-zA-z-]{1,12}$/,
          timer: null
        },
        firstname: {
          value: '',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: /^[\u4e00-\u9fa5a-zA-z\-]{1,12}$/,
          timer: null
        },
        avatar: {
          value: 'asn',
          validationState: '', // 'has-success' || 'has-error' || ''
          regex: null,
          timer: null
        }
      },

      avatarData: {
        baseURL: '../../../static/img/avatar/',
        avatars: [
          'asn',
          'beauty',
          'bojack',
          'cherry',
          'doge',
          'doraemon',
          'frog'
        ]
      },

      avatarSelected: 'asn',

      isSubmitting: false,

      isRegisterSuceeded: false,

      errorMsg: {
        hasError: false,
        text: '',
        map: {
          100: '注册失败，写入数据库时发生错误',
          200: '该邮箱已经被使用',
          300: '注册失败，提交的数据有误',
          // no correct response
          'nores': '服务器发生错误',
          'signined': '请登出后再注册',
          'invalidsignupdata': '你的注册信息没有填写正确',
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

  methods: {

    submitRegisterForm: function() {

      if (this.isSubmitting) {
        return;
      }
      if (this.isSignIned) {
        this.showErrorMsg('signined');
        return;
      }

      this.dismissErrorMsg();

      // 验证所有需要提交的数据
      if (this.verifyRegisterData()) {

        this.isSubmitting = true;

        let requestData = qs.stringify({
          email: this.registerData.email.value,
          user_name: this.registerData.username.value,
          pass1: this.registerData.password_first.value,
          pass2: this.registerData.password_second.value,
          last_name: this.registerData.lastname.value,
          first_name: this.registerData.firstname.value,
          avatar: this.registerData.avatar.value
        });

        axios
        .post(
          '/api/sign_up.php',
          requestData
        )
        .then(
          (res) => {
            if (res) {
              if (res.data.status.code === 0) {
                let userdata = res.data.data;
                this.$store.commit('signin', userdata);
                this.isSubmitting = false;
                this.isRegisterSucceeded = true;
                setTimeout(() => {
                  location.reload(true);
                },2000);
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

      } else {
        this.showErrorMsg('invalidsignupdata');
      }

    },

    verifyEmail: function(isDebounced) {

      const email = this.registerData.email;

      if (email.value === '') {
        email.validationState = '';
        if (email.timer) {
          clearTimeout(email.timer);
        }
        return false;
      }

      if (isDebounced) {       // if set timeout
        if (email.timer) {
          clearTimeout(email.timer);
        }
        email.timer = setTimeout(
          () => {
            if (email.regex.test(email.value)) {
              email.validationState = 'has-success';
              return true;
            } else {
              email.validationState = 'has-error';
              return false;
            }
          },
          750
        );
      } else {
        return email.regex.test(email.value);
      }
    },

    verifyUsername: function(isDebounced) {

      const username = this.registerData.username;

      if (username.value === '') {
        username.validationState = '';
        if (username.timer) {
          clearTimeout(username.timer);
        }
        return false;
      }

      if (isDebounced) {       // if set timeout
        if (username.timer) {
          clearTimeout(username.timer);
        }
        username.timer = setTimeout(
          () => {
            if (username.regex.test(username.value)) {
              username.validationState = 'has-success';
              return true;
            } else {
              username.validationState = 'has-error';
              return false;
            }
          },
          750
        );
      } else {
        return username.regex.test(username.value);
      }
    },

    verifyPasswordFirst: function(isDebounced) {

      const password_first = this.registerData.password_first;

      if (password_first.value === '') {
        password_first.validationState = '';
        if (password_first.timer) {
          clearTimeout(password_first.timer);
        }
        return false;
      }

      if (isDebounced) {       // if set timeout
        if (password_first.timer) {
          clearTimeout(password_first.timer);
        }
        password_first.timer = setTimeout(
          () => {
            if (password_first.regex.test(password_first.value)) {
              password_first.validationState = 'has-success';
              return true;
            } else {
              password_first.validationState = 'has-error';
              return false;
            }
          },
          750
        );
      } else {
        return password_first.regex.test(password_first.value);
      }
    },

    verifyPasswordSecond: function(isDebounced) {

      const password_second = this.registerData.password_second;
      const password_first = this.registerData.password_first;

      if (password_second.value === '') {
        password_second.validationState = '';
        if (password_second.timer) {
          clearTimeout(password_second.timer);
        }
        return false;
      }

      if (isDebounced) {       // if set timeout
        if (password_second.timer) {
          clearTimeout(password_second.timer);
        }
        password_second.timer = setTimeout(
          () => {
            if (password_second.regex.test(password_second.value) && password_second.value === password_first.value) {
              password_second.validationState = 'has-success';
              return true;
            } else {
              password_second.validationState = 'has-error';
              return false;
            }
          },
          750
        );
      } else {
        return password_second.regex.test(password_second.value) && password_second.value === password_first.value;
      }
    },

    verifyFirstname: function(isDebounced) {

      const firstname = this.registerData.firstname;

      if (firstname.value === '') {
        firstname.validationState = '';
        if (firstname.timer) {
          clearTimeout(firstname.timer);
        }
        return false;
      }

      if (isDebounced) {       // if set timeout
        if (firstname.timer) {
          clearTimeout(firstname.timer);
        }
        firstname.timer = setTimeout(
          () => {
            if (firstname.regex.test(firstname.value)) {
              firstname.validationState = 'has-success';
              return true;
            } else {
              firstname.validationState = 'has-error';
              return false;
            }
          },
          750
        );
      } else {
        return firstname.regex.test(firstname.value);
      }
    },

    verifyLastname: function(isDebounced) {

      const lastname = this.registerData.lastname;

      if (lastname.value === '') {
        lastname.validationState = '';
        if (lastname.timer) {
          clearTimeout(lastname.timer);
        }
        return false;
      }

      if (isDebounced) {       // if set timeout
        if (lastname.timer) {
          clearTimeout(lastname.timer);
        }
        lastname.timer = setTimeout(
          () => {
            if (lastname.regex.test(lastname.value)) {
              lastname.validationState = 'has-success';
              return true;
            } else {
              lastname.validationState = 'has-error';
              return false;
            }
          },
          750
        );
      } else {
        return lastname.regex.test(lastname.value);
      }
    },

    verifyFullName: function() {
      if (this.registerData.lastname.value === '' && this.registerData.firstname.value === '') {
        return true;
      } else {
        return this.verifyFirstname() && this.verifyLastname();
      }
    },

    verifyAvatar: function() {
      return this.avatarData.avatars.indexOf(this.registerData.avatar.value) >= 0;
    },

    verifyRegisterData: function() {
      return this.verifyEmail() &&
      this.verifyUsername() &&
      this.verifyPasswordFirst() &&
      this.verifyPasswordSecond() &&
      this.verifyFullName() &&
      this.verifyAvatar();
    },

    selectAvatar: function(avatar) {
      this.avatarSelected = avatar;
      this.registerData.avatar.value = avatar;
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

.avatar-box {
  text-align: center;
  margin-bottom: 30px;
  img {
    margin: 0 3px;
    border-radius: 5px;
    display: inline-block;
    border: 2px solid rgba(255, 255, 255, 0);
    &:hover {
       cursor: pointer;
       opacity: 0.7;
       border: 2px solid #f60;
    }
    &.selected {
       cursor: pointer;
       border: 2px solid #f60;
    }
  }
}

.help {
  visibility: hidden;
  &.has-error {
    visibility: visible;
  }
}
</style>
