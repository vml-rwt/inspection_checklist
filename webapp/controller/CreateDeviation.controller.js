sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("YMII_IINSP_CHECKLIST.YMII_IINSP_CHECKLIST.controller.CreateDeviation", {

		onInit: function () {
			this.sDevType = "";
			this.sMiiLine = "";
			this.sPlant = "";
			this.sOrder = "";
			this.sConfwc = "";
			this.Notinum = "";
			this.getOwnerComponent().getModel("DropDown").setData();
			this.getOwnerComponent().getModel("DropDown").refresh();
			this.getOwnerComponent().getRouter().getRoute("CreateDeviation").attachPatternMatched(this._onObjectMatched, this);
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		_onObjectMatched: function (oEvent) {
			this.getOwnerComponent().getModel("DropDown").setData();
			this.getOwnerComponent().getModel("DropDown").refresh();

			this.getView().byId("idSubject").setSelectedKey("");
			this.getView().byId("idProblem").setSelectedKey("");
			this.getView().byId("idProblemPart").setSelectedKey("");
			this.getView().byId("idOwner").setSelectedKey("");
			this.getView().byId("idFttrel").setSelected(false);

			this.sPlant = "";
			this.sOrder = "";
			this.Notinum = "";

			//	this.sPlant = oEvent.getParameters("data").arguments.Plant;
			this.sOrder = oEvent.getParameters("data").arguments.Order;
			this.fnReadDropDownValues();
		},

		fnReadDropDownValues: function () {

			this.getOwnerComponent().getModel("DropDown").setData();
			this.getOwnerComponent().getModel("DropDown").refresh();

			var afilters = [];

			var oFilter = new sap.ui.model.Filter("Prodorder", sap.ui.model.FilterOperator.EQ, this.sOrder);
			afilters.push(oFilter);
			var mParam = {
				filters: afilters,
				async: true,
				urlParameters: {
					"$expand": ["DeviationtoOwner", "DeviationtoProblem",
						"DeviationtoProblemPart", "DeviationtoSubject"
					]
				},
				success: function (odata) {
					var oModel = this.getOwnerComponent().getModel("DropDown");
					oModel.setData(odata.results[0]);

				}.bind(this),
				error: function (error) {
					sap.m.MessageToast.show(JSON.parse(error.responseText).error.message.value);
				}
			};
			this._oODataModel.read("/DeviationSet", mParam);

		},

		onSubmitBtnPress: function () {

			var oView = this.getView();
			var oUploadCollection = this.getView().byId("UploadCollection");

			var oSubject = oView.byId("idSubject").getSelectedKey();
			if (oSubject === null || oSubject === ":") {
				MessageToast.show("Please enter Mandatory input");
			} else {
				var oProblem = oView.byId("idProblem").getSelectedKey();
				if (oProblem === null || oProblem === ":") {
					MessageToast.show("Please enter Mandatory input");
				} else {

					var oProblempart = oView.byId("idProblemPart").getSelectedKey();
					if (oProblempart === null || oProblempart === ":") {
						MessageToast.show("Please enter Mandatory input");
					} else {
						var oOwner = oView.byId("idOwner").getSelectedKey();
						if (oOwner === null || oOwner === ":") {
							MessageToast.show("Please enter Mandatory input");
						} else {
							var oDescr = oView.byId("idDesc").getValue();

							if (!oDescr) {
								MessageToast.show("Please enter Mandatory input");
							} else {
								var sFttrel;
								if (oView.byId("idFttrel").getProperty("selected")) {
									sFttrel = 'X';
								} else {
									sFttrel = ' ';
								}
								var oPayload = {};

								oPayload.Prodorder = this.sOrder;
								oPayload.Owner = oView.byId("idOwner").getSelectedKey();
								oPayload.Problempart = oView.byId("idProblemPart").getSelectedKey();
								oPayload.Problem = oView.byId("idProblem").getSelectedKey();
								oPayload.Subject = oView.byId("idSubject").getSelectedKey();
								oPayload.Fttrel = sFttrel;
								oPayload.Description = oView.byId("idDesc").getValue();
								oPayload.inspectionlot = this.getView().getModel("InspOper").getData().Insplot;

								var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
									pattern: "dd/MM/yyyy"
								});
								// timezoneOffset is in hours convert to milliseconds
								var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;

								oPayload.ReqStartDate = new Date();

								// format date and time to strings offsetting to GMT
								var dateStr = dateFormat.format(new Date(oPayload.ReqStartDate.getTime() + TZOffsetMs)); //05-12-2012
								//parse back the strings into Limit Valid To date object back to Time Zone
								oPayload.ReqStartDate = new Date(dateFormat.parse(dateStr).getTime() - TZOffsetMs); //1354665600000  
								// format date and time to strings offsetting to GMT

								var today = new Date();
								oPayload.ReqStartTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

								var mParam = {
									async: true,
									success: function (oData, oResponse) {
										oView.byId("idCreateViewPage").setBusy(false);
										this.Notinum = JSON.parse(oResponse.headers.response).Message;
										MessageToast.show(this.Notinum);

										oUploadCollection.upload();

										this.getOwnerComponent().getModel("DropDown").refresh();

										this.getView().byId("idSubject").setSelectedKey("");
										this.getView().byId("idProblem").setSelectedKey("");
										this.getView().byId("idProblemPart").setSelectedKey("");
										this.getView().byId("idOwner").setSelectedKey("");
										this.getView().byId("idFttrel").setSelected(false);
										this.getView().byId("idDesc").setValue("");

									}.bind(this),
									error: function (error) {
										oView.byId("idCreateViewPage").setBusy(false);
										sap.m.MessageToast.show(JSON.parse(error.responseText).error.message.value);

									}
								};
								oView.byId("idCreateViewPage").setBusy(true);

								this._oODataModel.create("/DeviationSet", oPayload, mParam);
							}
						}

					}
				}

			}

		},

		// Functions for Attachments ////

		onFilenameLengthExceed: function () {
			var oFileNameLengthMsg = this._oResourceBundle.getText("FileNameLengthExceeded");
			MessageToast.show(oFileNameLengthMsg);

		},

		onBeforeUploadStarts: function (oEvent) {

			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});

			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

			// Header Notification number
			var oCustomerHeaderNotifNo = new sap.m.UploadCollectionParameter({
				name: "NotifNo",
				value: this.Notinum
			});

			oEvent.getParameters().addHeaderParameter(oCustomerHeaderNotifNo);

			var sAttachPath = "/sap/opu/odata/sap/YMII_INSPOPER_CHECKLIST_SRV/NotifAttachmentSet('NotifNo='" + this.Notinum + "')";

			var oUploadCollection = oEvent.getSource();
			//	oUploadCollection.setProperty("uploadUrl", sAttachPath);
			//		oUploadCollection.setUploadUrl(sAttachPath);
			oUploadCollection.uploadUrl = sAttachPath;

		},

		onUploadComplete: function (oEvent) {
			// Handle Response from the server

			var oUploadParam = oEvent.getParameters(),
				files = oUploadParam.files,
				status = files[0].status,
				responseRaw = files[0].responseRaw;
			var parser = new DOMParser();

			if (status === 400) {
				var ResponsexmlDoc = parser.parseFromString(responseRaw, "text/xml"),
					oresponse = ResponsexmlDoc.all[2].textContent;
				MessageBox(
					oresponse, {
						id: "",
						details: "",
						styleClass: "",
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							if (sAction === MessageBox.Action.RETRY) {
								this.getView().getModel().refreshMetadata();
							}
						}.bind(this)
					}
				);
			}
			/*else {
				oUploadCollection.upload();
			}*/
			this.getView().getModel().refresh();

		},

		onChange: function (oEvent) {

			var sAttachPath = "/sap/opu/odata/sap/YMII_INSPOPER_CHECKLIST_SRV/NotifAttachmentSet('NotifNo='" + this.Notinum + "')";
			var oUploadCollection = oEvent.getSource();
			oUploadCollection.setUploadUrl(sAttachPath);

			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: this.getView().getModel().oHeaders['x-csrf-token']
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		}

	});

});