<template>
  <img :src="imgUrl" @click="click($event)">
</template>

<script>
export default {
  name: 'ImageLazyload',
  props: {

    src: {
      src: String,
      default: ''
    }
  },
  data () {
    return {
      imgUrl: '/img/img-placeholder.png'
    }
  },
  created () {
    const self = this
    const newImg = new Image()
    newImg.src = this.src
    newImg.onload = function () {
      self.imgUrl = this.src
    }
    newImg.onerror = function () {
      this.hidden = true
    }
  },
  methods: {
    click (evt) {
      this.$emit('click', evt)
    }
  }
}
</script>
