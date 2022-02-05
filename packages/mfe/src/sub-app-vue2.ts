import { isFunction } from 'lodash'
export interface VueRouterProps {
  subAppBase: string
  routes: any[]
  base?: string
  [key: string]: any
}

export interface SubAppVue2Props {
  Vue: any
  VueRouter: any
  App: any
  mountId?: string
  vueRouterProps: VueRouterProps
  vueProps: any
  master?: any
  instance?: any
  router?: any
  onSelfMount?: (props: SubAppVue2Props) => void
  onSelfBeforeMount?: (props: SubAppVue2Props) => void
  onMount?: (props: SubAppVue2Props) => void
  onBeforeMount?: (props: SubAppVue2Props) => void
}

function render(props: SubAppVue2Props) {
  // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
  const {
    Vue,
    VueRouter,
    App,
    mountId = '#app',
    vueRouterProps,
    vueProps,
    onSelfMount,
    onSelfBeforeMount,
    onMount,
    onBeforeMount
  } = props || {}

  const { base = '/', subAppBase } = vueRouterProps || {}

  let initVueProps = {
    ...(vueProps || {})
  }

  let beforeMountFunc = onSelfBeforeMount

  if ((<any>window).__POWERED_BY_QIANKUN__) {
    beforeMountFunc = onBeforeMount
  }

  if (beforeMountFunc) {
    const _initVueProps: any = beforeMountFunc(props)
    initVueProps = {
      ...(_initVueProps || {}),
      ...initVueProps
    }
  }

  const router = new VueRouter({
    // 运行在主应用中时，添加路由命名空间
    mode: 'history',
    ...(vueRouterProps || {}),
    base: (<any>window).__POWERED_BY_QIANKUN__ ? subAppBase : base
  })

  // 挂载应用
  const instance = new Vue({
    ...initVueProps,
    router,
    render: (h: any) => h(App)
  }).$mount(mountId)

  let mountFunc = onSelfMount

  if ((<any>window).__POWERED_BY_QIANKUN__) {
    mountFunc = onMount
  }

  if (mountFunc) {
    mountFunc(props)
  }

  console.log('subapp instance', instance)

  return {
    router,
    instance
  }
}

export const initSubApp = (props: SubAppVue2Props) => {
  let instance: any = null
  let router: any = null

  /**
   * 渲染函数
   * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
   */

  // 独立运行时，直接挂载应用
  if (!(<any>window).__POWERED_BY_QIANKUN__) {
    const obj = render(props)
    instance = obj.instance
    router = obj.router
  }

  /**
   * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
   * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
   */
  async function bootstrap() {
    console.log('MicroApp bootstraped')
  }

  /**
   * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
   */
  async function mount(mountProps: any) {
    console.log('MicroApp mount', mountProps)

    const { master } = mountProps || {}

    const obj = render({ ...props, master })
    instance = obj.instance
    router = obj.router
  }

  /**
   * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
   */
  async function unmount() {
    console.log('MicroApp unmount')
    if (instance) {
      instance.$destroy()
    }

    instance = null
    router = null
  }

  return {
    bootstrap,
    mount,
    unmount,
    instance,
    router
  }
}

export const initSubAppVue2OnBeforeMountInitVue = (props: SubAppVue2Props) => {
  const { Vue: _Vue, master } = props || {}
  const { vue, utils } = master || {}

  if (vue) {
    const { prototype, ...otherProps } = vue
    Object.keys(prototype || {}).forEach(key => {
      _Vue.prototype[key] = prototype[key]
    })

    Object.keys(otherProps).forEach(key => {
      if (isFunction(_Vue[key])) {
        const arr = otherProps[key]
        if (Array.isArray(arr)) {
          arr.forEach(item => {
            if (key === 'component') {
              const { name, component } = item
              _Vue[key](name, component)
            } else {
              _Vue[key](item)
            }
          })
        }
      }
    })

    _Vue.prototype.$utils = utils
  }
}

export const initSubAppVue2OnBeforeMountInitVueProps = (
  props: SubAppVue2Props
) => {
  const { master, vueProps: _vueProps } = props || {}
  const { store } = _vueProps || {}
  const { vue, utils } = master || {}
  const { store: masterStore } = utils || {}

  const { initProps: vueProps } = vue || {}

  if (store && masterStore) {
    const modulesNamespaceMap = masterStore._modulesNamespaceMap || {}
    Object.keys(modulesNamespaceMap).forEach(key => {
      const module = modulesNamespaceMap[key]
      const moduleName = key.replace(/\/$/, '')
      if (!store.hasModule(moduleName)) {
        store.registerModule(moduleName, module)
      }
    })
  }

  return vueProps
}

export const initSubAppVue2OnBeforeMount = (props: SubAppVue2Props) => {
  initSubAppVue2OnBeforeMountInitVue(props)

  return initSubAppVue2OnBeforeMountInitVueProps(props)
}
