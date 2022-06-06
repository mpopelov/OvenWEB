<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue';
import { Controller } from './main';
import TFTMirror from './components/TFTMirror.vue';
import PGMSelector from './components/PGMSelector.vue';
import Settings from './components/Settings.vue'
import Problem from './components/Problem.vue';

/* WebSocket instance upfront declaration */
var WSocket : WebSocket;

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
  /* try to establish connection and initialize event handlers */
  WSocket = new WebSocket("ws://" + window.location.host + "/ws");

  WSocket.onerror = event => {
    console.log("onWSError: ", event);
    Controller._cStatus.statusText = "WSError: " + event;
  };

  WSocket.onclose = event => {
    console.log("onWSClosed: ", event);
    Controller.isWSConnected = false;
    Controller._cStatus.statusText = "Connection closed: clean=" + event.wasClean + ", code=" + event.code + ", reason: " + event.reason;
  };

  WSocket.onopen = event => {
    console.log("onWSOpen: ", event);
    Controller.isWSConnected = true;
  };

  WSocket.onmessage = event => {
    console.log("onWSMessage: ", event);
    Controller._cStatus.statusText = event.data;
  };
});

/* close connection once unmounted */
onUnmounted(() => {
  WSocket.close();
});

</script>



<template>
  <component :is="currentView" />
</template>


<style>
@import './assets/base.css';
</style>
