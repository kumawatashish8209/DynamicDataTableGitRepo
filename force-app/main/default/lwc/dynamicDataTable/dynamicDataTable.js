import { LightningElement, track } from 'lwc';
import getListOfObjects from '@salesforce/apex/DataTableHandler.getListOfObjects';

export default class DynamicDataTable extends LightningElement {
    @track selectedValue = '';
    @track options = [];

    
    connectedCallback() {
        getListOfObjects()
        .then(result => {
            if (Array.isArray(result)) {
                this.options = result.map(obj => ({ label: obj, value: obj }));  // format the options
            } else {
                this.options = [];
            }
        })
        .catch(error => {
            this.options = [];
            console.log('Error: ' + error);
        } );
    }

    handleChange(event) {
        this.selectedValue = event.detail.value;
    }
}