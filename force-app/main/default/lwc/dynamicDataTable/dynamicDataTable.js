import { LightningElement, track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getListOfObjects from '@salesforce/apex/DataTableHandler.getListOfObjects';
import getFields from '@salesforce/apex/DataTableHandler.getFields';
import getData from '@salesforce/apex/DataTableHandler.getData';
import updateFields from '@salesforce/apex/DataTableHandler.updateFields';

export default class DynamicDataTable extends LightningElement {
    @track selectedValue;
    @track objectOptions = [];
    @track records = [];
    @track columns = [];
    @track drafvals = [];
    @track fieldsOptions = [];
    @track selectedFields = [];
    @track showedData = [];
    @track fieldsVisibility = false;
    @track tableVisibility = false;
    @track isLoading = false;
    count = 0;
    error;

    
    connectedCallback() {
        //get all objects from org
        this.isLoading = true;
        getListOfObjects()
        .then(result => {
            let apiToObj = result;
            this.objectOptions = Object.entries(apiToObj)
                     .map(([key, value]) => ({ label: key, value: value }))
                     .sort((a, b) => {
                         // Compare labels alphabetically
                         if(a.label < b.label) return -1;
                         if(a.label > b.label) return 1;
                         return 0;
                     });

        })
        .catch(error => {
            this.objectOptions = [];
            this.showToast('Error getting objects', error.body.message, 'error');
            //console.log('Error while getting all objects: ' + error);
        } ).finally(() => {
            this.isLoading = false;
        });
    }

    //            <<<<Search for an object>>>>>
    // handle when user reselects a selected object
    handleFocus() {
        if(this.count == 1) {
            this.fieldsVisibility = true;
            this.count = 0;
        }else {
            this.count++;
        }
    }

    // handle event when object is selected or changed
    handleChangeSelectedObject(event) {        
        this.selectedValue = event.detail.value;
        this.getObjectFields();
        this.fieldsVisibility = true;
        this.drafvals = [];
    }

    // imperative call to apex method to get fields of selected object
    getObjectFields() {
        this.isLoading = true;
        getFields({objectApiName: this.selectedValue})
        .then(result => {
            this.fieldsOptions = result.sort((a, b) => a.label.localeCompare(b.label));;
            //console.log('fieldsOptions: ' + JSON.stringify(this.fieldsOptions));
        })
        .catch(error => {
            this.fieldsOptions = [];
            this.showToast('Error getting fields', error.body.message, 'error');        
        })
        .finally(() => {
            this.isLoading = false;
        });
    }


    //           <<<<<<fields selection>>>>>>
    handleChangeDualList(event) {
        this.selectedFields = event.detail.value;
        //console.log('handleChangeDualList: ' + JSON.stringify(this.selectedFields));
    }

    // handle event when user clicks LoadData button
    handleLoad() {
        this.setColoumns(this.selectedFields);
        this.loadData();
        this.handleCancel();
        this.tableVisibility = true;
    }

    // handle event when user clicks cancel button
    handleCancel() {
        this.fieldsVisibility = false;
    }

    // set columns according to selected fields
    setColoumns (fields) {
        this.columns = fields.map(field => {
            //console.log('Mapping label: ' + field.label + ' value: ' + field.value);
            return {
                label: this.fieldsOptions.find(f => f.value === field).label,       
                fieldName: field,
                editable: this.fieldsOptions.find(f => f.value === field).editable === 'false' ? false : true       
            };
        });
    }

    // load data from org according to selected fields
    loadData() {
        if(this.selectedFields.length == 0) {
            this.showToast('No fields selected!', 'Please select at least one field', 'warning');
            return;
        }
        this.isLoading = true;
        getData({fields: this.selectedFields, objectApiName: this.selectedValue})
        .then(result => {
            this.records = result;
            this.showedData = this.records.slice(0, 20);
            if(this.records.length == 0) {
                this.showToast('No records found!', 'No records found for the selected object', 'warning');
            }
        }) 
        .catch(error => {
            this.records = [];
            this.showToast('Error getting data', error.body.message, 'error')
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    //            <<<<<<Data Table of selected object>>>>>>
    // handle event when user clicks save button then update records in org
    handleSave(event){
        this.isLoading = true;
        this.drafvals = event.detail.draftValues;
        updateFields({sobjList :this.drafvals})
        .then (result => {
            if(result == "Success")
                this.showToast('Success', 'Records Updated Successfully!', 'success');
            else
                this.showToast('Error', 'Records are not Updated properly because: '+result, 'error');
            this.loadData();
            this.isLoading = false;
        })
        .catch(error => {
            this.showNotification('Error updating records', error.body.message, 'error');
        })
        .finally(() => {
            this.isLoading = false;
            this.drafvals = [];   // clear after everything
        });
    }

    // handle event when user scrolls to the end of the table
    handleLoadMore() {
        console.log('handleLoadMore called');
        this.isLoading = true;
        this.showedData = this.records.slice(0, this.showedData.length + 20);
        this.isLoading = false;
    }

    // Toast event handling
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

}