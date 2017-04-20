<template>
  <div id="app">
    <sign-in-modal/>
    <sign-up-modal/>
    <navbar-top/>
    <div class="container">
      <div class="row">
        <router-view></router-view>
        <router-view name="center"></router-view>
        <router-view name="right"></router-view>
      </div>
    </div>
    <vfooter/>
  </div>
</template>

<script>
import NavbarTop from './components/navbar_top/navbar_top';
import Footer from './components/footer/footer';
import SignInModal from './components/sign_in_modal/sign_in_modal';
import SignUpModal from './components/sign_up_modal/sign_up_modal';

export default {

  data: function() {
    return {}
  },

  components: {
    'navbar-top': NavbarTop,
    'vfooter': Footer,
    'sign-in-modal': SignInModal,
    'sign-up-modal': SignUpModal
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

body {
  background-color: #eee;
}

</style>
