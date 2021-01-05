import { a as __extends, b as Component } from './Utils-e5be3308.js';
import { select } from 'd3';

var Tooltip = /** @class */ (function (_super) {
    __extends(Tooltip, _super);
    function Tooltip(renderTarget) {
        return _super.call(this, renderTarget) || this;
    }
    Tooltip.prototype.hide = function () {
        if (this.tooltipDiv) {
            this.tooltipDiv.style("display", "none");
        }
    };
    Tooltip.prototype.getSVGWidth = function () {
        return !this.renderTarget.select('.tsi-chartSVG').empty() ? this.renderTarget.select('.tsi-chartSVG').node().getBoundingClientRect().width : 0;
    };
    Tooltip.prototype.getSVGHeight = function () {
        return !this.renderTarget.select('.tsi-chartSVG').empty() ? this.renderTarget.select('.tsi-chartSVG').node().getBoundingClientRect().height : 0;
    };
    Tooltip.prototype.getLeftOffset = function (chartMargins) {
        //NOTE - this assumes that the svg's right border is the same as the render target's
        var renderTargetWidth = this.renderTarget.node().getBoundingClientRect().width;
        return (renderTargetWidth - this.getSVGWidth() + chartMargins.left);
    };
    Tooltip.prototype.getTopOffset = function (chartMargins) {
        //NOTE - this assumes that the svg's bottom border is the same as the render target's
        var renderTargetHeight = this.renderTarget.node().getBoundingClientRect().height;
        return (renderTargetHeight - this.getSVGHeight() + chartMargins.top);
    };
    Tooltip.prototype.isRightOffset = function (tooltipWidth, xPos, chartMarginLeft) {
        //NOTE - this assumes that the svg's right border is the same as the render target's
        var renderTargetWidth = this.renderTarget.node().getBoundingClientRect().width;
        return this.getSVGWidth() > (xPos + tooltipWidth + 20 + chartMarginLeft);
    };
    Tooltip.prototype.isTopOffset = function (tooltipHeight, yPos, chartMargins) {
        //NOTE - this assumes that the svg's bottom border is the same as the render target's
        var renderTargetHeight = this.renderTarget.node().getBoundingClientRect().height;
        var tooltipYPos = yPos + tooltipHeight + 20 + chartMargins.bottom + this.getTopOffset(chartMargins);
        return renderTargetHeight > tooltipYPos;
    };
    Tooltip.prototype.render = function (theme) {
        var _this = this;
        var self = this;
        var tooltip = this.renderTarget.selectAll('.tsi-tooltip').filter(function () {
            return (this.parentNode === self.renderTarget.node());
        }).data([theme]);
        this.tooltipDiv = tooltip.enter().append('div')
            .attr('class', 'tsi-tooltip')
            .merge(tooltip)
            .each(function (d) {
            select(this).selectAll("*").remove();
            self.tooltipDivInner = select(this).append('div')
                .attr('class', 'tsi-tooltipInner');
        });
        tooltip.exit().remove();
        _super.prototype.themify.call(this, this.tooltipDiv, theme);
        // Element width is an optional parameter which ensures that the tooltip doesn't interfere with the element
        // when positioning to the right
        this.draw = function (d, chartComponentData, xPos, yPos, chartMargins, addText, elementWidth, xOffset, yOffset, borderColor, isFromMarker) {
            if (elementWidth === void 0) { elementWidth = null; }
            if (xOffset === void 0) { xOffset = 20; }
            if (yOffset === void 0) { yOffset = 20; }
            if (borderColor === void 0) { borderColor = null; }
            if (isFromMarker === void 0) { isFromMarker = false; }
            _this.tooltipDiv.style("display", "block");
            _this.tooltipDivInner.text(null);
            _this.borderColor = borderColor;
            var leftOffset = isFromMarker ? 0 : _this.getLeftOffset(chartMargins);
            var topOffset = _this.getTopOffset(chartMargins);
            addText(_this.tooltipDivInner);
            _this.tooltipDiv.style("left", Math.round(xPos + leftOffset) + "px")
                .style("top", Math.round(yPos) + topOffset + "px");
            var tooltipWidth = _this.tooltipDiv.node().getBoundingClientRect().width;
            var tooltipHeight = _this.tooltipDiv.node().getBoundingClientRect().height;
            var translateX = _this.isRightOffset(tooltipWidth, xPos, chartMargins.left) ? xOffset :
                (-Math.round(tooltipWidth) - xOffset - (elementWidth !== null ? elementWidth : 0));
            translateX = Math.max(0 - xPos, translateX);
            var translateY = 0;
            if (_this.isTopOffset(tooltipHeight, yPos, chartMargins)) { // Place tooltip @ bottom of point
                translateY = yOffset;
            }
            else {
                if (!isFromMarker && Math.round(yPos) - yOffset + topOffset - Math.round(tooltipHeight) <= 0) { // Upper bound check to keep tooltip within chart
                    translateY = -(Math.round(yPos) + topOffset);
                }
                else {
                    translateY = (-Math.round(tooltipHeight) - yOffset); // Place tooltip @ top of point
                }
            }
            _this.tooltipDiv.style("transform", "translate(" + translateX + "px," + translateY + "px)");
            if (_this.borderColor) {
                _this.tooltipDivInner.style('border-left-color', _this.borderColor)
                    .style('border-left-width', '5px');
            }
            else {
                _this.tooltipDivInner.style('border-left-width', '0');
            }
        };
    };
    return Tooltip;
}(Component));

export { Tooltip as T };
