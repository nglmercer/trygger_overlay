<template>
  <span 
    :class="[
      'material-symbols',
      filled ? 'material-symbols-filled' : '',
      outlined ? 'material-symbols-outlined' : '',
      rounded ? 'material-symbols-rounded' : '',
      sharp ? 'material-symbols-sharp' : '',
      'hover:cursor-pointer'
    ]"
    :style="{
      'font-variation-settings': 
        `'FILL' ${fill}, 
         'wght' ${weight}, 
         'GRAD' ${grade},
         'opsz' ${opticalSize}`
    }"
  >
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'MaterialSymbol',
  props: {
    filled: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    },
    sharp: {
      type: Boolean,
      default: false
    },
    fill: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 1
    },
    weight: {
      type: Number,
      default: 400,
      validator: value => value >= 100 && value <= 700
    },
    grade: {
      type: Number,
      default: 0,
      validator: value => value >= -25 && value <= 200
    },
    opticalSize: {
      type: Number,
      default: 24,
      validator: value => value >= 20 && value <= 48
    }
  }
}
</script>

<style scoped>
.material-symbols {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}
</style>
