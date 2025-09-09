/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 09-09-2025
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public class DataTableHandler {
    //search list objects 
    @AuraEnabled
    public static Map<String, String> getListOfObjects() {
        Map<String, String> apiToObj = new Map<String, String>();
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();

        for(Schema.SObjectType obj : gd.values()) {
            apiToObj.put(obj.getDescribe().getLabel(), obj.getDescribe().getName());
        }

        return apiToObj;
    }

    @AuraEnabled
    public static List<Map<String, String>> getFields(String objectApiName) {

        List<Map<String, String>> fieldList = new List<Map<String, String>>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();

        for(String fieldName : fieldMap.keySet()) {
            Map<String, String> fields = new Map<String, String>();
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
            fields.put('label', fieldDescribe.getLabel());
            fields.put('value', fieldDescribe.getName());
            fieldList.add(fields);
        }
        return fieldList;
    }

    @AuraEnabled
    public static List<sObject> getData(List<String> fields, String objectApiName) {
        return Database.query('SELECT ' + String.join(fields, ',') + ' FROM ' + objectApiName);
    }

}