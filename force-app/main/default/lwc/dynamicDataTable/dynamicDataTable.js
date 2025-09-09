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
    @track fieldsVisibility = false;
    @track tableVisibility = false;
    @track isLoading = false;
    error;

    
    connectedCallback() {
        //get all objects from org
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
        } );
    }

    handleChangeSelectedObject(event) {            //handle event when object is selected
        this.selectedValue = event.detail.value;
        this.getObjectFields();
        this.fieldsVisibility = true;
    }

    handleCancel() {
        this.fieldsVisibility = false;
    }

    handleLoad() {
        this.setColoumns(this.selectedFields);
        this.loadData();
        this.handleCancel();
        this.tableVisibility = true;
    }

    handleChangeDualList(event) {
        this.selectedFields = event.detail.value;
        //console.log('handleChangeDualList: ' + JSON.stringify(this.selectedFields));
    }

    getObjectFields() {
        getFields({objectApiName: this.selectedValue})
        .then(result => {
            this.fieldsOptions = result;
            //console.log('fieldsOptions: ' + JSON.stringify(this.fieldsOptions));
        })
        .catch(error => {
            this.fieldsOptions = [];
            this.showToast('Error getting fields', error.body.message, 'error');        
        })
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    setColoumns (fields) {
        this.columns = fields.map(field => {
            //console.log('Mapping label: ' + field.label + ' value: ' + field.value);
            let fieldName = field;
            return {
                label: this.fieldsOptions.find(f => f.value === field).label,       
                fieldName: field,
                editable: fieldName != 'Id' ? true : false       
            };
        });
    }

    loadData() {
        getData({fields: this.selectedFields, objectApiName: this.selectedValue})
        .then(result => {
            this.records = result;
        }) 
        .catch(error => {
            this.records = [];
            this.showToast('Error getting data', error.body.message, 'error')
        });
    }

    //save button functionality while inline edit
    handleSave(event){
        this.isLoading = true;

        this.drafvals = event.detail.draftValues;
        updateFields({sobjList :this.drafvals})
        .then (result => {
            if(result == "Success")
                this.showToast('Success', 'Records Updated Successfully!', 'success');
            else
                this.showToast('Error', 'These records are not Updated : '+result, 'error');
            this.loadData();
            this.isLoading = false;
        })
        .catch(error => {
            this.showNotification('Error updating records', error.body.message, 'error');
        });
        this.drafvals = [];
    }

}