<script setup lang="ts">
import { ref } from 'vue';
import { Controller, clProgram, detach } from '../main';
import PGMEditor from './PGMEditor.vue';

const msgSaveChanges = "Please save your changes first.";

const idxSelected = ref(-1); // track currently selected program; -1 == nothing selected; -2 == new program;
const inEditMode = ref(false); // track editing status as emitted from child PGMEditor component

// get a disconnected copy of programs to be able to edit safely
//var Programs = ref(JSON.parse(JSON.stringify(Controller.GetPrograms())));
var Programs = ref(detach(Controller.GetPrograms()));

const curProgram = ref<clProgram>(new clProgram());

// provide class value for program entries dynamically
function highlightClass(index : number){
    return index == idxSelected.value ? (inEditMode.value ? 'editing' : 'current') : 'inactive';
}

// refresh disconnected object of currently selected program
function refreshCurProgram(){
    curProgram.value = idxSelected.value >= 0 ? detach(Programs.value[idxSelected.value]) : new clProgram();
}

function onEmitEdit(){
    // just enter editing mode and notice editing was initiated
    inEditMode.value = true;
}

function onEmitCancel(refresh = true){
    // discard any changes potentially made by user into a program and refresh current disconnected copy of program object
    inEditMode.value = false;
    // if new program was being edited - discard it
    if(idxSelected.value < 0) idxSelected.value = -1; // reset selection
    if(refresh) refreshCurProgram();
}

function onEmitSave(refresh = true){
    // save changes made by user and again create disconnected copy for further editing
    if(idxSelected.value == -2){
        // push new program value to an array and make it selected
        idxSelected.value =  Programs.value.push(curProgram.value) - 1;
    }else{
        // update existing program
        Programs.value[idxSelected.value] = curProgram.value;
    }
    inEditMode.value = false; // reset edit flag
    if(refresh) refreshCurProgram();
}

function onEmitDelete(){
    // delete seletcted program / dismiss new program creation
    inEditMode.value = false;
    // sanity check - only delete currently selected valid program
    if(idxSelected.value >= 0 && idxSelected.value < Programs.value.length){
        Programs.value.splice(idxSelected.value, 1);
    }
    idxSelected.value = -1; // reset currently selected program
    refreshCurProgram();
}

function onOk(){
    // check taht we are not in edit mode / new program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    /* set new program only in case a valid index was selected */
    if(idxSelected.value >= 0){
        // send command to controller
        Controller.SetActiveProgram(Programs.value[idxSelected.value].Name);
    }
    /* if(idxSelected.value < 0){
        Controller._cStatus.actPgm = null;
        Controller._cStatus.isRunning = false;
        Controller._cStatus.stsText = "Active program reset.";
    }else{
        // populate controller with the disconnected copy of selected program
        Controller._cStatus.actPgm = detach(Programs.value[idxSelected.value]);
        Controller._cStatus.stsText = "Selected program idx=" + idxSelected.value;
    } */

    /* navigate back to the main screen */
    window.location.hash = '#/';
}

function onCancel(){
    // check taht we are not in edit mode / new program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    /* update status text */
    Controller._cStatus.stsText = "program selection cancelled";
    /* navigate back to the main screen discarding any changes */
    window.location.hash = '#/';
}

function onUp(){
    // check taht we are not in edit mode / new program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // verify that we stay within boundaries
    idxSelected.value = (idxSelected.value <= 0 ? 0 : idxSelected.value - 1);
    refreshCurProgram();
}

function onDown(){
    // check taht we are not in edit mode / new program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // verify that we stay within boundaries
    idxSelected.value = (idxSelected.value == Programs.value.length - 1 ? idxSelected.value : idxSelected.value + 1);
    refreshCurProgram();
}

function onToggle(index: number){
    // check taht we are not in edit mode / new program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // toggle selection
    idxSelected.value = (index == idxSelected.value ? -1 : index);
    // finally refresh disconnected copy of program
    refreshCurProgram();
}

function onProgramAdd(){
    // check that we are not editing any program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // set current program to a new empty instance
    curProgram.value = new clProgram();
    idxSelected.value = -2;
    inEditMode.value = true;
}

function onSendToController(){
    // check taht we are not in edit mode / new program
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // attempts to save changes to program into controller memory
    Controller.SetPrograms(Programs.value);
    // get a disconnected copy of programs to be able to edit safely
    Programs.value = detach(Controller.GetPrograms());
}

function onSaveToFlash(){
    // check if editing was done and changes have to be sent to controller first
    if(inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // tell controller to save programs to flash memory permanently
    Controller.SavePrograms();
}

</script>



<template>
    <div id="scrPGMSelector" class="tftlike">
        <div>
          <fieldset class="pfset">
              <legend>Programs ({{Programs.length}}):</legend>
              <div
               v-for="(item,index) in Programs"
               @click="onToggle(index)"
               :class="highlightClass(index)">
               <label>{{index}} - {{item.Name}}</label>
              </div>
          </fieldset>
          <div>
            <button id="btnAdd" class="edtbtn" @click="onProgramAdd">Add</button>
            <button id="btnSend" class="edtbtn" @click="onSendToController">Send to controller</button>
            <button id="btnSave" class="edtbtn" @click="onSaveToFlash">Write to memory</button>
          </div>
        </div>
        <div>
            <button id="btnUp" class="tftbtn tftbtnneutral" @click="onUp">UP</button>
            <button id="btnOk" class="tftbtn tftbtnneutral" @click="onOk">Set</button>
            <button id="btnC" class="tftbtn tftbtnneutral" @click="onCancel">X</button>
            <button id="btnDn" class="tftbtn tftbtnneutral" @click="onDown">DN</button>
        </div>
    </div>

    <PGMEditor v-if="idxSelected != -1"
               :program="curProgram"
               :inEdit="idxSelected == -2"
               @edit="onEmitEdit"
               @cancel="onEmitCancel"
               @save="onEmitSave"
               @delete="onEmitDelete">
    </PGMEditor>
</template>



<style>
.editing{
  background-color: brown;
}
.inactive{
  background-color: none;
}
.current{
  background-color: var(--c-tft-btnneutral);
}

.pfset{
    margin: 5px;
    border-radius: 3px;
    display: grid;
    grid-template-columns: 1fr;
}
.pfset > legend{
    font-weight: bolder;
}
</style>