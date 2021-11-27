import _Vue from 'vue'

import {
  RouteConfig,
  MenuItem,
  Route,
  getRouterMapByRouter,
  getPermissionMapByRouterMap,
  getMenuByRouteMap,
  getPermissionMenuItem,
  getPermissionMenuList
} from './utils'
declare module 'vue/types/vue' {
  interface Vue {
    $auth: (permission: string, msg?: string) => boolean
  }
}

const havePermission = (
  store: any,
  permissionName: string,
  gettersName = `userModule/permission`
): boolean => {
  console.log('havePermission store =', store, gettersName, permissionName)

  const getters = store.getters || {}
  console.log('havePermission getters =', getters)

  const permissionList = getters[gettersName] || []

  console.log('havePermission permissionList =', permissionList)

  const haveAuth = permissionList.includes(permissionName)
  if (!haveAuth) {
    console.warn('没有权限', permissionName)
  }

  return haveAuth
}
export class Auth {
  router: any
  routeMap: Map<string, RouteConfig>
  permissionRouterMap: Map<string, string[]>

  gettersName = 'userModule/permission'

  constructor({ router, Vue }: { router: any; Vue: typeof _Vue }) {
    this.routeMap = new Map()
    this.permissionRouterMap = new Map()

    this.router = router
    this.initRouter()
    this.install(Vue)
  }

  install(Vue: any): void {
    console.log('Auth install')
    Vue.prototype.$auth = function (permissionName: string) {
      console.log('$auth permissionName =', permissionName)
      return havePermission(this.$store, permissionName)
    }
  }

  authFn(permissionName: string): boolean {
    console.log('authFn', permissionName, this)
    const { app } = this.router || {}
    return havePermission(app?.$store, permissionName)
  }

  initRouter(routes?: RouteConfig[]): void {
    let useRoutes = routes
    if (!useRoutes) {
      const { options } = this.router
      const { routes: optionRoutes } = options || {}
      useRoutes = optionRoutes
    }

    this.routeMap = getRouterMapByRouter(routes)
    this.permissionRouterMap = getPermissionMapByRouterMap(this.routeMap)
  }

  checkRoutePermission({
    route,
    permissions
  }: {
    route: Route
    permissions: string[]
  }): boolean {
    return getPermissionMenuItem({
      routerPermissions: this.permissionRouterMap.get(
        route?.fullPath || route?.path
      ),
      permissions
    })
  }

  getMenuByPermissions(menu: MenuItem[], permissions: string[]): MenuItem[] {
    return getPermissionMenuList(
      this.routeMap,
      getMenuByRouteMap(menu, this.routeMap),
      permissions
    )
  }
}

export default Auth
