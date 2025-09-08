/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 09-08-2025
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public class DataTableHandler {
    //search list objects 
    @AuraEnabled
    public static Map<String, String> getListOfObjects() {
        Map<String, String> apiToObj = new Map<String, String>();
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();

        for(Schema.SObjectType obj : gd.values()) {
            apiToObj.put(obj.getDescribe().getName(), obj.getDescribe().getLabel());
        }

        return apiToObj;
    }
}