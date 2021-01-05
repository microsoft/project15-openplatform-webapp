import { _ as __assign, U as Utils, E as ErrorCodes } from './Utils-e5be3308.js';
import 'd3';
import 'moment-timezone';

var ServerClient = /** @class */ (function () {
    function ServerClient() {
        var _this = this;
        this.apiVersionUrlParam = "?api-version=2016-12-12";
        this.oldTsmTsqApiVersion = "?api-version=2018-11-01-preview";
        this.tsmTsqApiVersion = "?api-version=2020-07-31";
        this.referenceDataAPIVersion = "?api-version=2017-11-15";
        this.maxRetryCount = 3;
        this.sessionId = Utils.guid();
        this.retriableStatusCodes = [408, 429, 500, 503];
        this.onAjaxError = function (logObject) { };
        this.onAjaxRetry = function (logObject) { };
        this.onFallbackToOldApiVersion = function (logObject) { };
        this.retryBasedOnStatus = function (xhr) { return _this.retriableStatusCodes.indexOf(xhr.status) !== -1; };
        this.fallBackToOldApiVersion = function (xhr) { return xhr.status === 400 && xhr.response.indexOf('UnsupportedTSXVersionTSX01') !== -1; };
        this.setStandardHeaders = function (xhr, token) {
            var clientRequestId = Utils.guid();
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.setRequestHeader('x-ms-client-request-id', clientRequestId);
            xhr.setRequestHeader('x-ms-client-session-id', _this.sessionId);
            return clientRequestId;
        };
        this.mergeTsqEventsResults = function (tsqEvents) {
            var events = { properties: [], timestamps: [] };
            tsqEvents.forEach(function (tsqe) {
                var currentPropertiesValueLength = events.timestamps.length;
                if (tsqe.properties && tsqe.properties.length) {
                    tsqe.properties.forEach(function (prop) {
                        var foundProperty = events.properties.filter(function (p) { return p.name === prop.name && p.type === prop.type; });
                        var existingProperty;
                        if (foundProperty.length === 1) {
                            var indexOfExistingProperty = events.properties.indexOf(foundProperty[0]);
                            existingProperty = events.properties[indexOfExistingProperty];
                        }
                        else {
                            existingProperty = { name: prop.name, type: prop.type, values: [] };
                            events.properties.push(existingProperty);
                        }
                        while (existingProperty.values.length < currentPropertiesValueLength) {
                            existingProperty.values.push(null);
                        }
                        existingProperty.values = existingProperty.values.concat(prop.values);
                    });
                }
                events.timestamps = events.timestamps.concat(tsqe.timestamps);
            });
            return events;
        };
        this.getQueryApiResult = function (token, results, contentObject, index, uri, resolve, messageProperty, onProgressChange, mergeAccumulatedResults, xhr) {
            if (onProgressChange === void 0) { onProgressChange = function (percentComplete) { }; }
            if (mergeAccumulatedResults === void 0) { mergeAccumulatedResults = false; }
            if (xhr === void 0) { xhr = null; }
            if (xhr === null) {
                xhr = new XMLHttpRequest();
            }
            var onreadystatechange;
            var retryCount = 0;
            var retryTimeout;
            var continuationToken;
            var accumulator = [];
            var clientRequestId;
            onreadystatechange = function () {
                if (xhr.readyState != 4)
                    return;
                var fallBackToOldApiVersion = _this.fallBackToOldApiVersion(xhr);
                if (xhr.status == 200) {
                    var message = JSON.parse(xhr.responseText);
                    if (!message.continuationToken) {
                        if (mergeAccumulatedResults && accumulator.length) {
                            accumulator.push(message);
                            results[index] = _this.mergeTsqEventsResults(accumulator);
                        }
                        else {
                            results[index] = messageProperty(message);
                            delete results[index].progress;
                        }
                        var eventCount = (results[index] && results[index].timestamps && results[index].timestamps.length) ? results[index].timestamps.length : 0;
                        var take = (contentObject && contentObject.getEvents && contentObject.getEvents.take) ? contentObject.getEvents.take : 0;
                        if (eventCount && take && eventCount === take) {
                            results['moreEventsAvailable'] = true;
                        }
                        if (results.map(function (ar) { return !('progress' in ar); }).reduce(function (p, c) { p = c && p; return p; }, true))
                            resolve(results);
                    }
                    else {
                        accumulator.push(message);
                        var progressFromMessage = message && message.progress ? message.progress : 0;
                        results[index].progress = mergeAccumulatedResults ? Math.max(progressFromMessage, accumulator.reduce(function (p, c) { return p + (c.timestamps && c.timestamps.length ? c.timestamps.length : 0); }, 0) / contentObject.getEvents.take * 100) : progressFromMessage;
                        xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = onreadystatechange;
                        xhr.open('POST', uri);
                        _this.setStandardHeaders(xhr, token);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        continuationToken = message.continuationToken;
                        xhr.setRequestHeader('x-ms-continuation', continuationToken);
                        xhr.send(JSON.stringify(contentObject));
                    }
                }
                else if ((_this.retryBasedOnStatus(xhr) && retryCount < _this.maxRetryCount) || fallBackToOldApiVersion) {
                    retryCount += fallBackToOldApiVersion ? 0 : 1;
                    retryTimeout = _this.retryWithDelay(retryCount, function () {
                        if (fallBackToOldApiVersion) {
                            uri = uri.split(_this.tsmTsqApiVersion).join(_this.oldTsmTsqApiVersion);
                            _this.onFallbackToOldApiVersion({ uri: uri, payload: JSON.stringify(contentObject), clientRequestId: clientRequestId, sessionId: _this.sessionId, statusCode: xhr.status });
                        }
                        xhr.open('POST', uri);
                        clientRequestId = _this.setStandardHeaders(xhr, token);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        if (continuationToken)
                            xhr.setRequestHeader('x-ms-continuation', continuationToken);
                        xhr.send(JSON.stringify(contentObject));
                        _this.onAjaxRetry({ uri: uri, payload: JSON.stringify(contentObject), clientRequestId: clientRequestId, sessionId: _this.sessionId, statusCode: xhr.status });
                    });
                }
                else if (xhr.status !== 0) {
                    results[index] = { __tsiError__: JSON.parse(xhr.responseText) };
                    if (results.map(function (ar) { return !('progress' in ar); }).reduce(function (p, c) { p = c && p; return p; }, true)) {
                        resolve(results);
                        _this.onAjaxError({ uri: uri, payload: JSON.stringify(contentObject), clientRequestId: clientRequestId, sessionId: _this.sessionId });
                    }
                }
                var percentComplete = Math.max(results.map(function (r) { return 'progress' in r ? r.progress : 100; }).reduce(function (p, c) { return p + c; }, 0) / results.length, 1);
                onProgressChange(percentComplete);
            };
            xhr.onreadystatechange = onreadystatechange;
            xhr.onabort = function () {
                resolve('__CANCELLED__');
                clearTimeout(retryTimeout);
            };
            xhr.open('POST', uri);
            clientRequestId = _this.setStandardHeaders(xhr, token);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(contentObject));
        };
        // this function returns a promise which resolve empty object after request is done and 
        // keeps track of the items and changes the values in the passed parameters 
        // based on the response if it is erroneous
        this.sendBatchDataPostRequestPromise = function (requestParams, batchParams) {
            var url = requestParams.url, token = requestParams.token, method = requestParams.method, onProgressChange = requestParams.onProgressChange, batch = requestParams.batch;
            return new Promise(function (resolve) {
                var batchObject = {};
                batchObject[method] = batch;
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) {
                        return;
                    }
                    if (xhr.status === 200 || xhr.status === 202) {
                        var result = JSON.parse(xhr.responseText);
                        if (result === null || result === void 0 ? void 0 : result.error) {
                            batchParams.erroneousDataCount += batch.length;
                            batchParams.resultErrorMessage += result.error.message ? ' Item ' + batchParams.dataIndex + "-" + (batchParams.dataIndex + batch.length) + ": " + result.error.message : '';
                            batchParams.dataIndex += batch.length;
                            return;
                        }
                        else {
                            result[method].forEach(function (i) {
                                var _a;
                                batchParams.dataIndex++;
                                if ((i === null || i === void 0 ? void 0 : i.error) || (i === null || i === void 0 ? void 0 : i.code) === ErrorCodes.InvalidInput) {
                                    batchParams.erroneousDataCount++;
                                    batchParams.resultErrorMessage += "\n>Item-" + batchParams.dataIndex + ": " + (((_a = i === null || i === void 0 ? void 0 : i.error) === null || _a === void 0 ? void 0 : _a.message) || (i === null || i === void 0 ? void 0 : i.message));
                                }
                            });
                        }
                    }
                    else {
                        batchParams.erroneousDataCount += batch.length;
                        batchParams.resultErrorMessage += ' Item ' + batchParams.dataIndex + "-" + (batchParams.dataIndex + batch.length) + ": Server error!";
                        batchParams.dataIndex += batch.length;
                    }
                    batchParams.completedDataCount += batch.length;
                    var percentComplete = batchParams.completedDataCount * 100 / batchParams.totalItemCount;
                    onProgressChange(percentComplete);
                    resolve({});
                };
                xhr.open('POST', url);
                _this.setStandardHeaders(xhr, token);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(batchObject));
            });
        };
        this.createPostBatchPromise = function (url, data, token, method, responseTextFormat, onProgressChange, batchSize, maxByteSize) {
            var batchParams = {
                dataIndex: 0,
                erroneousDataCount: 0,
                completedDataCount: 0,
                totalItemCount: data.length,
                resultErrorMessage: ''
            };
            var batches = [];
            while (data.length) {
                var batch = [];
                while (batch.length < batchSize && Utils.memorySizeOf(batch.concat(data[0])) < maxByteSize) { // create the batch of data to send based on limits provided
                    batch = batch.concat(data.splice(0, 1));
                    if (data.length === 0) {
                        break;
                    }
                }
                if (batch.length) {
                    batches.push(batch);
                }
            }
            //returns a promise with result object which waits for inner promises to make batch requests and resolve
            return batches.reduce(function (p, batch) {
                return p.then(function () { return _this.sendBatchDataPostRequestPromise({ url: url, token: token, method: method, onProgressChange: onProgressChange, batch: batch }, batchParams); }); // send batches in sequential order
            }, Promise.resolve())
                .then(function () {
                var result = {};
                if (batchParams.erroneousDataCount === 0) {
                    result[method] = [{}];
                }
                else {
                    result[method] = [{ error: { code: ErrorCodes.PartialSuccess, message: "Error in " + batchParams.erroneousDataCount + "/" + batchParams.totalItemCount + (" items.  " + batchParams.resultErrorMessage) } }];
                }
                return responseTextFormat(JSON.stringify(result));
            });
        };
        this.createPromiseFromXhrForBatchData = function (url, payload, token, responseTextFormat, onProgressChange, batchSize, maxByteSize) {
            if (onProgressChange === void 0) { onProgressChange = function (percentComplete) { }; }
            if (batchSize === void 0) { batchSize = 1000; }
            if (maxByteSize === void 0) { maxByteSize = 8000000; }
            var payloadObj = JSON.parse(payload);
            if (payloadObj.put || payloadObj.update) {
                var method = payloadObj.put ? "put" : "update";
                var data = payloadObj[method];
                return _this.createPostBatchPromise(url, data, token, method, responseTextFormat, onProgressChange, batchSize, maxByteSize);
            }
            else {
                return _this.createPromiseFromXhr(url, 'POST', payload, token, function (responseText) { return JSON.parse(responseText); });
            }
        };
    }
    ServerClient.prototype.Server = function () {
    };
    ServerClient.prototype.createPromiseFromXhr = function (uri, httpMethod, payload, token, responseTextFormat, continuationToken) {
        var _this = this;
        if (continuationToken === void 0) { continuationToken = null; }
        return new Promise(function (resolve, reject) {
            var sendRequest;
            var retryCount = 0;
            var clientRequestId;
            sendRequest = function () {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4)
                        return;
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (xhr.responseText.length == 0)
                            resolve({});
                        else {
                            resolve(responseTextFormat(xhr.responseText));
                        }
                    }
                    else if (_this.retryBasedOnStatus(xhr) && retryCount < _this.maxRetryCount) {
                        retryCount++;
                        _this.retryWithDelay(retryCount, sendRequest);
                        _this.onAjaxRetry({ uri: uri, method: httpMethod, payload: JSON.stringify(payload), clientRequestId: clientRequestId, sessionId: _this.sessionId, statusCode: xhr.status });
                    }
                    else {
                        reject(xhr);
                        _this.onAjaxError({ uri: uri, method: httpMethod, payload: JSON.stringify(payload), clientRequestId: clientRequestId, sessionId: _this.sessionId });
                    }
                };
                xhr.open(httpMethod, uri);
                clientRequestId = _this.setStandardHeaders(xhr, token);
                if (httpMethod == 'POST' || httpMethod == 'PUT')
                    xhr.setRequestHeader('Content-Type', 'application/json');
                if (continuationToken)
                    xhr.setRequestHeader('x-ms-continuation', continuationToken);
                xhr.send(payload);
            };
            sendRequest();
        });
    };
    ServerClient.prototype.getCancellableTsqResults = function (token, uri, tsqArray, onProgressChange, mergeAccumulatedResults, storeType) {
        if (onProgressChange === void 0) { onProgressChange = function (p) { }; }
        if (mergeAccumulatedResults === void 0) { mergeAccumulatedResults = false; }
        if (storeType === void 0) { storeType = null; }
        // getTsqResults() returns either a promise or an array containing a promise + cancel trigger 
        // depending on whether we set the hasCancelTrigger flag. Here we need to set the type of what
        // we get back to 'unknown'. This lets TypeScript know that we have enough information to
        // confidently cast the return value as an Array<Promise<any> | Function>.
        var promiseAndTrigger = this.getTsqResults(token, uri, tsqArray, onProgressChange, mergeAccumulatedResults, storeType, true);
        return promiseAndTrigger;
    };
    ServerClient.prototype.getTsqResults = function (token, uri, tsqArray, onProgressChange, mergeAccumulatedResults, storeType, hasCancelTrigger) {
        var _this = this;
        if (onProgressChange === void 0) { onProgressChange = function (p) { }; }
        if (mergeAccumulatedResults === void 0) { mergeAccumulatedResults = false; }
        if (storeType === void 0) { storeType = null; }
        if (hasCancelTrigger === void 0) { hasCancelTrigger = false; }
        var tsqResults = [];
        tsqArray.forEach(function (tsq) {
            tsqResults.push({ progress: 0 });
        });
        var xhrs = tsqArray.map(function (tsq) {
            return new XMLHttpRequest();
        });
        var storeTypeString = storeType ? '&storeType=' + storeType : '';
        var promise = new Promise(function (resolve, reject) {
            tsqArray.map(function (tsq, i) {
                return _this.getQueryApiResult(token, tsqResults, tsq, i, "https://" + uri + "/timeseries/query" + _this.tsmTsqApiVersion + storeTypeString, resolve, function (message) { return message; }, onProgressChange, mergeAccumulatedResults, xhrs[i]);
            });
        });
        if (hasCancelTrigger) {
            var cancelTrigger = function () {
                xhrs.forEach(function (xhr) {
                    xhr.abort();
                });
            };
            return [promise, cancelTrigger];
        }
        return promise;
    };
    ServerClient.prototype.getAggregates = function (token, uri, tsxArray, onProgressChange) {
        var _this = this;
        if (onProgressChange === void 0) { onProgressChange = function (p) { }; }
        var aggregateResults = [];
        tsxArray.forEach(function (ae) {
            aggregateResults.push({ progress: 0 });
        });
        return new Promise(function (resolve, reject) {
            tsxArray.forEach(function (tsx, i) {
                _this.getQueryApiResult(token, aggregateResults, tsx, i, "https://" + uri + "/aggregates" + _this.apiVersionUrlParam, resolve, function (message) { return message.aggregates[0]; }, onProgressChange);
            });
        });
    };
    ServerClient.prototype.getTimeseriesInstances = function (token, environmentFqdn, limit, timeSeriesIds) {
        var _this = this;
        if (limit === void 0) { limit = 10000; }
        if (timeSeriesIds === void 0) { timeSeriesIds = null; }
        if (!timeSeriesIds || timeSeriesIds.length === 0) {
            return new Promise(function (resolve, reject) {
                _this.getDataWithContinuationBatch(token, resolve, reject, [], 'https://' + environmentFqdn + '/timeseries/instances/' + _this.tsmTsqApiVersion, 'GET', 'instances', null, limit);
            });
        }
        else {
            return this.createPromiseFromXhr('https://' + environmentFqdn + '/timeseries/instances/$batch' + this.tsmTsqApiVersion, "POST", JSON.stringify({ get: timeSeriesIds }), token, function (responseText) { return JSON.parse(responseText); });
        }
    };
    ServerClient.prototype.getTimeseriesTypes = function (token, environmentFqdn, typeIds) {
        if (typeIds === void 0) { typeIds = null; }
        if (!typeIds || typeIds.length === 0) {
            var uri = 'https://' + environmentFqdn + '/timeseries/types/' + this.tsmTsqApiVersion;
            return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
        }
        else {
            return this.createPromiseFromXhr('https://' + environmentFqdn + '/timeseries/types/$batch' + this.tsmTsqApiVersion, "POST", JSON.stringify({ get: { typeIds: typeIds, names: null } }), token, function (responseText) { return JSON.parse(responseText); });
        }
    };
    ServerClient.prototype.postTimeSeriesTypes = function (token, environmentFqdn, payload, useOldApiVersion) {
        if (useOldApiVersion === void 0) { useOldApiVersion = false; }
        var uri = 'https://' + environmentFqdn + '/timeseries/types/$batch' + (useOldApiVersion ? this.oldTsmTsqApiVersion : this.tsmTsqApiVersion);
        return this.createPromiseFromXhr(uri, "POST", payload, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.updateSavedQuery = function (token, timeSeriesQuery, endpoint) {
        if (endpoint === void 0) { endpoint = 'https://api.timeseries.azure.com'; }
        var uri = endpoint + "/artifacts/" + timeSeriesQuery.id + this.tsmTsqApiVersion;
        var payload = JSON.stringify(timeSeriesQuery);
        return this.createPromiseFromXhr(uri, "MERGE", payload, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getTimeseriesHierarchies = function (token, environmentFqdn) {
        var uri = 'https://' + environmentFqdn + '/timeseries/hierarchies/' + this.tsmTsqApiVersion;
        return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getTimeseriesModel = function (token, environmentFqdn) {
        var uri = 'https://' + environmentFqdn + '/timeseries/modelSettings/' + this.tsmTsqApiVersion;
        return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getTimeseriesInstancesPathSearch = function (token, environmentFqdn, payload, instancesContinuationToken, hierarchiesContinuationToken) {
        if (instancesContinuationToken === void 0) { instancesContinuationToken = null; }
        if (hierarchiesContinuationToken === void 0) { hierarchiesContinuationToken = null; }
        var uri = 'https://' + environmentFqdn + '/timeseries/instances/search' + this.tsmTsqApiVersion;
        var requestPayload = __assign({}, payload);
        if (requestPayload.path.length == 0) {
            requestPayload.path = null;
        }
        return this.createPromiseFromXhr(uri, "POST", JSON.stringify(requestPayload), token, function (responseText) { return JSON.parse(responseText); }, instancesContinuationToken || hierarchiesContinuationToken);
    };
    ServerClient.prototype.getTimeseriesInstancesSuggestions = function (token, environmentFqdn, searchString, take) {
        if (take === void 0) { take = 10; }
        var uri = 'https://' + environmentFqdn + '/timeseries/instances/suggest' + this.tsmTsqApiVersion;
        return this.createPromiseFromXhr(uri, "POST", JSON.stringify({ searchString: searchString, take: take }), token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getTimeseriesInstancesSearch = function (token, environmentFqdn, searchString, continuationToken) {
        if (continuationToken === void 0) { continuationToken = null; }
        var uri = 'https://' + environmentFqdn + '/timeseries/instances/search' + this.tsmTsqApiVersion;
        return this.createPromiseFromXhr(uri, "POST", JSON.stringify({ searchString: searchString }), token, function (responseText) { return JSON.parse(responseText); }, continuationToken);
    };
    ServerClient.prototype.getReferenceDatasetRows = function (token, environmentFqdn, datasetId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getDataWithContinuationBatch(token, resolve, reject, [], "https://" + environmentFqdn + "/referencedatasets/" + datasetId + "/items" + _this.apiVersionUrlParam + "&format=stream", 'POST', 'items');
        });
    };
    ServerClient.prototype.postReferenceDatasetRows = function (token, environmentFqdn, datasetName, rows, onProgressChange) {
        if (onProgressChange === void 0) { onProgressChange = function (p) { }; }
        var uri = "https://" + environmentFqdn + "/referencedatasets/" + datasetName + "/$batch" + this.apiVersionUrlParam;
        return this.createPromiseFromXhrForBatchData(uri, JSON.stringify({ put: rows }), token, function (responseText) { return JSON.parse(responseText); }, onProgressChange);
    };
    ServerClient.prototype.getReferenceDatasets = function (token, resourceId, endpoint) {
        if (endpoint === void 0) { endpoint = "https://management.azure.com"; }
        var uri = endpoint + resourceId + "/referencedatasets" + this.referenceDataAPIVersion;
        return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.deleteReferenceDataSet = function (token, resourceId, datasetName, endpoint) {
        if (endpoint === void 0) { endpoint = "https://management.azure.com"; }
        var uri = endpoint + resourceId + "/referencedatasets/" + datasetName + this.referenceDataAPIVersion;
        return this.createPromiseFromXhr(uri, "DELETE", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.putReferenceDataSet = function (token, resourceId, datasetName, dataSet, endpoint) {
        if (endpoint === void 0) { endpoint = "https://management.azure.com"; }
        var uri = endpoint + resourceId + "/referencedatasets/" + datasetName + this.referenceDataAPIVersion;
        return this.createPromiseFromXhr(uri, "PUT", JSON.stringify(dataSet), token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getGen1Environment = function (token, resourceId, endpoint) {
        if (endpoint === void 0) { endpoint = "https://management.azure.com"; }
        var uri = endpoint + resourceId + this.referenceDataAPIVersion;
        return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getEnvironments = function (token, endpoint) {
        if (endpoint === void 0) { endpoint = 'https://api.timeseries.azure.com'; }
        var uri = endpoint + '/environments' + this.apiVersionUrlParam;
        return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getSampleEnvironments = function (token, endpoint) {
        if (endpoint === void 0) { endpoint = 'https://api.timeseries.azure.com'; }
        var uri = endpoint + '/sampleenvironments' + this.apiVersionUrlParam;
        return this.createPromiseFromXhr(uri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); });
    };
    ServerClient.prototype.getMetadata = function (token, environmentFqdn, minMillis, maxMillis) {
        var uri = 'https://' + environmentFqdn + '/metadata' + this.apiVersionUrlParam;
        var searchSpan = { searchSpan: { from: new Date(minMillis).toISOString(), to: new Date(maxMillis).toISOString() } };
        var payload = JSON.stringify(searchSpan);
        return this.createPromiseFromXhr(uri, "POST", payload, token, function (responseText) { return JSON.parse(responseText).properties; });
    };
    ServerClient.prototype.getEventSchema = function (token, environmentFqdn, minMillis, maxMillis) {
        var uri = 'https://' + environmentFqdn + '/eventSchema' + this.tsmTsqApiVersion;
        var searchSpan = { searchSpan: { from: new Date(minMillis).toISOString(), to: new Date(maxMillis).toISOString() } };
        var payload = JSON.stringify(searchSpan);
        return this.createPromiseFromXhr(uri, "POST", payload, token, function (responseText) { return JSON.parse(responseText).properties; });
    };
    ServerClient.prototype.getAvailability = function (token, environmentFqdn, apiVersion, hasWarm) {
        var _this = this;
        if (apiVersion === void 0) { apiVersion = this.apiVersionUrlParam; }
        if (hasWarm === void 0) { hasWarm = false; }
        var uriBase = 'https://' + environmentFqdn + '/availability';
        var coldUri = uriBase + apiVersion + (hasWarm ? '&storeType=ColdStore' : '');
        return new Promise(function (resolve, reject) {
            _this.createPromiseFromXhr(coldUri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); }).then(function (coldResponse) {
                if (hasWarm) {
                    var warmUri = uriBase + apiVersion + '&storeType=WarmStore';
                    _this.createPromiseFromXhr(warmUri, "GET", {}, token, function (responseText) { return JSON.parse(responseText); }).then(function (warmResponse) {
                        var availability = warmResponse ? warmResponse.availability : null;
                        if (coldResponse.availability) {
                            availability = Utils.mergeAvailabilities(warmResponse.availability, coldResponse.availability, warmResponse.retention);
                        }
                        resolve({ availability: availability });
                    })
                        .catch(function () { resolve(coldResponse); });
                }
                else {
                    resolve(coldResponse);
                }
            })
                .catch(function (xhr) {
                reject(xhr);
            });
        });
    };
    ServerClient.prototype.getEvents = function (token, environmentFqdn, predicateObject, options, minMillis, maxMillis) {
        var uri = 'https://' + environmentFqdn + '/events' + this.apiVersionUrlParam;
        var take = 10000;
        var searchSpan = { from: new Date(minMillis).toISOString(), to: new Date(maxMillis).toISOString() };
        var topObject = { sort: [{ input: { builtInProperty: '$ts' }, order: 'Asc' }], count: take };
        var messageObject = { predicate: predicateObject, top: topObject, searchSpan: searchSpan };
        var payload = JSON.stringify(messageObject);
        return this.createPromiseFromXhr(uri, "POST", payload, token, function (responseText) { return JSON.parse(responseText).events; });
    };
    ServerClient.prototype.getDataWithContinuationBatch = function (token, resolve, reject, rows, url, verb, propName, continuationToken, maxResults) {
        var _this = this;
        if (continuationToken === void 0) { continuationToken = null; }
        if (maxResults === void 0) { maxResults = Number.MAX_VALUE; }
        var continuationToken, sendRequest, clientRequestId, retryCount = 0;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4)
                return;
            if (xhr.status == 200) {
                var message = JSON.parse(xhr.responseText);
                if (message[propName])
                    rows = rows.concat(message[propName]);
                // HACK because /instances doesn't match /items
                continuationToken = verb == 'GET' ? message.continuationToken : xhr.getResponseHeader('x-ms-continuation');
                if (!continuationToken || rows.length >= maxResults)
                    resolve(rows);
                else
                    _this.getDataWithContinuationBatch(token, resolve, reject, rows, url, verb, propName, continuationToken, maxResults);
            }
            else if (_this.retryBasedOnStatus(xhr) && retryCount < _this.maxRetryCount) {
                retryCount++;
                _this.retryWithDelay(retryCount, sendRequest);
                _this.onAjaxRetry({ uri: url, method: verb, clientRequestId: clientRequestId, sessionId: _this.sessionId, statusCode: xhr.status });
            }
            else {
                reject(xhr);
                _this.onAjaxError({ uri: url, method: verb, clientRequestId: clientRequestId, sessionId: _this.sessionId });
            }
        };
        sendRequest = function () {
            xhr.open(verb, url);
            clientRequestId = _this.setStandardHeaders(xhr, token);
            if (verb === 'POST')
                xhr.setRequestHeader('Content-Type', 'application/json');
            if (continuationToken)
                xhr.setRequestHeader('x-ms-continuation', continuationToken);
            xhr.send(JSON.stringify({ take: 100000 }));
        };
        sendRequest();
    };
    ServerClient.prototype.retryWithDelay = function (retryNumber, method) {
        var retryDelay = (Math.exp(retryNumber - 1) + Math.random() * 2) * 1000;
        return setTimeout(method, retryDelay);
    };
    return ServerClient;
}());

export default ServerClient;
