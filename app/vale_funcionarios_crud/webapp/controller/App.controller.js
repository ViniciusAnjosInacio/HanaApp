sap.ui.define(
  [
    "sap/ui/core/Messaging",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/util/MockServer',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/ui/model/odata/v2/ODataModel'
  ],
  function (Messaging, BaseController, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, JSONModel, MockServer, exportLibrary, Spreadsheet, ODataModel) {
    "use strict";

    var Edm = exportLibrary.EdmType;

    return BaseController.extend("valefuncionarioscrud.controller.App", {

      // Configuração do modelo para mensagens e tratamento de erros técnicos

      onInit: function () {

        var oModel = new JSONModel({
          selectedCountry: "BR",
          countries: [
            { key: "BR", text: "Brasil" },
            { key: "AR", text: "Argentina" },
            { key: "ME", text: "México" }
          ],
        
          genero: [
            { key: "F", text: "Feminino" },
            { key: "M", text: "Masculino" }
          ]
        });
        
        this.getView().setModel(oModel, "model");

        var oMessageModel = Messaging.getMessageModel(),
          oMessageModelBinding = oMessageModel.bindList("/", undefined, [],
            new Filter("technical", FilterOperator.EQ, true)),
          oViewModel = new JSONModel({
            busy: false,
            hasUIChanges: false,
            usernameEmpty: false,
            order: 0
          });

        // Configuração dos modelos na visão (View)
        this.getView().setModel(oViewModel, "appView");
        this.getView().setModel(oMessageModel, "message");
        this.getView().setModel(oModel, "model");

        oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
        this._bTechnicalErrors = false;
      },

      // Exportação de dados para Excel
      createColumnConfig: function () {
        var aCols = [];

        aCols.push({
          label: 'ID',
          type: Edm.Int32,
          property: 'ID',
          scale: 0
        });

        aCols.push({
          property: 'Nome',
          type: Edm.String
        });

        aCols.push({
          property: 'Genero',
          type: Edm.String
        });

        aCols.push({
          property: 'Estado',
          type: Edm.String
        });

        aCols.push({
          property: 'Pais_code',
          type: Edm.String,
          scale: 2,
          delimiter: true
        });

        return aCols;
      },

      // Exportação dos dados para um arquivo Excel
      onExport: function () {
        var oTable = this.byId('IDTabelaFuncionario');
        var oRowBinding = oTable.getBinding('items');

        var oSettings = {
          workbook: { columns: this.createColumnConfig() },
          dataSource: oRowBinding,
          fileName: 'Funcionarios.xlsx',
          worker: false // Desabilitar o uso de trabalhador (worker) para uso local
        };

        var oSpreadsheet = new Spreadsheet(oSettings);
        oSpreadsheet.build().finally(function () {
          oSpreadsheet.destroy();
        });
      },

      // Ações a serem executadas ao sair da aplicação
      onExit: function () {
        this._oMockServer.stop();
      },


      // Operações CRUD (Criar, Ler, Atualizar, Deletar)

      // Criação de um novo item
      onCreate: function () {
        var oList = this.byId("IDTabelaFuncionario"),
          oBinding = oList.getBinding("items"),
          oContext = oBinding.create({
            ID: this._generateNewID()
          });

        this._setUIChanges(true);
        this.getView().getModel("appView").setProperty("/usernameEmpty", true);

        oList.getItems().some(function (oItem) {
          if (oItem.getBindingContext() === oContext) {
            oItem.focus();
            oItem.setSelected(true);
            return true;
          }
        });
      },

      // Geração de um novo ID
      _generateNewID: function () {
        // Obtenha a referência para a tabela
        var oTable = this.byId("IDTabelaFuncionario");

        // Obtenha a ligação dos itens da tabela
        var oBinding = oTable.getBinding("items");

        // Obtenha a quantidade atual de itens na tabela
        var iTableLength = oBinding.getLength();

        // Se a tabela estiver vazia, retorne 1 como o novo ID
        if (iTableLength === 0) {
          return 1;
        }

        // Obtenha o contexto do último item na tabela
        var oLastItemContext = oBinding.getContexts()[iTableLength - 1];

        // Obtenha o valor do ID do último item
        var iLastItemID = oLastItemContext.getProperty("ID");

        // Adicione 1 ao ID do último item para obter o novo ID
        var iNewItemID = iLastItemID + 1;

        return iNewItemID;
      },

      // Exclusão de um item
      onDelete: function () {
        var oContext,
          oSelected = this.byId("IDTabelaFuncionario").getSelectedItem(),
          sUserName;

        if (oSelected) {
          oContext = oSelected.getBindingContext();
          sUserName = oContext.getProperty("Nome");
          oContext.delete().then(function () {
            MessageToast.show(this._getText("Funcionário deletado", [sUserName]));
          }.bind(this), function (oError) {
            this._setUIChanges();
            if (oError.canceled) {
              MessageToast.show(this._getText("Funcionário não deletado", [sUserName]));
              return;
            }
            MessageBox.error(oError.message + ": " + sUserName);
          }.bind(this));
          this._setUIChanges();
        }
      },

      // Manipulação de alterações em campos de entrada
      onInputChange: function (oEvt) {
        if (oEvt.getParameter("escPressed")) {
          this._setUIChanges();
        } else {
          this._setUIChanges(true);
          if (oEvt.getSource().getParent().getBindingContext().getProperty("Nome")) {
            this.getView().getModel("appView").setProperty("/usernameEmpty", false);
          }
        }
      },

      // Atualização da lista de itens
      onRefresh: function () {
        var oBinding = this.byId("IDTabelaFuncionario").getBinding("items");

        if (oBinding.hasPendingChanges()) {
          MessageBox.error(this._getText("Página não Recarregada"));
          return;
        }
        oBinding.refresh();
        MessageToast.show(this._getText("Página Recarregada"));
      },

      // Reverter alterações não salvas
      onResetChanges: function () {
        this.byId("IDTabelaFuncionario").getBinding("items").resetChanges();
        this._bTechnicalErrors = false;
        this._setUIChanges(false);
      },

      // Salvamento de alterações no servidor
      onResetDataSource: function () {
        var oModel = this.getView().getModel(),
          oOperation = oModel.bindContext("/ResetDataSource(...)");

        oOperation.execute().then(function () {
          oModel.refresh();
          MessageToast.show(this._getText("Dados Restaurados"));
        }.bind(this), function (oError) {
          MessageBox.error(oError.message);
        }
        );
      },

      // Salvamento de alterações no servidor
      onSave: function () {
        var fnSuccess = function () {
          this._setBusy(false);
          MessageToast.show(this._getText("Dados Salvos"));
          this._setUIChanges(false);
        }.bind(this),

          fnError = function (oError) {
            this._setBusy(false);
            this._setUIChanges(false);
            MessageBox.error(oError.message);
          }.bind(this);

        this._setBusy(true); // Lock UI until submitBatch is resolved.
        this.getView().getModel().submitBatch("peopleGroup").then(fnSuccess, fnError);
        this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
      },

      // Pesquisa na lista de itens
      onSearch: function () {
        var oView = this.getView(),
          sValue = oView.byId("searchField").getValue(),
          oFilter = new Filter("Nome", FilterOperator.Contains, sValue);

        oView.byId("IDTabelaFuncionario").getBinding("items").filter(oFilter, FilterType.Application);
      },

      // Ordenação da lista de itens
      onSort: function () {
        var oView = this.getView(),
          aStates = [undefined, "asc", "desc"],
          aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
          sMessage,
          iOrder = oView.getModel("appView").getProperty("/order");

        iOrder = (iOrder + 1) % aStates.length;
        var sOrder = aStates[iOrder];

        oView.getModel("appView").setProperty("/order", iOrder);
        oView.byId("IDTabelaFuncionario").getBinding("items").sort(sOrder && new Sorter("Nome", sOrder === "desc"));

        sMessage = this._getText("Ordem Alterada", [this._getText(aStateTextIds[iOrder])]);
        MessageToast.show(sMessage);
      },

      // Manipulação de alterações nas mensagens
      onMessageBindingChange: function (oEvent) {
        var aContexts = oEvent.getSource().getContexts(),
          aMessages,
          bMessageOpen = false;

        if (bMessageOpen || !aContexts.length) {
          return;
        }

        // Extract and remove the technical messages
        aMessages = aContexts.map(function (oContext) {
          return oContext.getObject();
        });
        Messaging.removeMessages(aMessages);

        this._setUIChanges(true);
        this._bTechnicalErrors = true;
        MessageBox.error(aMessages[0].message, {
          id: "serviceErrorMessageBox",
          onClose: function () {
            bMessageOpen = false;
          }
        });

        bMessageOpen = true;
      },

      // Obtenção de texto internacionalizado (i18n)
      _getText: function (sTextId, aArgs) {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

      },

      // Configuração de alterações na interface do usuário (UI)
      _setUIChanges: function (bHasUIChanges) {
        if (this._bTechnicalErrors) {
          // If there is currently a technical error, then force 'true'.
          bHasUIChanges = true;
        } else if (bHasUIChanges === undefined) {
          bHasUIChanges = this.getView().getModel().hasPendingChanges();
        }
        var oModel = this.getView().getModel("appView");
        oModel.setProperty("/hasUIChanges", bHasUIChanges);
      },

      // Configuração do estado de ocupação (busy)
      _setBusy: function (bIsBusy) {
        var oModel = this.getView().getModel("appView");
        oModel.setProperty("/busy", bIsBusy);
      }

    });
  });
