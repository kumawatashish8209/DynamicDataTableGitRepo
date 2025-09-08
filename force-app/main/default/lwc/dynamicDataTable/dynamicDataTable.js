import { LightningElement, track } from 'lwc';
import getListOfObjects from '@salesforce/apex/DataTableHandler.getListOfObjects';

export default class DynamicDataTable extends LightningElement {
    @track selectedValue = '';
    @track options = [];
    @track records = [];
    apiToObj = {};

    
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
    }
}