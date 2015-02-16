define(["jquery", "underscore", "js/formBuilder", "js/proj"], function($, _, formBuilder, proj) {

    return function(givenSyncher, layerOptions) {

        var that = this;
        var syncher = givenSyncher;
        var $page = $("#pageDetails");
        var incomingFeature;

        var combinedHash = function() {
            // Need to enable all fields for serialisation
            // http://stackoverflow.com/questions/15958671/disabled-fields-not-picked-up-by-serializearray
            var detailForm = $page.find("#detailsForm");
            var disabled = detailForm.find(':input:disabled').removeAttr('disabled');
            var nameValueHashes = detailForm.serializeArray();
            disabled.attr('disabled','disabled');

            var singlePairHashes = _(nameValueHashes).map(function(h) { var result = {}; result[h.name] = h.value; return result; });
            return _(singlePairHashes).reduce(function(memo, hash) { return _(memo).extend(hash); }, {});
        };

        var updatedGeoFeature = function() {
            var idFieldIfEmpty = combinedHash()[layerOptions.idField] === '' ? layerOptions.idField : undefined;
            _(incomingFeature.properties).extend(_(combinedHash()).omit(idFieldIfEmpty));

            _(layerOptions.onSaves).each(function(onSave) {
                incomingFeature = require(onSave)(incomingFeature); // can require sync cos these were preloaded with the config
            });
            return incomingFeature;
        };

        this.enhanceForm = function() {
            $page.find(".content").first().trigger("create");
        };

        this.triggerPrePopulators = function() {
            _(layerOptions.prePopulators).each(function(prePopulator) {
                require(prePopulator)($page, incomingFeature); // can require sync cos these were preloaded with the config
            });
        };

        this.initForm = function(feature) {
            incomingFeature = feature;

            var formFields = _(layerOptions.detailsFields).map(function(fieldConf) {
                return formBuilder.buildField(fieldConf);
            }).join("\n");
            $page.find(".content").first().html(formFields);

            formBuilder.repopulateForm($page, incomingFeature.properties);

            that.enhanceForm(); // important: this must be done after form population
            that.triggerPrePopulators();
        };

        this.initButtons = function(buttonsToActions) {
            var saveButtonLabel = layerOptions.saveFeatureButtonLabel || "Save";
            var buttons = {
                save: '<input type="button" id="saveButton" data-theme="a" class="submit" value="'+saveButtonLabel+'" />',
                delete: '<button id="deleteButton" data-theme="a" class="">Delete</button>'
            }

            // Removing delete button if layer configured to not support deletion
            if (!layerOptions.handlesDeleteFeatures) {delete buttons['delete'];}

            var controlGroup = '<div data-role="controlgroup" data-type="horizontal" class="ui-btn-right">'+
                                   _(buttonsToActions).keys().map(function(name) { return buttons[name]; }).join("\n") +
                               '</div>';
            $page.find('header [data-role="controlgroup"]').remove();
            $page.find("header").append(controlGroup).trigger("create");
            $page.find("input.submit").first().off("click").click(buttonsToActions["save"]);
            $page.find("#deleteButton").off("click").click(buttonsToActions["delete"]);
        };


        this.new = function(feature) {
            that.initForm(feature);
            that.initButtons({
                save: function() {
                    // Disabling button to prevent double clicks
                    $(this).button('disable'); 
                    syncher.persist({
                        restEndpoint: layerOptions.restEndpoint,
                        action: "create",
                        data: updatedGeoFeature()
                    });
                    history.back();
                    // Re-enabling button for subsequent captures
                    $(this).button('enable'); 
                    return false;
                }
            });
            return this;
        };

        this.update = function(feature) {
            that.initForm(feature);
            that.initButtons({
                delete: function() {
                    if (confirm("Are you sure you want to delete this record?")) {
                        syncher.persist({
                            restEndpoint: layerOptions.restEndpoint,
                            action: "delete",
                            data: updatedGeoFeature(),
                            id: combinedHash()[layerOptions.idField]
                        });
                        history.back();
                    }
                    return false;
                },
                save: function() {
                    syncher.persist({
                        restEndpoint: layerOptions.restEndpoint,
                        action: "update",
                        data: updatedGeoFeature(),
                        id: combinedHash()[layerOptions.idField]
                    });
                    history.back();
                    return false;
                }
            });
            return this;
        };

        this.changeTo = function() {
            $.mobile.changePage($page, { transition: "none" });
            return this;
        };


        $page.css("visibility", "visible");

    };

});

