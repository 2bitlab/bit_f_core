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
      sysConfig({ sysConfigMap }) {
        const { path } = this.$route || {}
        return (sysConfigMap || {})[path]
      },
      userConfig({ userConfigMap }) {
        const { path } = this.$route || {}
        return (userConfigMap || {})[path]
      },
      pathConfig({ sysConfig, userConfig }) {
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
        const { locale } = this.$i18n || {}
        return (i18n || {})[locale]
      }
    } as any,
    watch: {
      configI18n: {
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
    }
  } as any
}
