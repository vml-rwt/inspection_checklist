sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("YMII_IINSP_CHECKLIST.YMII_IINSP_CHECKLIST.controller.View1", {
		onInit: function () {
			this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this._oODataModel = this.getOwnerComponent().getModel();

			var oTable = this.getView().byId("IdInspOper");
			this.oTemplate = oTable.getBindingInfo("items").template;
			//	oTable.unbindAggregation("items");
		},

		onPress: function (oEvent) {
			try {
				if (cordova) {
					var sBarCode = this.getView().byId("InOrderVin");
					cordova.plugins.barcodeScanner.scan(function (result) {
						var sBarcodeVal = result.text;
						sBarCode.setValue(sBarcodeVal);
						this.onSearch();
					}, function (error) {
						sap.m.MessageToast.show(this._oResourceBundle.getText("CameraError"));
					});
				}
			} catch (exception) {
				MessageToast.show(this._oResourceBundle.getText("Unavailable"), {
					at: "center middle"
				});
			}
		},

		onSearch: function (oEvent) {
			var oModel = this.getView().getModel();
			oModel.refresh();
			var oInsOperModel = this.getOwnerComponent().getModel("InspectOperations");

			var oBarCodeVal = this.getView().byId("InOrderVin").getValue().trim();
			var afilters = [];
			var oFilter = new Filter("Barcode", FilterOperator.EQ, oBarCodeVal);
			afilters.push(oFilter);

			// filter binding

			var oTable = this.getView().byId("IdInspOper");
			//  var oColumnlist = this.getView().byId("idColumnlist");

			/*			oTable.bindAggregation("items", {
							path: "/InspectionOperationsSet",
			                template: this.oTemplate,
							filters: afilters
						});
			*/
			/* var oBinding = oTable.getBinding("items");
			oBinding.filter(afilters);*/

			// oTable.setVisible(true);

			var mParam = {
				filters: afilters,

				success: function (odata) {
					oTable.setVisible(true);
					var OdataResult = odata.results;
					oInsOperModel.setData(OdataResult);

				}.bind(this),
				error: function (error) {
					sap.m.MessageToast.show(JSON.parse(error.responseText).error.message.value);
				}
			};

			oModel.read("/InspectionOperationsSet", mParam);
		},

		OnItemPress: function (oEvent) {
			//Navigate to Stock Items View
			var sSelectedPath = oEvent.getSource().getBindingContextPath();
			var oObject = this.getOwnerComponent().getModel("InspectOperations").getObject(sSelectedPath);
			/*			var oData = [];
						oData.Insplot = oEvent.getSource().getBindingContext().getProperty("Insplot");
						oData.Inspoper = oEvent.getSource().getBindingContext().getProperty("Inspoper");
						oData.Qpoint = oEvent.getSource().getBindingContext().getProperty("Qpoint");
						oData.Workcentre = oEvent.getSource().getBindingContext().getProperty("Workcentre");
						oData.Order = oEvent.getSource().getBindingContext().getProperty("Order");
						oData.Plant = oEvent.getSource().getBindingContext().getProperty("Plant");
						oData.MiiLine = oEvent.getSource().getBindingContext().getProperty("MiiLine");*/

			var oModel = this.getView().getModel("InspOper");
			oModel.setData(oObject);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("InspChar", {

			});
		}
	});
});