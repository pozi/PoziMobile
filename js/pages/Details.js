define(["jquery", "underscore", "config", "formBuilder"], function($, _, config, formBuilder) {

    return function(givenSyncher) {

        var syncher = givenSyncher;
        var $page = $("#pageDetails");
        var that = this;

        this.enhanceForm = function() {
            $page.find(".content").first().trigger("create"); 
        };

        this.initForm = function(data) {
            var formFields = _(config.data().detailsFields.concat(config.data().genericDetailsFields)).map(function(fieldConf) {
                return formBuilder.buildField(fieldConf);
            }).join("\n");
            $page.find(".content").first().html(formFields)
            $page.find('[name="config"]').first().val(config.data().databaseName);
            if (data) {
              formBuilder.repopulateForm($page, data);
            };
            that.enhanceForm(); // important: this must be done after form population
        };

        this.initButtons = function(buttonsToActions) {
            var buttons = {
                save: '<input type="button" id="saveButton" data-theme="a" class="submit" value="Save" />',
                delete: '<button id="deleteButton" data-theme="a" class="">Delete</button>'
            }
            var controlGroup = '<div data-role="controlgroup" data-type="horizontal" class="ui-btn-right">'+
                                   _(buttonsToActions).keys().map(function(name) { return buttons[name]; }).join("\n") +
                               '</div>';
            $page.find('header [data-role="controlgroup"]').remove();
            $page.find("header").append(controlGroup).trigger("create");
            $page.find("input.submit").first().off("click").click(buttonsToActions["save"]);
            $page.find("#deleteButton").off("click").click(buttonsToActions["delete"]);
        };


        this.new = function(position) {
            that.initForm();
            $page.find('[name="lon"]').first().val(position.lon);
            $page.find('[name="lat"]').first().val(position.lat);
            that.initButtons({
                save: function() {
                    history.back();
                    syncher.persist("create", $page.find("#detailsForm").serialize());
                    return false;
                }
            });
            return this;
        };

        this.update = function(feature) {
            that.initForm(feature.data);
            that.initButtons({
                delete: function() {
                    if (confirm("Are you sure you want to delete this record?")) {
                        history.back();
                        syncher.persist("delete", $page.find("#detailsForm").serialize());
                    }
                    return false;
                },
                save: function() {
                    history.back();
                    syncher.persist("update", $page.find("#detailsForm").serialize());
                    return false;
                }
            });
            return this;
        };

        this.changeTo = function() {
            $.mobile.changePage($page, { transition: "flip" });
            return this;
        };


        $page.css("visibility", "visible");

    };

});

