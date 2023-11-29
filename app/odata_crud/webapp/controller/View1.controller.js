sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
	"sap/m/MessageBox",
    'sap/ui/model/json/JSONModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageToast, MessageBox,JSONModel) {
        "use strict";

        var ListController = Controller.extend("sap.m.sample.ListCounter.List",{

        
            onInit: function () {
                var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			    this.getView().setModel(oModel);
            }
    });
            
        return Controller;
    });
