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
 *  "delete"                     - is emitted upon clicking Delete button to inform parent of user intention to delete program
 * 
 */

import {ref, computed} from 'vue'
import {clProgram, clPGMStep} from '../main'

/**
 * Properties exposed by component:
 * - program: a program to show/edit
 * - inEdit: whether editing is allowed
 */
const props = defineProps<{
    program: clProgram
    inEdit: Boolean
}>()

/**
 * Events emitted by component:
 * - edit: enter current program editing mode
 * - save: save changes to current program requested
 * - cancel: discard changes to current program requested
 * - delete: request to delete current program
 */
const emit = defineEmits(['edit','save','cancel','delete'])

/**
 * Current component state: showing/editing.
 */
var inEditMode = ref(props.inEdit); // default false

/**
 * curProgram is computed to keep track of when parent controller changes the property.
 * It also resets the inEditMode.
 */
const curProgram = computed( () => {
    inEditMode.value = props.inEdit;
    return props.program;
    } )

/**
 * Enter editing mode or save changes done.
 */
function onEditSave(){
    if(inEditMode.value){
        emit('save'); // emit save event so parent can save possible changes
    }else{
        emit('edit'); // emit edit event to notify parent that changes might be done
    }
    inEditMode.value = !inEditMode.value;
}

/**
 * Cancel any changes.
 */
function onCancel(){
    emit('cancel'); // emit cancel event to notify parent to discard any changes
    inEditMode.value = false;
}

/**
 * Delete program
 */
function onDelete(){
    emit('delete');
    inEditMode.value = false;
}

/**
 * Insert program step at a given index.
 * @param idx index to insert at. If idx < 0 - insert element at the end of the array
 */
function onStepInsert(idx = -1){
    // make sure index is within boundaries
    let index = ( idx < 0 ? curProgram.value.steps.length : (idx > curProgram.value.steps.length ? curProgram.value.steps.length : idx) )
    curProgram.value.steps.splice( index, 0, new clPGMStep() );
}

/**
 * Remove program step.
 * @param idx index of step to remove
 */
function onStepDelete(idx = -1){
    // add sanity check and do nothing if index is beyond boundaries
    let index = (idx >= curProgram.value.steps.length ? -1 : idx)
    if( index >= 0) curProgram.value.steps.splice( index, 1 ); // remove element only if index is valid
}

/**
 * Move step up/down one position reordering steps in the program
 * @param idx index of step to move
 * @param moveup whether to move step up or down
 */
function onStepMove(idx = -1, moveup = true){
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
    <div class="tftexp pgmeditor">
        <div>
            <label class="lblpgm">Program:
                <input type="text" :disabled="!inEditMode" v-model="curProgram.Name" />
            </label>
            <button class="alert edtbtn" :disabled="!inEditMode" id="delpgm" @click="onDelete">Delete</button>
        </div>
        <div class="pgmstep" v-for="(step,index) in curProgram.steps">
            <div class="pgmstepno">Step {{index}}</div>
            <div class="pgmstepdetails">
                <fieldset class="fset">
                    <legend>start T&deg;</legend>
                    <input type="number" :disabled="!inEditMode" v-model.number="step.tStart" />
                </fieldset>
                <fieldset class="fset">
                    <legend>end T&deg;</legend>
                    <input type="number" :disabled="!inEditMode" v-model.number="step.tEnd" />
                </fieldset>
                <fieldset class="fset">
                    <legend>duration</legend>
                    <input type="number" :disabled="!inEditMode" v-model.number="step.duration" />
                </fieldset>
            </div>
            <div class="pgmactions">
                <fieldset class="fset">
                    <legend>Actions</legend>
                    <button class="edtbtn" :disabled="!inEditMode" id="insbefore" @click="onStepInsert(index)">&uArr;</button>
                    <button class="edtbtn" :disabled="!inEditMode" id="moveup" @click="onStepMove(index, true)">&uarr;</button>
                    <button class="edtbtn" :disabled="!inEditMode" id="del" @click="onStepDelete(index)">&otimes;</button>
                    <button class="edtbtn" :disabled="!inEditMode" id="movedn" @click="onStepMove(index, false)">&darr;</button>
                    <button class="edtbtn" :disabled="!inEditMode" id="insafter" @click="onStepInsert(index + 1)">&dArr;</button>
                </fieldset>
            </div>
        </div>




        
        <div>
            <button class="edtbtn" @click="onEditSave">{{inEditMode ? "Save" : "Edit"}}</button>
            <button v-if="inEditMode" class="edtbtn" @click="onCancel">Cancel</button>
            <button class="edtbtn" :disabled="!inEditMode" id="addStep" @click="onStepInsert(-1)">Add step</button>
        </div>
    </div>
</template>

<style>
.pgmeditor{
    color: var(--c-tft-text);
    background-color: var(--c-tft-bg);
    position: relative;
    width:fit-content;
    justify-self: center;
    padding: 5px;
    border: none;
    border-radius: 3px;
    box-shadow: 3px 3px 3px var(--c-tft-shadow);

    display: grid;
    grid-template-columns: 1fr;
    row-gap: 5px;
}

.pgmstep{
    display: grid;
    grid-template-columns: 20px minmax(min-content,610px) minmax(min-content,180px);
    column-gap: 2px;
    height: min-content;
    border-bottom-style: unset;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: antiquewhite;
    padding: 2px;
}

.pgmstepno{
    -ms-writing-mode: tb-rl;
    -webkit-writing-mode: vertical-rl;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    white-space: nowrap;
    text-align: center;
    vertical-align: middle;
    width: min-content;
    height: min-content;
    align-self: center;
}

.pgmstepdetails{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min-content, 200px));
    column-gap: 2px;
    row-gap: 2px;
}

.pgmactions{
    width: minmax(40px, min-content);
}

.fset{
    padding-left: 1px;
    padding-right: 1px;
    padding-bottom: 1px;
    border-radius: 3px;
}

.alert{
    background-color: red !important;
}

.lblpgm{
    font-weight: bold;
    font-size: large;
}
</style>