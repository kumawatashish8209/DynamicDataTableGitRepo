import getContactsByLimit from '@salesforce/apex/contactController.getContactsByLimit';
import getContactsByName from '@salesforce/apex/contactController.getContactsByName';
import updateContacts from '@salesforce/apex/contactController.updateContacts';
import deleteContacts from '@salesforce/apex/contactController.deleteContacts';
import createContact from '@salesforce/apex/contactController.createContact';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { LightningElement, wire, track} from 'lwc';

const actions = [
    {label: 'Edit', name:'edit', iconName:'utility:edit'},
    {label: 'Delete', name:'delete', iconName:'utility:delete'}
]

const columns = [
    {label:'Id', fieldName:'Id'},
    {label:'FirstName', fieldName:'FirstName', editable:true},
    {label:'LastName', fieldName:'LastName', editable:true},
    {label:'Email', fieldName:'Email', type:'text', editable:true},
    {label:'Phone', fieldName:'Phone', type:'text', editable:true},
    {label:'Account Name', fieldName:'AccountName', type:'text'},
    { type: 'action', 
        typeAttributes: { rowActions: actions }
    }
]

export default class ContactTable extends LightningElement {
    @track contacts = [];
    @track drafvals = [];
    @track isLoading = true;
    errors;
    num = 10;
    conName = '';
    columns = columns;

    @track isVisible = false;
    @track contact = {FirstName:'', LastName:'', Email:'', Phone:'', AccountName:'', AccountId:''};

    @track paginatedData = [];
    pageNumber = 1;
    pageSize = 10;
    totalPages = 0;

    inlineDelete = '';
    isVisibleEditForm = false;
    recordId = '';
    //editContact = {FirstName:'', LastName:'', Email:'', Phone:'', AccountName:'', AccountId:''};

    refreshWireContact;

    //get contacts by limit
    /*@wire(getContactsByLimit,{numberOfContacts: '$num'})
    wiredContacts(result) {
        this.refreshWireContact = result;
        if (result.data) {
            this.contacts = result.data.map(record => ({
                ...record,
                AccountName: record.Account?.Name
            }));
            this.errors = undefined;
        }
        else {
            this.contacts = undefined;
            this.errors = result.error;
        }
    }

    setCount(event){
        let val = event.target.value;
        if(val == '') return;
        this.num = val;
    }*/

    //get contacts by search list
    @wire(getContactsByName,{name: '$conName'})
    wiredContacts(result) {
        this.refreshWireContact = result;
        this.isLoading = true;
        if (result.data) {
            this.contacts = result.data.map(record => ({
                ...record,
                AccountName: record.Account?.Name
            }));
            this.totalPages = Math.ceil(result.data.length / this.pageSize);

            let savedPage = localStorage.getItem('pageNumber');
            if (savedPage) {
                this.pageNumber = parseInt(savedPage);
            } else {
                this.pageNumber = 1;
            }

            this.updatePaginatedData();
        }
        else {
            this.errors = result.error;
        }
        this.isLoading = false;
    }

    searchByName(event) {
        let val = event.target.value;
        if(val  == '') return;
        this.conName = val;
    }

    //handle row action
    handleRowAction(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.isLoading = true;
        if(actionName === 'delete'){
            this.inlineDelete = row;
            this.handleDelete();
            this.inlineDelete = null;
        }
        else if(actionName === 'edit'){
            this.isVisibleEditForm = true;
            this.recordId = row.Id;
        }
        this.isLoading = false;
    }

    //edit button functionality using save and cancel
    handleEditForm(event) {
        this.isLoading = true;
        this.isVisibleEditForm = !this.isVisibleEditForm;
        this.recordId = '';
        //console.log('label: '+event.target.dataset.id);
        if(event && event.target.dataset.id === 'EditForm') {
            this.showNotification('Success', 'Contact Updated successfully', 'success');
            this.isLoading = false;
            return refreshApex(this.refreshWireContact);
        }
        
    }

    //pagination
    updatePaginatedData() {
        const start = (this.pageNumber - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedData = this.contacts.slice(start, end);

        localStorage.setItem('pageNumber', this.pageNumber);
    }

    get isFirstPage() {
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber === this.totalPages;
    }

    handleFirst() {
        this.pageNumber = 1;
        this.updatePaginatedData();
    }

    handlePrevious() {
        this.pageNumber--;
        this.updatePaginatedData();
    }

    handleNext() {
        this.pageNumber++;
        this.updatePaginatedData();
    }

    handleLast() {
        this.pageNumber = this.totalPages;
        this.updatePaginatedData();
    }

    //save button functionality while inline edit
    handleSave(event){
        this.isLoading = true;
        this.drafvals = event.detail.draftValues;
        
        updateContacts({conList :this.drafvals})
        .then (result => {
            //console.log('result: '+ result);
            if(result == "Success")
                this.showNotification('Success', 'Records Updated Successfully!', 'success');
            else
                this.showNotification('Error', 'These records are not Updated : '+result, 'error');
            this.isLoading = false;
            return refreshApex(this.refreshWireContact);
        })
        .catch(error => {
            this.showNotification('Error updating records', error.body.message, 'error');
        });
        this.drafvals = [];
    }

    //delete button functionality both inline or muilty delete
    handleDelete() {
        this.isLoading = true;
        let selectedRows = [];
        if(this.inlineDelete){
            selectedRows.push(this.inlineDelete);
        }else{
            selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        }
        //const conIds = selectedRows.map(row => row.Id); // we can also use normal list of contacts
        deleteContacts({conList: selectedRows})
        .then(result => {
            if(result == "Success")
                this.showNotification('Success', 'Records Deleted Successfully!', 'success');
            else
                this.showNotification('Error', 'These records are not Deleted : '+result, 'error');
            this.isLoading = false;
            return refreshApex(this.refreshWireContact);
        })
        .catch(error => {
            this.showNotification('Error deleting records', error.body.message, 'error');
        })

    }

    //new contact creation using modal
    showForm(){
        this.isVisible = true;
    }

    hideForm(){
        //console.log('Hide');
        this.isVisible = false;
        this.contact = {FirstName:'', LastName:'', Email:'', Phone:'', AccountName:'', AccountId:''};
    }

    handleChange(event){                                        //use for assigning values to contact object
        const field = event.target.dataset.id;
        // console.log(field+' '+JSON.stringify(event.detail));
        if(field == 'AccountName'){
            this.contact.AccountId = event.detail.recordId;
        }
        else {
            this.contact[field] = event.target.value;
        }
    }

    saveContact(event){                                 //saving while creating new contact
        this.isLoading = false;
        createContact({con:this.contact})
        .then(result => {
            if(result == "Success"){
                this.showNotification('Success', 'Record Created Successfully!', 'success');
            }
            else{
                this.showNotification('Error', 'This record is not Created : '+result, 'error');
            }
            this.hideForm();
            this.isLoading = false;
            return refreshApex(this.refreshWireContact);
        })
        .catch(error => {
            this.showNotification('Error creating record', error.body.message, 'error');
        })
        
    }

    //toast event
    showNotification(titleText, messageText, variant) {
        const evt = new ShowToastEvent({
          title: titleText,
          message: messageText,
          variant: variant,
        });
        this.dispatchEvent(evt);
    }
}