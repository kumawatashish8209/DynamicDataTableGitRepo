/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 09-08-2025
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/

public with sharing class contactController {
    @AuraEnabled(cacheable = true)
    public static List<Contact> getContactsByLimit(integer numberOfContacts) {
        List<Contact> conList = [select id, AccountId, firstName, lastname, email, phone, Account.name from Contact order by createdDate desc limit :numberOfContacts];
        return conList;
    }

    @AuraEnabled(cacheable = true)
    public static List<Contact> getContactsByName(String name) {
        String searchKey = '%' + name + '%';
        List<Contact> conList = [select id, AccountId, firstName, lastname, email, phone, Account.name from Contact where name like :searchKey];
        return conList;
    }

    @AuraEnabled
    public static String updateContacts(List<Contact> conList) {
        //System.debug(conList);
        Database.SaveResult[] res = Database.update(conList, false);
        List<String> errList = new List<String>();
        for(Database.SaveResult sr : res) {
            if(!sr.isSuccess()) {
                errList.add(sr.getId());
            }
        }

        if(!errList.isEmpty()) {
            //System.debug('errors : '+errList);
            return errList.toString();
        }
        else {
            return 'Success';
        }
    }

    @AuraEnabled
    public static String deleteContacts(List<Contact> conList){
        if(conList == null || conList.isEmpty()) return 'No records selected';
        System.debug('conList :'+conList);
        Database.DeleteResult[] drList = Database.delete(conList, false);
        List<String> errList = new List<String>();
        for(Database.DeleteResult dr : drList) {
            if(!dr.isSuccess()){
                errList.add(dr.getId());
            }
        }
        if(errList.isEmpty()){
            return 'Success';
        }else{
            return errList.toString();
        }
    }

    @AuraEnabled
    public static String createContact(Contact con) {
        Database.SaveResult sr = Database.insert(con, false);
        if(sr.isSuccess()) {
            return 'Success';
        }else{
            return sr.getErrors().toString();
        }
    }
    
}