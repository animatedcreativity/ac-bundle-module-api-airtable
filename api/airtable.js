exports = module.exports = exports = module.exports = exports = module.exports = function() {
  var mod = {
    requestDynamic: function(configKey, baseId) {
      return async function(name, callback, table, view, fields, method, data, offset, page) {
        return await mod.request(name, callback, table, view, fields, method, data, offset, page, configKey, baseId);
      }
    },
    requestCallback: async function(callback, errorCallback, table, view, fields, method, data, offset, page, configKey, baseId) {
      if (!app.has(configKey)) configKey = "default";
      if (app.has(offset) != true) offset = "";
      if (app.has(fields) !== true) fields = [];
      if (app.has(page) !== true) page = 1;
      if (app.has(method) !== true) method = "GET";
      var fieldsStr = "";
      for (var i=0; i<=fields.length-1; i++) {
        fieldsStr += "&fields[]=" + fields[i];
      }
      var apiLink = config.airtable[configKey].link;
      if (app.has(baseId)) apiLink = apiLink.split(config.airtable[configKey].base).join(baseId);
      var url = apiLink + "/" + app.utils.url.encode(table) + (method === "GET" ? "?pageSize=100&view=" + app.utils.url.encode(view) + "&offset=" + offset + fieldsStr + (app.has(data) ? data : "") : "");
      if (config.api.log.url === true) console.log(page, method, url);
      var options = {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + config.airtable[configKey].apiKey
        }
      };
      if (app.has(data) === true && method !== "GET") options.body = JSON.stringify(data);
      var result = await fetch(url, options);
      if (result.status === 200) {
        var json = await result.json();
        if (typeof callback === "function") {
          var cResult = await callback(json, page);
          if (app.has(json.offset) === true && app.has(cResult) && app.has(cResult.length)) {
            await mod.requestCallback(callback, errorCallback, table, view, fields, method, data, json.offset, page + 1, configKey, baseId);
          }
        }
      } else {
        if (typeof errorCallback === "function") errorCallback("Could not load " + url + " from airtable.", await result.text());
      }
    }
  };
  return mod;
};