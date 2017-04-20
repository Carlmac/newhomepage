<template>
  <li>
    <a v-on:click.prevent="changepage">
      <span aria-hidden="true">
        {{ switchback=="true" ? '&laquo;' : '&raquo;'}}
      </span>
    </a>
  </li>
</template>

<script>
  export default {

    name: 'MessageSwitcher',

    props: ['switchback'],

    methods: {

      changepage: function () {
        this.$emit('changepage');
      }

    }

  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
