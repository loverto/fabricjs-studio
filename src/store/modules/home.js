/**
 * 首页
 */

import { queryDiePatterns, queryCustomTemplates, saveCustomTemplates, queryAllCustomTemplates } from '@/api/home'
import { updateCustomTemplates } from '@/api/studio'
import { gererateUUID } from '@/utils'
import { cloneDeep } from 'lodash'

const home = {
  state: {
    // 我要定制列表
    bookingList: [],
    bookingTotal: 0,
    // 我的定制列表
    bookedList: [],
    bookedTotal: 0,
    currentType: {},
    // 鼠标垫贴膜模具
    sbdDiePattern: null,
    // 初始化自定义模板数据
    customeTemplate: {
      // 定制编号
      customNumber: '',
      // 定制数量
      customQuantity: 0,
      // 淘宝ID
      taobaoNickname: '',
      // 收件人姓名
      theRecipientName: '',
      // 推荐状态
      recommendedStatus: {
        id: 1
      },
      // 电脑贴膜模具
      diePattern: null,
      // 磨具类型： id: 1 贴膜 id: 2 鼠标垫
      modelType: {
        id: 1
      },
      // 完成状态
      finishedCondition: {
        id: 1
      },
      // 定制状态
      customState: {
        id: 1
      },
      // 当前用户
      user: {
        id: -1
      }
    },
    // 缓存模具数据
    cacheDiePattern: {
      // 模具编号
      id: -1,
      // 定制编号
      customNumber: '',
      // 模具图路径
      path: '',
      // 模具类型
      modelType: 1
    }
  },
  mutations: {
    SET_BOOKING_LIST: (state, data) => {
      state.bookingList = data
    },
    SET_CURRENT_TYPE: (state, data) => {
      state.currentType = data
    },
    SET_SBD: (state, data) => {
      state.sbdDiePattern = data
    },
    SET_BOOKING_TOTAL: (state, total) => {
      state.bookingTotal = total
    },
    SET_BOOKED_LIST: (state, data) => {
      state.bookedList = data
    },
    SET_BOOKED_TOTAL: (state, total) => {
      state.bookedTotal = total
    },
    INIT_TEMPLATE_DATA: (state, data) => {
      state.customeTemplate.customNumber = gererateUUID()
      state.customeTemplate.customQuantity = data.customQuantity
      state.customeTemplate.taobaoNickname = data.taobaoNickname
      state.customeTemplate.theRecipientName = data.theRecipientName
      state.customeTemplate.user = data.user
      state.customeTemplate.modelType.id = data.modelType
      state.customeTemplate.diePattern = data

      // 电脑贴膜和鼠标垫的图片路径是不一样的
      if (data.modelType === 1) {
        state.cacheDiePattern.path = data.diePatternimagePath
      } else {
        state.cacheDiePattern.path = state.sbdDiePattern?.diePatternimagePath
      }
    },
    SET_CACHE_CUSTOMNUMBER: (state, customNumber) => {
      state.cacheDiePattern.customNumber = customNumber
    },
    SET_CACHE_MODE_TYPE: (state, modelType) => {
      state.cacheDiePattern.modelType = modelType
    },
    SET_CACHE_DATA: (state, data) => {
      state.cacheDiePattern.id = data.id
      state.cacheDiePattern.modelType = data.modelType.id
    },
    SET_JSON_OF_TEMPLATE: (state, jsonStr) => {
      if (!state.customeTemplate.fabricDesignMaterials) {
        state.customeTemplate.fabricDesignMaterials = []
      }
      state.customeTemplate.fabricDesignMaterials.push({
        originJson: jsonStr
      })
    }
  },
  actions: {
    /**
     * 获取`我要定制`列表
     */
    getBookingList ({ commit }, query) {
      return new Promise((resolve, reject) => {
        queryDiePatterns(query).then(response => {
          if (response.status !== 200) reject(new Error('error'))
          commit('SET_BOOKING_LIST', response.data ? response.data : [])
          commit('SET_BOOKING_TOTAL', Number(response?.headers['x-total-count']) || 0)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 获取鼠标垫信息
     */
    getSbdInfo ({ commit }, query) {
      return new Promise((resolve, reject) => {
        queryDiePatterns(query).then(response => {
          if (response.status !== 200) reject(new Error('error'))
          commit('SET_SBD', response.data ? response.data[0] : {})
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 获取`我的定制`列表
     */
    getBookedList ({ commit, getters }, query) {
      return new Promise((resolve, reject) => {
        queryCustomTemplates(Object.assign(
          { login: getters.user.login },
          query
        )).then(response => {
          if (response.status !== 200) reject(new Error('error'))
          commit('SET_BOOKED_LIST', response.data ? response.data : [])
          commit('SET_BOOKED_TOTAL', Number(response?.headers['x-total-count']) || 0)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 获取`我的定制`列表
     */
    getMyAllBookedList ({ commit, getters }, query) {
      return new Promise((resolve, reject) => {
        queryAllCustomTemplates(getters.user.login, Object.assign(
          query
        )).then(response => {
          if (response.status !== 200) reject(new Error('error'))
          commit('SET_BOOKED_LIST', response.data ? response.data : [])
          commit('SET_BOOKED_TOTAL', Number(response?.headers['x-total-count']) || 0)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 初始化磨具数据： 定制数量、淘宝ID、收件人姓名
     */
    initTemplateData ({ commit, state, getters }, { row, type }) {
      const data = Object.assign({
        user: getters.user,
        modelType: type
      }, row)
      return new Promise((resolve) => {
        commit('INIT_TEMPLATE_DATA', data)
        commit('SET_CACHE_MODE_TYPE', state.customeTemplate.modelType.id)
        resolve(state.customeTemplate.customNumber)
      })
    },
    /**
     * 保存自定义磨具
     */
    saveCustomTemplates ({ commit, state }) {
      return new Promise((resolve, reject) => {
        const computerTemplateData = cloneDeep(state.customeTemplate)
        const sbdTemplateData = cloneDeep(state.customeTemplate)

        // 电脑贴膜数据
        computerTemplateData.modelType.id = 1
        // 鼠标垫数据
        sbdTemplateData.modelType.id = 2
        sbdTemplateData.diePattern = state.sbdDiePattern

        Promise.all([
          saveCustomTemplates(computerTemplateData),
          saveCustomTemplates(sbdTemplateData)
        ]).then(response => {
          if (response[0].status !== 201) reject(new Error('saveCustomTemplates: error'))
          commit('SET_CACHE_CUSTOMNUMBER', state.customeTemplate.customNumber)
          commit('SET_CACHE_MODE_TYPE', state.customeTemplate.modelType.id)
          resolve()
        }).catch(err => {
          reject(err)
        })

      })
    },
    /**
     * 更新自定义磨具
     */
    updateCustomTemplates ({ commit, state }, jsonStr) {
      return new Promise((resolve, reject) => {
        commit('SET_JSON_OF_TEMPLATE', jsonStr)
        updateCustomTemplates(state.customeTemplate).then(response => {
          if (response.status !== 200) reject(new Error('updateCustomTemplates: error'))
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 设置缓存中的模具类型
     */
    setCacheDiePattern ({ commit }, data) {
      return new Promise(resolve => {
        commit('SET_CACHE_DATA', data)
        commit('SET_CACHE_CUSTOMNUMBER', data.id)
        resolve()
      })
    }
  }
}

export default home
