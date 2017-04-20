import Vue from 'vue';
import Router from 'vue-router';

// components for router
import TormbApp from '../components/tormb_app/tormb_app';
import TodoApp from '../components/todo_app/todo_app';
import ChatboardApp from '../components/chatboard_app/chatboard_app';
import NewsApp from '../components/news_app/news_app';

Vue.use(Router);

export default new Router({
  mode: 'history',
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      components: {
        default: TormbApp,
        center: TodoApp,
        right: ChatboardApp
      }
    },
    {
      path: '/news',
      component: NewsApp
    }
  ]
});
