// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from './store';
import router from './router';

// import bootstrap js and style
import './js/bootstrap';
import './sass/_bootstrap.scss';

// import jquery-ui for datepicker
import './assets/jquery-ui/jquery-ui';
import './assets/jquery-ui/jquery-ui.css';
import './assets/jquery-ui/jquery-ui.structure.css';
import './assets/jquery-ui/jquery-ui.theme.css';

import App from './App';

Vue.config.productionTip = false;

new Vue({

  el: '#app',

  store,

  router,

  created: function() {
    this.checkSignInStatus();
  },

  render: function(createElement) {
    return createElement(App);
  },

  methods: {
    checkSignInStatus: function() {
      let userdata = JSON.parse(localStorage.getItem('user'));
      if (userdata) {
        this.$store.commit('signin', userdata);
      }
    }
  }
});

