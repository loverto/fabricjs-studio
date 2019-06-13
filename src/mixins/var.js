import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters([
      'canvas',
      'waterText',
      'dieBg'
    ])
  },
  methods: {
    /**
     * 通过Id找到对象
     */
    getObjectById (id) {
      let o = null
      const arr = this.canvas.getObjects()
      const len = arr.length
      for (let i = 0; i < len; i++) {
        if (arr[i]._uuid === id) {
          o = arr[i]
          break
        }
      }
      return o
    },
    /**
     * 置顶一个Fabric对象
     * @param {Object} object Fabric's install
     */
    bringToFront (object) {
      this.canvas.bringToFront(object)
    },
    /**
     * 置顶模糊图和水印内容
     */
    bringDiebgAndWater () {
      const self = this
      if (self.dieBg) {
        self.bringToFront(self.dieBg)
      }
      if (self.waterText) {
        self.bringToFront(self.waterText)
      }
    }
  }
}
