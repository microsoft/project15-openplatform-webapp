import { a as __extends, K as KeyCodes, U as Utils, b as Component } from './Utils-e5be3308.js';
import { select, event } from 'd3';
import 'moment-timezone';

var ColorPicker = /** @class */ (function (_super) {
    __extends(ColorPicker, _super);
    function ColorPicker(renderTarget, componentId) {
        if (componentId === void 0) { componentId = Utils.guid(); }
        var _this = _super.call(this, renderTarget) || this;
        _this.getSelectedColorValue = function () {
            return _this.selectedColor;
        };
        _this.showColorGrid = function () {
            _this.colorPickerElem.select(".tsi-colorGrid").style("display", "flex");
            _this.isColorGridVisible = true;
            _this.colorPickerElem.selectAll(".tsi-colorItem").nodes()[0].focus();
            _this.colorPickerElem.select(".tsi-colorPickerButton").attr("aria-expanded", true);
        };
        _this.hideColorGrid = function (withFocusBackToPickerButton) {
            if (withFocusBackToPickerButton === void 0) { withFocusBackToPickerButton = false; }
            _this.colorPickerElem.select(".tsi-colorGrid").style("display", "none");
            _this.isColorGridVisible = false;
            _this.colorPickerElem.select(".tsi-colorPickerButton").attr("aria-expanded", false);
            if (withFocusBackToPickerButton) {
                _this.colorPickerElem.select(".tsi-colorPickerButton").node().focus();
            }
        };
        _this.setSelectedColor = function (cStr, gridItem) {
            _this.colorPickerElem.select(".tsi-selectedColor").classed("tsi-noColor", false);
            _this.colorPickerElem.select(".tsi-selectedColor").style("background-color", cStr);
            _this.colorPickerElem.select(".tsi-selectedColorValue").text(cStr);
            _this.colorPickerElem.select(".tsi-colorItem.tsi-selected").classed("tsi-selected", false);
            _this.colorPickerElem.select(".tsi-colorItem.tsi-selected").attr("aria-selected", false);
            _this.colorPickerElem.select(".tsi-colorPickerButton").attr("aria-label", (_this.selectedColor ? _this.selectedColor : _this.getString('No color')) + ' ' + _this.getString('Select color'));
            gridItem.classed("tsi-selected", true);
            gridItem.attr("aria-selected", true);
            _this.selectedColor = cStr;
        };
        _this.getColorPickerElem = function () {
            return _this.colorPickerElem;
        };
        _this.componentId = componentId;
        return _this;
    }
    ColorPicker.prototype.render = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.chartOptions.setOptions(options);
        this.selectedColor = this.chartOptions.defaultColor;
        if (this.chartOptions.colors.indexOf(this.selectedColor) === -1) {
            this.chartOptions.colors.push(this.selectedColor);
        }
        this.colorPickerElem = select(this.renderTarget).classed("tsi-colorPicker", true);
        this.colorPickerElem.text('');
        _super.prototype.themify.call(this, this.colorPickerElem, this.chartOptions.theme);
        // color selection button
        var colorPickerButton = this.colorPickerElem.append('button').classed("tsi-colorPickerButton", true)
            .attr("title", this.getString('Select color'))
            .attr("aria-label", (this.selectedColor ? this.selectedColor : this.getString('No color')) + ' ' + this.getString('Select color'))
            .attr("aria-controls", "tsi-colorGrid_" + this.componentId)
            .on('click', function () {
            if (_this.isColorGridVisible) {
                _this.hideColorGrid(true);
            }
            else {
                _this.chartOptions.onClick(event);
                _this.showColorGrid();
            }
        });
        if (this.selectedColor) {
            colorPickerButton.append('div').classed("tsi-selectedColor", true).style("background-color", this.selectedColor);
        }
        else {
            colorPickerButton.append('div').classed("tsi-selectedColor", true).classed("tsi-noColor", true);
        }
        colorPickerButton.append('span').classed("tsi-selectedColorValue", true).classed("hidden", this.chartOptions.isColorValueHidden)
            .attr("id", "tsi-selectedColorValue_" + this.componentId)
            .text(this.selectedColor ? this.selectedColor : this.getString('No color'));
        // color grid
        var colorGridElem = this.colorPickerElem.append('div').classed("tsi-colorGrid", true).attr("id", "tsi-colorGrid_" + this.componentId).attr("role", "grid");
        var colorGridRowElem = colorGridElem.append('div').classed("tsi-colorGridRow", true).attr("role", "row");
        this.chartOptions.colors.forEach(function (c, idx) {
            var gridItem = colorGridRowElem.append('div').classed("tsi-colorItem", true).classed("tsi-selected", c === _this.selectedColor)
                .attr("tabindex", 0)
                .attr("role", "gridcell")
                .attr("aria-label", c)
                .attr("aria-selected", c === _this.selectedColor)
                .style("background-color", c)
                .on('click', function () {
                event.preventDefault();
                event.stopPropagation();
                _this.chartOptions.onSelect(c);
                _this.hideColorGrid(true);
                _this.setSelectedColor(c, gridItem);
            })
                .on('keydown', function () {
                if (event.keyCode === KeyCodes.Tab && !event.shiftKey && idx === _this.chartOptions.colors.length - 1) { // tab
                    event.preventDefault();
                    _this.colorPickerElem.selectAll(".tsi-colorItem").nodes()[0].focus();
                }
                else if (event.keyCode === KeyCodes.Enter) {
                    event.preventDefault();
                    event.stopPropagation();
                    _this.chartOptions.onSelect(c);
                    _this.hideColorGrid(true);
                    _this.setSelectedColor(c, gridItem);
                }
                else if (event.keyCode === KeyCodes.Esc) {
                    event.preventDefault();
                    event.stopPropagation();
                    _this.hideColorGrid(true);
                }
            });
        });
        select("html").on("click." + this.componentId, function () {
            if (_this.colorPickerElem.select(".tsi-colorPickerButton").filter(Utils.equalToEventTarget).empty() &&
                _this.colorPickerElem.select(".tsi-colorPickerButton").selectAll("*").filter(Utils.equalToEventTarget).empty() &&
                _this.colorPickerElem.selectAll(".tsi-colorGrid").filter(Utils.equalToEventTarget).empty()) {
                _this.hideColorGrid();
            }
        });
    };
    return ColorPicker;
}(Component));

export default ColorPicker;
