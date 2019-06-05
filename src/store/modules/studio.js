/**
 * 工作台
 */

import * as Api from '@/api/studio'
import { cloneDeep } from 'lodash'

const studio = {
  state: {
    // 画布
    canvas: null,
    // 激活对象
    activeObject: null,
    // 官方图库类型
    galleryTypes: [],
    // 官方图库
    gallerys: [],
    // 图层
    layers: []
  },
  mutations: {
    SET_CANVAS: (state, canvas) => {
      state.canvas = canvas
    },
    SET_ACTIVE_OBJECT: (state, activeObject) => {
      state.activeObject = activeObject
    },
    DEL_ACTIVE_OBJECT: (state) => {
      state.activeObject = null
    },
    SET_GALLERYTYPES: (state, data) => {
      state.galleryTypes = data
    },
    SET_GALLERYS: (state, data) => {
      state.gallerys = data
    },
    SET_LAYERS: (state, object) => {
      state.layers.push(object)
    }
  },
  actions: {
    /**
     * 设置 Canvas 实例
     */
    setCanvas ({ commit }, canvas) {
      commit('SET_CANVAS', canvas)
    },
    /**
     * 设置当前激活的 Canvas 对象
     */
    setActiveObject ({ commit }, activeObject) {
      return new Promise(resolve => {
        commit('SET_ACTIVE_OBJECT', activeObject)
        resolve()
      })
    },
    /**
     * 清空当前激活的 Canvas 对象
     */
    delActiveObject ({ commit }) {
      commit('DEL_ACTIVE_OBJECT')
    },
    /**
     * 获取官方图库分类
     */
    getGalleryTypes ({ commit }) {
      return new Promise((resolve, reject) => {
        Api.fetchImageTypes().then(response => {
          if (response.status !== 200) reject(new Error('fetchImageTypes: error'))
          commit('SET_GALLERYTYPES', response.data)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 根绝分类Id获取图库
     * @param  {String|Number} typeId 图片类型Id
     */
    getGalleryByTypeId ({ commit }, typeId) {
      return new Promise((resolve, reject) => {
        if (!typeId) {
          Api.fetchImages().then(response => {
            if (response.status !== 200) reject(new Error('fetchImages: error'))
            commit('SET_GALLERYS', response.data)
          })
        } else {
          Api.fetchImagesByTypeId(typeId).then(response => {
            if (response.status !== 200) reject(new Error('fetchImagesByTypeId: error'))
            commit('SET_GALLERYS', response.data)
          })
        }
      })
    },
    /**
     * 根据Id获取Fabric’s json 文件
     * @param  {String|Number} id 定制编号或定制id
     */
    getFabricJsonById ({ commit }, id) {
      return new Promise((resolve, reject) => {
        let fetchJson = null
        if (typeof id === 'string') {
          fetchJson = Api.getFabricDesignMaterialsByCustomNumber(id)
        } else {
          fetchJson = Api.getFabricDesignMaterialsByCustomId(id)
        }
        fetchJson.then(response => {
          if (!response.status === 200) return reject(new Error('getFabricJsonById: error'))
          resolve(response.data.length > 0 ? response.data[0] : null)
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 保存/更新设计素材
     */
    saveOrUpdateFabricDesign ({ commit, getters }, jsonStr) {
      return new Promise((resolve, reject) => {
        const data = cloneDeep(getters.cacheSavedCustomTemplate)
        data.originJson = jsonStr
        Api.updateFabricDesignMaterials(data).then(response => {
          if (response.status !== 200) reject(new Error('saveOrUpdateFabricDesign: error'))
          resolve(response)
        }).catch(err => {
          reject(err)
        })
      })
    },
    /**
     * 添加图层
     */
    pushLayer ({ commit }, object) {
      return new Promise(resolve => {
        commit('SET_LAYERS', object)
        resolve()
      })
    },
    /**
     * 删除图层
     */
    removeLayer ({ getters }, id) {
      return new Promise(resolve => {
        const arr = getters.layers
        arr.forEach((item, index) => {
          if (item.id === id) {
            arr.splice(index, 1)
          }
        })
        resolve()
      })
    },
    /**
     * 设置图层属性
     */
    setLayerValue ({ getters }, prod) {
      return new Promise(resolve => {
        const arr = getters.layers
        arr.forEach((item, index) => {
          if (item.id === prod.id) {
            item[prod.key] = prod.value
          }
        })
        resolve()
      })
    }
  }
}

export default studio
