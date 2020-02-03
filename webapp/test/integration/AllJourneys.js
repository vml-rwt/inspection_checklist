/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"YMII_IINSP_CHECKLIST/YMII_IINSP_CHECKLIST/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"YMII_IINSP_CHECKLIST/YMII_IINSP_CHECKLIST/test/integration/pages/View1",
	"YMII_IINSP_CHECKLIST/YMII_IINSP_CHECKLIST/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "YMII_IINSP_CHECKLIST.YMII_IINSP_CHECKLIST.view.",
		autoWait: true
	});
});