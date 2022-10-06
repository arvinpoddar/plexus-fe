import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { logout, isUnsupportedDevice } from 'src/modules/Utils'
import Plexus from 'src/api'

const AUTO_LOGIN_ROUTE_NAMES = [
  'login'
]

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const banRedirect = { path: '/unsupported', query: { ref: to.name } }
    const isAuthenticated = await Plexus.Auth.isAuthenticated()
    const isRegistered = !!(await Plexus.Auth.getUserData())
    const isAdmin = false
    const requiresAuth = to.meta.requireAuth
    const requiresRegister = to.meta.requireRegister
    const requiresAdmin = to.meta.requireAdmin

    if (to.path === banRedirect.path) {
      next()
    } else if (isUnsupportedDevice()) {
      next(banRedirect)
    } else if (AUTO_LOGIN_ROUTE_NAMES.includes(to.name)) {
      // AUTO LOGIN
      if (isAuthenticated) {
        next({ name: 'app' })
      } else {
        next()
      }
    } else if (requiresAuth && requiresRegister && requiresAdmin) {
      // IS AN ADMIN PAGE
      if (isAuthenticated && isRegistered && isAdmin) {
        next()
      } else {
        await logout()
      }
    } else if (requiresAuth && requiresRegister) {
      // IS AN AUTHENTICATED PAGE
      if (isAuthenticated && isRegistered) {
        next()
      } else if (isAuthenticated) {
        next({ name: 'join' })
      } else {
        await logout()
      }
    } else {
      next()
    }
  })

  return Router
})
