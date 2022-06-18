<script setup lang="ts">
import { Controller } from '../main';

function onPgmSelect() {
  window.location.hash = '#/sel';
}

function onConf() {
  window.location.hash = '#/conf';
}

function Duration(ms : number) : String {
    return String(Math.floor(ms/3600000)) + "h : " 
           + String( Math.floor(((Math.floor(ms/1000))%3600)/60) ) + "m : "
           + String( ((Math.floor(ms/1000))%3600)%60 ) + "s";
}

</script>

<template>
    <div id="scrTFTMirror" class="tftmirror">

      <div id="mainscreen" class="displ">
        <div>
          <span>Program: </span>
          <span>{{Controller._cStatus.actPgm === null ? "no prog selected" : Controller._cStatus.actPgm.Name}}</span>
        </div>
        <div>
          <span>Step: </span>
          <span>{{Controller._cStatus.actPgm === null ? "--" : Controller._cStatus.actStep}}</span>
          <span> of </span>
          <span>{{Controller._cStatus.actPgm === null ? "--" : Controller._cStatus.actPgm.steps.length}}</span>
        </div>
        <div style="min-height: 110px; display: flex; align-items: center;">
          <span style="font-size:xx-large; text-align: center; vertical-align: middle;">{{Controller._cStatus.tPB}} &deg;C</span>
        </div>
        <div>
          <span>Step time: </span>
          <span>{{ Duration(Controller._cStatus.tmElapsed) }}</span>
        </div>
        <div>
          <span>Program time: </span>
          <span>{{ Duration(Controller._cStatus.tmElapsed) }}</span>
        </div>
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
  min-height: 210px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25px 25px 110px 25px 25px;
}

.btns {
  grid-column: 2;
}

.stts{
  grid-column: span 2;
  min-height: 30px;
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