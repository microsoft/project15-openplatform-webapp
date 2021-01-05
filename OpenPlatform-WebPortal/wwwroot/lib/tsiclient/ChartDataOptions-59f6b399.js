import { m as InterpolationFunctions, U as Utils, D as DataTypes, c as EventElementTypes } from './Utils-e5be3308.js';

var DEFAULT_HEIGHT = 40;
// Represents an expression that is suitable for use as the expression options parameter in a chart component
var ChartDataOptions = /** @class */ (function () {
    function ChartDataOptions(optionsObject) {
        this.interpolationFunction = InterpolationFunctions.None;
        this.yExtent = null;
        this.includeEnvelope = false;
        this.includeDots = false;
        this.visibilityState = null;
        this.connectPoints = false;
        this.pointConnectionMeasure = '';
        this.searchSpan = Utils.getValueOrDefault(optionsObject, 'searchSpan');
        this.measureTypes = Utils.getValueOrDefault(optionsObject, 'measureTypes');
        this.color = Utils.getValueOrDefault(optionsObject, 'color');
        this.alias = Utils.getValueOrDefault(optionsObject, 'alias');
        this.contextMenu = Utils.getValueOrDefault(optionsObject, 'contextMenu', []);
        this.interpolationFunction = Utils.getValueOrDefault(optionsObject, 'interpolationFunction', InterpolationFunctions.None);
        this.includeEnvelope = Utils.getValueOrDefault(optionsObject, 'includeEnvelope', false);
        this.includeDots = Utils.getValueOrDefault(optionsObject, 'includeDots', false);
        this.visibilityState = Utils.getValueOrDefault(optionsObject, 'visibilityState');
        this.yExtent = Utils.getValueOrDefault(optionsObject, 'yExtent');
        this.timeShift = Utils.getValueOrDefault(optionsObject, 'timeShift', '');
        this.dataType = Utils.getValueOrDefault(optionsObject, 'dataType', DataTypes.Numeric);
        this.valueMapping = Utils.getValueOrDefault(optionsObject, 'valueMapping', {});
        this.height = Utils.getValueOrDefault(optionsObject, 'height', DEFAULT_HEIGHT);
        this.onElementClick = Utils.getValueOrDefault(optionsObject, 'onElementClick', null);
        this.eventElementType = Utils.getValueOrDefault(optionsObject, 'eventElementType', EventElementTypes.Diamond);
        this.rollupCategoricalValues = Utils.getValueOrDefault(optionsObject, 'rollupCategoricalValues', false);
        this.tooltipAttributes = Utils.getValueOrDefault(optionsObject, 'tooltipAttributes', []);
        this.positionX = Utils.getValueOrDefault(optionsObject, 'positionX', 0);
        this.positionY = Utils.getValueOrDefault(optionsObject, 'positionY', 0);
        this.swimLane = Utils.getValueOrDefault(optionsObject, 'swimLane', null);
        this.variableAlias = Utils.getValueOrDefault(optionsObject, 'variableAlias', null);
        this.connectPoints = Utils.getValueOrDefault(optionsObject, "connectPoints", false);
        this.pointConnectionMeasure = Utils.getValueOrDefault(optionsObject, 'pointConnectionMeasure', '');
        this.positionXVariableName = Utils.getValueOrDefault(optionsObject, 'positionXVariableName', null);
        this.positionYVariableName = Utils.getValueOrDefault(optionsObject, 'positionYVariableName', null);
        this.image = Utils.getValueOrDefault(optionsObject, 'image', null);
        this.startAt = Utils.getValueOrDefault(optionsObject, 'startAt', null);
        this.isRawData = Utils.getValueOrDefault(optionsObject, 'isRawData', false);
        this.isVariableAliasShownOnTooltip = Utils.getValueOrDefault(optionsObject, 'isVariableAliasShownOnTooltip', true);
    }
    return ChartDataOptions;
}());

export { ChartDataOptions as C };
