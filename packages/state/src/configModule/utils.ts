import { merge } from 'lodash'

/**
 * 提供 config 的mixin
 */
export const initConfigMixin = ({
  mapState,
  configModuleName = 'configModule'
}) => {
  return {
    data() {
      return {
        compConfig: {}
      }
    },
    create() {
      // 处理父组件的重写
      const { config, _componentTag } = this.$options || {}
      const { path } = this.$route || {}
      console.log(path, '_componentTag = ', _componentTag, 'config =', config)

      this.compConfig = config
      // TODO 父组件的重写

      // TODO i18n
      // TODO ui

      // TODO API
      // TODO showMap
      // TODO variable
      // TODO 数据功能的只显示那些，不显示哪些
    },
    computed: {
      ...mapState(configModuleName, ['sysConfigMap', 'userConfigMap']),
      currentConfig({ sysConfigMap, userConfigMap, compConfig }) {
        const { path } = this.$route || {}
        const sysConfig = sysConfigMap[path]
        const userConfig = userConfigMap[path]

        let cacheConfig = compConfig
        cacheConfig = merge(sysConfig, cacheConfig)
        cacheConfig = merge(userConfig, cacheConfig)

        console.log(
          'currentConfig change',
          path,
          sysConfig,
          userConfig,
          cacheConfig
        )
        return cacheConfig
      }
    } as any
  } as any
}
