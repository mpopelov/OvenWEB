<script setup lang="ts">
import { Controller } from '../main';

function onPgmSelect() {
  window.location.hash = '#/sel';
}

function onConf() {
  window.location.hash = '#/conf';
}

</script>

<template>
    <div id="scrTFTMirror" class="tftmirror">

      <div id="mainscreen" class="displ">
        <p><span>Program: </span><span>{{Controller._cStatus.actPgm === null ? "no prog selected" : Controller._cStatus.actPgm.Name}}</span></p>
        <p>
            <span>Step: </span>
            <span>--</span>
            <span> of </span>
            <span>{{Controller._cStatus.actPgm === null ? "--" : Controller._cStatus.actPgm.steps.length}}</span></p>
        <p><span>{{Controller._cStatus.tPB}} &deg;C</span></p>
      </div>

      <div id="buttons" class="btns">
        <button id="pgm" class="tftbtn pgm" @click="onPgmSelect">Prog</button>
        <button 
          id="toggle"
          :class="['tftbtn', Controller._cStatus.isRunning ? 'started' : 'stopped']"
          @click="Controller.onStartStop()"
        >{{Controller._cStatus.isRunning ? "Stop" : "Start"}}
        </button>
        <button id="conf" class="tftbtn tftbtnneutral" @click="onConf">Conf</button>
      </div>

      <div id="status" class="stts">
        <p id="status">{{Controller._cStatus.stsText}}</p>
      </div>

    </div>
</template>

<style>
.displ {
  grid-column: 1;
  min-height: 200px;
}

.btns {
  grid-column: 2;
}

.stts{
  grid-column: span 2;
}

/* specific for program selection button */
.pgm{
  background-color:blueviolet;
}
/* specific for start/stop button */
.started{
  background-color: red;
}
.stopped{
  background-color: green;
}
</style>