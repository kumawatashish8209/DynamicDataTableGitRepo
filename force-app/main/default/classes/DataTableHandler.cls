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
    public static List<String> getListOfObjects() {
        List<String> objectNames = new List<String>();
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        for(Schema.SObjectType obj : gd.values()) {
            objectNames.add(obj.getDescribe().getName());
        }
        objectNames.sort();
        return objectNames;
    }
}