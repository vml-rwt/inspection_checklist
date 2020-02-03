sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/Device',
	'sap/ui/model/json/JSONModel'
], function (Controller, Filter, FilterOperator, Device, JSONModel) {
	"use strict";

	return Controller.extend("YMII_IINSP_CHECKLIST.YMII_IINSP_CHECKLIST.controller.InspChar", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf YMII_IINSP_CHECKLIST.YMII_IINSP_CHECKLIST.view.InspChar
		 */
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("InspChar").attachPatternMatched(this._onObjectMatched, this);
			this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this._oODataModel = this.getOwnerComponent().getModel();
			var oIsPhone = Device.system.phone;

			var oImageModel = new JSONModel();

			oImageModel.setData({
				imageWidth: oIsPhone ? "5em" : "10em",
				imageHeigth: oIsPhone ? "5em" : "10em"
			});

		},

		_onObjectMatched: function (oEvent) {
			var oModel = this.getView().getModel("InspOper");
			var oData = oModel.getData();

			this.Insplot = oData.Insplot;
			this.Inspoper = oData.Inspoper;
			this.Qpoint = oData.Qpoint;
			this.Workcentre = oData.Workcentre;
			this.Order = oData.Order;
			this.Plant = oData.Plant;
			this.MiiLine = oData.MiiLine;

			if (this.Qpoint) {
				this.getView().byId("header0").setTitle("Q point: " + this.Qpoint);
			}
			if (this.Workcentre) {
				this.getView().byId("idWorkCentre").setText(this.Workcentre);
			}

			var afilters = [];
			var oFilter = new Filter("Insplot", FilterOperator.EQ, this.Insplot);
			afilters.push(oFilter);
			oFilter = new Filter("Inspoper", FilterOperator.EQ, this.Inspoper);
			afilters.push(oFilter);
			oFilter = new Filter("Plant", FilterOperator.EQ, this.Plant);
			afilters.push(oFilter);
			oFilter = new Filter("MiiLine", FilterOperator.EQ, this.MiiLine);
			afilters.push(oFilter);
			// filter binding
			var oTable = this.getView().byId("IdInspChar");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(afilters);

		},

		OnUpdateFinished: function () {
			var oTable = this.getView().byId("IdInspChar");
			var aData = (oTable.getItems() || []).map(function (oItem) {
				// assuming that you are using the default model  
				return oItem.getBindingContext().getObject();
			});

			if (aData) {
				if (aData[0].CriteriaFlag) {
					this.getView().byId("ColCriteria").setVisible(true);
				} else {
					this.getView().byId("ColCriteria").setVisible(false);
				}
				if (aData[0].ImageFlag) {
					this.getView().byId("ColImage").setVisible(true);
				} else {
					this.getView().byId("ColImage").setVisible(false);
				}

			} else {
				this.getView().byId("ColCriteria").setVisible(false);
				this.getView().byId("ColImage").setVisible(false);
			}
		},

		OnPressNok: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CreateDeviation", {
				Order: this.Order
			});
		},

		onCompleteInsp: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var oTable = this.getView().byId("IdInspChar");
			var aData = (oTable.getItems() || []).map(function (oItem) {
				// assuming that you are using the default model  
				return oItem.getBindingContext().getObject();
			});
			for (var i = 0; i < aData.length; i++) {

				if (aData[i]) {
					aData[i].Qpoint = this.Qpoint;
					aData[i].Order = this.Order;
					var mParam = {
						async: true,
						success: function (oData, oResponse) {

							this.getView().byId("IdPageInspChar").setBusy(false);
							sap.m.MessageToast.show(this._oResourceBundle.getText("InspectionCompleteSuccess"));
							var oBinding = oTable.getBinding("items");
							oBinding.getModel().resetChanges();

						}.bind(this),
						error: function (error) {

							sap.m.MessageToast.show(JSON.parse(error.responseText).error.message.value);
						}
					};

					oModel.setUseBatch(true);

					oModel.create("/InspoperCheckpointSet", aData[i], mParam);

				}
			}
		},

		onImagepress: function (oEvent) {
			var oSrc = oEvent.getSource().getProperty("src");

			if (oSrc) {
				var oData = [];
				oData.src = oSrc;

				var oImgModel = this.getView().getModel("Image");

				oImgModel.setData(oData);

				if (!this._oImgDialog) {
					this._oImgDialog = sap.ui.xmlfragment("YMII_IINSP_CHECKLIST.YMII_IINSP_CHECKLIST.view.Image", this);
				}
				this.getView().addDependent(this._oImgDialog);
				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oImgDialog);
				this._oImgDialog.open();
			}
		},
		OnClose: function (oEvent) {
			this._oImgDialog.close();
			this.getView().getModel("Image").setData("");
		}

	});

});