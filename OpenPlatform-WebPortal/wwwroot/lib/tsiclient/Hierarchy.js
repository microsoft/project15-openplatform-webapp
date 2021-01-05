import { U as Utils, a as __extends, b as Component } from './Utils-e5be3308.js';
import { select, event, selectAll, mouse } from 'd3';
import 'moment-timezone';

var HierarchyNode = /** @class */ (function () {
    function HierarchyNode(name, level) {
        this.children = [];
        this.isExpanded = false;
        this.isSelected = false;
        this.isLeaf = false;
        this.childrenInFilter = false;
        this.selfInFilter = false;
        this.color = function () { return null; };
        this.click = function (n) { };
        this.isLeafParent = false; // used in the event of context menut to denote that we should use a context menu for children
        this.name = name;
        this.level = level;
        this.markedName = name;
    }
    HierarchyNode.prototype.filter = function (filterText) {
        var regExp = new RegExp(filterText, 'i');
        var isInFilter = function (node) {
            var childrenInFilter = node.children.reduce(function (p, c) {
                p = isInFilter(c) || p;
                return p;
            }, false);
            var selfInFilter = regExp.test(node.name);
            node.markedName = selfInFilter ? Utils.mark(filterText, node.name) : node.name;
            if (node.parent != null)
                node.parent.childrenInFilter = (selfInFilter || childrenInFilter) && filterText.length > 0;
            node.selfInFilter = selfInFilter && filterText.length > 0;
            node.childrenInFilter = childrenInFilter && filterText.length > 0;
            return childrenInFilter || selfInFilter;
        };
        isInFilter(this);
    };
    HierarchyNode.prototype.traverse = function (condition) {
        var traversal = [];
        if (condition(this))
            traversal.push(this);
        this.children.forEach(function (n) {
            traversal = traversal.concat(n.traverse(condition));
        });
        return traversal;
    };
    HierarchyNode.prototype.colorify = function (el) {
        if (this.isLeaf && this.isSelected && this.color(this))
            el.style('background-color', this.color(this));
        if (!this.isSelected && this.isLeaf)
            el.style('background-color', null);
    };
    return HierarchyNode;
}());

var Hierarchy = /** @class */ (function (_super) {
    __extends(Hierarchy, _super);
    function Hierarchy(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.filterText = '';
        _this.withContextMenu = false;
        _this.expandCollapseList = function (node, el, isFromClick) {
            if (isFromClick === void 0) { isFromClick = false; }
            _this.closeContextMenu();
            if (el.classed('tsi-expanded') && !(_this.withContextMenu && node.isLeafParent)) {
                el.selectAll('ul').remove();
                el.classed('tsi-expanded', false);
                node.isExpanded = false;
            }
            else {
                if (_this.withContextMenu && node.isLeafParent) {
                    if (_this.clickedNode != el.node()) {
                        _this.clickedNode = el.node();
                        _this.contextMenu = _this.hierarchyList.append('div');
                        node.children.filter(function (n) { return n.name[0] !== '~'; }).forEach(function (n) {
                            _this.contextMenu.append('div').text("" + n.name).on('click', function () { return n.click(n); });
                        });
                        _this.contextMenu.append('div').classed('tsi-break', true);
                        node.children.filter(function (n) { return n.name[0] === '~'; }).forEach(function (n) {
                            var noTildeName = n.name.slice(1);
                            _this.contextMenu.append('div').text("" + noTildeName).on('click', function () { return n.click(n); });
                        });
                        _this.contextMenu.classed('tsi-hierarchyContextMenu', true);
                        var mouseWrapper_1 = mouse(_this.hierarchyList.node());
                        var mouseElt_1 = mouse(el.node());
                        _this.contextMenu.attr('style', function () { return "top: " + (mouseWrapper_1[1] - mouseElt_1[1]) + "px"; });
                        el.classed('tsi-resultSelected', true);
                        _this.hierarchyList.selectAll('.tsi-noPad').on('scroll', function () { _this.closeContextMenu(); });
                    }
                    else {
                        _this.clickedNode = null;
                    }
                }
                else {
                    var list = el.append('ul');
                    node.children.forEach(function (n) {
                        if (isFromClick || n.selfInFilter || n.childrenInFilter || (node.isExpanded && _this.filterText.length == 0)) {
                            var self = _this;
                            var clickMethod = function () {
                                if (n.isLeaf) {
                                    var parent = n.parent;
                                    while (parent != this.root) {
                                        parent.isExpanded = true;
                                        parent = parent.parent;
                                    }
                                    n.isSelected = !n.isSelected;
                                    n.click(n);
                                    var selector = select(this);
                                    n.colorify(selector);
                                    selector.classed('tsi-selected', n.isSelected);
                                }
                                else {
                                    self.expandCollapseList(n, select(this), true);
                                }
                                event.stopPropagation();
                            };
                            var li = list.append('li').classed('tsi-leaf', n.isLeaf)
                                .classed('tsi-leafParent', n.isLeafParent && _this.withContextMenu)
                                .classed('tsi-selected', n.isSelected).on('click', clickMethod);
                            li.append('span').classed('tsi-caret', true).attr('style', "left: " + (n.level - 1) * 18 + "px");
                            li.append('span').classed('tsi-markedName', true).html(n.markedName) // known unsafe usage of .html
                                .attr('style', "padding-left: " + (40 + (n.level - 1) * 18 - (n.isLeafParent && _this.withContextMenu ? 16 : 0)) + "px")
                                .attr('title', n.isLeafParent && _this.withContextMenu ? n.name : '');
                            n.colorify(li);
                            if ((n.isExpanded || n.childrenInFilter) && !n.isLeaf) {
                                _this.expandCollapseList(n, li);
                            }
                        }
                    });
                    node.isExpanded = (node.isExpanded || isFromClick) || (node == _this.root);
                    el.classed('tsi-expanded', true);
                }
            }
        };
        return _this;
    }
    Hierarchy.prototype.render = function (data, options) {
        var _this = this;
        var self = this;
        var targetElement = select(this.renderTarget).classed('tsi-hierarchy', true);
        targetElement.html('');
        this.chartOptions.setOptions(options);
        _super.prototype.themify.call(this, targetElement, this.chartOptions.theme);
        this.withContextMenu = this.chartOptions.withContextMenu;
        this.root = this.buildTree(data);
        this.root.isExpanded = true;
        select("html").on("click." + Utils.guid(), function () {
            if (_this.clickedNode && event.target != _this.clickedNode && _this.contextMenu) {
                _this.closeContextMenu();
                _this.clickedNode = null;
            }
        });
        var inputDebounceTimeout;
        var filter = targetElement.append('div').classed('tsi-filterWrapper', true).append('input').attr('placeholder', 'Search...').on('input', function () {
            var _this = this;
            clearTimeout(inputDebounceTimeout);
            inputDebounceTimeout = setTimeout(function () {
                self.filterText = _this.value.trim();
                if (self.filterText.length == 1)
                    return; // quick return for small sets
                var splitFilterText = self.filterText.split('/');
                self.root.filter(splitFilterText[0]);
                if (splitFilterText.length > 1) {
                    for (var i = 1; i < splitFilterText.length; i++) {
                        if (splitFilterText[i].length) {
                            var nodesInFilter = self.root.traverse(function (n) { return n.selfInFilter; });
                            nodesInFilter.forEach(function (n) {
                                var markedName = n.markedName;
                                n.filter(splitFilterText[i], false);
                                n.markedName = markedName;
                            });
                            nodesInFilter.forEach(function (n) {
                                if (!n.childrenInFilter)
                                    n.selfInFilter = false;
                            });
                        }
                    }
                }
                list.selectAll('ul').remove();
                list.classed('tsi-expanded', false);
                self.root.childrenInFilter = self.root.childrenInFilter || self.filterText.length == 0;
                if (self.root.childrenInFilter == false)
                    list.append('ul').append('div').text(self.getString('No filter results'));
                else
                    self.expandCollapseList(self.root, list, false);
                list.select('ul').classed('tsi-noPad', true);
            }, 250);
        });
        var navTabs = targetElement.append('div').classed('tsi-navTabWrapper', true);
        var allTab = navTabs.append('div').classed('tsi-navTab tsi-selected', true).text(this.getString('All hierarchies'));
        var selectedTab = navTabs.append('div').classed('tsi-navTab', true).text(this.getString('Selected'));
        var list = targetElement.append('div').classed('tsi-hierarchyList', true);
        this.hierarchyList = list;
        allTab.on('click', function () {
            if (!allTab.classed('tsi-selected')) {
                allTab.classed('tsi-selected', true);
                selectedTab.classed('tsi-selected', false);
                list.html('').classed('tsi-expanded', false);
                _this.expandCollapseList(_this.root, list, true);
                list.select('ul').classed('tsi-noPad', true);
                filter.attr('disabled', null);
            }
        });
        selectedTab.on('click', function () {
            if (!selectedTab.classed('tsi-selected')) {
                allTab.classed('tsi-selected', false);
                selectedTab.classed('tsi-selected', true);
                list.html('');
                var ul = list.append('ul').classed('tsi-noPad', true);
                var leafs = _this.root.traverse(function (n) { return n.isSelected; });
                leafs.forEach(function (n) {
                    var li = ul.append('li').classed('tsi-leaf', n.isLeaf).classed('tsi-selected', n.isSelected).on('click', function () {
                        n.isSelected = !n.isSelected;
                        select(this).classed('tsi-selected', n.isSelected);
                        n.click(n);
                        n.colorify(select(this));
                    });
                    li.append('span').text(n.name).classed('tsi-markedName', true);
                    n.colorify(li);
                });
                filter.attr('disabled', true);
            }
        });
        this.expandCollapseList(this.root, list, false);
        list.select('ul').classed('tsi-noPad', true);
    };
    Hierarchy.prototype.buildTree = function (data) {
        var traverse = function (data, key, level, parent) {
            if (parent === void 0) { parent = null; }
            var node = new HierarchyNode(key, level);
            node.parent = parent;
            if (data.hasOwnProperty('$leaf')) {
                node.isLeaf = true;
                if (data.hasOwnProperty('click'))
                    node.click = data.click;
                if (data.hasOwnProperty('color'))
                    node.color = data.color;
                node.parent.isLeafParent = true;
            }
            else {
                Object.keys(data).sort().forEach(function (k) {
                    node.children.push(traverse(data[k], k, level + 1, node));
                });
            }
            return node;
        };
        return traverse(data, '', 0);
    };
    Hierarchy.prototype.closeContextMenu = function () {
        if (this.contextMenu) {
            this.contextMenu.remove();
        }
        selectAll('.tsi-resultSelected').classed('tsi-resultSelected', false);
    };
    return Hierarchy;
}(Component));

export default Hierarchy;
