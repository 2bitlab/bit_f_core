import {
  RouteConfig,
  MenuItem,
  Route,
  defaultAuthFn,
  getRouterMapByRouter,
  getPermissionMapByRouterMap,
  getMenuByRouteMap,
  getPermissionMenuItem,
  getPermissionMenuList
} from './utils'

export default class Auth {
  authFn: () => false
  routeMap: Map<string, RouteConfig>
  menu: MenuItem[]
  permissionRouterMap: Map<string, string[]>
  constructor({
    authFn,
    routes,
    menu
  }: {
    authFn?: any
    routes: RouteConfig[]
    menu: MenuItem[]
  }) {
    this.authFn =
      Object.prototype.toString.call(authFn) === '[object Function]'
        ? authFn
        : defaultAuthFn

    this.routeMap = getRouterMapByRouter(routes)
    this.permissionRouterMap = getPermissionMapByRouterMap(this.routeMap)
    this.menu = getMenuByRouteMap(menu, this.routeMap)
  }
  static install(Vue): void {
    Vue.prototype.$auth = function (permission: string): boolean {
      const haveAuth = this.authFn(permission, this.$store)
      if (!haveAuth) {
        console.warn('没有权限', permission)
      }

      return haveAuth
    }
  }
  updateRouter(routes: RouteConfig[]): RouteConfig[] {
    this.routeMap = getRouterMapByRouter(routes)
    this.permissionRouterMap = getPermissionMapByRouterMap(this.routeMap)

    return routes
  }
  updateMenu(menu: MenuItem[]): MenuItem[] {
    this.menu = getMenuByRouteMap(menu, this.routeMap)
    return this.menu
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
  getMenuByPermissions(permissions: string[]): MenuItem[] {
    return getPermissionMenuList(this.routeMap, this.menu, permissions)
  }

  getMenu(menu: MenuItem[], permissions: string[]): MenuItem[] {
    return getPermissionMenuList(
      this.routeMap,
      getMenuByRouteMap(menu, this.routeMap),
      permissions
    )
  }
}
