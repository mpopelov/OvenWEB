<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue';
import { Controller, clMsgRequest, clMsgResponse } from './main';
import TFTMirror from './components/TFTMirror.vue';
import PGMSelector from './components/PGMSelector.vue';
import Settings from './components/Settings.vue'
import Problem from './components/Problem.vue';

/* simple routing implementation */
interface Router { [route: string] : Component; }
const routes : Router = {
  '/'     : TFTMirror,
  '/sel'  : PGMSelector,
  '/conf' : Settings
}

const currentPath = ref(window.location.hash)
window.addEventListener('hashchange', () => { currentPath.value = window.location.hash })
const currentView = computed(() => { return routes[currentPath.value.slice(1) || '/'] || Problem })

/* prepare WebSocket to communicate with controller once application is mounted */
onMounted(() => {
  Controller.Connect(window.location.host);
});

/* close connection once unmounted */
onUnmounted(() => {
  Controller.Disconnect();
});

</script>



<template>
  <component :is="currentView" />
</template>


<style>
@import './assets/base.css';
</style>
