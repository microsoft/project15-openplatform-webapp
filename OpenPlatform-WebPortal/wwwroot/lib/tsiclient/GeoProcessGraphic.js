import { a as __extends } from './Utils-e5be3308.js';
import 'd3';
import 'moment-timezone';
import ServerClient from './ServerClient.js';
import './EllipsisMenu.js';
import 'split.js';
import './ChartComponent-a7f89f69.js';
import './ChartDataOptions-59f6b399.js';
import './ChartVisualizationComponent-80709f0f.js';
import './TemporalXAxisComponent-f960f34b.js';
import './PlaybackControls.js';
import { H as HistoryPlayback } from './HistoryPlayback-2a2caaa3.js';
import { Map, AuthenticationType, source, Popup, HtmlMarker } from 'azure-maps-control';

var GeoProcessGraphic = /** @class */ (function (_super) {
    __extends(GeoProcessGraphic, _super);
    function GeoProcessGraphic(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.serverClient = new ServerClient();
        _this.currentCancelTrigger = null;
        return _this;
    }
    GeoProcessGraphic.prototype.render = function (environmentFqdn, getToken, data, chartOptions) {
        this.zoom = chartOptions.zoom;
        this.center = chartOptions.center;
        this.bearing = chartOptions.bearing;
        this.pitch = chartOptions.pitch;
        this.maxZoom = chartOptions.maxZoom;
        this.minZoom = chartOptions.minZoom;
        this.duration = chartOptions.duration;
        this.azureMapsSubscriptionKey = chartOptions.subscriptionKey;
        this.width = chartOptions.width;
        this.height = chartOptions.height;
        this.theme = chartOptions.theme;
        this.renderBase(environmentFqdn, getToken, data, chartOptions);
    };
    GeoProcessGraphic.prototype.loadResources = function () {
        var _this = this;
        this.component.node().style.width = this.width + "px";
        this.component.node().style.height = this.height + "px";
        this.map = new Map(this.component.node(), {
            authOptions: {
                authType: AuthenticationType.subscriptionKey,
                subscriptionKey: this.azureMapsSubscriptionKey
            }
        });
        this.map.events.add('ready', function () {
            _this.dataSource = new source.DataSource();
            _this.map.sources.add(_this.dataSource);
            var _loop_1 = function (i) {
                var popup = new Popup({
                    content: "<div class = 'tsi-gpgPopUp id= tsi-popup" + i + "'></div>",
                    pixelOffset: [0, -30]
                });
                var marker = new HtmlMarker({
                    htmlContent: "<div class = tsi-geoprocess-graphic> <img class='tsi-gpgcircleImage \n          id= tsi-htmlMarker" + i + "' src= \"" + _this.tsqExpressions[i].image + '" /> </div>',
                    position: [0, 0],
                    popup: popup
                });
                _this.map.markers.add(marker);
                _this.map.popups.add(popup);
                _this.map.events.add('click', marker, function () {
                    marker.togglePopup();
                });
            };
            for (var i = 0; i < _this.tsqExpressions.length; i++) {
                _loop_1(i);
            }
        });
        this.map.setCamera({
            center: this.center,
            bearing: this.bearing,
            pitch: this.pitch,
            zoom: this.zoom,
            maxZoom: this.maxZoom,
            minZoom: this.minZoom,
            type: "fly",
            duration: this.duration
        });
        return Promise.resolve();
    };
    GeoProcessGraphic.prototype.draw = function () {
        this.drawBase();
    };
    GeoProcessGraphic.prototype.getDataPoints = function (results) {
        var _this = this;
        var dataPoints = results.map(function (r) {
            return _this.parseTsqResponse(r);
        });
        this.updateDataMarkers(dataPoints);
    };
    GeoProcessGraphic.prototype.parseTsqResponse = function (response) {
        var parsedResponse = {};
        if (response && response.properties) {
            for (var i = 0; i < response.properties.length; i++) {
                response.properties[i] && response.properties[i].name && response.properties[i].values ?
                    parsedResponse[response.properties[i].name] = response.properties[i].values[0]
                    : null;
            }
        }
        return parsedResponse;
    };
    GeoProcessGraphic.prototype.updateDataMarkers = function (dataPoints) {
        for (var i = 0; i < dataPoints.length; i++) {
            var lat = dataPoints[i][this.tsqExpressions[i].positionXVariableName];
            var lon = dataPoints[i][this.tsqExpressions[i].positionYVariableName];
            this.map.markers.getMarkers()[i].setOptions({
                position: [lat, lon]
            });
            var dataPointArr = Object.entries(dataPoints[i]);
            this.map.popups.getPopups()[i].setOptions({
                position: [lat, lon],
                content: this.createTable(dataPointArr, i)
            });
        }
    };
    GeoProcessGraphic.prototype.createTable = function (dataPointArr, idx) {
        var gpgTooltipDiv = document.createElement('div');
        gpgTooltipDiv.className = 'tsi-gpgTooltip tsi-' + this.theme;
        var gpgTooltipInnerDiv = document.createElement('div');
        gpgTooltipInnerDiv.className = 'tsi-gpgTooltipInner';
        var gpgTooltipTitleDiv = document.createElement('div');
        gpgTooltipTitleDiv.className = 'tsi-gpgTooltipTitle';
        var title = document.createTextNode(this.tsqExpressions[idx].alias);
        gpgTooltipTitleDiv.appendChild(title);
        var gpgTooltipTable = document.createElement('table');
        gpgTooltipTable.className = 'tsi-gpgTooltipValues';
        gpgTooltipTable.classList.add('tsi-gpgTooltipTable');
        for (var i = 0; i < dataPointArr.length; i++) {
            var spacer = document.createElement('tr');
            spacer.className = 'tsi-gpgTableSpacer';
            gpgTooltipTable.appendChild(spacer);
            var gpgTooltipValueRow = document.createElement('tr');
            var gpgValueLabelCell = document.createElement('td');
            gpgValueLabelCell.className = 'tsi-gpgValueLabel';
            var labelName = document.createTextNode(dataPointArr[i][0]);
            gpgValueLabelCell.appendChild(labelName);
            gpgTooltipValueRow.appendChild(gpgValueLabelCell);
            var gpgValueCell = document.createElement('td');
            gpgValueCell.className = 'tsi-gpgValueCell';
            var cellData = document.createTextNode(dataPointArr[i][1].toFixed(5));
            gpgValueCell.appendChild(cellData);
            gpgTooltipValueRow.appendChild(gpgValueCell);
            gpgTooltipTable.appendChild(gpgTooltipValueRow);
        }
        gpgTooltipInnerDiv.appendChild(gpgTooltipTitleDiv);
        gpgTooltipInnerDiv.appendChild(gpgTooltipTable);
        gpgTooltipDiv.appendChild(gpgTooltipInnerDiv);
        return gpgTooltipDiv;
    };
    return GeoProcessGraphic;
}(HistoryPlayback));

export default GeoProcessGraphic;
