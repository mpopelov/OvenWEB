<script setup lang="ts">
import { ref, onUpdated } from 'vue';
import { Controller, clProgram, detach } from '../main';
import PGMEditor from './PGMEditor.vue';

const msgSaveChanges = "Please save your changes first.";

const idxSelected = ref(-1); // track currently selected program
const inEditMode = ref(false); // track editing status as emitted from child PGMEditor component
const isNewProgram = ref(false); // flag to indicate a new program is added and edited

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
    curProgram.value = idxSelected.value == -1 ? {} : detach(Programs.value[idxSelected.value]);
}

onUpdated(() => {
    // if the new program was added it might need to be scrolled into visible area
    if(isNewProgram.value) document.getElementById('prg'+idxSelected.value)?.scrollIntoView(false);
})

function onEmitEdit(){
    // just enter editing mode and notice editing was initiated
    inEditMode.value = true;
}

function onEmitCancel(refresh = true){
    // discard any changes potentially made by user into a program and refresh current disconnected copy of program object
    inEditMode.value = false;
    if(isNewProgram.value){
        // cancel was called on editing newly created program
        isNewProgram.value = false;
        idxSelected.value = -1; // reset selection
        Programs.value.pop(); // remove added program from array
    }
    if(refresh) refreshCurProgram();
}

function onEmitSave(refresh = true){
    // save changes made by user and again create disconnected copy for further editing
    Programs.value[idxSelected.value] = curProgram.value;
    inEditMode.value = false;
    isNewProgram.value = false; // program not new anymore :)
    if(refresh) refreshCurProgram();
}

function onOk(){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    /* set new program only in case a valid index was selected */
    if(idxSelected.value == -1){
        Controller.program = null;
        Controller.isRunning = false;
        Controller.status = "Active program reset.";
    }else{
        /* populate controller with the disconnected copy of selected program */
        Controller.program = detach(Programs.value[idxSelected.value]);
        Controller.status = "Selected program idx=" + idxSelected.value;
    }

    /* navigate back to the main screen */
    window.location.hash = '#/';
}

function onCancel(){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    /* update status text */
    Controller.status = "program selection cancelled";
    /* navigate back to the main screen discarding any changes */
    window.location.hash = '#/';
}

function onUp(){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // verify that we stay within boundaries
    idxSelected.value = (idxSelected.value <= 0 ? 0 : idxSelected.value - 1);
    refreshCurProgram();
    // scroll to selected item so it is visible
    document.getElementById('prg'+idxSelected.value)?.scrollIntoView(true);
}

function onDown(){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // verify that we stay within boundaries
    idxSelected.value = (idxSelected.value == Programs.value.length - 1 ? idxSelected.value : idxSelected.value + 1);
    refreshCurProgram();
    // scroll selected element into view
    document.getElementById('prg'+idxSelected.value)?.scrollIntoView(false);
}

function onToggle(index: number){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // toggle selection
    idxSelected.value = (index == idxSelected.value ? -1 : index);
    // finally refresh disconnected copy of program
    refreshCurProgram();
}

function onProgramAdd(){
    // check that we are not editing a new program already
    if(isNewProgram.value){
        window.alert(msgSaveChanges);
        return;
    }
    // add a new program to controller configuration at the end of current list
    Programs.value.push(new clProgram());
    // set focus to the new program and refresh
    idxSelected.value = Programs.value.length - 1;
    inEditMode.value = true;
    isNewProgram.value = true;
    refreshCurProgram();
}

function onProgramDelete(index: number){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // delete a progam from controller configuration

    // sanity check
    if(index < 0 || index >= Programs.value.length) return; // do nothing on index out of bound
    Programs.value.splice(index, 1);
}

function onSaveToController(){
    // check taht we are not in edit mode / new program
    if(isNewProgram.value || inEditMode.value){
        window.alert(msgSaveChanges);
        return;
    }
    // attempts to save changes to program into controller memory
    Controller.SetPrograms(Programs.value);
    // get a disconnected copy of programs to be able to edit safely
    Programs.value = detach(Controller.GetPrograms());
}

</script>



<template>
    <div class="tft tftpgm">
        <div>
          <table class="pgmtbl">
            <thead>
              <tr>
                <th colspan="2">Programs:</th>
              </tr>
            </thead>
            <tbody>
              <tr
               v-for="(item,index) in Programs"
               :id="`prg${index}`"
               @click="onToggle(index)"
               :class="[highlightClass(index)]">
                <td style="width: 95%;"><label>{{index}} - {{item.Name}}</label></td>
                <td><button id="del" class="edtbtn" @click.stop="onProgramDelete(index)">&otimes;</button></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">
                  <button id="btnAdd" class="edtbtn" @click="onProgramAdd">Add</button>
                  <button id="btnSave" class="edtbtn" @click="onSaveToController">Save to controller</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div>
            <button id="btnUp" class="tftbtn tftbtn40px current" @click="onUp">UP</button>
            <button id="btnOk" class="tftbtn tftbtn40px current" @click="onOk">Set</button>
            <button id="btnC" class="tftbtn tftbtn40px current" @click="onCancel">X</button>
            <button id="btnDn" class="tftbtn tftbtn40px current" @click="onDown">DN</button>
        </div>
    </div>
    <PGMEditor v-if="idxSelected != -1" :program="curProgram" :inEdit="isNewProgram" @edit="onEmitEdit" @cancel="onEmitCancel" @save="onEmitSave"></PGMEditor>
</template>



<style>
.tftpgm{
  display: grid;
  grid-template-columns: 280px 40px;
  padding: 0px;
}

table.pgmtbl{
    width: 275px;
    margin-left: 5px;
    border-collapse: collapse;
}
table.pgmtbl tbody{
    display: block;
    overflow: auto;
    height: 140px;
}
table.pgmtbl td{
    padding: 0px;
}

.current{
  background-color: rgba(0, 255, 234, 0.349);
}
.editing{
  background-color: brown;
}
.inactive{
  background-color: none;
}
</style>