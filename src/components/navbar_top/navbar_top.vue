<template>
  <nav id="navbar-top" class="navbar navbar-default navbar-static-top navbar-fixed-top" role="navigation">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="">
          <img src="./assets/logo_black.png" alt="WeirdFishes">
        </a>
      </div> <!-- End of .navbar-header -->
      <div class="navbar-collapse collapse">
        <!-- normal nav btns -->
        <ul class="nav navbar-nav">
          <!-- dynamic router nav btn -->
          <router-link
            v-for="navbtn in navbtns"
            v-bind:to="navbtn.path"
            tag="li"
            exact
          >
            <a>
              <span :class="navbtn.iconCls"></span> {{ navbtn.text }}
            </a>
          </router-link>
          <!-- static origin nav btn -->
          <li
            v-for="navbtn in staticNavbtns"
          >
            <a
              v-bind:href="navbtn.path"
              v-bind:target="navbtn.newWindow ? '_blank' : '_self'"
            >
              <span :class="navbtn.iconCls"></span> {{ navbtn.text }}
            </a>
          </li>
        </ul>
        <!-- login management -->
        <ul
          class="nav navbar-nav navbar-right"
          v-show="!isSignIned"
        >
          <li
            v-for="btn in loginbtns"
            v-showModal="btn"
          >
            <a :href="btn.href">
              <span :class="btn.iconCls"></span> {{ btn.text }}
            </a>
          </li>
        </ul> <!-- End of login management -->
        <!-- logout management -->
        <ul
          class="nav navbar-nav navbar-right"
          v-show="isSignIned"
        >
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
              欢迎，{{ $store.state.auth.user_name }}<span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li>
                <a href="#"
                   v-on:click.prevent="signout"
                >
                  <span class="icon fa fa-sign-out"></span>登出
                </a>
              </li>
              <!--<li role="separator" class="divider"></li>-->
            </ul>
          </li>
        </ul> <!-- End of logout management -->
      </div> <!-- End of .navbar-collapse -->
    </div> <!-- End of .container -->
  </nav>
</template>

<script>
export default {
  name: 'navbar-top',
  data: function() {
    return {

      navbtns: [
        {
          text: '主页',
          path: '/',
          iconCls: 'icon fa fa-home'
        },
        {
          text: '看点新闻',
          path: '/news',
          iconCls: 'icon fa fa-newspaper-o'
        }
      ],

      staticNavbtns: [
        {
          text: '简历',
          path: '/resume',
          iconCls: 'icon fa fa-file',
          newWindow: true
        }
      ],

      loginbtns: [
        {
          text: '登录',
          href: 'javascript:void(0);',
          iconCls: 'icon fa fa-sign-in',
          modalID: '#login-modal'
        },
        {
          text: '注册',
          href: 'javascript:void(0);',
          iconCls: 'icon fa fa-user',
          modalID: '#register-modal'
        }
      ]

    }
  },

  computed: {
    isSignIned: function() {
      return this.$store.state.auth.isSignIned;
    }
  },

  directives: {
    showModal: {
      inserted: function(el, binding) {
        let id = binding.value.modalID;
        el.setAttribute('data-toggle', 'modal');
        el.setAttribute('data-target', id);
      }
    }
  },

  methods: {

    signout: function() {
      this.$store.commit('signout');
      location.reload(true);
    },

    goTo: function(path) {
      this.$router.push(path);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  /* 为固定的 navbar 腾出高度 */
  padding-top: 51px;
}
</style>
