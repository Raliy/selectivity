'use strict';

var $ = require('jquery');

var debounce = require('./debounce');

var Select3 = require('./select3-base');

require('./select3-locale');

/**
 * Option listener that implements a convenience query function for performing AJAX requests.
 */
Select3.OptionListeners.unshift(function(select3, options) {

    var ajax = options.ajax;
    if (ajax && ajax.url) {
        var formatError = ajax.formatError || Select3.Locale.ajaxError;
        var params = ajax.params;
        var processItem = ajax.processItem || function(item) { return item; };
        var quietMillis = ajax.quietMillis || 0;
        var resultsCb = ajax.results || function(data) { return { results: data, more: false }; };
        var transport = ajax.transport || $.ajax;

        if (quietMillis) {
            transport = debounce(transport, quietMillis);
        }

        options.query = function(queryOptions) {
            var offset = queryOptions.offset;
            var term = queryOptions.term;
            var url = (ajax.url instanceof Function ? ajax.url() : ajax.url);
            if (params) {
                url += (url.indexOf('?') > -1 ? '&' : '?') + $.param(params(term, offset));
            }

            transport($.extend({}, ajax, {
                url: url,
                success: function(data) {
                    var results = resultsCb(data, offset);
                    results.results = results.results.map(processItem);
                    queryOptions.callback(results);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    queryOptions.error(
                        formatError(term, jqXHR, textStatus, errorThrown),
                        { escape: false }
                    );
                }
            }));
        };
    }
});
