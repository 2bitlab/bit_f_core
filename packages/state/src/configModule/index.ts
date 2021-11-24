import { merge } from 'lodash'

export interface I18nMap {
  [key: string]: string
}

export interface I18nLangMap {
  [lang: string]: I18nMap
}

export interface UiMap {
  [key: string]: string // class name
}

export interface ApiMap {
  [key: string]: string
}

export interface FeatureMap {
  [key: string]: boolean
}

export interface VariableMap {
  [key: string]: any
}

export interface Config {
  ui?: UiMap
  i18n?: I18nLangMap
  feature?: FeatureMap
  api?: ApiMap
  variable?: VariableMap
}

export interface ConfigMap {
  [key: string]: Config
}

export interface ConfigModuleState {
  sysConfigMap: ConfigMap
  userConfigMap: ConfigMap
}

export type GetSysConfigFunc = (path: string) => Promise<Config>

export type GetUserConfigFunc = (path: string) => Promise<Config>

export interface InitConfigModuleProps {
  LS: any
  Vue: any
  getSysConfigFunc: GetSysConfigFunc
  getUserConfigFunc: GetUserConfigFunc
}

const initState = ({ sysConfigMap, userConfigMap }): ConfigModuleState => ({
  sysConfigMap,
  userConfigMap
})

export const initConfigModule = ({
  LS,
  Vue,
  getSysConfigFunc,
  getUserConfigFunc
}: InitConfigModuleProps) => {
  const sysConfigLsKey = 'sysConfig'
  const userConfigLsKey = 'userConfig'

  const sysConfigMap = LS.get(sysConfigLsKey)
  const userConfigMap = LS.get(userConfigLsKey)

  return {
    namespaced: true,
    state: initState({ sysConfigMap, userConfigMap }),
    mutations: {
      setSysConfig(state: ConfigModuleState, { path, config }): void {
        Vue.set(state.sysConfigMap, path, { ...config })
        LS.set(sysConfigLsKey, state.sysConfigMap)
      },
      setUserConfig(state: ConfigModuleState, { path, config }): void {
        Vue.set(state.userConfigMap, path, { ...config })
        LS.set(userConfigLsKey, state.userConfigMap)
      }
    },
    actions: {
      async getConfig({ state, commit }, { config, path, passCache }) {
        let cacheSysConfig = state.sysConfigMap[path]

        let cacheUserConfig = state.userConfigMap[path]

        if (!cacheSysConfig || passCache) {
          cacheSysConfig = await getSysConfigFunc(path)
          commit('setSysConfig', { path, config: cacheSysConfig })
        }
        if (!cacheUserConfig || passCache) {
          cacheUserConfig = await getUserConfigFunc(path)
          commit('setUserConfig', { path, config: cacheUserConfig })
        }

        let cacheConfig = config
        cacheConfig = merge(cacheSysConfig, cacheConfig)
        cacheConfig = merge(cacheUserConfig, cacheConfig)
        return cacheConfig
      }
    }
  }
}

export default initConfigModule
