export interface I18nMap {
  [key: string]: string
}

export interface I18nLangMap {
  [lang: string]: I18nMap
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
  i18n?: I18nLangMap
  feature?: FeatureMap
  api?: ApiMap
  variable?: VariableMap
}

export interface ConfigMap {
  [key: string]: Config
}

export interface ConfigModuleState {
  configKeys: string[]
  [key: string]: ConfigMap | any
}

export type GetConfigFunc = (path: string) => Promise<Config>

export interface ConfigMapFunc {
  [key: string]: GetConfigFunc
}

export interface InitConfigModuleProps {
  LS: any
  Vue: any
  configMapFunc: ConfigMapFunc
}

export const initState = (configKeys: string[], LS) => {
  return configKeys.reduce(
    (obj, key) => {
      obj[key] = LS.get(key) || {}
      return obj
    },
    { configKeys }
  )
}

export const initConfigModule = ({
  LS,
  Vue,
  configMapFunc
}: InitConfigModuleProps) => {
  const configKeys = Object.keys(configMapFunc)

  return {
    namespaced: true,
    state: initState(configKeys, LS),
    mutations: {
      setConfig(state: ConfigModuleState, { path, config, key }): void {
        Vue.set(state[key], path, { ...config })
        LS.set(key, state[key])
      }
    },
    actions: {
      async getConfig({ state, commit }, { path, passCache }) {
        console.log('getConfig', path)

        const { configKeys } = state

        await Promise.all(
          configKeys.map(key => {
            return new Promise(resolve => {
              const cacheData = (state[key] || {})[path]
              if (!cacheData || passCache) {
                configMapFunc[key](path).then(config => {
                  commit('setConfig', { path, config, key })
                  resolve(config)
                })
              } else {
                resolve(cacheData)
              }
            })
          })
        )
      }
    }
  }
}

export default initConfigModule
