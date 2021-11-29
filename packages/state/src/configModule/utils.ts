import { merge, isEqual, cloneDeep } from 'lodash'

/**
 * 提供 config 的mixin
 */
export const initConfigMixin = ({ configModuleName = 'configModule' }) => {
  return {
    props: {
      //父组件的重写
      overwriteConfig: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      const { config } = this.$options || {}
      // const { path } = this.$route || {}
      // console.log(path, '_componentTag = ', _componentTag, 'config =', config)
      return {
        compConfig: config || {}
      }
    },
    computed: {
      sysConfigMap() {
        const state = (this.$store?.state || {})[configModuleName]
        const { sysConfigMap } = state || {}
        return sysConfigMap
      },
      userConfigMap() {
        const state = (this.$store?.state || {})[configModuleName]
        const { userConfigMap } = state || {}
        return userConfigMap
      },
      pathConfig({ sysConfigMap, userConfigMap }) {
        const { path } = this.$route || {}
        let sysConfig
        let userConfig
        if (path) {
          sysConfig = (sysConfigMap || {})[path]
          userConfig = (userConfigMap || {})[path]
        }
        return merge(cloneDeep(sysConfig || {}), cloneDeep(userConfig || {}))
      },
      currentConfig({ compConfig, overwriteConfig, pathConfig }) {
        let cacheConfig = compConfig || {}
        cacheConfig = merge(
          cloneDeep(cacheConfig),
          cloneDeep(overwriteConfig || {})
        )
        cacheConfig = merge(cloneDeep(cacheConfig), cloneDeep(pathConfig || {}))
        return cacheConfig
      },
      variable({ currentConfig }) {
        const { variable } = currentConfig || {}
        return variable || {}
      },
      configI18n({ currentConfig }) {
        const { i18n } = currentConfig || {}
        return i18n
      }
    } as any,
    watch: {
      configI18n: {
        handler(newValue) {
          const { locale, messages } = this.$i18n || {}
          if (newValue && locale) {
            const langObj = messages[locale] || {}
            const newLangObj = newValue[locale] || {}
            const afterMerge = merge(cloneDeep(langObj), cloneDeep(newLangObj))
            const needSetLocaleMessage = !isEqual(afterMerge, langObj)
            if (needSetLocaleMessage) {
              this.$i18n.setLocaleMessage(locale, afterMerge)
            }
          }
        },
        immediate: true
      } as any
    }
  } as any
}
