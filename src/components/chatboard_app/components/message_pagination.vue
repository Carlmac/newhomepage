<template>
  <li>
    <a class="page-link" v-on:click.prevent="changepage">
      {{ index + 1 }}
    </a>
  </li>
</template>

<script>
  export default {

    name: 'MessagePagination',

    props: ['index'],

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
