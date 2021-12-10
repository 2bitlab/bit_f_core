import { merge, isEqual, cloneDeep, assign, isString, isObject } from 'lodash'

/**
 * 具体看单测
 * @param overwriteObj 用它来做覆盖
 * @param sourceObj 原来的旧对象
 * @returns
 */
export const mergeConfig = (overwriteObj: any, sourceObj: any) => {
  const keyMapFunc = {
    i18n: merge,
    feature: assign,
    api: assign,
    variable: assign
  }
  const returnObj = {}
  Object.keys(keyMapFunc).forEach(key => {
    const func = keyMapFunc[key]

    returnObj[key] = func(
      cloneDeep((sourceObj || {})[key] || {}),
      cloneDeep((overwriteObj || {})[key] || {})
    )
  })

  return returnObj
}

export const fixUrlParams = (url: string, params?: any): string => {
  if (isObject(params)) {
    const { length } = Object.keys(params)
    if (length) {
      const arr = url.split('/')
      return arr
        .map(i => {
          if (i.startsWith(':')) {
            const v = params[i.replace(':', '')]
            if (v) {
              return v
            }
          }
          return i
        })
        .join('/')
    }
  }
  return url
}

export const saveConfigSetting = ({ that, commend }) => {
  const { path } = that.$route || {}
  const { value } = commend || {}
  const { label, editMode, editValue, configKey, cd, lang } = value || {}
  const key = `${editMode}Map`

  const configMapData = that[key] || {}

  const pathConfigData = configMapData[path] || {}

  const configKeyData = pathConfigData[configKey] || {}

  let newValue

  let willSetValue = editValue
  try {
    willSetValue = JSON.parse(willSetValue)
  } catch (error) {
    console.warn(error)
  }

  if (configKey === 'i18n') {
    const langObj = configKeyData[lang] || {}

    newValue = {
      ...pathConfigData,
      [configKey]: {
        ...configKeyData,
        [lang]: {
          ...langObj,
          [label]: willSetValue
        }
      }
    }
  } else {
    newValue = {
      ...pathConfigData,
      [configKey]: {
        ...configKeyData,
        [label]: willSetValue
      }
    }
  }

  that.setConfig({ path, config: newValue, key })

  if (cd) {
    cd()
  }

  return {
    path,
    config: newValue,
    key,
    commend,
    configMapData: {
      ...configMapData,
      [path]: newValue
    }
  }
}

export const apiPath2Obj = (apiPath: string | any, props?: any) => {
  let data = {}
  let headers = {}
  let method = 'GET'
  let url
  let cancelKey
  let responseType

  if (isString(apiPath)) {
    const [pathMethod, pathUrl, pathCancelKey, pathResponseType] =
      apiPath.split(' ')

    if (pathMethod && pathUrl) {
      method = pathMethod
      url = pathUrl

      if (pathCancelKey) {
        cancelKey = pathCancelKey
      }
      if (pathResponseType) {
        responseType = pathResponseType
      }
    }
  }

  const {
    data: propsData,
    headers: propsHeaders,
    method: propsMethod,
    params,
    ...otherProps
  } = props || {}

  if (propsMethod) {
    method = propsMethod
  }

  if (isObject(propsData)) {
    data = {
      ...(data || {}),
      ...(propsData || {})
    }
  }

  if (isObject(propsHeaders)) {
    headers = {
      ...(headers || {}),
      ...(propsHeaders || {})
    }
  }

  return {
    url: fixUrlParams(url, params),
    data,
    headers,
    method,
    cancelKey,
    responseType,
    ...(otherProps || {})
  }
}

/**
 * 提供 config 的mixin
 */
export const initConfigMixin = ({
  configModuleName = 'configModule',
  configKeys = ['sysConfigMap', 'userConfigMap'],
  fetchUtil
}: {
  configModuleName: string
  configKeys: string[]
  fetchUtil: any
}) => {
  return {
    props: {
      //父组件的重写
      $overwriteConfig: {
        type: Object,
        default: () => ({})
      }
    },
    computed: {
      ...configKeys.reduce((obj: any, key: string) => {
        obj[`$${key}`] = function () {
          const state = (this.$store?.state || {})[configModuleName] || {}
          return state[key]
        }
        return obj
      }, {}),
      ...configKeys.reduce((obj: any, key: string) => {
        obj[`$${key.replace('Map', '')}`] = function () {
          const { path } = this.$route || {}
          return (this[`$${key}`] || {})[path] || {}
        }
        return obj
      }, {}),
      $compConfig() {
        const { config } = this.$options || {}
        return config
      },
      $pathConfig() {
        return configKeys.reduce((obj, key) => {
          obj = mergeConfig(this[`$${key.replace('Map', '')}`] || {}, obj)
          return obj
        }, {})
      },
      $currentConfig({ $compConfig, $overwriteConfig, $pathConfig }) {
        return [$compConfig, $overwriteConfig, $pathConfig].reduce(
          (obj, config) => {
            obj = mergeConfig(config || {}, obj)
            return obj
          },
          {}
        )
      },
      $variable({ $currentConfig }) {
        const { variable } = $currentConfig || {}
        return variable || {}
      },
      $configI18n({ $currentConfig }) {
        const { i18n } = $currentConfig || {}
        const { locale } = this.$i18n || {}
        return (i18n || {})[locale]
      }
    } as any,
    watch: {
      $configI18n: {
        handler(newValue) {
          const { locale, messages } = this.$i18n || {}
          if (newValue && locale) {
            const langObj = messages[locale] || {}
            const afterMerge = merge(cloneDeep(langObj), cloneDeep(newValue))
            const needSetLocaleMessage = !isEqual(afterMerge, langObj)
            if (needSetLocaleMessage) {
              this.$i18n.setLocaleMessage(locale, afterMerge)
            }
          }
        },
        immediate: true
      } as any
    },
    methods: {
      async $apiGetData(apiKey: string, props?: any) {
        const apiPath = ((this.$currentConfig || {}).api || {})[apiKey]
        if (!apiPath) {
          console.error(`not '${apiKey}' api set in config.api`)
          return
        }

        const fetchProps = apiPath2Obj(apiPath, props)
        const { url } = fetchProps || {}
        if (!url) {
          console.error(`'${apiKey}' can't get url`)
          return
        }

        return await fetchUtil.fetchByObj(fetchProps)
      }
    } as any
  } as any
}
