sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",

  ],
  function (Controller, Filter, FilterOperator, FilterType, models) {
    "use strict";

    return Controller.extend("projetovale2.controller.App", {
      onInit: function () {
        var sServiceUrl = "odata/v4/catalog/";
        var oModel = new sap.ui.model.odata.v4.ODataModel({ serviceUrl: sServiceUrl, metadataUrlParams: { Funcionario: '' } });
        this.getView().setModel(oModel, "model");
        var oList = this.byId("peopleList");
        this._oList = oList;
      },


      OnRefresh: function (oEvent) {
        this._oList.getBinding("items").refresh();
      },

    

      OnAdd: function (oEvent) {
        var oList = this.byId("peopleList")
        var oBinding = oList.getBinding("items")
        console.log(oList)
        console.log(oBinding)

        var dialog = new sap.m.Dialog({
          title: "Adicione um funcionário",
          type: "Message",
          content: [new sap.ui.layout.HorizontalLayout({
            content: [
              new sap.ui.layout.VerticalLayout({
                width: "140px",
                content: [
                  new sap.m.Label({
                    text: "Funcionário ID"
                  }),
                  new sap.m.Label({
                    text: "Funcionário Name:"
                  }),
                  new sap.m.Label({
                    text: "Funcionário Genero:"
                  }),
                  new sap.m.Label({
                    text: "Employee Estado:"
                  })
                ]
              }),
              new sap.ui.layout.VerticalLayout({
                width: "140px",
                content: [
                  new sap.m.Input("ID", {
                    editable: false
                    
                  }),
                  new sap.m.Input("Nome", {
                  }),
                  new sap.m.Input("Genero", {
                  }),
                  new sap.m.Input("Estado", {
                  })
                ]
              })
            ]
          })],
          beginButton: new sap.m.Button({
            text: "Save",
            press: function () {
              var sEmployeeName = sap.ui.getCore().byId("Nome").getValue();
              var sEmployeeGender = sap.ui.getCore().byId("Genero").getValue();
              var sEmployeeState = sap.ui.getCore().byId("Estado").getValue();
              var oObject = {};
              oObject = {
                "Nome": sEmployeeName,
                "Genero": sEmployeeGender,
                "Estado": sEmployeeState,
              };

              var oContext = oBinding.create(oObject)
              oContext.created().then(() => {
                console.log("objeto criado")
              }, error => {
                console.log(error)
              })

              dialog.close();
            }
          }),
          endButton: new sap.m.Button({
            text: "Cancel",
            press: function () {
              dialog.close();
            }
          }),
          afterClose: function () {
            dialog.destroy();
          }
        });
        dialog.open();
      },

      
      OnEdit: function (oEvent) {
              var employeeContext = this._itemContext

              var oEmployee = this._item
              var oEmployeeID = oEmployee.ID;
              var oEmployeeNome = oEmployee.Nome;
              var oEmployeeJobGenero = oEmployee.Genero;
              var oEmployeeEstado = oEmployee.Estado;

              // call Dialog popup
              var dialog = new sap.m.Dialog({
                  title: "Edit Organization Employee",
                  type: "Message",
                  content: [new sap.ui.layout.HorizontalLayout({
                      content: [
                          new sap.ui.layout.VerticalLayout({
                            width: "140px",
                            content: [
                              new sap.m.Label({
                                text: "Funcionário ID"
                              }),
                              new sap.m.Label({
                                text: "Funcionário Name:"
                              }),
                              new sap.m.Label({
                                text: "Funcionário Genero:"
                              }),
                              new sap.m.Label({
                                text: "Employee Estado:"
                              })
                            ]
                          }),
                          new sap.ui.layout.VerticalLayout({
                            width: "140px",
                            content: [
                              new sap.m.Input("ID", {
                                editable: false
                              }),
                              new sap.m.Input("Nome", {
                              }),
                              new sap.m.Input("Genero", {
                              }),
                              new sap.m.Input("Estado", {
                              })
                            ]
                          })
                        ]
                      })],
                  beginButton: new sap.m.Button({
                    text: "Save",
                    press: function () {
                      var sEmployeeName = sap.ui.getCore().byId("Nome").getValue();
                      var sEmployeeGender = sap.ui.getCore().byId("Genero").getValue();
                      var sEmployeeState = sap.ui.getCore().byId("Estado").getValue();
                      var oObject = {};
                      oObject = {
                        "Nome": sEmployeeName,
                        "Genero": sEmployeeGender,
                        "Estado": sEmployeeState,
                      };
        
                      var oContext = oBinding.create(oObject)
                      oContext.created().then(() => {
                        console.log("objeto criado")
                      }, error => {
                        console.log(error)
                      })
        
                      dialog.close();
                    }
                  }),
                  endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                      dialog.close();
                    }
                  }),
                  afterClose: function () {
                    dialog.destroy();
                  }
                });
                dialog.open();
      },


      

      OnDelete: function(oEvent){
        var employeeContext = this._itemContext
           	
        employeeContext.delete();

      },

      OnSelectionChange: function (oEvent) {
                this._item = oEvent.getSource().getBindingContext("model").getObject();
                this._itemContext = oEvent.getSource().getBindingContext("model")
            },

            onSearch: function () {
                var oList = this.byId("peopleList")
                var oBinding = oList.getBinding("items")

                var oView = this.getView(),
                  sValue = oView.byId("searchField").getValue();

                console.log(sValue)
                
                if (sValue) {
                    var oFilter = new sap.ui.model.Filter({
                        path : "$filter=",
                        operator : sap.ui.model.FilterOperator.All,
                        variable : "name",
                        condition : new sap.ui.model.Filter("name", FilterOperator.Contains, sValue)
                    });
                }
                console.log(oFilter)

                oBinding.filter(oFilter)
              }



    });
  }
);
