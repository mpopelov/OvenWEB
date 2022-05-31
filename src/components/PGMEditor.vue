<script setup lang="ts">
/**
 * Component for viewing/editing program details in the controller.
 * Tightly bound to (invoked by) PGMSelector component
 * 
 * Defined properties: "program" - is used to pass program instance to be viewed/edited.
 *                                 Parent component creates a disconnected copy of required program
 *                                 in order to handle changes. Elements within this component are bound
 *                                 to that disconnected copy so any changes made are immediately reflected
 *                                 and are visible to parent component (due to JS passing objects by reference)
 *                                 It is up to parent component to save/undo changes upon receiving events
 *                                 emitted from this component.
 *                     "inEdit"  - is used to indicate whether to start in edit mode
 * 
 * Emitted events:
 *  "edit"                       - is emitted on entering edit mode to notify parent
 *  "save"                       - is emitted upon clicking Save button to inform parent of user committing changes
 *  "cancel"                     - is emitted upon clicking Cancel button to inform parent of user discarding changes
 * 
 */

import {ref, computed} from 'vue'
import {clProgram, clPGMStep} from '../main'

const props = defineProps<{
    program: clProgram
    inEdit: Boolean
}>()


const emit = defineEmits(['edit','save', 'cancel'])

var inEditMode = ref(props.inEdit); // default false

// curProgram is computed to keep track of when parent controller changes the property
// it also resets the inEditMode
const curProgram = computed( () => {
    inEditMode.value = props.inEdit;
    return props.program;
    } )

function onEditSave(){
    if(inEditMode.value){
        emit('save'); // emit save event so parent can save possible changes
    }else{
        emit('edit'); // emit edit event to notify parent that changes might be done
    }
    inEditMode.value = !inEditMode.value;
}

function onCancel(){
    emit('cancel'); // emit cancel event to notify parent to discard any changes
    inEditMode.value = false;
}

function onStepInsert(idx = -1){
    // insert program step at a given index.
    // if idx < 0 - insert element at the end of the array
    // make sure index is within boundaries
    let index = ( idx < 0 ? curProgram.value.steps.length : (idx > curProgram.value.steps.length ? curProgram.value.steps.length : idx) )
    curProgram.value.steps.splice( index, 0, new clPGMStep() );
}

function onStepDelete(idx = -1){
    // remove program step
    // add sanity check and do nothing if index is beyond boundaries
    let index = (idx >= curProgram.value.steps.length ? -1 : idx)
    if( index >= 0) curProgram.value.steps.splice( index, 1 ); // remove element only if index is valid
}

function onStepMove(idx = -1, moveup = true){
    // moving step up/down one position reordering steps in the array
    // idx: an index of the step to move
    // moveup: whether to move step up or down
    
    // sanity check so we attempt move on existing steps only
    let index = (idx >= curProgram.value.steps.length ? -1 : idx)
    if(index < 0) return; // no action on out of bound items

    // calculate new index to insert at
    let insindex = 0;
    if(moveup){
        // insert before current position
        insindex = (index > 0 ? index - 1 : 0)
    }else{
        // insert after current position
        insindex = (index == (curProgram.value.steps.length - 1) ? index : index + 1)
    }

    let [step] = curProgram.value.steps.splice( index, 1 ) // remove step (array shifts after this operation)
    curProgram.value.steps.splice( insindex, 0, step ) // put it back at a new position
}
</script>

<template>
    <div class="pgmeditor">
        <section>
            <header><h1 style="margin: 0px;">Program: <input type="text" :disabled="!inEditMode" v-model="curProgram.Name" /></h1></header>
            <table>
              <thead>
                <tr>
                    <th>start T&deg;</th>
                    <th>end T&deg;</th>
                    <th>duration</th>
                    <th>actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(step,index) in curProgram.steps">
                    <td><input type="text" :disabled="!inEditMode" v-model.number="step.tStart" /></td>
                    <td><input type="text" :disabled="!inEditMode" v-model.number="step.tEnd" /></td>
                    <td><input type="text" :disabled="!inEditMode" v-model.number="step.duration" /></td>
                    <td>
                        <button class="edtbtn" :disabled="!inEditMode" id="insbefore" @click="onStepInsert(index)">&uArr;</button>
                        <button class="edtbtn" :disabled="!inEditMode" id="moveup" @click="onStepMove(index, true)">&uarr;</button>
                        <button class="edtbtn" :disabled="!inEditMode" id="del" @click="onStepDelete(index)">&otimes;</button>
                        <button class="edtbtn" :disabled="!inEditMode" id="movedn" @click="onStepMove(index, false)">&darr;</button>
                        <button class="edtbtn" :disabled="!inEditMode" id="insafter" @click="onStepInsert(index + 1)">&dArr;</button>
                    </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><button class="edtbtn" :disabled="!inEditMode" id="addStep" @click="onStepInsert(-1)">+</button></td>
                </tr>
              </tfoot>
            </table>
            <footer>
                <button class="edtbtn" @click="onEditSave">{{inEditMode ? "Save" : "Edit"}}</button>
                <button v-if="inEditMode" class="edtbtn" @click="onCancel">Cancel</button>
            </footer>
        </section>
    </div>
</template>

<style>
.pgmeditor{
    color: var(--c-tft-text);
    background-color: var(--c-tft-bg);
    width: fit-content;
    position: relative;
    justify-self: center;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    padding: 1px;
    border: none;
    border-radius: 3px;
    box-shadow: 3px 3px 3px var(--c-tft-shadow);
}
</style>