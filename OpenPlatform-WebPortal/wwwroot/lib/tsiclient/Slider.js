import { a as __extends, U as Utils, b as Component } from './Utils-e5be3308.js';
import { select, scalePoint, drag, event } from 'd3';
import 'moment-timezone';

var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    function Slider(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.sliderSVG = null;
        _this.sliderTextDiv = null;
        _this.margins = {
            left: 60,
            right: 60
        };
        _this.height = 55;
        _this.setSelectedLabelAndGetLabelAction = function (h, useFirstValue) {
            if (useFirstValue === void 0) { useFirstValue = false; }
            //find the closest time and set position to that
            var reduceFirstValue = useFirstValue ? _this.data[0] : { label: _this.selectedLabel, action: function () { } };
            var newSelectedLabel = _this.data.reduce(function (prev, curr) {
                var currDiff = Math.abs(_this.getXPositionOfLabel(curr.label) - h);
                var prevDiff = Math.abs(_this.getXPositionOfLabel(prev.label) - h);
                return (currDiff < prevDiff) ? curr : prev;
            }, reduceFirstValue);
            _this.selectedLabel = (newSelectedLabel != null) ? newSelectedLabel.label : _this.selectedLabel;
            return newSelectedLabel;
        };
        _this.setSliderTextDivLabel = function () {
            _this.sliderTextDiv.attr("aria-label", function () {
                return _this.getString("Currently displayed time is") + ' ' + _this.selectedLabel + ". " +
                    _this.getString("Left arrow to go back in time") + ", " + _this.getString("right arrow to go forward");
            });
        };
        return _this;
    }
    Slider.prototype.Slider = function () {
    };
    Slider.prototype.getXPositionOfLabel = function (label) {
        if (this.data.map(function (d) { return d.label; }).indexOf(label) != -1) {
            return this.xScale(label);
        }
        // find approximate position if ascending time periods and label is a time label as well
        if ((Utils.parseTimeInput(label) > -1) && this.isAscendingTimePeriods && this.data.length > 1) {
            var labelMillis = Utils.parseTimeInput(label);
            for (var i = 0; i < this.data.length; i++) {
                if (Utils.parseTimeInput(this.data[i].label) > labelMillis) {
                    return (this.xScale(this.data[i].label) + this.xScale(this.data[Math.max(i - 1, 0)].label)) / 2;
                }
            }
            return this.xScale(this.data[this.data.length - 1].label);
        }
        return 0;
    };
    Slider.prototype.determineIfAscendingTimePeriods = function () {
        var left = this.data.length > 0 ? Utils.parseTimeInput(this.data[0].label) : -1;
        var isAscending = left !== -1;
        for (var i = 0; isAscending && i < this.data.length - 1; i++) {
            isAscending = left < (left = Utils.parseTimeInput(this.data[i + 1].label));
        }
        return isAscending;
    };
    Slider.prototype.render = function (data, options, width, selectedLabel) {
        var _this = this;
        if (selectedLabel === void 0) { selectedLabel = null; }
        this.chartOptions.setOptions(options);
        this.data = data;
        this.isAscendingTimePeriods = this.determineIfAscendingTimePeriods();
        this.width = width;
        var marginsTotal = this.margins.left + this.margins.right;
        this.sliderWidth = width - marginsTotal;
        var targetElement = select(this.renderTarget);
        if (targetElement.style("position") == "static")
            targetElement.style("position", "relative");
        if (selectedLabel)
            this.selectedLabel = selectedLabel;
        this.xScale = scalePoint()
            .domain(data.map(function (d) { return d.label; }))
            .range([0, this.sliderWidth]);
        width = Math.max(width, marginsTotal);
        var self = this;
        if (this.sliderSVG == null) {
            this.sliderSVG = targetElement.append("svg")
                .attr("class", "tsi-sliderComponent");
            var slider = this.sliderSVG.append("g")
                .attr("class", "slider tsi-sliderG");
            slider.append("line")
                .attr("class", "slider-track tsi-sliderTrack")
                .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("class", "track-overlay tsi-sliderTrackOverlay")
                .call(drag()
                .on("start.interrupt", function () { slider.interrupt(); })
                .on("start drag", function (d) {
                self.onDrag(event.x);
            })
                .on("end", function (d) {
                self.onDragEnd(event.x);
            }));
            slider.insert("circle", ".track-overlay")
                .attr("class", "handle tsi-sliderHandle")
                .attr("r", 6);
            this.sliderTextDiv = targetElement.append("div")
                .attr("class", "tsi-sliderLabel")
                .attr("tabindex", 0)
                .attr("aria-label", selectedLabel)
                .on("keydown", function () {
                if (event.keyCode == 37) {
                    _this.moveLeft();
                }
                if (event.keyCode == 39) {
                    _this.moveRight();
                }
            });
        }
        this.themify(this.sliderSVG, this.chartOptions.theme);
        this.sliderSVG.attr("width", width + "px");
        var slider = this.sliderSVG.select(".tsi-sliderG")
            .attr("transform", "translate(" + this.margins.left + "," + (this.height / 2) + ")");
        slider.select(".tsi-sliderTrack")
            .attr("x1", 0)
            .attr("x2", this.sliderWidth)
            .attr("y1", 0)
            .attr("y2", 0);
        slider.select(".tsi-sliderTrackOverlay")
            .attr("x1", -20)
            .attr("x2", this.sliderWidth + 20)
            .attr("y1", 0)
            .attr("y2", 0);
        this.setStateFromLabel();
    };
    Slider.prototype.remove = function () {
        if (this.sliderSVG)
            this.sliderSVG.remove();
        this.sliderSVG = null;
        if (this.sliderTextDiv)
            this.sliderTextDiv.remove();
    };
    Slider.prototype.onDrag = function (h) {
        // find the closest time and set position to that
        var newSelectedLabel = this.setSelectedLabelAndGetLabelAction(h);
        if (!this.chartOptions.throttleSlider) {
            newSelectedLabel.action(newSelectedLabel.label);
        }
        this.setStateFromLabel();
    };
    Slider.prototype.onDragEnd = function (h) {
        if (this.chartOptions.throttleSlider) {
            var newSelectedLabel = this.setSelectedLabelAndGetLabelAction(h, true);
            newSelectedLabel.action(newSelectedLabel.label);
        }
    };
    //set the position of the slider and text, and set the text, given a label
    Slider.prototype.setStateFromLabel = function () {
        this.sliderSVG.select(".handle").attr("cx", this.getXPositionOfLabel(this.selectedLabel));
        this.sliderTextDiv.text(this.selectedLabel);
        this.setSliderTextDivLabel();
        //adjust until center lines up with 
        var centerDivOffset = this.sliderTextDiv.node().getBoundingClientRect().width / 2;
        this.sliderTextDiv.style("right", (this.width - (this.margins.right + this.getXPositionOfLabel(this.selectedLabel))) - centerDivOffset + "px");
    };
    Slider.prototype.moveLeft = function () {
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].label == this.selectedLabel) {
                var newI = Math.max(0, i - 1);
                this.selectedLabel = this.data[newI].label;
                this.data[newI].action(this.selectedLabel);
                this.setStateFromLabel();
                return;
            }
        }
    };
    Slider.prototype.moveRight = function () {
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].label == this.selectedLabel) {
                var newI = Math.min(this.data.length - 1, i + 1);
                this.selectedLabel = this.data[newI].label;
                this.data[newI].action(this.selectedLabel);
                this.setStateFromLabel();
                return;
            }
        }
    };
    return Slider;
}(Component));

export default Slider;
