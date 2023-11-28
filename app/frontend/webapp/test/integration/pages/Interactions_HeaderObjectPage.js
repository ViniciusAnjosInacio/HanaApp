sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'frontend',
            componentId: 'Interactions_HeaderObjectPage',
            contextPath: '/Interactions_Header'
        },
        CustomPageDefinitions
    );
});