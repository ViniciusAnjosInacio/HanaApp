sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/m/MessageToast',
    'sap/base/util/deepExtend'
  ],
  function (BaseController,deepExtend, Formatter, JSONModel, ColumnListItem, Input, MessageToast) {
    "use strict";

    return BaseController.extend("projetovale2.controller.App", {
      onInit: function () {
        var sServiceUrl = "odata/v4/catalog/";
        var oModel = new sap.ui.model.odata.v4.ODataModel({ serviceUrl: sServiceUrl, metadataUrlParams: { Funcionario: '' } });
        this.getView().setModel(oModel, "model")
        var oList = this.byId("idProductsTable");
        this._oList = oList;
        
        //forma correta de importar a biblioteca



      }
    });
  }
);
