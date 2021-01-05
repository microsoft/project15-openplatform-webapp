import { a as __extends, U as Utils } from './Utils-e5be3308.js';
import { C as ChartComponent } from './ChartComponent-a7f89f69.js';
import { C as ChartDataOptions } from './ChartDataOptions-59f6b399.js';

var ChartVisualizationComponent = /** @class */ (function (_super) {
    __extends(ChartVisualizationComponent, _super);
    function ChartVisualizationComponent(renderTarget) {
        return _super.call(this, renderTarget) || this;
    }
    ChartVisualizationComponent.prototype.render = function (data, options, aggregateExpressionOptions) {
        this.data = Utils.standardizeTSStrings(data);
        this.chartOptions.setOptions(options);
        this.aggregateExpressionOptions = data.map(function (d, i) {
            return Object.assign(d, aggregateExpressionOptions && i in aggregateExpressionOptions ?
                new ChartDataOptions(aggregateExpressionOptions[i]) :
                new ChartDataOptions({}));
        });
    };
    return ChartVisualizationComponent;
}(ChartComponent));

export { ChartVisualizationComponent as C };
