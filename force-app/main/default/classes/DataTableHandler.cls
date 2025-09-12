/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 09-12-2025
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class DataTableHandler {
    //search list objects 
    @AuraEnabled
    public static Map<String, String> getListOfObjects() {
        Map<String, String> apiToObj = new Map<String, String>();
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        
        for(Schema.SObjectType obj : gd.values()) {
            if(obj.getDescribe().isAccessible()){
                apiToObj.put(obj.getDescribe().getLabel(), obj.getDescribe().getName());
            }
        }

        return apiToObj;
    }

    @AuraEnabled
    public static List<Map<String, String>> getFields(String objectApiName) {

        List<Map<String, String>> fieldList = new List<Map<String, String>>();
        try {
            Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();

            for(String fieldName : fieldMap.keySet()) {
                
                Map<String, String> fields = new Map<String, String>();
                Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                if(!fieldDescribe.isAccessible()) continue;
                fields.put('label', fieldDescribe.getLabel());
                fields.put('value', fieldDescribe.getName());
                fields.put('editable', String.valueOf(fieldDescribe.isUpdateable()));
                fieldList.add(fields);
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
        return fieldList;
    }

    @AuraEnabled
    public static List<sObject> getData(List<String> fields, String objectApiName) {
        try {
            return Database.query('SELECT ' + String.join(fields, ',') + ' FROM ' + objectApiName);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

    }

    @AuraEnabled
    public static String updateFields(List<SObject> sobjList) {
        
        Database.SaveResult[] res = Database.update(sobjList, false);
        List<String> errList = new List<String>();
        for(Database.SaveResult sr : res) {
            if(!sr.isSuccess()){
                for(Database.Error err : sr.getErrors()){
                    errList.add(err.getMessage());
                }
            }
            
        }
        if(errList.size() > 0) {
            return String.join(errList, ' , ');
        }else {
            return 'Success';
        }
    }

}