<script setup lang="ts">
/**
 * Component to manage general controller settings
 */
import { ref } from 'vue';
import { Controller, detach } from '../main';


var curConfiguration = ref(detach(Controller.GetConfiguration()));

function onConfSave(){
    // save configuration to controller memory
    Controller.SetConfiguration(curConfiguration.value);
    // navigate back to the main screen
    window.location.hash = '#/';
}

function onConfCancel(){
    // navigate back to the main screen
    window.location.hash = '#/';
}

</script>



<template>
    <div id="scrSettings" class="tftlike">
        <div id="Settings">

            <div id="sWiFi" v-if="curConfiguration.WiFi">
                <fieldset class="sfset2">
                    <legend>WiFi settings</legend>
                    <label for="iSSID">SSID:</label>
                    <input id="iSSID" type="text" v-model="curConfiguration.WiFi.SSID" />
                    <label for="iKEY">KEY:</label>
                    <input id="iKEY" type="text" v-model="curConfiguration.WiFi.KEY" />
                </fieldset>
            </div>

            <div id="sPID" v-if="curConfiguration.PID">
                <fieldset class="sfset2">
                    <legend>PID parameters</legend>
                    <label for="iK_p">K_p:</label>
                    <input id="iK_p" type="number" v-model="curConfiguration.PID.KP" />
                    <label for="iK_i">K_i:</label>
                    <input id="iK_i" type="number" v-model="curConfiguration.PID.KI" />
                    <label for="iK_d">K_d:</label>
                    <input id="iK_d" type="number" v-model="curConfiguration.PID.KD" />
                </fieldset>
            </div>

            <div id="sTFT" v-if="curConfiguration.TFT">
                <fieldset class="sfset1">
                    <legend>TFT touchscreen data</legend>
                    {{curConfiguration.TFT}}
                </fieldset>
            </div>

            <div id="sPrograms" v-if="curConfiguration.Programs">
                <fieldset class="sfset1">
                    <legend>Available programs ({{curConfiguration.Programs.length}})</legend>
                    <div v-for="(item,index) in curConfiguration.Programs">{{index}} - {{item.Name}} ({{item.steps.length}} steps)</div>
                </fieldset>
            </div>

        </div>
        <div id="buttons">
            <button id="OK" class="tftbtn tftbtnneutral" @click="onConfSave">OK</button>
            <button id="Cancel" class="tftbtn tftbtnneutral" @click="onConfCancel">Cancel</button>
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