import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    auth: {
      isSignIned: false,
      user_id: -1,       // not signined: -1
      user_name: '',     // not signined: ''
      user_level: -1     // not signined: -1
    },
    STORAGE_KEY: 'user'
  },
  mutations: {
    signin(state, userdata) {
      localStorage.setItem(state.STORAGE_KEY, JSON.stringify(userdata));
      state.auth = {
        isSignIned: true,
        user_id: userdata.user_id,
        user_name: userdata.user_name,
        user_level: userdata.user_level
      }
    },
    signout(state) {
      localStorage.removeItem(state.STORAGE_KEY);
      state.auth = {
        isSignIned: false,
        user_id: -1,       // not signined: -1
        user_name: '',     // not signined: ''
        user_level: -1     // not signined: -1
      }
    }
  }
});
