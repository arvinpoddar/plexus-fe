const authMetaDeta = (title) => ({
  title,
  requireAuth: true
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
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/App.vue'), name: 'app', meta: authMetaDeta('Home') }
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
