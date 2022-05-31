<script setup lang="ts">
import { Controller } from '../main';

function onPgmSelect() {
    window.location.hash = '#/sel';
}
</script>

<template>
    <div id="tftmirror" class="tft tftmain">

      <div id="mainscreen" class="displ">
        <p><span>Program: </span><span>{{Controller.program === null ? "no prog selected" : Controller.program.Name}}</span></p>
        <p>
            <span>Step: </span>
            <span>--</span>
            <span> of </span>
            <span>{{Controller.program === null ? "--" : Controller.program.steps.length}}</span></p>
        <p><span>{{Controller.tempProbe}} &deg;C</span></p>
      </div>

      <div id="buttons" class="btns">
        <button id="pgm" class="tftbtn tftbtn40px pgm" @click="onPgmSelect">PGM</button>
        <button 
          id="toggle"
          :class="['tftbtn', 'tftbtn40px', Controller.isRunning ? 'started' : 'stopped']"
          @click="Controller.onStartStop()"
        >{{Controller.isRunning ? "Stop" : "Start"}}
        </button>
      </div>

      <div id="status" class="stts">
        <p id="status">{{Controller.status}}</p>
      </div>

    </div>
</template>

<style>
.tftmain{
  display: grid;
  grid-template-columns: 250px 70px;
}

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