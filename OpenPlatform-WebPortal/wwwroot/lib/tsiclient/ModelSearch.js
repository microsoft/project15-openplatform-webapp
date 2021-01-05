import { a as __extends, _ as __assign, b as Component, U as Utils } from './Utils-e5be3308.js';
import { select, mouse, selectAll, event } from 'd3';
import 'moment-timezone';
import ServerClient from './ServerClient.js';
import Hierarchy from './Hierarchy.js';
import 'awesomplete';
import ModelAutocomplete from './ModelAutocomplete.js';

var ModelSearch = /** @class */ (function (_super) {
    __extends(ModelSearch, _super);
    function ModelSearch(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.usedContinuationTokens = {};
        _this.currentResultIndex = -1;
        _this.stripHits = function (str) {
            return str.split('<hit>').map(function (h) { return h.split('</hit>').map(function (h2) { return Utils.strip(h2); }).join('</hit>'); }).join('<hit>');
        };
        _this.server = new ServerClient();
        select("html").on("click." + Utils.guid(), function () {
            if (_this.clickedInstance && event.target != _this.clickedInstance && _this.contextMenu) {
                _this.closeContextMenu();
                _this.clickedInstance = null;
            }
        });
        return _this;
    }
    ModelSearch.prototype.ModelSearch = function () {
    };
    ModelSearch.prototype.render = function (environmentFqdn, getToken, hierarchyData, chartOptions) {
        var _this = this;
        this.chartOptions.setOptions(chartOptions);
        var self = this;
        var continuationToken, searchText;
        var targetElement = select(this.renderTarget);
        targetElement.html('');
        this.wrapper = targetElement.append('div').attr('class', 'tsi-modelSearchWrapper');
        _super.prototype.themify.call(this, this.wrapper, this.chartOptions.theme);
        var inputWrapper = this.wrapper.append("div")
            .attr("class", "tsi-modelSearchInputWrapper");
        var autocompleteOnInput = function (st, event) {
            self.usedContinuationTokens = {};
            // blow results away if no text
            if (st.length === 0) {
                searchText = st;
                self.instanceResults.html('');
                self.currentResultIndex = -1;
                hierarchyElement.node().style.display = 'block';
                showMore.node().style.display = 'none';
                noResults.style('display', 'none');
            }
            else if (event.which === 13 || event.keyCode === 13) {
                hierarchyElement.node().style.display = 'none';
                self.instanceResults.html('');
                self.currentResultIndex = -1;
                noResults.style('display', 'none');
                searchInstances(st);
                searchText = st;
            }
        };
        var modelAutocomplete = new ModelAutocomplete(inputWrapper.node());
        modelAutocomplete.render(environmentFqdn, getToken, __assign({ onInput: autocompleteOnInput, onKeydown: function (event, ap) { _this.handleKeydown(event, ap); } }, chartOptions));
        var ap = modelAutocomplete.ap;
        var results = this.wrapper.append('div')
            .attr("class", "tsi-modelSearchResults").on('scroll', function () {
            self.closeContextMenu();
            var that = this;
            if (that.scrollTop + that.clientHeight + 150 > self.instanceResults.node().clientHeight && searchText.length !== 0) {
                searchInstances(searchText, continuationToken);
            }
        });
        var noResults = results.append('div').text(this.getString('No results')).classed('tsi-noResults', true).style('display', 'none');
        var instanceResultsWrapper = results.append('div').attr('class', 'tsi-modelSearchInstancesWrapper');
        this.instanceResults = instanceResultsWrapper.append('div').attr('class', 'tsi-modelSearchInstances');
        var showMore = instanceResultsWrapper.append('div').attr('class', 'tsi-showMore').text(this.getString('Show more') + '...').on('click', function () { return searchInstances(searchText, continuationToken); }).style('display', 'none');
        var hierarchyElement = this.wrapper.append('div')
            .attr("class", "tsi-hierarchyWrapper");
        var hierarchy = new Hierarchy(hierarchyElement.node());
        hierarchy.render(hierarchyData, __assign(__assign({}, this.chartOptions), { withContextMenu: true }));
        var searchInstances = function (searchText, ct) {
            if (ct === void 0) { ct = null; }
            var self = _this;
            if (ct === 'END')
                return;
            if (ct === null || !self.usedContinuationTokens[ct]) {
                self.usedContinuationTokens[ct] = true;
                getToken().then(function (token) {
                    self.server.getTimeseriesInstancesSearch(token, environmentFqdn, searchText, ct).then(function (r) {
                        var instances;
                        if (Array.isArray(r.instances)) {
                            continuationToken = r.instancesContinuationToken;
                            instances = r.instances;
                        }
                        else { //new search api with the support of hierarchy navigation
                            if (r.instances.hasOwnProperty('hits')) {
                                instances = r.instances.hits;
                                continuationToken = r.instances.hits.continuationToken;
                            }
                        }
                        if (!continuationToken)
                            continuationToken = 'END';
                        showMore.node().style.display = continuationToken !== 'END' ? 'block' : 'none';
                        if (instances.length == 0) {
                            noResults.style('display', 'block');
                        }
                        else {
                            noResults.style('display', 'none');
                        }
                        instances.forEach(function (i) {
                            var handleClick = function (elt, wrapperMousePos, eltMousePos, fromKeyboard) {
                                if (fromKeyboard === void 0) { fromKeyboard = false; }
                                self.closeContextMenu();
                                if (self.clickedInstance != elt) {
                                    self.clickedInstance = elt;
                                    i.type = self.types.filter(function (t) {
                                        return t.name.replace(/\s/g, '') === (i.highlights.type ? i.highlights.type.split('<hit>').join('').split('</hit>').join('').replace(/\s/g, '') : i.highlights.typeName.split('<hit>').join('').split('</hit>').join('').replace(/\s/g, ''));
                                    })[0];
                                    var contextMenuActions = self.chartOptions.onInstanceClick(i);
                                    self.contextMenu = self.wrapper.append('div');
                                    if (!Array.isArray(contextMenuActions)) {
                                        contextMenuActions = [contextMenuActions];
                                    }
                                    var totalActionCount_1 = contextMenuActions.map(function (cma) { return Object.keys(cma).length; }).reduce(function (p, c) { return p + c; }, 0);
                                    var currentActionIndex_1 = 0;
                                    contextMenuActions.forEach(function (cma, cmaGroupIdx) {
                                        Object.keys(cma).forEach(function (k, kIdx, kArray) {
                                            var localActionIndex = currentActionIndex_1;
                                            self.contextMenu.append('div').text(k).on('click', cma[k]).on('keydown', function () {
                                                var evt = event;
                                                if (evt.keyCode === 13) {
                                                    this.click();
                                                }
                                                if (evt.keyCode === 13 || evt.keyCode === 37) {
                                                    self.closeContextMenu();
                                                    var results_1 = self.instanceResults.selectAll('.tsi-modelResultWrapper');
                                                    results_1.nodes()[self.currentResultIndex].focus();
                                                }
                                                if (evt.keyCode === 40 && (localActionIndex + 1 < totalActionCount_1)) { // down
                                                    self.contextMenu.node().children[localActionIndex + 1 + cmaGroupIdx + (kIdx === (kArray.length - 1) ? 1 : 0)].focus();
                                                }
                                                if (evt.keyCode === 38 && localActionIndex > 0) { // up
                                                    self.contextMenu.node().children[localActionIndex - 1 + cmaGroupIdx - (kIdx === 0 ? 1 : 0)].focus();
                                                }
                                            }).attr('tabindex', '0');
                                            currentActionIndex_1++;
                                        });
                                        self.contextMenu.append('div').classed('tsi-break', true);
                                    });
                                    self.contextMenu.attr('style', function () { return "top: " + (wrapperMousePos - eltMousePos) + "px"; });
                                    self.contextMenu.classed('tsi-modelSearchContextMenu', true);
                                    select(elt).classed('tsi-resultSelected', true);
                                    if (self.contextMenu.node().children.length > 0 && fromKeyboard) {
                                        self.contextMenu.node().children[0].focus();
                                    }
                                }
                                else {
                                    self.clickedInstance = null;
                                }
                            };
                            _this.instanceResults.append('div').html(self.getInstanceHtml(i)) // known unsafe usage of .html
                                .on('click', function () {
                                var mouseWrapper = mouse(self.wrapper.node());
                                var mouseElt = mouse(this);
                                handleClick(this, mouseWrapper[1], mouseElt[1]);
                            })
                                .on('keydown', function () {
                                var evt = event;
                                if (evt.keyCode === 13) {
                                    var resultsNodes = _this.instanceResults.selectAll('.tsi-modelResultWrapper').nodes();
                                    var height = 0;
                                    for (var i = 0; i < _this.currentResultIndex; i++) {
                                        height += resultsNodes[0].clientHeight;
                                    }
                                    handleClick(_this.instanceResults.select('.tsi-modelResultWrapper:focus').node(), height - results.node().scrollTop + 48, 0, true);
                                }
                                self.handleKeydown(evt, ap);
                            }).attr('tabindex', '0').classed('tsi-modelResultWrapper', true);
                        });
                    });
                });
            }
        };
        getToken().then(function (token) {
            _this.server.getTimeseriesHierarchies(token, environmentFqdn).then(function (r) {
                _this.hierarchies = r.hierarchies;
            });
        });
        // get types
        getToken().then(function (token) {
            _this.server.getTimeseriesTypes(token, environmentFqdn).then(function (r) {
                _this.types = r.types;
            });
        });
    };
    ModelSearch.prototype.handleKeydown = function (event, ap) {
        if (!ap.isOpened) {
            var results = this.instanceResults.selectAll('.tsi-modelResultWrapper');
            if (results.size()) {
                if (event.keyCode === 40 && this.currentResultIndex < results.nodes().length - 1) {
                    this.currentResultIndex++;
                    results.nodes()[this.currentResultIndex].focus();
                }
                else if (event.keyCode === 38) {
                    this.currentResultIndex--;
                    if (this.currentResultIndex <= -1) {
                        this.currentResultIndex = -1;
                        ap.input.focus();
                    }
                    else {
                        results.nodes()[this.currentResultIndex].focus();
                    }
                }
            }
        }
    };
    ModelSearch.prototype.closeContextMenu = function () {
        if (this.contextMenu) {
            this.contextMenu.remove();
        }
        selectAll('.tsi-resultSelected').classed('tsi-resultSelected', false);
    };
    ModelSearch.prototype.getInstanceHtml = function (i) {
        var _this = this;
        return "<div class=\"tsi-modelResult\">\n                    <div class=\"tsi-modelPK\">\n                        " + (i.highlights.name ? this.stripHits(i.highlights.name) : this.stripHits(i.highlights.timeSeriesIds ? i.highlights.timeSeriesIds.join(' ') : i.highlights.timeSeriesId.join(' '))) + "\n                    </div>\n                    <div class=\"tsi-modelHighlights\">\n                        " + this.stripHits(i.highlights.description && i.highlights.description.length ? i.highlights.description : this.getString('No description')) + "\n                        <br/><table>\n                        " + (i.highlights.name ? ('<tr><td>' + this.getString("Time Series ID") + '</td><td>' + this.stripHits(i.highlights.timeSeriesIds ? i.highlights.timeSeriesIds.join(' ') : i.highlights.timeSeriesId.join(' ')) + '</td></tr>') : '') + "                        \n                        " + i.highlights.instanceFieldNames.map(function (ifn, idx) {
            var val = i.highlights.instanceFieldValues[idx];
            if (ifn.indexOf('<hit>') !== -1 || val.indexOf('<hit>') !== -1) {
                return val.length === 0 ? '' : '<tr><td>' + _this.stripHits(ifn) + '</td><td>' + _this.stripHits(val) + '</tr>';
            }
        }).join('') + "\n                        </table>\n                    </div>\n                </div>";
    };
    return ModelSearch;
}(Component));

export default ModelSearch;
