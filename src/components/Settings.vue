<script setup lang="ts">
/**
 * Component to manage general controller settings
 */
import { ref } from 'vue';
import { Controller, detach, clProgram } from '../main';


var curConfiguration = ref(detach(Controller.GetConfiguration()));
var curPrograms = ref(detach(Controller.GetPrograms()));

function onConfSet(){
    // send configuration to controller memory
    Controller.SetConfiguration(curConfiguration.value);
}

function onConfSave(){
    // tell controller to write configuration to flash
    //Controller.SetConfiguration(curConfiguration.value);
    Controller.SaveConfiguration();
    // navigate back to the main screen
    window.location.hash = '#/';
}

function onConfCancel(){
    // navigate back to the main screen
    window.location.hash = '#/';
}

function programDuration(pgm : clProgram) : String {
    let duration = 0;
    for(const step of pgm.steps){
        duration += step.duration;
    }
    return String(Math.floor(duration/3600000)) + "h : " 
           + String( Math.floor(((Math.floor(duration/1000))%3600)/60) ) + "m : "
           + String( ((Math.floor(duration/1000))%3600)%60 ) + "s";
}

</script>



<template>
    <div id="scrSettings" class="tftlike">
        <div id="Settings">

            <div id="sWiFi" v-if="curConfiguration.WiFi">
                <fieldset class="sfset2">
                    <legend>WiFi settings</legend>
                    <label for="iSSID">SSID:</label>
                    <input id="iSSID" type="text" maxlength="32" v-model="curConfiguration.WiFi.SSID" />
                    <label for="iKEY">KEY:</label>
                    <input id="iKEY" type="text" maxlength="64" v-model="curConfiguration.WiFi.KEY" />
                </fieldset>
            </div>

            <div id="sPID" v-if="curConfiguration.PID">
                <fieldset class="sfset2">
                    <legend>PID parameters</legend>
                    <label for="iPIDPoll">poll:</label>
                    <input id="iPIDPoll" type="number" v-model="curConfiguration.PID.poll" />
                    <label for="iK_p">K_p:</label>
                    <input id="iK_p" type="number" v-model="curConfiguration.PID.KP" />
                    <label for="iK_i">K_i:</label>
                    <input id="iK_i" type="number" v-model="curConfiguration.PID.KI" />
                    <label for="iK_d">K_d:</label>
                    <input id="iK_d" type="number" v-model="curConfiguration.PID.KD" />
                    <label for="iTOL">K_d:</label>
                    <input id="iTOL" type="number" v-model="curConfiguration.PID.TOL" />
                </fieldset>
            </div>

            <div id="sTFT" v-if="curConfiguration.TFT">
                <fieldset class="sfset2">
                    <legend>TFT touchscreen data</legend>
                    <label for="iTFTPoll">poll:</label>
                    <input id="iTFTPoll" type="number" v-model="curConfiguration.TFT.poll" />
                    <div>data:</div> <div style="font-size:smaller">{{curConfiguration.TFT.TFT}}</div>
                </fieldset>
            </div>

            <div id="sPrograms" v-if="curPrograms">
                <fieldset class="sfset1">
                    <legend>Available programs ({{curPrograms.length}})</legend>
                    <div v-for="(item,index) in curPrograms">
                        <div>{{index}} - {{item.Name}}</div>
                        <div style="font-size:smaller">({{item.steps.length}} steps, {{programDuration(item)}})</div>
                    </div>
                </fieldset>
            </div>

        </div>
        <div id="buttons">
            <button id="OK" class="tftbtn tftbtnneutral" @click="onConfSave">OK</button>
            <button id="Cancel" class="tftbtn tftbtnneutral" @click="onConfCancel">Cancel</button>
            <button id="Set" class="tftbtn tftbtnneutral" @click="onConfSet">Send to controller</button>
        </div>
    </div>
</template>

<style>
.sfset1,
.sfset2{
    margin: 5px;
    border-radius: 3px;
}

.sfset2{
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.sfset1 > legend,
.sfset2 > legend{
    font-weight: bolder;
}
</style>