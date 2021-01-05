import { U as Utils, v as valueTypes, a as __extends } from './Utils-e5be3308.js';
import { select, event } from 'd3';
import 'moment-timezone';
import './EllipsisMenu.js';
import 'split.js';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';

var TimeSeriesEventCell = /** @class */ (function () {
    function TimeSeriesEventCell(name, value, type) {
        if (type === void 0) { type = null; }
        this.key = name + "_" + type;
        this.name = name;
        this.type = type;
        this.value = value;
    }
    return TimeSeriesEventCell;
}());

var TimeSeriesEvent = /** @class */ (function () {
    function TimeSeriesEvent(rawEvent, offset, offsetName, locale) {
        if (offset === void 0) { offset = null; }
        if (offsetName === void 0) { offsetName = null; }
        if (locale === void 0) { locale = 'en'; }
        this.cells = {};
        if (offset !== null) {
            var type = 'DateTime';
            var utcOffsetDate_1 = Utils.offsetUTC(new Date(Date.parse(rawEvent['timestamp ($ts)'].split("Z").join(""))));
            rawEvent[offsetName + "_" + type] = {
                name: offsetName,
                value: function () { return Utils.timeFormat(true, true, offset, true, null, null, locale)(utcOffsetDate_1); },
                type: type
            };
        }
        this.cells = Object.keys(rawEvent).reduce(function (cellObj, propId) {
            var cell;
            if (propId == "timestamp ($ts)")
                cell = new TimeSeriesEventCell('timestamp ($ts)', rawEvent[propId], 'DateTime');
            else {
                cell = new TimeSeriesEventCell(rawEvent[propId]['name'], rawEvent[propId]['value'], rawEvent[propId]['type']);
            }
            cellObj[cell.key] = cell;
            return cellObj;
        }, {});
    }
    return TimeSeriesEvent;
}());

var EventsTableData = /** @class */ (function () {
    function EventsTableData() {
        this.columns = {};
        this.rows = [];
        this.events = [];
        this.timestampColumnKey = "timestamp ($ts)_DateTime";
        this.offsetName = null;
        this.maxVisibleToStart = 10;
        this.offsetNameCache = {};
        this.timeSeriesIdProperties = [];
    }
    EventsTableData.prototype.createOffsetName = function (offset) {
        if (offset in this.offsetNameCache) {
            return this.offsetNameCache[offset];
        }
        var offsetSubstring = "";
        if ((typeof offset) === 'string') {
            offsetSubstring = Utils.convertTimezoneToLabel(offset);
        }
        else {
            offsetSubstring = Utils.formatOffsetMinutes(offset);
        }
        var offsetName = "timestamp " + offsetSubstring;
        this.offsetNameCache[offset] = offsetName;
        return offsetName;
    };
    EventsTableData.prototype.sortColumnKeys = function () {
        var _this = this;
        var columnKeys = Object.keys(this.columns);
        var existingTsidColumnKeys = Object.values(this.columns).filter(function (c) { return c['isTsid']; }).map(function (c) { return c['key']; }); // detect existing time series id properties in column keys
        columnKeys = existingTsidColumnKeys.concat(columnKeys.filter(function (c) { return !existingTsidColumnKeys.includes(c); })); // put these time series id properties to the beginning of the column key list
        var offsetKey = this.offsetName + "_DateTime";
        var lessTimestamps = columnKeys.filter(function (columnKey) {
            return (columnKey !== _this.timestampColumnKey && columnKey !== offsetKey);
        });
        var timestamps = [];
        if (columnKeys.indexOf(this.timestampColumnKey) !== -1)
            timestamps.push(this.timestampColumnKey);
        if (columnKeys.indexOf(offsetKey) !== -1)
            timestamps.push(offsetKey);
        return timestamps.concat(lessTimestamps);
    };
    EventsTableData.prototype.setEvents = function (rawEvents, fromTsx, timeSeriesIdProperties, offset) {
        var _this = this;
        if (offset === void 0) { offset = null; }
        this.timeSeriesIdProperties = timeSeriesIdProperties;
        this.events = [];
        rawEvents.forEach(function (rawEvent) {
            if (!fromTsx) {
                rawEvent = Object.keys(rawEvent).reduce(function (newEventMap, currColName) {
                    newEventMap[currColName] = {
                        name: currColName,
                        value: rawEvent[currColName]
                    };
                    return newEventMap;
                }, {});
            }
            if (offset !== null) {
                _this.offsetName = _this.createOffsetName(offset);
            }
            var event = new TimeSeriesEvent(rawEvent, offset, (offset !== null ? _this.offsetName : null));
            _this.events.push(event);
        });
        this.constructColumns();
    };
    EventsTableData.prototype.sortEvents = function (columnKey, isAscending) {
        var sortType = this.columns[columnKey].type;
        var aTop = 1;
        var bTop = -1;
        if (!isAscending) {
            aTop = -1;
            bTop = 1;
        }
        this.events.sort(function (a, b) {
            if ((a.cells && a.cells[columnKey]) || (b.cells && b.cells[columnKey])) {
                var aConverted = (a.cells && a.cells[columnKey]) ? a.cells[columnKey].value : null;
                var bConverted = (b.cells && b.cells[columnKey]) ? b.cells[columnKey].value : null;
                //one value is null
                if (aConverted == null)
                    return bTop;
                if (bConverted == null)
                    return aTop;
                //convert to appropriate type
                if (sortType == "Double") {
                    aConverted = Number(aConverted);
                    bConverted = Number(bConverted);
                }
                else if (sortType == "DateTime") {
                    aConverted = (new Date(aConverted)).valueOf();
                    bConverted = (new Date(bConverted)).valueOf();
                }
                //compare
                if (aConverted > bConverted)
                    return aTop;
                if (aConverted < bConverted)
                    return bTop;
                return 0;
            }
            return 0;
        });
    };
    EventsTableData.prototype.constructColumns = function () {
        var _this = this;
        var timeSeriesIdPropertyKeys = this.timeSeriesIdProperties.map(function (p) { return p.name + "_" + p.type; });
        var newColumns = {};
        this.events.forEach(function (event) {
            Object.keys(event.cells).forEach(function (cellKey) {
                var cell = event.cells[cellKey];
                if (_this.columns[cell.key] == null) {
                    newColumns[cell.key] = {
                        key: cell.key,
                        name: cell.name,
                        visible: true,
                        type: cell.type,
                        isTsid: timeSeriesIdPropertyKeys.includes(cell.key)
                    };
                }
                else {
                    newColumns[cell.key] = _this.columns[cell.key];
                }
            });
        });
        var visibleColumnCounter = Object.values(newColumns).filter(function (c) { return c['isTsid']; }).length;
        Object.keys(newColumns).forEach(function (columnKey) {
            if (newColumns[columnKey].isTsid) {
                newColumns[columnKey].visible = true;
            }
            else {
                newColumns[columnKey].visible = visibleColumnCounter < _this.maxVisibleToStart;
                visibleColumnCounter++;
            }
        });
        this.columns = newColumns;
    };
    EventsTableData.prototype.generateCSVString = function (includeAllColumns, offset) {
        //replace comma at end of line with end line character
        var endLine = function (s) {
            return s.slice(0, s.length - 1) + "\n";
        };
        var columnKeys = this.sortColumnKeys();
        var csvString = endLine(columnKeys.reduce(function (headerString, columnKey) {
            return headerString + Utils.sanitizeString(columnKey, valueTypes.String) + ",";
        }, ""));
        this.events.forEach(function (event) {
            csvString += endLine(columnKeys.reduce(function (lineString, columnKey) {
                var value = (event.cells[columnKey] ? (typeof (event.cells[columnKey].value) === 'function' ? event.cells[columnKey].value() : event.cells[columnKey].value) : null);
                return lineString + ((event.cells[columnKey] != null && Utils.sanitizeString(value, event.cells[columnKey].type) !== null) ?
                    Utils.sanitizeString(value, event.cells[columnKey].type) : "") + ",";
            }, ""));
        });
        return csvString;
    };
    return EventsTableData;
}());

var EventsTable = /** @class */ (function (_super) {
    __extends(EventsTable, _super);
    function EventsTable(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.maxVisibleIndex = 100;
        _this.isAscending = true;
        _this.timestampColumnName = 'timestamp ($ts)';
        _this.sortColumn = 'timestamp ($ts)';
        _this.allSelectedState = "all"; // all | some | none
        _this.eventsTableData = new EventsTableData();
        _this.margins = {
            left: 10,
            right: 10
        };
        return _this;
    }
    EventsTable.prototype.EventsTable = function () {
    };
    EventsTable.prototype.renderFromEventsTsx = function (eventsFromTsx, chartOptions) {
        this.render(eventsFromTsx, chartOptions, true);
    };
    EventsTable.prototype.render = function (events, chartOptions, fromTsx) {
        if (fromTsx === void 0) { fromTsx = false; }
        this.chartOptions.setOptions(chartOptions);
        this.maxVisibleIndex = 100;
        this.eventsTableData.setEvents(events, fromTsx, this.chartOptions.timeSeriesIdProperties, chartOptions.offset);
        var componentContainer = select(this.renderTarget)
            .classed("tsi-tableComponent", true);
        _super.prototype.themify.call(this, componentContainer, this.chartOptions.theme);
        var tableLeftPanel;
        if (this.eventsTable == null) {
            tableLeftPanel = componentContainer.append("div")
                .classed("tsi-tableLeftPanel", true);
            this.eventsLegend = tableLeftPanel.append("div")
                .classed("tsi-tableLegend", true);
            this.eventsLegend.append("ul");
            this.eventsTable = componentContainer.append("div")
                .classed("tsi-eventsTable", true);
            this.eventsTable.append("div").classed("tsi-columnHeaders", true);
            var table = this.eventsTable.append("div").classed("tsi-eventRowsContainer", true)
                .append("table").classed("tsi-eventRows", true);
            table.append("tr");
        }
        else {
            tableLeftPanel = componentContainer.select("tsi-tableLeftPanel");
        }
        this.renderLegend();
        this.buildTable();
        tableLeftPanel.selectAll(".tsi-eventsDownload").remove();
        var downloadButton = tableLeftPanel.append("button")
            .attr("class", "tsi-eventsDownload tsi-primaryButton")
            .attr("aria-label", this.getString("Download as CSV"))
            .on("click", function () {
            var _this = this;
            this.classList.add('tsi-downloading');
            setTimeout(function () {
                Utils.downloadCSV(self.eventsTableData.generateCSVString(true, 0), "Events");
                _this.classList.remove('tsi-downloading');
            }, 100);
        });
        downloadButton.append("div").attr("class", "tsi-downloadEventsIcon");
        downloadButton.append("div").attr("class", "tsi-downloadEventsText").text(this.getString("Download as CSV"));
        //listen for table scroll and adjust the headers accordingly
        var self = this;
        this.eventsTable.select('.tsi-eventRowsContainer').node().scrollLeft = 0;
        this.eventsTable.select('.tsi-eventRowsContainer').node().scrollTop = 0;
        this.eventsTable.select('.tsi-eventRowsContainer').node().addEventListener('scroll', function (evt) {
            self.eventsTable.select('.tsi-columnHeaders').node().scrollLeft = this.scrollLeft;
            //check to see if need to infiniteScroll
            if ((this.scrollTop + this.clientHeight) > (this.scrollHeight - 100)) {
                var oldVisibleIndex = self.maxVisibleIndex;
                self.maxVisibleIndex += (Math.min(100, self.eventsTableData.events.length - self.maxVisibleIndex));
                if (self.maxVisibleIndex != oldVisibleIndex)
                    self.buildTable();
            }
        }, false);
    };
    EventsTable.prototype.renderLegend = function () {
        var _this = this;
        this.eventsLegend.html("");
        this.eventsLegend.append("ul");
        var columns = this.eventsTableData.sortColumnKeys()
            .map(function (cIdx) { return _this.eventsTableData.columns[cIdx]; });
        this.setSelectAllState();
        if (columns.length > 2) { // tristate - all selected
            var selectAllColumns = this.eventsLegend.select("ul")
                .append("li").attr("class", "tsi-selectAllColumns");
            selectAllColumns.append("button").attr("class", "tsi-columnToggleButton")
                .attr("aria-label", function () {
                var selectAllState = _this.getSelectAllState();
                return selectAllState !== "all" ? _this.getString("Toggle all columns") : _this.getString("Toggle all columns");
            })
                .on("click", function () {
                var setAllVisible = false;
                var selectAllState = _this.getSelectAllState();
                if (selectAllState != "all") {
                    setAllVisible = true;
                }
                Object.keys(_this.eventsTableData.columns).forEach(function (columnKey) {
                    if (setAllVisible) {
                        _this.eventsTableData.columns[columnKey].visible = true;
                    }
                    else {
                        if (columnKey != _this.timestampColumnName)
                            _this.eventsTableData.columns[columnKey].visible = false;
                    }
                });
                _this.setLegendColumnStates();
                _this.buildTable();
            });
            selectAllColumns.append("span").attr("class", "tsi-columnToggleCheckbox");
            selectAllColumns.append("span").attr("class", "tsi-selectAllSomeState");
            selectAllColumns.append("span").attr("class", "tsi-columnToggleName")
                .text(this.getString("All Columns"));
        }
        var toggleableColumnLis = this.eventsLegend.select("ul").selectAll(".tsi-columnToggle")
            .data(columns);
        var toggleableColumnLisEntered = toggleableColumnLis.enter()
            .append("li")
            .classed("tsi-columnToggle", true)
            .merge(toggleableColumnLis);
        var self = this;
        toggleableColumnLisEntered.each(function (d) {
            select(this).append("button").attr("class", "tsi-columnToggleButton")
                .attr("aria-label", function (d) { return "toggle column " + d.key; })
                .on("click", function (d) {
                d.visible = !d.visible;
                self.setLegendColumnStates();
                self.buildTable();
            });
            select(this).append("div").attr("class", "tsi-columnToggleCheckbox");
            if (d.isTsid) {
                var typeIconCOntainer = select(this).append("div").attr("class", "tsi-columnTypeIcons");
                typeIconCOntainer.append("span").attr("class", "tsi-columnTypeIcon")
                    .classed("tsid", true).attr("title", self.getString("Time Series ID"));
                typeIconCOntainer.append("span").attr("class", "tsi-columnTypeIcon")
                    .classed(d.type, true);
            }
            else {
                select(this).append("div").attr("class", "tsi-columnTypeIcon")
                    .classed(d.type, true);
            }
            select(this).select("button").append("div").attr("class", "tsi-onlyLabel").text(self.getString("only"))
                .attr('tabindex', "0")
                .attr('role', 'button')
                .on("click", function (d) {
                event.stopPropagation();
                columns.forEach(function (column) {
                    if (column.key == d.key)
                        column.visible = true;
                    else
                        column.visible = false;
                });
                self.setLegendColumnStates();
                self.buildTable();
            });
            select(this).append("div").attr("class", "tsi-columnToggleName").classed('tsidPropertyName', function (d) { return d.isTsid; }).text(function (d) { return columns.filter(function (c) { return c.name === d.name; }).length > 1 ? d.name + " (" + d.type + ")" : d.name; });
        });
        this.setLegendColumnStates();
        toggleableColumnLis.exit().remove();
    };
    EventsTable.prototype.setLegendColumnStates = function () {
        if (this.eventsLegend.select("ul")) {
            this.eventsLegend.select("ul").selectAll(".tsi-columnToggle").each(function () {
                select(this).select(".tsi-columnToggleCheckbox").classed("tsi-notSelected", function (d) { return !(d.visible); });
            });
        }
        this.setSelectAllState();
    };
    EventsTable.prototype.getSelectAllState = function () {
        var _this = this;
        var selectAllState = Object.keys(this.eventsTableData.columns).reduce(function (prev, curr) {
            if (curr == _this.timestampColumnName) // skip timestamp, will always be visible
                return prev;
            if (prev == null)
                return (_this.eventsTableData.columns[curr].visible) ? "all" : "none";
            if (prev == "some")
                return "some";
            return (prev == (_this.eventsTableData.columns[curr].visible ? "all" : "none")) ? prev : "some";
        }, null);
        if (selectAllState == null)
            selectAllState = "none";
        return selectAllState;
    };
    EventsTable.prototype.setSelectAllState = function () {
        var selectAllState = this.getSelectAllState();
        var selectAllColumns = this.eventsLegend.select("ul").select(".tsi-selectAllColumns");
        selectAllColumns.select(".tsi-columnToggleCheckbox")
            .classed("tsi-notSelected", function () { return selectAllState !== "all"; });
        selectAllColumns.select(".tsi-columnToggleButton")
            .attr("aria-label", (selectAllState !== "all" ? this.getString("Toggle all columns on") : this.getString("Toggle all columns off")));
        this.eventsLegend.select("ul").select(".tsi-selectAllColumns").select(".tsi-selectAllSomeState")
            .style("visibility", function () { return (selectAllState == "some") ? "visible" : "hidden"; });
    };
    EventsTable.prototype.getFilteredColumnKeys = function () {
        var _this = this;
        return this.eventsTableData.sortColumnKeys().filter(function (columnKey) {
            return _this.eventsTableData.columns[columnKey].visible;
        });
    };
    //creates columnHeaders, returns a dictionary of widths so that buildTable can know the min width of each column
    EventsTable.prototype.buildHeaders = function (filteredColumnKeys, focusedHeader) {
        var _this = this;
        if (focusedHeader === void 0) { focusedHeader = null; }
        var longAndDoubleExist = function (propertyKey) {
            var propertyName = _this.eventsTableData.columns[propertyKey].name;
            return _this.eventsTableData.columns.hasOwnProperty(propertyName + "_Long") && _this.eventsTableData.columns.hasOwnProperty(propertyName + "_Double");
        };
        this.eventsTable.select(".tsi-columnHeaders").html("");
        var self = this;
        var columnHeaders = this.eventsTable.select(".tsi-columnHeaders").selectAll(".tsi-columnHeader")
            .data(filteredColumnKeys);
        var isOffsetDateTimeColumn = function (d) { return d.includes('timestamp') && (d.includes('') || d.includes('-')) && !d.includes('$ts') ? true : null; };
        var columnHeadersEntered = columnHeaders.enter()
            .append("div")
            .classed("tsi-columnHeader", true)
            .classed("tsi-columnHeaderDisabled", isOffsetDateTimeColumn)
            .each(function (d) {
            select(this).append("span")
                .classed("tsi-columnHeaderName", true)
                .classed("moreMarginRight", function (d) { return self.eventsTableData.columns[d].isTsid; })
                .text(longAndDoubleExist(d) ? self.eventsTableData.columns[d].name + " (" + self.eventsTableData.columns[d].type + ")" : self.eventsTableData.columns[d].name);
            select(this).append("span").attr("class", "tsi-columnSortIcon").classed("moreRight", self.eventsTableData.columns[d].isTsid)
                .classed("up", (self.sortColumn == d && self.isAscending))
                .classed("down", (self.sortColumn == d && !self.isAscending));
            if (self.eventsTableData.columns[d].isTsid) {
                var typeIconContainer = select(this).append("div").attr("class", "tsi-columnTypeIcons");
                typeIconContainer.append("span").attr("class", "tsi-columnTypeIcon")
                    .classed("tsid", true).attr("title", self.getString("Time Series ID"));
                typeIconContainer.append("span").attr("class", "tsi-columnTypeIcon")
                    .classed(self.eventsTableData.columns[d].type, true);
            }
            else {
                select(this).append("span").attr("class", "tsi-columnTypeIcon")
                    .classed(self.eventsTableData.columns[d].type, true);
            }
            var id = JSON.parse(JSON.stringify(d));
            select(this).append("button").attr("class", "tsi-sortColumnButton")
                .attr("aria-label", function (title) { return "Sort by column " + title; })
                .on("click", function (f, i) {
                //set sort column and direction
                if (self.sortColumn == d) {
                    self.isAscending = !self.isAscending;
                }
                else {
                    self.isAscending = false;
                }
                self.sortColumn = d;
                self.eventsTableData.sortEvents(d, self.isAscending);
                self.buildTable(f);
                self.eventsTable.select('.tsi-columnHeaders').node().scrollLeft =
                    self.eventsTable.select('.tsi-eventRowsContainer').node().scrollLeft;
            })
                .attr("disabled", isOffsetDateTimeColumn);
        });
        var widthDictionary = {};
        columnHeadersEntered.each(function (d) {
            widthDictionary[d] = select(this).node().getBoundingClientRect().width;
        });
        columnHeaders.exit().remove();
        if (focusedHeader !== null) {
            var columnHeader = select(columnHeadersEntered.filter(function (d) {
                return d === focusedHeader;
            }).nodes()[0]);
            if (columnHeader) {
                columnHeader.select("button").node().focus();
            }
        }
        return widthDictionary;
    };
    EventsTable.prototype.adjustHeaderWidth = function (widthDictionary) {
        //set the width to fit inside the container less the scroll bar
        var tableSelection = this.eventsTable.select('.tsi-eventRowsContainer').node();
        var scrollBarWidthDiff = tableSelection.getBoundingClientRect().width - tableSelection.clientWidth;
        this.eventsTable.select(".tsi-columnHeaders").style("width", "calc(100% - " + scrollBarWidthDiff + "px)");
        this.eventsTable.select(".tsi-columnHeaders").selectAll(".tsi-columnHeader")
            .style("width", function (d) {
            if (widthDictionary[d])
                return (widthDictionary[d] - 17) + "px"; //17 pixel difference in element due to padding/border
            else {
                return select(this).style("width");
            }
        });
    };
    EventsTable.prototype.buildTable = function (currentSortedCol) {
        var _this = this;
        if (currentSortedCol === void 0) { currentSortedCol = null; }
        var filteredColumnKeys = this.getFilteredColumnKeys();
        var widthDictionary = this.buildHeaders(filteredColumnKeys, currentSortedCol);
        this.eventsTable.select("table").html("");
        var self = this;
        var rowsData = this.eventsTableData.events.slice(0, this.maxVisibleIndex);
        var firstRow = this.eventsTable.select("table").append("tr")
            .classed("tsi-eventRow", true);
        var firstRowCells = firstRow.selectAll("td").data(filteredColumnKeys);
        firstRowCells.enter()
            .append("td")
            .classed("tsi-eventCell", true)
            .text(function (d) { return _this.eventsTableData.columns[d].name; });
        var rows = this.eventsTable.select("table").selectAll("tsi-eventRow").data(rowsData);
        var rowsEntered = rows.enter()
            .append("tr")
            .classed("tsi-eventRow", true)
            .merge(rows)
            .each(function (event) {
            var visibleCells = filteredColumnKeys.map(function (columnKey) {
                if (event.cells[columnKey])
                    return event.cells[columnKey];
                return { key: columnKey, value: null };
            });
            var valueCells = select(this).selectAll("td").data(visibleCells);
            var valueCellsEntered = valueCells.enter()
                .append("td")
                .classed("tsi-eventCell", true)
                .style("min-width", function (d) {
                if (widthDictionary[d.key] != null)
                    return Math.ceil(widthDictionary[d.key]) + "px";
                else
                    return "none";
            })
                .text(function (d) {
                return self.formatValue(d.value, d.type);
            });
            valueCells.exit().remove();
        });
        if (rowsEntered.size() > 0) {
            var firstRow = rowsEntered.filter(function (d, i) { return i === 0; });
            firstRow.selectAll("td").each(function (d) {
                var cellWidth = select(this).node().getBoundingClientRect().width;
                widthDictionary[d.key] = (cellWidth > widthDictionary[d.key]) ? cellWidth : widthDictionary[d.key];
            });
        }
        rows.exit().remove();
        this.adjustHeaderWidth(widthDictionary);
    };
    EventsTable.prototype.formatValue = function (value, type) {
        if (type === 'Dynamic') {
            return JSON.stringify(value);
        }
        if (type !== 'DateTime' || value === null || value === undefined) {
            return value;
        }
        if (typeof (value) === 'function') {
            return value();
        }
        var timeFormatFunction = Utils.timeFormat(true, true, 0, this.chartOptions.is24HourTime, null, null, this.chartOptions.dateLocale);
        var dateValue = new Date(value.split("Z").join(""));
        return timeFormatFunction(Utils.offsetUTC(dateValue));
    };
    return EventsTable;
}(ChartComponent));

export default EventsTable;
