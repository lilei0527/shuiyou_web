import { createRouter, createWebHistory } from 'vue-router'
import MindList from '../views/mindList.vue'
const router = createRouter({
  history: createWebHistory(),
  routes:
    [
      {
        path: '/',
        name: 'home',
        component: MindList
      },
      {
        path: '/minds',
        name: 'minds',
        component: () => MindList
      },
      {
        path: '/create_mind',
        name: 'create_mind',

        component: () => import('../views/createMind.vue')
      },
      {
        path: '/person',
        name: 'person',
        component: () => import('../views/person.vue')
      },
      {
        path: '/comment',
        name: 'comment',
        component: () => import('../views/comment.vue')
      },
      {
        path: '/editUserInfo',
        name: 'editUserInfo',
        component: () => import('../views/editUserInfo.vue')
      },
      {
        path: '/chatView',
        name: 'chatView',
        component: () => import('../components/chatView.vue')
      },

    ]

})

export default router
