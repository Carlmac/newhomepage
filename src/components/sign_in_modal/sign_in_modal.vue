<template>
  <div
    id="login-modal"
    class="modal fade"
    tabindex="-1"
    role="dialog"
    v-if="!isSignIned"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">登录</h4>
        </div>
        <!-- modal body -->
        <div class="modal-body">

          <!-- 错误信息 -->
          <div class="alert alert-danger text-center" role="alert" v-show="errorMsg.hasError">
            {{ errorMsg.text }}
          </div>

          <form class="form-horizontal" v-on:submit.prevent>
            <div class="form-group">
              <label for="inputLoginEmail" class="col-sm-2 control-label">邮箱</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="inputLoginEmail"
                  type="email"
                  placeholder="邮箱"
                  required="required"
                  maxlength="50"
                  v-model="loginData.email"
                >
              </div>
            </div>
            <div class="form-group">
              <label for="inputLoginPassword" class="col-sm-2 control-label">密码</label>
              <div class="col-sm-10">
                <input
                  class="form-control"
                  id="inputLoginPassword"
                  type="password"
                  placeholder="密码"
                  required="required"
                  maxlength="16"
                  v-model="loginData.password"
                  v-on:keyup.enter="submitLoginData"
                >
              </div>
            </div>
          </form>
        </div><!-- modal body -->

        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
          <button
            type="button"
            class="btn btn-primary"
            v-bind:disabled="isSubmitting"
            v-on:click.prevent="submitLoginData"
          >
            登录
          </button>
        </div>
      </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->
</template>

<script>
import axios from 'axios';
import qs from 'qs';
export default {
  name: 'login-modal',

  data: function() {

    return {

      loginData: {
        email: '',
        password: ''
      },

      isSubmitting: false,

      errorMsg: {
        hasError: false,
        text: '',
        map: {
          100: '登录失败，邮箱或密码错误',
          200: '登录失败，提交的数据有误',
          // no correct response
          'nores': '服务器发生错误',
          'signined': '你已经登录了',
          'invalidsignindata': '你的登录信息没有填写完整',
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

    submitLoginData: function() {

      if (this.isSubmitting) {
        return;
      }

      if (this.isSignIned) {
        this.showErrorMsg('signined');
        return;
      }

      this.dismissErrorMsg();

      if (this.loginData.email && this.loginData.password) {

        this.isSubmitting = true;

        let requestData = qs.stringify({
          email: this.loginData.email,
          password: this.loginData.password
        });

        axios.post(
          '/api/sign_in.php',
          requestData
        )
        .then(
          (res) => {
            if (res) {
              if (res.data.status.code === 0) {
                let userdata = res.data.data;
                this.$store.commit('signin', userdata);
                this.isSubmitting = false;
                $('#login-modal').modal('hide');
                location.reload(true);
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
        this.showErrorMsg('invalidsignindata');
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
