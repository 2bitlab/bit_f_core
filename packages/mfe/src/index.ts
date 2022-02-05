import * as vue2SubAppUtils from './sub-app-vue2'

export const { initSubApp: initSubAppVue2 } = vue2SubAppUtils

export const subAppUtils = {
  vue2: vue2SubAppUtils
}

export default {
  initSubAppVue2,
  subAppUtils
}
