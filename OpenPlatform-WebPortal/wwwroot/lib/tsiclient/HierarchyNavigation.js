import { a as __extends, h as __awaiter, I as InstancesSort, H as HierarchiesExpand, i as HierarchiesSort, j as __generator, U as Utils, k as __spreadArrays, K as KeyCodes, _ as __assign, b as Component } from './Utils-e5be3308.js';
import { event, create, select, selectAll, mouse } from 'd3';
import 'moment-timezone';
import ServerClient from './ServerClient.js';
import 'awesomplete';
import ModelAutocomplete from './ModelAutocomplete.js';

var HierarchyNavigation = /** @class */ (function (_super) {
    __extends(HierarchyNavigation, _super);
    function HierarchyNavigation(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.usedInstanceSearchContinuationTokens = {};
        _this.envHierarchies = {};
        _this.envTypes = {};
        _this.selectedHierarchyName = HierarchySelectionValues.All;
        _this.viewType = ViewType.Hierarchy;
        _this.mode = State.Navigate;
        _this.searchString = "";
        _this.path = [];
        _this.renderHierarchySelection = function () {
            var hierarchyList = __spreadArrays([HierarchySelectionValues.All], Object.keys(_this.envHierarchies), [HierarchySelectionValues.Unparented]);
            _this.hierarchyListElem.text('');
            var self = _this;
            hierarchyList.forEach(function (h) {
                var title = h === HierarchySelectionValues.All ? _this.getString("All hierarchies") :
                    h === HierarchySelectionValues.Unparented ? _this.getString("Unassigned Time Series Instances") : h;
                _this.hierarchyListElem.append('li').classed('selected', h === _this.selectedHierarchyName)
                    .attr("hName", h)
                    .attr('tabindex', 0)
                    .attr('role', 'option')
                    .attr('aria-selected', h === _this.selectedHierarchyName)
                    .attr('title', title)
                    .text(title).on('click keydown', function () {
                    if (event && event.type && event.type === 'keydown') {
                        event.preventDefault();
                        var key = event.which || event.keyCode;
                        if (key === KeyCodes.Down) {
                            if (this.nextElementSibling)
                                this.nextElementSibling.focus();
                            else {
                                self.hierarchyListElem.selectAll("li").nodes()[0].focus();
                            }
                        }
                        else if (key === KeyCodes.Up) {
                            if (this.previousElementSibling)
                                this.previousElementSibling.focus();
                            else {
                                self.hierarchyListElem.selectAll("li").nodes()[self.hierarchyListElem.selectAll("li").nodes().length - 1].focus();
                            }
                        }
                        else if (key === KeyCodes.Enter) {
                            self.selectHierarchy(h);
                            self.searchGloballyElem.node().style.display = 'none';
                            self.hierarchySelectorElem.node().focus();
                        }
                        else if (key === KeyCodes.Esc) {
                            self.isHierarchySelectionActive = false;
                            self.hierarchyListWrapperElem.style('display', 'none');
                            self.hierarchySelectorElem.node().focus();
                        }
                        return;
                    }
                    self.selectHierarchy(h);
                    self.hierarchySelectorElem.node().focus();
                    if (h === HierarchySelectionValues.All) {
                        self.searchGloballyElem.node().style.display = 'none';
                    }
                });
            });
            _this.hierarchyListWrapperElem.style('display', 'inline-flex');
            _this.hierarchyListElem.select("li.selected").node().focus();
        };
        //to switch between list view and hierarchy view when search string exists, i.e. in Search mode
        _this.switchToSearchView = function (view, applySearch) {
            if (applySearch === void 0) { applySearch = true; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.closeContextMenu();
                            this.viewType = view;
                            this.viewTypesElem.selectAll('.tsi-view-type').classed('selected', false).attr('aria-selected', false);
                            if (!(this.viewType === ViewType.Hierarchy)) return [3 /*break*/, 3];
                            select(this.viewTypesElem.selectAll('.tsi-view-type').nodes()[0]).classed('selected', true).attr('aria-selected', true);
                            if (this.searchString) {
                                this.setModeAndRequestParamsForFilter();
                            }
                            else {
                                this.setModeAndRequestParamsForNavigate();
                            }
                            if (!(selectAll('.tsi-hierarchy ul').size() === 0 && applySearch)) return [3 /*break*/, 2];
                            this.hierarchyElem.text('');
                            return [4 /*yield*/, this.pathSearchAndRenderResult({ search: { payload: this.requestPayload() }, render: { target: this.hierarchyElem } })];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            this.hierarchyElem.node().style.display = 'block';
                            this.instanceListWrapperElem.node().style.display = 'none';
                            return [3 /*break*/, 6];
                        case 3:
                            select(this.viewTypesElem.selectAll('.tsi-view-type').nodes()[1]).classed('selected', true).attr('aria-selected', true);
                            this.setModeAndRequestParamsForSearch();
                            if (this.selectedHierarchyName === HierarchySelectionValues.Unparented) {
                                this.chartOptions.hierarchyOptions.isInstancesRecursive = false;
                            }
                            if (!(selectAll('.tsi-modelResultWrapper').size() === 0 && applySearch)) return [3 /*break*/, 5];
                            this.instanceListElem.text('');
                            this.lastInstanceContinuationToken = null;
                            this.usedInstanceSearchContinuationTokens = {};
                            return [4 /*yield*/, this.pathSearchAndRenderResult({ search: { payload: this.requestPayload() }, render: { target: this.instanceListElem } })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            this.hierarchyElem.node().style.display = 'none';
                            this.instanceListWrapperElem.node().style.display = 'block';
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        // do exact search with tsid to retrieve all possible paths until that instance to traverse for expansion
        _this.doExactSearchWithPossiblePaths = function (tsid, hNames) {
            _this.setModeAndRequestParamsForFilter();
            var escapedTsidString = Utils.escapedTsidForExactSearch(tsid === null || tsid === void 0 ? void 0 : tsid.join(" "));
            _this.searchString = "\"" + escapedTsidString + "\""; //TODO: null vs string null check for exact search and escape for character : fix from backend will come here!!
            return Promise.all(hNames.map(function (hName) {
                var payload = hName ? _this.requestPayload([hName]) : _this.requestPayload(null);
                return _this.getToken().then(function (token) {
                    return _this.server.getTimeseriesInstancesPathSearch(token, _this.environmentFqdn, payload, null, null)
                        .catch(function (err) { throw err; });
                })
                    .catch(function (err) { throw err; });
            })).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to complete search", err instanceof XMLHttpRequest ? err : null); });
        };
        // clear dom and reset some variables for fresh navigation experience 
        _this.prepareComponentForLookup = function (timeSeriesID) {
            _this.instanceListElem.text('');
            _this.hierarchyElem.text('');
            _this.hierarchyElem.style('display', 'none');
            _this.noResultsElem.style('display', 'none');
            _this.instanceLookupLoadingElem.select('.tsi-lookup-instance').text(_this.getString("Looking for") + " " + timeSeriesID.join(" "));
            _this.instanceLookupLoadingElem.style('display', 'flex');
            _this.clearAndHideFilterPath();
            _this.viewTypesElem.style("display", "none");
            _this.searchWrapperElem.select("input").node().value = "";
            _this.searchGloballyElem.style("display", "none");
            _this.path = _this.selectedHierarchyName !== HierarchySelectionValues.All && _this.selectedHierarchyName !== HierarchySelectionValues.Unparented ? [_this.selectedHierarchyName] : [];
        };
        // pull instance to get its name to search in the tree if exist
        _this.getInstance = function (timeSeriesID) {
            return _this.getToken()
                .then(function (token) {
                return _this.server.getTimeseriesInstances(token, _this.environmentFqdn, 1, [timeSeriesID]).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to get instance details", err instanceof XMLHttpRequest ? err : null); });
            })
                .catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to get token", err instanceof XMLHttpRequest ? err : null); });
        };
        // simulate expand operation for each hierarchy node in a full path until the instance and then locate the instance
        _this.simulateExpand = function (path, hierarchyNamesFromParam, instance) { return __awaiter(_this, void 0, void 0, function () {
            var instanceIdentifier, isHierarchySelected, lastHierarchyNodeParent, ulToLook, nameSpan, _loop_1, this_1, idx, instanceNode, li, newListContentElem, instanceCount, hitElem;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instanceIdentifier = this.instanceNodeIdentifier(instance);
                        isHierarchySelected = this.selectedHierarchyName !== HierarchySelectionValues.All && this.selectedHierarchyName !== HierarchySelectionValues.Unparented;
                        lastHierarchyNodeParent = document.getElementsByClassName("tsi-hierarchy")[0];
                        _loop_1 = function (idx) {
                            var p, hierarchyNodeToExpand, pathNodeName, hierarchyNode_1, li, newListContentElem, hitCount, onClickFunc;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        p = path[idx];
                                        if (isHierarchySelected && idx === 0) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        hierarchyNodeToExpand = void 0;
                                        pathNodeName = this_1.hierarchyNodeIdentifier(p);
                                        ulToLook = lastHierarchyNodeParent.getElementsByTagName("ul")[0];
                                        nameSpan = Array.from(ulToLook.getElementsByClassName("tsi-name")).find(function (e) { return e.innerText === pathNodeName; });
                                        if (!nameSpan) { // if the hierarchy node we are looking is not there, add it manually to prevent possible show more calls and dom insertions
                                            hierarchyNode_1 = new HierarchyNode(pathNodeName, path.slice(0, idx), isHierarchySelected || hierarchyNamesFromParam ? idx - 1 : idx, '');
                                            hierarchyNode_1.expand = function () {
                                                return _this.pathSearchAndRenderResult({ search: { payload: _this.requestPayload(hierarchyNode_1.path), bubbleUpReject: true }, render: { target: hierarchyNode_1.node } })
                                                    .then(function (r) { return __awaiter(_this, void 0, void 0, function () {
                                                    var payload;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                payload = this.requestPayload(hierarchyNode_1.path);
                                                                payload["instances"].recursive = true;
                                                                return [4 /*yield*/, this.pathSearch(payload, null, null) // make a second call to retrieve the cumulative instance count for manually added hierarchy node
                                                                        .then(function (r) {
                                                                        hierarchyNode_1.node.select(".tsi-instanceCount").text(r.instances.hitCount);
                                                                    })
                                                                        .catch(function (err) { })];
                                                            case 1:
                                                                _a.sent();
                                                                hierarchyNode_1.isExpanded = true;
                                                                hierarchyNode_1.node.classed('tsi-expanded', true);
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); })
                                                    .catch(function (err) { });
                                            };
                                            li = create("li").attr("role", "none");
                                            ulToLook.insertBefore(li.node(), ulToLook.firstChild); // put it to the top of the list
                                            newListContentElem = this_1.createHierarchyItemElem(hierarchyNode_1, this_1.hierarchyNodeIdentifier(hierarchyNode_1.name));
                                            li.node().appendChild(newListContentElem.node());
                                            hierarchyNode_1.node = li;
                                            nameSpan = newListContentElem.select('.tsi-name').node();
                                            hitCount = parseInt(lastHierarchyNodeParent.getElementsByClassName("tsi-hitCount")[0].innerText);
                                            if (ulToLook.getElementsByClassName("tsi-hierarchyItem").length === hitCount + 1) {
                                                ulToLook.removeChild(ulToLook.lastChild); // remove show more to prevent duplication
                                            }
                                        }
                                        hierarchyNodeToExpand = nameSpan.parentNode;
                                        lastHierarchyNodeParent = hierarchyNodeToExpand.parentNode;
                                        onClickFunc = select(hierarchyNodeToExpand).on("click");
                                        return [4 /*yield*/, onClickFunc.apply(hierarchyNodeToExpand)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        idx = 0;
                        _a.label = 1;
                    case 1:
                        if (!(idx < path.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(idx)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        idx++;
                        return [3 /*break*/, 1];
                    case 4:
                        // locate the instance
                        ulToLook = lastHierarchyNodeParent.getElementsByTagName("ul")[0];
                        nameSpan = Array.from(ulToLook.getElementsByClassName("tsi-name")).find(function (e) { return e.innerText === _this.instanceNodeString(instance); });
                        if (!nameSpan) { //if the instance node we are looking is not there after expansion, add it manually to prevent possible show more calls and dom insertions
                            instanceNode = new InstanceNode(instance.timeSeriesId, instance.name, this.envTypes[instance.typeId], instance.hierarchyIds, instance.highlights, isHierarchySelected || hierarchyNamesFromParam ? path.length - 1 : path.length);
                            li = create("li").classed('tsi-leaf', true).attr("role", "none");
                            newListContentElem = this.createHierarchyItemElem(instanceNode, instanceIdentifier);
                            li.node().appendChild(newListContentElem.node());
                            ulToLook.insertBefore(li.node(), ulToLook.getElementsByClassName('tsi-leaf')[0]); // put it to the top of the instance list after hierarchy nodes
                            instanceNode.node = li;
                            instanceCount = parseInt(lastHierarchyNodeParent.getElementsByClassName("tsi-instanceCount")[0].innerText);
                            if (ulToLook.getElementsByClassName("tsi-hierarchyItem").length === instanceCount + 1) {
                                ulToLook.removeChild(ulToLook.lastChild); // remove show more to prevent duplication
                            }
                            nameSpan = newListContentElem.select('.tsi-name').node();
                        }
                        else {
                            ulToLook.insertBefore(nameSpan.parentNode.parentNode, ulToLook.getElementsByClassName('tsi-leaf')[0]); // move it to the top of the instance list after hierarchy nodes
                        }
                        hitElem = document.createElement('hit');
                        Utils.appendFormattedElementsFromString(select(hitElem), nameSpan.innerText);
                        nameSpan.innerText = '';
                        nameSpan.appendChild(hitElem);
                        return [2 /*return*/];
                }
            });
        }); };
        _this.prepareComponentForAfterLookup = function () {
            _this.searchString = "";
            _this.setModeAndRequestParamsForNavigate();
            _this.viewType = ViewType.Hierarchy;
        };
        // renders instances data in flat list view, only in 'Search' mode
        _this.renderInstances = function (data, target) {
            var self = _this;
            if (Object.keys(data).length === 0) {
                _this.noResultsElem.style('display', 'block');
                _this.viewTypesElem.node().style.display = 'none';
                if ((_this.selectedHierarchyName !== HierarchySelectionValues.All) || _this.filterPathElem.classed('visible')) {
                    _this.searchGloballyElem.node().style.display = 'inline-flex';
                }
                return;
            }
            else {
                _this.noResultsElem.style('display', 'none');
                _this.viewTypesElem.node().style.display = 'inline-flex';
                if ((_this.selectedHierarchyName !== HierarchySelectionValues.All) || _this.filterPathElem.classed('visible')) {
                    _this.searchGloballyElem.node().style.display = 'inline-flex';
                }
            }
            target.select('.tsi-show-more.tsi-show-more-instance').remove();
            Object.keys(data).forEach(function (i) {
                var div;
                if (data[i].name === _this.getString("Show More Instances")) {
                    div = target.append('div').classed('tsi-show-more tsi-show-more-instance', true);
                    div.append('span').classed('tsi-markedName', true).attr('tabindex', 0).text(i).on('click keydown', function () {
                        if (Utils.isKeyDownAndNotEnter(event)) {
                            return;
                        }
                        data[i].onClick();
                    });
                }
                else {
                    div = target.append('div').classed('tsi-modelResultWrapper', true).attr('tabindex', 0);
                    var instanceElem = _this.createInstanceElem(data[i]);
                    div.node().appendChild(instanceElem.node());
                    div.on('click keydown', function () {
                        var _this = this;
                        var clickInstance = function () {
                            event.stopPropagation();
                            self.closeContextMenu();
                            var target = self.instanceListElem.select(function () { return this.parentNode.parentNode; });
                            var mouseWrapper = mouse(target.node());
                            var mouseElt = mouse(_this);
                            self.prepareForContextMenu(data[i], target, mouseWrapper[1], mouseElt[1]);
                            self.chartOptions.onInstanceClick(data[i]);
                        };
                        if (event && event.type && event.type === 'keydown') {
                            var key = event.which || event.keyCode;
                            if (key === 40) { // pressed down
                                if (this.nextElementSibling)
                                    this.nextElementSibling.focus();
                            }
                            else if (key === 38) { //pressed up
                                if (this.previousElementSibling)
                                    this.previousElementSibling.focus();
                            }
                            else if (key === 13) {
                                clickInstance();
                            }
                            return;
                        }
                        clickInstance();
                    });
                }
                data[i].node = div;
            });
        };
        _this.pathSearchAndRenderResult = function (_a) {
            var _b = _a.search, payload = _b.payload, _c = _b.instancesContinuationToken, instancesContinuationToken = _c === void 0 ? null : _c, _d = _b.hierarchiesContinuationToken, hierarchiesContinuationToken = _d === void 0 ? null : _d, _e = _b.bubbleUpReject, bubbleUpReject = _e === void 0 ? false : _e, _f = _a.render, target = _f.target, _g = _f.locInTarget, locInTarget = _g === void 0 ? null : _g, _h = _f.skipLevels, skipLevels = _h === void 0 ? null : _h;
            return _this.pathSearch(payload, instancesContinuationToken, hierarchiesContinuationToken).then(function (r) {
                try {
                    if (r.error) {
                        throw r.error;
                    }
                    else {
                        _this.renderSearchResult(r, payload, target, locInTarget, skipLevels);
                    }
                }
                catch (err) {
                    throw err;
                }
            }).catch(function (err) {
                _this.chartOptions.onError("Error in hierarchy navigation", "Failed to complete search", err instanceof XMLHttpRequest ? err : null);
                if (bubbleUpReject) {
                    throw err;
                }
            });
        };
        _this.pathSearch = function (payload, instancesContinuationToken, hierarchiesContinuationToken) {
            if (instancesContinuationToken === void 0) { instancesContinuationToken = null; }
            if (hierarchiesContinuationToken === void 0) { hierarchiesContinuationToken = null; }
            return _this.getToken().then(function (token) {
                return _this.server.getTimeseriesInstancesPathSearch(token, _this.environmentFqdn, payload, instancesContinuationToken, hierarchiesContinuationToken);
            }).catch(function (err) { throw err; });
        };
        _this.renderSearchResult = function (r, payload, target, locInTarget, skipLevels) {
            var _a, _b, _c, _d, _e;
            if (locInTarget === void 0) { locInTarget = null; }
            if (skipLevels === void 0) { skipLevels = null; }
            var self = _this;
            var hierarchyData = {};
            var instancesData = {};
            if ((_b = (_a = r.hierarchyNodes) === null || _a === void 0 ? void 0 : _a.hits) === null || _b === void 0 ? void 0 : _b.length) {
                var hitCountElem = target.select(".tsi-hitCount");
                if (hitCountElem.size() == 0) {
                    hitCountElem = target.append('span').classed('tsi-hitCount', true).text('');
                }
                hitCountElem.text(r.hierarchyNodes.hitCount);
                hierarchyData = self.fillDataRecursively(r.hierarchyNodes, _this.getToken, _this.environmentFqdn, payload, payload);
            }
            if ((_d = (_c = r.instances) === null || _c === void 0 ? void 0 : _c.hits) === null || _d === void 0 ? void 0 : _d.length) {
                r.instances.hits.forEach(function (i) {
                    instancesData[_this.instanceNodeIdentifier(i)] = new InstanceNode(i.timeSeriesId, i.name, self.envTypes[i.typeId], i.hierarchyIds, i.highlights, payload.path.length - self.path.length);
                });
            }
            if (((_e = r.instances) === null || _e === void 0 ? void 0 : _e.continuationToken) && r.instances.continuationToken !== 'END') {
                var showMoreInstances_1 = new InstanceNode(null, _this.getString("Show More Instances"), null, null, null, payload.path.length - self.path.length);
                showMoreInstances_1.onClick = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.pathSearchAndRenderResult({
                            search: { payload: payload, hierarchiesContinuationToken: null, instancesContinuationToken: r.instances['continuationToken'] },
                            render: { target: showMoreInstances_1.node.select(function () { return this.parentNode; }), locInTarget: '.tsi-show-more.tsi-show-more-instance' }
                        });
                        return [2 /*return*/];
                    });
                }); };
                instancesData[showMoreInstances_1.name] = showMoreInstances_1;
                if (!self.usedInstanceSearchContinuationTokens[r.instances.continuationToken]) {
                    self.lastInstanceContinuationToken = r.instances.continuationToken;
                }
            }
            else {
                self.lastInstanceContinuationToken = "END";
            }
            if (self.mode === State.Navigate) {
                if (self.selectedHierarchyName !== HierarchySelectionValues.Unparented) {
                    self.renderTree(__assign(__assign({}, hierarchyData), instancesData), target, locInTarget);
                }
                else {
                    self.renderTree(instancesData, target, locInTarget);
                }
            }
            else if (self.mode === State.Filter) {
                self.renderTree(__assign(__assign({}, hierarchyData), instancesData), target, locInTarget, skipLevels);
            }
            else {
                self.renderInstances(instancesData, target);
            }
        };
        _this.closeContextMenu = function () {
            if (_this.clickedInstance && _this.contextMenu) {
                _this.contextMenu.remove();
                selectAll('li.tsi-selected').classed('tsi-selected', false);
            }
            selectAll('.tsi-modelResultWrapper').classed('tsi-selected', false);
            _this.clickedInstance = null;
        };
        _this.prepareForContextMenu = function (instanceObj, target, wrapperMousePos, eltMousePos) {
            var contextMenuProps = {};
            contextMenuProps['target'] = target;
            contextMenuProps['wrapperMousePos'] = wrapperMousePos;
            contextMenuProps['eltMousePos'] = eltMousePos;
            _this.contextMenuProps = contextMenuProps;
            _this.clickedInstance = instanceObj;
            instanceObj.node.classed('tsi-selected', true);
        };
        _this.drawContextMenu = function (contextMenuItems, contextMenuOptions) {
            var itemList = [];
            var contextMenuList;
            var searchString = "";
            _this.contextMenu = _this.contextMenuProps['target'].append('div').classed('tsi-hierarchyNavigationContextMenu', true).attr('style', function () { return "top: " + (_this.contextMenuProps['wrapperMousePos'] - _this.contextMenuProps['eltMousePos']) + "px"; });
            var renderList = function (contextMenuItems) {
                if (_this.contextMenu.select("ul").empty()) {
                    contextMenuList = _this.contextMenu.append('ul');
                }
                else {
                    _this.contextMenu.select("ul").text('');
                }
                contextMenuItems.forEach(function (item) {
                    var option = item.name;
                    var li = contextMenuList.append('li');
                    if (!contextMenuOptions.isSelectionEnabled) {
                        li.attr('tabindex', 0)
                            .attr('arialabel', option)
                            .attr('title', option)
                            .on('click keydown', function () {
                            if (Utils.isKeyDownAndNotEnter(event)) {
                                return;
                            }
                            item.action();
                            _this.closeContextMenu();
                        });
                        var itemWrapperElem = li.append('div').classed('tsi-selectionItemWrapper', true);
                        Utils.appendFormattedElementsFromString(itemWrapperElem, Utils.mark(searchString, option), { splitByTag: 'mark' });
                    }
                    else {
                        li.attr('tabindex', 0)
                            .on('click keydown', function () {
                            if (Utils.isKeyDownAndNotEnter(event)) {
                                return;
                            }
                            var elem = select(event.currentTarget).select(".tsi-hierarchyCheckbox");
                            if (elem.classed("tsi-notSelected")) {
                                itemList.push(item);
                                elem.classed("tsi-notSelected", false);
                                elem.attr("aria-checked", true);
                            }
                            else {
                                var index = itemList.map(function (elem) { return elem.name; }).indexOf(item.name);
                                itemList.splice(index, 1);
                                elem.classed("tsi-notSelected", true);
                                elem.attr("aria-checked", false);
                            }
                            itemList.length === 0 ?
                                _this.contextMenu.select("button").classed("disabled", true)
                                : _this.contextMenu.select("button").classed("disabled", false);
                        });
                        var itemWrapperElem = li.append('div').classed('tsi-selectionItemWrapper', true);
                        itemWrapperElem.append('span').classed('tsi-hierarchyCheckbox tsi-notSelected', true)
                            .attr("role", "checkbox").attr("aria-checked", false);
                        var itemElem = itemWrapperElem.append('span').classed('tsi-selectionItem', true).attr('title', option);
                        Utils.appendFormattedElementsFromString(itemElem, Utils.mark(searchString, option), { splitByTag: 'mark' });
                        itemWrapperElem.append('span').classed('tsi-selectionItemKind', true).classed(item.kind, true).attr('title', item.kind.charAt(0).toUpperCase() + item.kind.slice(1));
                    }
                });
            };
            // draw filter box if enabled
            if (contextMenuOptions.isFilterEnabled) {
                var searchBox = _this.contextMenu.append('div').classed('tsi-search', true);
                searchBox.append('i').classed('tsi-search-icon', true);
                searchBox.append('input').classed('tsi-searchInput', true).attr('placeholder', _this.getString('Search'))
                    .on('input', function () {
                    var regex = new RegExp(event.currentTarget.value, 'gi');
                    searchString = event.currentTarget.value;
                    renderList(contextMenuItems.filter(function (varObj) { return varObj.name.match(regex); }));
                    itemList = [];
                    _this.contextMenu.select("button").classed("disabled", true);
                });
            }
            //draw variable list with checkbox if selection enabled
            renderList(contextMenuItems);
            //add button
            if (contextMenuOptions.isSelectionEnabled) {
                _this.contextMenu.append('button').classed("tsi-primaryButton", true).classed("disabled", true).text(_this.getString("Add")).on('click', function () {
                    itemList.forEach(function (item) { return item.action(); });
                    _this.closeContextMenu();
                });
            }
            // move context menu above if necessary for tag selection visibility around the bottom of the page
            var leftSpaceAtBottom = _this.contextMenuProps['target'].node().getBoundingClientRect().height - parseFloat(_this.contextMenu.node().style.top);
            var overflowAtBottom = _this.contextMenu.node().getBoundingClientRect().height - leftSpaceAtBottom;
            if (overflowAtBottom > 0)
                _this.contextMenu.style('top', (parseFloat(_this.contextMenu.node().style.top) - overflowAtBottom) + 'px');
            var contextMenuFirstElt = select('.tsi-hierarchyNavigationContextMenu li').node();
            if (contextMenuFirstElt) {
                contextMenuFirstElt.focus();
            }
        };
        _this.hasHits = function (str) {
            return str && (str.indexOf("<hit>") !== -1);
        };
        _this.hierarchyNodeIdentifier = function (hName) {
            return hName ? hName : '(' + _this.getString("Empty") + ')';
        };
        _this.instanceNodeIdentifier = function (instance) {
            return "instance-" + Utils.getInstanceKey(instance);
        };
        _this.instanceNodeStringToDisplay = function (instance) {
            var _a;
            return ((_a = instance.highlights) === null || _a === void 0 ? void 0 : _a.name) || Utils.getHighlightedTimeSeriesIdToDisplay(instance)
                || instance.name || Utils.getTimeSeriesIdToDisplay(instance, _this.getString('Empty'));
        };
        _this.instanceNodeString = function (instance) {
            return instance.name || Utils.getTimeSeriesIdString(instance);
        };
        _this.clearAndHideFilterPath = function () {
            select('.tsi-path-list').text('');
            select('.tsi-filter-clear').style('display', 'none');
            _this.filterPathElem.classed('visible', false);
        };
        // when an hierarchy is selected from the flyout selection menu
        _this.selectHierarchy = function (pathName, applySearch) {
            if (applySearch === void 0) { applySearch = true; }
            _this.path = pathName === HierarchySelectionValues.All || pathName === HierarchySelectionValues.Unparented ? [] : [pathName];
            _this.selectedHierarchyName = pathName;
            var selectedhierarchyId = pathName === HierarchySelectionValues.All || pathName === HierarchySelectionValues.Unparented ? pathName : _this.envHierarchies[_this.selectedHierarchyName].id;
            _this.chartOptions.onSelect(selectedhierarchyId);
            var pathText = pathName === HierarchySelectionValues.All ? _this.getString("All hierarchies") : pathName === HierarchySelectionValues.Unparented ? _this.getString("Unassigned Time Series Instances") : pathName;
            select('.tsi-hierarchy-name').text(pathText).attr('title', pathText);
            _this.clearAndGetResults(applySearch);
            _this.clearAndHideFilterPath();
            _this.isHierarchySelectionActive = false;
            _this.hierarchyListWrapperElem.style('display', 'none');
        };
        _this.resettingVariablesForEnvChange = function () {
            _this.path = [];
            _this.selectedHierarchyName = HierarchySelectionValues.All;
            _this.searchString = '';
            _this.lastInstanceContinuationToken = null;
            _this.usedInstanceSearchContinuationTokens = {};
            _this.envHierarchies = {};
            _this.envTypes = {};
            _this.setModeAndRequestParamsForNavigate();
            _this.viewType = ViewType.Hierarchy;
            _this.clickedInstance = null;
            _this.isHierarchySelectionActive = false;
        };
        _this.server = new ServerClient();
        function isTarget() {
            return event.target === this || this.contains(event.target);
        }
        select("html").on("click. keydown." + Utils.guid(), function () {
            if (_this.clickedInstance && _this.contextMenu) {
                if (event.type && event.type === 'keydown') {
                    if (!_this.contextMenu.filter(isTarget).empty()) {
                        var key = event.which || event.keyCode;
                        if (key === KeyCodes.Esc) { // close context menu when pressed esc on it
                            _this.closeContextMenu();
                        }
                        return;
                    }
                }
                else {
                    if (_this.contextMenu.filter(isTarget).empty()) { // close context menu when clicked any other target outside of it
                        _this.closeContextMenu();
                    }
                }
            }
            if (_this.isHierarchySelectionActive) {
                if (event && event.type && event.type === 'keydown') {
                    if (!select(_this.hierarchyListWrapperElem.node().parentNode).filter(isTarget).empty()) {
                        var key = event.which || event.keyCode;
                        if (key === KeyCodes.Esc) { // close hierarchy selection dropdown when pressed esc on it
                            _this.isHierarchySelectionActive = false;
                            _this.hierarchyListWrapperElem.style('display', 'none');
                        }
                        return;
                    }
                }
                else {
                    if (select(_this.hierarchyListWrapperElem.node().parentNode).filter(isTarget).empty()) { // close hierarchy selection dropdown when clicked any other target outside of it
                        _this.isHierarchySelectionActive = false;
                        _this.hierarchyListWrapperElem.style('display', 'none');
                    }
                }
            }
        });
        return _this;
    }
    HierarchyNavigation.prototype.HierarchyNavigation = function () {
    };
    HierarchyNavigation.prototype.render = function (environmentFqdn, getToken, hierarchyNavOptions) {
        if (hierarchyNavOptions === void 0) { hierarchyNavOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var self, targetElement, hierarchyNavWrapper, selectedHierarchyId, hierarchy, autocompleteOnInput, handleKeydown;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        this.chartOptions.setOptions(hierarchyNavOptions);
                        this.getToken = getToken;
                        this.environmentFqdn = environmentFqdn;
                        this.resettingVariablesForEnvChange();
                        targetElement = select(this.renderTarget);
                        targetElement.text('');
                        hierarchyNavWrapper = targetElement.append('div').attr('class', 'tsi-hierarchy-nav-wrapper');
                        _super.prototype.themify.call(this, hierarchyNavWrapper, this.chartOptions.theme);
                        //get the most recent types to show in the context menu on instance click
                        return [4 /*yield*/, getToken().then(function (token) {
                                return _this.server.getTimeseriesTypes(token, environmentFqdn).then(function (r) {
                                    try {
                                        if (r.error) {
                                            throw r.error;
                                        }
                                        else {
                                            r.types.forEach(function (t) {
                                                _this.envTypes[t.id] = t;
                                            });
                                        }
                                    }
                                    catch (err) {
                                        throw err;
                                    }
                                }).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to load types for navigation", err instanceof XMLHttpRequest ? err : null); });
                            }).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to get token", err instanceof XMLHttpRequest ? err : null); })];
                    case 1:
                        //get the most recent types to show in the context menu on instance click
                        _a.sent();
                        //get the most recent hierarchies for reverse lookup
                        return [4 /*yield*/, getToken().then(function (token) {
                                return _this.server.getTimeseriesHierarchies(token, environmentFqdn).then(function (r) {
                                    try {
                                        if (r.error) {
                                            throw r.error;
                                        }
                                        else {
                                            r.hierarchies.forEach(function (h) {
                                                _this.envHierarchies[h.name] = h;
                                            });
                                        }
                                    }
                                    catch (err) {
                                        throw err;
                                    }
                                }).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to load hierarchies for navigation", err instanceof XMLHttpRequest ? err : null); });
                            }).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to get token", err instanceof XMLHttpRequest ? err : null); })];
                    case 2:
                        //get the most recent hierarchies for reverse lookup
                        _a.sent();
                        selectedHierarchyId = hierarchyNavOptions.selectedHierarchyId;
                        if (selectedHierarchyId) {
                            if (selectedHierarchyId === HierarchySelectionValues.All || selectedHierarchyId === HierarchySelectionValues.Unparented) {
                                this.selectedHierarchyName = selectedHierarchyId; //Using enum values of All and Unparented as both name and id
                                this.path = [];
                            }
                            else {
                                hierarchy = Object.values(this.envHierarchies).find(function (h) { return h["id"] === selectedHierarchyId; });
                                if (hierarchy) {
                                    this.selectedHierarchyName = hierarchy["name"];
                                    this.path = [this.selectedHierarchyName];
                                }
                            }
                        }
                        getToken().then(function (token) {
                            self.server.getTimeseriesInstancesPathSearch(token, environmentFqdn, { searchString: '', path: _this.path, hierarchies: { sort: { by: HierarchiesSort.CumulativeInstanceCount }, expand: { kind: HierarchiesExpand.OneLevel }, pageSize: 100 } }).then(function (r) {
                                try {
                                    if (r.error) {
                                        throw r.error;
                                    }
                                    else {
                                        // hierarchy selection button
                                        var hierarchySelectionWrapper = hierarchyNavWrapper.append('div').classed('tsi-hierarchy-selection-wrapper', true);
                                        _this.hierarchySelectorElem = hierarchySelectionWrapper.append('button').classed('tsi-hierarchy-select', true)
                                            .attr("aria-haspopup", "listbox")
                                            .on('click keydown', function () {
                                            if (Utils.isKeyDownAndNotEnter(event)) {
                                                return;
                                            }
                                            if (_this.isHierarchySelectionActive) {
                                                _this.hierarchyListWrapperElem.style('display', 'none');
                                                _this.isHierarchySelectionActive = false;
                                            }
                                            else {
                                                _this.renderHierarchySelection();
                                                _this.isHierarchySelectionActive = true;
                                            }
                                        });
                                        _this.hierarchySelectorElem.append('span').classed('tsi-hierarchy-name', true).text(_this.selectedHierarchyName === HierarchySelectionValues.All ? _this.getString("All hierarchies")
                                            : _this.selectedHierarchyName === HierarchySelectionValues.Unparented ? _this.getString("Unassigned Time Series Instances")
                                                : _this.selectedHierarchyName);
                                        _this.hierarchySelectorElem.append('i').classed('tsi-down-caret-icon', true);
                                        // hierarchy flyout list
                                        _this.hierarchyListWrapperElem = hierarchySelectionWrapper.append('div').classed('tsi-hierarchy-list-wrapper', true);
                                        _this.hierarchyListElem = _this.hierarchyListWrapperElem.append('ul').classed('tsi-hierarchy-list', true).attr('role', 'listbox').attr("id", "tsi-hierarchy-listbox");
                                        // search
                                        _this.searchWrapperElem = hierarchyNavWrapper.append('div').classed('tsi-hierarchy-search', true);
                                        var modelAutocomplete = new ModelAutocomplete(_this.searchWrapperElem.node());
                                        modelAutocomplete.render(environmentFqdn, getToken, {
                                            onInput: autocompleteOnInput,
                                            onKeydown: function (event, ap) { handleKeydown(event, ap); },
                                            theme: hierarchyNavOptions.theme,
                                            strings: _this.chartOptions.strings
                                        });
                                        _this.viewTypesElem = _this.searchWrapperElem.append('div').classed('tsi-view-types', true).attr("role", "tablist");
                                        _this.viewTypesElem.append('div').classed('tsi-view-type', true)
                                            .attr('title', 'Hierarchy View')
                                            .attr('tabindex', 0)
                                            .attr('arialabel', 'Hierarchy View')
                                            .attr('role', 'tab')
                                            .on('click keydown', function () {
                                            if (Utils.isKeyDownAndNotEnter(event)) {
                                                return;
                                            }
                                            self.switchToSearchView(ViewType.Hierarchy);
                                        })
                                            .append('i').classed('tsi-tree-icon', true);
                                        _this.viewTypesElem.append('div').classed('tsi-view-type selected', true)
                                            .attr('title', 'List View')
                                            .attr('tabindex', 0)
                                            .attr('arialabel', 'List View')
                                            .attr('role', 'tab')
                                            .attr('aria-selected', true)
                                            .on('click keydown', function () {
                                            if (Utils.isKeyDownAndNotEnter(event)) {
                                                return;
                                            }
                                            self.switchToSearchView(ViewType.List);
                                        })
                                            .append('i').classed('tsi-list-icon', true);
                                        // filter path
                                        _this.filterPathElem = hierarchyNavWrapper.append('div').classed('tsi-filter-path-wrapper', true);
                                        var filterPath = _this.filterPathElem.append('div').classed('tsi-filter-path', true);
                                        filterPath.append('span').classed('tsi-path-list', true);
                                        filterPath.append('i').classed('tsi-close-icon tsi-filter-clear', true)
                                            .attr('tabindex', 0)
                                            .attr('arialabel', 'Clear Path Filter')
                                            .attr('title', 'Clear Path Filter')
                                            .on('click keydown', function () {
                                            if (Utils.isKeyDownAndNotEnter(event)) {
                                                return;
                                            }
                                            self.path = (self.selectedHierarchyName === HierarchySelectionValues.All || self.selectedHierarchyName === HierarchySelectionValues.Unparented) ? [] : [self.selectedHierarchyName];
                                            if (self.selectedHierarchyName === HierarchySelectionValues.All) {
                                                self.searchGloballyElem.node().style.display = 'none';
                                            }
                                            self.clearAndGetResults();
                                            self.clearAndHideFilterPath();
                                        });
                                        _this.searchGloballyElem = hierarchyNavWrapper.append('div').classed('tsi-search-global', true);
                                        _this.searchGloballyElem.append('a').text(_this.getString("Search Globally"))
                                            .attr('title', _this.getString("Search Globally"))
                                            .attr('tabindex', 0)
                                            .attr('arialabel', _this.getString("Search Globally"))
                                            .on('click keydown', function () {
                                            if (Utils.isKeyDownAndNotEnter(event)) {
                                                return;
                                            }
                                            self.selectHierarchy(HierarchySelectionValues.All, false);
                                            self.switchToSearchView(ViewType.List);
                                            this.parentNode.style.display = 'none';
                                        });
                                        _this.instanceLookupLoadingElem = hierarchyNavWrapper.append('div').classed('tsi-instance-lookup-loading', true);
                                        _this.instanceLookupLoadingElem.append('i').classed('tsi-spinner-icon', true);
                                        _this.instanceLookupLoadingElem.append('span').classed('tsi-lookup-instance', true);
                                        // result (hierarchy or flat list)
                                        var results = hierarchyNavWrapper.append('div').classed('tsi-hierarchy-or-list-wrapper', true);
                                        // no results
                                        _this.noResultsElem = results.append('div').text(_this.getString("No results")).classed('tsi-noResults', true).attr("role", "alert").style('display', 'none');
                                        // hierarchy
                                        _this.hierarchyElem = results.append('div').classed('tsi-hierarchy', true).attr("role", "navigation").on('scroll', function () {
                                            self.closeContextMenu();
                                        });
                                        // flat list
                                        _this.instanceListWrapperElem = results.append('div').classed('tsi-list', true).on('scroll', function () {
                                            if (self.viewType === ViewType.List) {
                                                self.closeContextMenu();
                                                if (self.lastInstanceContinuationToken && (self.lastInstanceContinuationToken !== "END")) {
                                                    var that = this;
                                                    if (that.scrollTop + that.clientHeight + 50 > self.instanceListElem.node().clientHeight) {
                                                        if (self.lastInstanceContinuationToken === null || !self.usedInstanceSearchContinuationTokens[self.lastInstanceContinuationToken]) {
                                                            self.usedInstanceSearchContinuationTokens[self.lastInstanceContinuationToken] = true;
                                                            self.pathSearchAndRenderResult({ search: { payload: self.requestPayload(), instancesContinuationToken: self.lastInstanceContinuationToken }, render: { target: self.instanceListElem } });
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                        _this.instanceListElem = _this.instanceListWrapperElem.append('div').classed('tsi-search-results', true);
                                        _this.pathSearchAndRenderResult({ search: { payload: self.requestPayload() }, render: { target: _this.hierarchyElem } });
                                    }
                                }
                                catch (err) {
                                    throw err;
                                }
                            }).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to complete search", err instanceof XMLHttpRequest ? err : null); });
                        }).catch(function (err) { return _this.chartOptions.onError("Error in hierarchy navigation", "Failed to get token", err instanceof XMLHttpRequest ? err : null); });
                        autocompleteOnInput = function (st, event) {
                            if (st.length === 0) {
                                _this.searchString = st;
                                _this.viewTypesElem.node().style.display = 'none';
                                _this.searchGloballyElem.node().style.display = 'none';
                                _this.switchToSearchView(ViewType.Hierarchy, false);
                                _this.clearAndGetResults();
                            }
                            else {
                                if (event.which === 13 || event.keyCode === 13) {
                                    _this.searchString = st;
                                    _this.switchToSearchView(ViewType.List, false);
                                    _this.clearAndGetResults();
                                }
                            }
                        };
                        handleKeydown = function (event, ap) {
                            if (!ap.isOpened) ;
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    HierarchyNavigation.prototype.setModeAndRequestParamsForSearch = function () {
        this.mode = State.Search;
        var options = this.chartOptions.hierarchyOptions;
        options.isInstancesRecursive = true;
        options.isInstancesHighlighted = true;
        options.instancesSort = InstancesSort.Rank;
        options.hierarchiesExpand = HierarchiesExpand.UntilChildren;
        options.hierarchiesSort = HierarchiesSort.CumulativeInstanceCount;
    };
    HierarchyNavigation.prototype.setModeAndRequestParamsForNavigate = function () {
        this.mode = State.Navigate;
        var options = this.chartOptions.hierarchyOptions;
        options.isInstancesRecursive = false;
        options.isInstancesHighlighted = true;
        options.instancesSort = InstancesSort.DisplayName;
        options.hierarchiesExpand = HierarchiesExpand.OneLevel;
        options.hierarchiesSort = HierarchiesSort.Name;
    };
    HierarchyNavigation.prototype.setModeAndRequestParamsForFilter = function () {
        this.mode = State.Filter;
        var options = this.chartOptions.hierarchyOptions;
        options.isInstancesRecursive = false;
        options.isInstancesHighlighted = true;
        options.instancesSort = InstancesSort.DisplayName;
        options.hierarchiesExpand = HierarchiesExpand.UntilChildren;
        options.hierarchiesSort = HierarchiesSort.CumulativeInstanceCount;
    };
    // prepares the parameters for search request
    HierarchyNavigation.prototype.requestPayload = function (path) {
        if (path === void 0) { path = null; }
        var payload = {};
        payload["searchString"] = this.searchString;
        payload["path"] = path ? path : this.path;
        payload["instances"] = { recursive: this.chartOptions.hierarchyOptions.isInstancesRecursive, sort: { by: this.chartOptions.hierarchyOptions.instancesSort }, highlights: this.chartOptions.hierarchyOptions.isInstancesHighlighted, pageSize: this.chartOptions.hierarchyOptions.instancesPageSize };
        if (this.selectedHierarchyName !== HierarchySelectionValues.Unparented && (this.mode !== State.Search)) { // hierarchyNodes are not needed for showing unassigned instances or flat list instance search results
            payload["hierarchies"] = { expand: { kind: this.chartOptions.hierarchyOptions.hierarchiesExpand }, sort: { by: this.chartOptions.hierarchyOptions.hierarchiesSort }, pageSize: this.chartOptions.hierarchyOptions.hierarchiesPageSize };
        }
        return payload;
    };
    // clears both hierarchy tree and flat list for new results
    HierarchyNavigation.prototype.clearAndGetResults = function (applySearch) {
        if (applySearch === void 0) { applySearch = true; }
        this.instanceListElem.text('');
        this.hierarchyElem.text('');
        this.lastInstanceContinuationToken = null;
        this.usedInstanceSearchContinuationTokens = {};
        if (this.mode === State.Search) {
            this.chartOptions.hierarchyOptions.isInstancesRecursive = this.selectedHierarchyName === HierarchySelectionValues.Unparented ? false : true;
        }
        if (applySearch) {
            if (this.viewType === ViewType.Hierarchy) {
                return this.pathSearchAndRenderResult({ search: { payload: this.requestPayload() }, render: { target: this.hierarchyElem } });
            }
            else {
                return this.pathSearchAndRenderResult({ search: { payload: this.requestPayload() }, render: { target: this.instanceListElem } });
            }
        }
    };
    HierarchyNavigation.prototype.showInstance = function (timeSeriesID, hierarchyIds) {
        if (hierarchyIds === void 0) { hierarchyIds = null; }
        return __awaiter(this, void 0, void 0, function () {
            var isHierarchySelected, hierarchyNamesFromParam, hNames, instance, paths, response, instanceFieldValues_1, err_1, err_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isHierarchySelected = this.selectedHierarchyName !== HierarchySelectionValues.All && this.selectedHierarchyName !== HierarchySelectionValues.Unparented;
                        hierarchyNamesFromParam = hierarchyIds ? hierarchyIds.map(function (hId) { return Object.keys(_this.envHierarchies).find(function (n) { return _this.envHierarchies[n].id === hId; }); }) : null;
                        hNames = hierarchyNamesFromParam ? hierarchyNamesFromParam : isHierarchySelected ? [null, this.selectedHierarchyName] : __spreadArrays([null], Object.keys(this.envHierarchies));
                        paths = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 13, , 14]);
                        this.prepareComponentForLookup(timeSeriesID);
                        response = void 0;
                        return [4 /*yield*/, this.getInstance(timeSeriesID)];
                    case 2:
                        response = _a.sent();
                        instance = response['get'][0]['instance'];
                        instanceFieldValues_1 = instance.instanceFields ? Object.values(instance.instanceFields) : [];
                        if (!instance) return [3 /*break*/, 11];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, this.doExactSearchWithPossiblePaths(timeSeriesID, hNames)];
                    case 4:
                        response = _a.sent();
                        response.forEach(function (r, idx) {
                            var _a, _b, _c, _d;
                            if (r.error) {
                                throw r.error;
                            }
                            if (idx === 0) { // if instance is direct instance of the top root
                                if ((_a = r.instances) === null || _a === void 0 ? void 0 : _a.hitCount) {
                                    paths.push([]);
                                }
                            }
                            else { // under defined hierarchies
                                if ((_c = (_b = r.hierarchyNodes) === null || _b === void 0 ? void 0 : _b.hits) === null || _c === void 0 ? void 0 : _c.length) { // if the instance is under sub nodes in the hierarchy
                                    r.hierarchyNodes.hits.forEach(function (h) {
                                        var currentHit = h;
                                        if (instanceFieldValues_1.indexOf(currentHit.name) !== -1) {
                                            var path = [hNames[idx]];
                                            path.push(currentHit.name);
                                            while (currentHit.hierarchyNodes) {
                                                currentHit = currentHit.hierarchyNodes.hits[0];
                                                if ((instanceFieldValues_1 === null || instanceFieldValues_1 === void 0 ? void 0 : instanceFieldValues_1.indexOf(currentHit.name)) !== -1) {
                                                    path.push(currentHit.name);
                                                }
                                            }
                                            paths.push(path);
                                        }
                                    });
                                }
                                else if ((_d = r.instances) === null || _d === void 0 ? void 0 : _d.hitCount) { // if it is direct instance under the defined the hierarchy
                                    var path = [hNames[idx]];
                                    paths.push(path);
                                }
                            }
                        });
                        this.prepareComponentForAfterLookup();
                        if (!paths.length) return [3 /*break*/, 7];
                        // go back to default navigate mode without exact search                    
                        return [4 /*yield*/, this.clearAndGetResults()];
                    case 5:
                        // go back to default navigate mode without exact search                    
                        _a.sent(); // get a fresh hierarchy with defaulf settings for navigation, ready to expand and locate
                        return [4 /*yield*/, Promise.all(paths.map(function (p) { return _this.simulateExpand(p, hierarchyNamesFromParam, instance); }))];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        this.noResultsElem.style('display', 'block');
                        _a.label = 8;
                    case 8:
                        this.hierarchyElem.style('display', 'block');
                        this.instanceLookupLoadingElem.style('display', 'none');
                        return [3 /*break*/, 10];
                    case 9:
                        err_1 = _a.sent();
                        throw err_1; // throw to be catched by parent try/catch block
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        this.prepareComponentForAfterLookup();
                        this.instanceLookupLoadingElem.style('display', 'none');
                        this.noResultsElem.style('display', 'block');
                        this.hierarchyElem.style('display', 'block');
                        _a.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        err_2 = _a.sent();
                        this.prepareComponentForAfterLookup();
                        this.hierarchyElem.style('display', 'block');
                        this.noResultsElem.style('display', 'block');
                        this.instanceLookupLoadingElem.style('display', 'none');
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // renders tree for both 'Navigate' and 'Filter' mode (with Hierarchy View option selected), locInTarget refers to the 'show more' element -either hierarchy or instance- within the target
    HierarchyNavigation.prototype.renderTree = function (data, target, locInTarget, skipLevels) {
        var _this = this;
        if (locInTarget === void 0) { locInTarget = null; }
        if (skipLevels === void 0) { skipLevels = null; }
        if (Object.keys(data).length === 0) {
            this.noResultsElem.style('display', 'block');
            if (this.mode === State.Filter) {
                this.viewTypesElem.node().style.display = 'none';
                if ((this.selectedHierarchyName !== HierarchySelectionValues.All) || this.filterPathElem.classed('visible')) {
                    this.searchGloballyElem.node().style.display = 'inline-flex';
                }
            }
            return;
        }
        else {
            this.noResultsElem.style('display', 'none');
            if (this.mode === State.Filter) {
                this.viewTypesElem.node().style.display = 'inline-flex';
                if ((this.selectedHierarchyName !== HierarchySelectionValues.All) || this.filterPathElem.classed('visible')) {
                    this.searchGloballyElem.node().style.display = 'inline-flex';
                }
            }
        }
        var list, currentShowMore;
        if (!locInTarget) {
            list = target.append('ul').attr("role", target === this.hierarchyElem ? "tree" : "group");
        }
        else {
            if (locInTarget === '.tsi-show-more.tsi-show-more-hierarchy')
                currentShowMore = target.selectAll('.tsi-show-more.tsi-show-more-hierarchy').filter(function (d, i, list) {
                    return i === list.length - 1;
                });
            else
                currentShowMore = target.selectAll('.tsi-show-more.tsi-show-more-instance').filter(function (d, i, list) {
                    return i === list.length - 1;
                });
            currentShowMore.node().style.display = 'none';
            currentShowMore.classed('tsi-target-loc', true);
        }
        if (locInTarget && skipLevels) {
            while (skipLevels) {
                data = data[Object.keys(data)[0]].children;
                skipLevels--;
            }
        }
        Object.keys(data).forEach(function (el) {
            var li, newListElem;
            var nodeNameToCheckIfExists = data[el] instanceof InstanceNode && data[el].name !== _this.getString("Show More Instances") ? _this.instanceNodeString(data[el]) : el;
            if (locInTarget) {
                if (target.selectAll(".tsi-name").nodes().find(function (e) { return e.innerText === nodeNameToCheckIfExists; })) {
                    return;
                }
                li = target.insert('li', '.tsi-target-loc').classed('tsi-leaf', data[el].isLeaf);
            }
            else {
                if (list.selectAll(".tsi-name").nodes().find(function (e) { return e.innerText === nodeNameToCheckIfExists; })) {
                    return;
                }
                li = list.append('li').classed('tsi-leaf', data[el].isLeaf);
            }
            li.attr("role", "none");
            if (el === _this.getString("Show More Hierarchies")) {
                li.classed('tsi-show-more tsi-show-more-hierarchy', true)
                    .append('span')
                    .classed('tsi-hierarchyItem', true)
                    .attr('tabindex', 0)
                    .attr("role", "treeitem").attr('aria-expanded', false)
                    .attr('style', "padding-left: " + ((data[el].level) * 18 + 20) + "px").text(_this.getString("Show more")).on('click keydown', function () {
                    if (Utils.isKeyDownAndNotEnter(event)) {
                        return;
                    }
                    return data[el].onClick();
                });
            }
            else if (el === _this.getString("Show More Instances")) {
                li.classed('tsi-show-more tsi-show-more-instance', true)
                    .append('span')
                    .classed('tsi-hierarchyItem', true)
                    .attr('tabindex', 0)
                    .attr("role", "treeitem").attr('aria-expanded', false)
                    .attr('style', "padding-left: " + ((data[el].level) * 18 + 20) + "px").text(_this.getString("Show more")).on('click keydown', function () {
                    if (Utils.isKeyDownAndNotEnter(event)) {
                        return;
                    }
                    data[el].onClick();
                });
            }
            else {
                newListElem = _this.createHierarchyItemElem(data[el], el);
                li.node().appendChild(newListElem.node());
            }
            data[el].node = li;
            if (data[el].children) {
                data[el].isExpanded = true;
                data[el].node.classed('tsi-expanded', true);
                _this.renderTree(data[el].children, data[el].node);
            }
            if (data[el] instanceof HierarchyNode && el !== _this.getString("Show More Hierarchies") && _this.mode === State.Filter && data[el].cumulativeInstanceCount == 1 && !data[el].isExpanded) { //expand the last parent node by default to prevent additional click to see the filter results
                newListElem.node().click();
            }
        });
        if (locInTarget) {
            currentShowMore.remove();
        }
    };
    // creates in-depth data object using the server response for hierarchyNodes to show in the tree all expanded, considering UntilChildren
    HierarchyNavigation.prototype.fillDataRecursively = function (hierarchyNodes, getToken, envFqdn, payload, payloadForContinuation) {
        var _this = this;
        if (payloadForContinuation === void 0) { payloadForContinuation = null; }
        var data = {};
        hierarchyNodes.hits.forEach(function (h) {
            var hierarchy = new HierarchyNode(h.name, payload.path, payload.path.length - _this.path.length, h.cumulativeInstanceCount);
            hierarchy.expand = function () {
                var expandNode = function () {
                    hierarchy.isExpanded = true;
                    hierarchy.node.classed('tsi-expanded', true);
                };
                if (_this.mode === State.Search) {
                    return _this.pathSearchAndRenderResult({ search: { payload: _this.requestPayload(hierarchy.path), bubbleUpReject: true }, render: { target: _this.instanceListElem } }).then(function (r) { return expandNode(); }).catch(function (err) { });
                }
                else {
                    return _this.pathSearchAndRenderResult({ search: { payload: _this.requestPayload(hierarchy.path), bubbleUpReject: true }, render: { target: hierarchy.node } }).then(function (r) { return expandNode(); }).catch(function (err) { });
                }
            };
            data[_this.hierarchyNodeIdentifier(h.name)] = hierarchy;
            if (h.hierarchyNodes && h.hierarchyNodes.hits.length) {
                hierarchy.children = _this.fillDataRecursively(h.hierarchyNodes, getToken, envFqdn, _this.requestPayload(hierarchy.path), payloadForContinuation);
            }
        });
        if (hierarchyNodes.continuationToken && hierarchyNodes.continuationToken !== 'END') {
            var showMorehierarchy_1 = new HierarchyNode(this.getString("Show More Hierarchies"), payload.path, payload.path.length - this.path.length);
            showMorehierarchy_1.onClick = function () {
                return _this.pathSearchAndRenderResult({
                    search: { payload: (payloadForContinuation ? payloadForContinuation : payload), hierarchiesContinuationToken: hierarchyNodes.continuationToken },
                    render: { target: showMorehierarchy_1.node.select(function () { return this.parentNode; }), locInTarget: '.tsi-show-more.tsi-show-more-hierarchy', skipLevels: payloadForContinuation ? payload.path.length - payloadForContinuation.path.length : null }
                });
            };
            data[showMorehierarchy_1.name] = showMorehierarchy_1;
        }
        return data;
    };
    //returns the dom element of one hierarchy level item for tree rendering
    HierarchyNavigation.prototype.createHierarchyItemElem = function (hORi, key) {
        var _this = this;
        var self = this;
        var isHierarchyNode = hORi instanceof HierarchyNode;
        var hierarchyItemElem = create('div').classed('tsi-hierarchyItem', true)
            .attr('style', "padding-left: " + (hORi.isLeaf ? hORi.level * 18 + 20 : (hORi.level + 1) * 18 + 20) + "px")
            .attr('tabindex', 0)
            .attr('arialabel', isHierarchyNode ? key : Utils.getTimeSeriesIdString(hORi))
            .attr('title', isHierarchyNode ? key : Utils.getTimeSeriesIdString(hORi))
            .attr("role", "treeitem").attr('aria-expanded', hORi.isExpanded)
            .on('click keydown', function () {
            return __awaiter(this, void 0, void 0, function () {
                var mouseElt, target, mouseWrapper;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (Utils.isKeyDownAndNotEnter(event)) {
                                return [2 /*return*/];
                            }
                            if (!!isHierarchyNode) return [3 /*break*/, 1];
                            event.stopPropagation();
                            self.closeContextMenu();
                            mouseElt = mouse(this);
                            target = self.hierarchyElem.select(function () { return this.parentNode; });
                            mouseWrapper = mouse(target.node());
                            self.prepareForContextMenu(hORi, target, mouseWrapper[1], mouseElt[1]);
                            self.chartOptions.onInstanceClick(hORi);
                            return [3 /*break*/, 4];
                        case 1:
                            if (!hORi.isExpanded) return [3 /*break*/, 2];
                            hORi.collapse();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, hORi.expand()];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        })
            .on('mouseover focus', function () {
            if (isHierarchyNode) {
                if (event.relatedTarget != select(this.parentNode).select('.tsi-filter-icon').node()) {
                    select(this.parentNode).select('.tsi-filter-icon').node().style.visibility = 'visible';
                }
            }
        })
            .on('mouseleave blur', function () {
            if (isHierarchyNode) {
                if (event.relatedTarget != select(this.parentNode).select('.tsi-filter-icon').node()) {
                    select(this.parentNode).select('.tsi-filter-icon').node().style.visibility = 'hidden';
                }
            }
        });
        if (isHierarchyNode) {
            hierarchyItemElem.append('span').classed('tsi-caret-icon', true).attr('style', "left: " + ((hORi.level) * 18 + 20) + "px");
            hierarchyItemElem.append('span').classed('tsi-name', true).text(key);
            hierarchyItemElem.append('span').classed('tsi-instanceCount', true).text(hORi.cumulativeInstanceCount);
            hierarchyItemElem.append('span').classed('tsi-hitCount', true).text(''); // hit count is the number of hierarchy nodes below, it is filled after expand is clicked for this node (after search is done for this path)
            hierarchyItemElem.append('div').classed('tsi-filter-icon', true).attr('title', this.getString('Add to Filter Path'))
                .attr('tabindex', 0)
                .attr('arialabel', this.getString('Add to Filter Path'))
                .attr('role', 'button')
                .on('click keydown', function () {
                if (Utils.isKeyDownAndNotEnter(event)) {
                    return;
                }
                self.path = hORi.path;
                var pathListElem = select('.tsi-path-list');
                pathListElem.text('');
                var pathToLoop = self.selectedHierarchyName !== HierarchySelectionValues.All ? hORi.path.slice(1) : hORi.path;
                pathToLoop.forEach(function (a, i) {
                    if (i > 0) {
                        pathListElem.append('span').text(' / ');
                    }
                    var pathName = self.hierarchyNodeIdentifier(a);
                    pathListElem.append('span').classed('tsi-path', true)
                        .text(pathName)
                        .attr('title', pathName)
                        .attr('tabindex', 0)
                        .attr('arialabel', pathName)
                        .on('click keydown', function () {
                        if (Utils.isKeyDownAndNotEnter(event)) {
                            return;
                        }
                        self.path = self.path.slice(0, i + (self.selectedHierarchyName === HierarchySelectionValues.All ? 1 : 2));
                        selectAll(pathListElem.selectAll('span').nodes().splice((i * 2) + 1, pathListElem.selectAll('span').nodes().length)).remove();
                        self.clearAndGetResults();
                    });
                });
                select('.tsi-filter-clear').style('display', 'inline-block');
                self.filterPathElem.classed('visible', true);
                self.clearAndGetResults();
            }).on('mouseleave blur', function () {
                if (event.relatedTarget != select(this.parentNode)) {
                    this.style.visibility = 'hidden';
                }
            });
        }
        else {
            var spanElem = hierarchyItemElem.append('span').classed('tsi-name', true);
            Utils.appendFormattedElementsFromString(spanElem, this.instanceNodeStringToDisplay(hORi));
            if (hORi.highlights) {
                var hitsExist_1 = false;
                var highlightDetails = hierarchyItemElem.append('div').classed('tsi-highlights-detail', true);
                if (hORi.highlights.description && this.hasHits(hORi.highlights.description)) {
                    hitsExist_1 = true;
                    Utils.appendFormattedElementsFromString(highlightDetails, hORi.highlights.description);
                }
                var hitTuples_1 = [];
                if (hORi.highlights.name && this.hasHits(Utils.getHighlightedTimeSeriesIdToDisplay(hORi))) {
                    hitsExist_1 = true;
                    hitTuples_1.push([this.getString("Time Series ID"), Utils.getHighlightedTimeSeriesIdToDisplay(hORi)]);
                }
                hORi.highlights.instanceFieldNames.forEach(function (ifn, idx) {
                    var val = hORi.highlights.instanceFieldValues[idx];
                    if (_this.hasHits(ifn) || _this.hasHits(val)) {
                        hitsExist_1 = true;
                        hitTuples_1.push([ifn, hORi.highlights.instanceFieldValues[idx]]);
                    }
                });
                var rows = highlightDetails.append('table').selectAll("tr")
                    .data(hitTuples_1)
                    .enter()
                    .append("tr");
                var cells = rows.selectAll("td")
                    .data(function (d) {
                    return d;
                });
                cells.enter()
                    .append("td")
                    .each(function (d) {
                    Utils.appendFormattedElementsFromString(select(this), d);
                })
                    .merge(cells);
                cells.exit().remove();
                rows.exit().remove();
                if (hitsExist_1) {
                    highlightDetails.style("display", "block");
                }
            }
        }
        return hierarchyItemElem;
    };
    //returns the dom elem of one instance item for flat list rendering
    HierarchyNavigation.prototype.createInstanceElem = function (i) {
        var _this = this;
        var instanceElem = create('div').classed('tsi-modelResult', true);
        var firstLine = instanceElem.append('div').classed('tsi-modelPK', true);
        i.highlights.name ? Utils.appendFormattedElementsFromString(firstLine, i.highlights.name) : Utils.appendFormattedElementsFromString(firstLine, Utils.getHighlightedTimeSeriesIdToDisplay(i));
        var secondLine = instanceElem.append('div').classed('tsi-modelHighlights', true);
        Utils.appendFormattedElementsFromString(secondLine, i.highlights.description && i.highlights.description.length ? i.highlights.description : 'No description');
        secondLine.append('br');
        var hitTuples = [];
        if (i.highlights.name) {
            hitTuples.push([this.getString("Time Series ID"), Utils.getHighlightedTimeSeriesIdToDisplay(i)]);
        }
        i.highlights.instanceFieldNames.forEach(function (ifn, idx) {
            var val = i.highlights.instanceFieldValues[idx];
            if (_this.searchString) {
                if (_this.hasHits(ifn) || _this.hasHits(val)) {
                    hitTuples.push([ifn, i.highlights.instanceFieldValues[idx]]);
                }
            }
            else if (val.length !== 0) {
                hitTuples.push([ifn, i.highlights.instanceFieldValues[idx]]);
            }
        });
        var rows = secondLine.append('table').selectAll("tr")
            .data(hitTuples)
            .enter()
            .append("tr");
        var cells = rows.selectAll("td")
            .data(function (d) {
            return d;
        });
        cells.enter()
            .append("td")
            .each(function (d) {
            Utils.appendFormattedElementsFromString(select(this), d);
        })
            .merge(cells);
        cells.exit().remove();
        rows.exit().remove();
        return instanceElem;
    };
    return HierarchyNavigation;
}(Component));
function HierarchyNode(name, parentPath, level, cumulativeInstanceCount) {
    var _this = this;
    if (cumulativeInstanceCount === void 0) { cumulativeInstanceCount = null; }
    this.name = name;
    this.path = parentPath.concat([name]);
    this.expand = function () { };
    this.level = level;
    this.cumulativeInstanceCount = cumulativeInstanceCount;
    this.node = null;
    this.children = null;
    this.isExpanded = false;
    this.collapse = function () { _this.isExpanded = false; _this.node.classed('tsi-expanded', false); _this.node.selectAll('ul').remove(); };
}
function InstanceNode(tsId, name, type, hierarchyIds, highlights, level) {
    if (name === void 0) { name = null; }
    this.timeSeriesId = tsId;
    this.name = name;
    this.type = type;
    this.hierarchyIds = hierarchyIds;
    this.highlights = highlights;
    this.suppressDrawContextMenu = false;
    this.isLeaf = true;
    this.level = level;
    this.node = null;
}
var HierarchySelectionValues;
(function (HierarchySelectionValues) {
    HierarchySelectionValues["All"] = "0";
    HierarchySelectionValues["Unparented"] = "-1";
})(HierarchySelectionValues || (HierarchySelectionValues = {}));
var ViewType;
(function (ViewType) {
    ViewType[ViewType["Hierarchy"] = 0] = "Hierarchy";
    ViewType[ViewType["List"] = 1] = "List";
})(ViewType || (ViewType = {}));
var State;
(function (State) {
    State[State["Navigate"] = 0] = "Navigate";
    State[State["Search"] = 1] = "Search";
    State[State["Filter"] = 2] = "Filter";
})(State || (State = {}));

export default HierarchyNavigation;
export { HierarchySelectionValues, State, ViewType };
