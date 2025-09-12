/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 09-12-2025
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
private class DataTableHandlerTest {
    
    @testSetup
    static void DataFactory() {
        List<Account> lst = new List<Account>();
        for(integer i=0;i<10;i++){
            lst.add(new Account(name='AccTest'+(i+1), Active__c = 'Yes'));
        }
        insert lst;
    }

    @isTest
    static void getListOfObjectsTest() {
        
        Map<String, String> apiToObj = DataTableHandler.getListOfObjects();
        System.Assert.areEqual(True, apiToObj.containsKey('Account'), 'Msg : Map size is ' + apiToObj.size());
    }
    
    @isTest
    static void getFieldsTest_Positive() {
        String objApiName = 'Account';
        List<Map<String, String>> res1 = DataTableHandler.getFields(objApiName);
        System.Assert.areEqual(true, true, 'List of Map : '+res1);
        
    }
    
    @isTest
    static void getFieldsTest_negative() {
        Boolean excThrow = false;
        try{
            String objApiName = '';
            List<Map<String, String>> res2 = DataTableHandler.getFields(objApiName);
            System.Assert.areEqual(excThrow, true, 'List of Map : '+res2);
        }
        catch(Exception e){
            excThrow = true;
            Assert.areEqual(excThrow, true, e.getMessage());
        }
        
    }
    
    @isTest
    static void getDataTest_positive() {
        String objApiName = 'Account';
        List<String> fields = new List<String>{'Id', 'Name', 'createdDate', 'Active__c', 'Description'};
        List<SObject> lst = DataTableHandler.getData(fields, objApiName);
        System.Assert.areEqual(10, lst.size(), 'Msg : '+lst);
    }
    
    @isTest
    static void getDataTest_negative() {
        Boolean excThrow = false;
        try{
            String objApiName = '';
            List<String> fields = new List<String>{'Id', 'Name', 'createdDate', 'Active__c', 'Description'};
            List<SObject> lst = DataTableHandler.getData(fields, objApiName);
            System.Assert.areEqual(excThrow, true, 'Msg : '+lst);
        }catch(Exception e){
            excThrow = true;
            System.Assert.areEqual(excThrow, true, 'Msg : '+e.getMessage());
        }
        
    }
    
    @isTest
    static void updateFieldsTest_positive() {
        List<Account> lst = [select name, description, Active__c from Account];
        for(Account acc : lst){
            acc.description = 'Description Added';
            acc.Active__c = 'No';
        }
        
        String s1 = DataTableHandler.updateFields(lst);
        List<Account> res1 = [select id, name, description, Active__c from Account];
        Assert.areEqual('Success', s1, 'Msg : '+res1);
    }
    
    @isTest
    static void updateFieldsTest_negative() {
        List<Account> lst = [select name, description, Active__c from Account];
        for(Account acc : lst){
            acc.description = 'Description Added';
            acc.Active__c = 'No';
        }
        
        lst.add(new Account());
        String s2 = DataTableHandler.updateFields(lst);
        List<Account> res2 = [select id, name, description, Active__c from Account];
        Assert.areEqual(true,s2 != 'Success', 'Msg : '+res2);
        
    }
    
}