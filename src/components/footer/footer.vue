<template>
  <footer class="footer" role="contentinfo">
    <div class="container">
      <p class="text-muted">Created By <a href="http://carlchu.me">Carl Chu</a>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <a href="http://www.miitbeian.gov.cn" target="_blank">粤ICP备16043694号</a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'footer'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

/* Sticky footer styles
-------------------------------------------------- */
html {
  position: relative;
  min-height: 100%;
}
body {
  /* Margin bottom by footer height */
  margin-bottom: 60px;
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* Set the fixed height of the footer here */
  height: 60px;
  background-color: #f5f5f5;
}


/* Custom page CSS
-------------------------------------------------- */
/* Not required for template or sticky footer method. */

.footer {
  .container {
    width: auto;
    max-width: 1140px;
    padding: 0 15px;
    text-align: center;
  }
  .container .text-muted {
    margin: 20px 0;
  }
}
</style>
