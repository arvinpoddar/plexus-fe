import Plexus from 'src/api'

const authMetaDeta = (title) => ({
  title,
  requireAuth: true,
  requireRegister: true
})

/*
const adminMetaData = {
  requireAuth: true,
  requireAdmin: true
}
*/

const routes = [
  {
    path: '/login',
    component: () => import('layouts/LoginCardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Auth/Login.vue'), name: 'login' }
    ]
  },

  {
    path: '/join',
    component: () => import('layouts/LoginCardLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Auth/Join.vue'),
        name: 'join',
        meta: {
          requireRegister: true
        }
      }
    ],
    beforeEnter: async (to, from, next) => {
      if (await Plexus.Auth.isAuthenticated()) {
        next()
      } else {
        next({ name: 'login' })
      }
    }
  },

  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/App.vue'), name: 'app', meta: authMetaDeta('Home') }
    ]
  },

  {
    path: '/account',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AccountManagement/MyAccount.vue'),
        name: 'myAccount',
        meta: authMetaDeta('My Account')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
