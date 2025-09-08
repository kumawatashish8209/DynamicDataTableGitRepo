import { LightningElement, track, wire } from 'lwc';
import getListOfObjects from '@salesforce/apex/DataTableHandler.getListOfObjects';
import getRecords from '@salesforce/apex/DataTableHandler.getRecords';

export default class DynamicDataTable extends LightningElement {
    @track selectedValue = '';
    @track options = [];
    @track records = [];
    @track columns = [];
    @track drafvals = [];
    @track tableVisibility = false;
    apiToObj = {};
    error;

    
    connectedCallback() {
        //get all objects from org
        getListOfObjects()
        .then(result => {
            this.apiToObj = result;
            this.options = Object.entries(this.apiToObj)
                     .map(([key, value]) => ({ label: value, value: key }))
                     .sort((a, b) => {
                         // Compare labels alphabetically
                         if(a.label < b.label) return -1;
                         if(a.label > b.label) return 1;
                         return 0;
                     });
        })
        .catch(error => {
            this.options = [];
            console.log('Error: ' + error);
        } );
    }

    handleChangeSelectedObject(event) {            //handle event when object is selected
        this.selectedValue = event.detail.value;
        this.tableVisibility = true;
    }

    @wire(getRecords,{objectName: this.selectedValue}) 
    handleWiredRecords(result) {
        if(result.data) {
            this.records = data;
            this.columns = this.getColumns(data);
        }else {
            this.error = result.error;
            console.log('Error: ' + this.error);
        }
    }

    getColumns(data) {
        let columns = [];
        data.forEach(record => {
            Object.keys(record).forEach(key => {
                columns.push({label: key, fieldName: key});
            });
        });
        
        return columns;
    }
}