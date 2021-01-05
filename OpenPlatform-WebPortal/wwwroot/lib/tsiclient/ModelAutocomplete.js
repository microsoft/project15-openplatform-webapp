import { a as __extends, U as Utils, b as Component, g as ChartOptions } from './Utils-e5be3308.js';
import { select, event } from 'd3';
import 'moment-timezone';
import ServerClient from './ServerClient.js';
import 'awesomplete';

var ModelAutocomplete = /** @class */ (function (_super) {
    __extends(ModelAutocomplete, _super);
    function ModelAutocomplete(renderTarget) {
        var _this = _super.call(this, renderTarget) || this;
        _this.chartOptions = new ChartOptions(); // TODO handle onkeyup and oninput in chart options
        _this.server = new ServerClient();
        return _this;
    }
    ModelAutocomplete.prototype.render = function (environmentFqdn, getToken, chartOptions) {
        var _this = this;
        this.chartOptions.setOptions(chartOptions);
        var targetElement = select(this.renderTarget);
        targetElement.html('');
        var wrapper = targetElement.append('div').attr('class', 'tsi-modelAutocompleteWrapper');
        _super.prototype.themify.call(this, wrapper, this.chartOptions.theme);
        var inputWrapper = wrapper.append("div")
            .attr("class", "tsi-search");
        inputWrapper.append('i').classed('tsi-search-icon', true);
        var input = inputWrapper.append("input")
            .attr("class", "tsi-searchInput")
            .attr("aria-label", this.getString("Search Time Series Instances"))
            .attr("aria-describedby", "tsi-search-desc")
            .attr("role", "combobox")
            .attr("aria-owns", "tsi-search-results")
            .attr("aria-expanded", "false")
            .attr("aria-haspopup", "listbox")
            .attr("placeholder", this.getString("Search Time Series Instances") + '...');
        var clear = inputWrapper.append('div').attr('class', 'tsi-clear')
            .attr("tabindex", "0").attr("role", "button")
            .attr("aria-label", "Clear Search")
            .on('click keydown', function () {
            if (Utils.isKeyDownAndNotEnter(event)) {
                return;
            }
            input.node().value = '';
            noSuggest = true;
            input.dispatch('input');
            self.ap.close();
            select(this).classed('tsi-shown', false);
        });
        inputWrapper.append('span').attr("id", "tsi-search-desc").style("display", "none").text(this.getString("Search suggestion instruction"));
        inputWrapper.append('div').attr("class", "tsi-search-results-info").attr("aria-live", "assertive");
        var Awesomplete = window.Awesomplete;
        this.ap = new Awesomplete(input.node(), { minChars: 1 });
        var noSuggest = false;
        var justAwesompleted = false;
        input.node().addEventListener('awesomplete-selectcomplete', function (event) { noSuggest = true; input.dispatch('input'); _this.ap.close(); justAwesompleted = true; });
        input.on('keydown', function () {
            _this.chartOptions.onKeydown(event, _this.ap);
        });
        input.node().addEventListener('keyup', function (event) {
            if (justAwesompleted) {
                justAwesompleted = false;
                return;
            }
            var key = event.which || event.keyCode;
            if (key === 13) {
                noSuggest = true;
                input.dispatch('input');
            }
        });
        var searchText;
        var self = this;
        input.on('input', function () {
            searchText = this.value;
            if (searchText.replace(/ /g, '') && !noSuggest) {
                getToken().then(function (token) {
                    self.server.getTimeseriesInstancesSuggestions(token, environmentFqdn, searchText).then(function (r) {
                        self.ap.list = r.suggestions.map(function (s) { return s.searchString; });
                        self.ap.ul.setAttribute("role", "listbox");
                        self.ap.ul.setAttribute("tabindex", "0");
                        self.ap.ul.setAttribute("id", "tsi-search-results");
                        self.ap.ul.querySelectorAll("li").forEach(function (li) { li.setAttribute("role", "option"); li.setAttribute("tabindex", "-1"); });
                        var liveAria = document.getElementsByClassName("tsi-search-results-info")[0];
                        liveAria.innerText = self.ap.suggestions && self.ap.suggestions.length ? self.ap.suggestions.length + self.getString("Search suggestions available") : self.getString("No results");
                        setTimeout(function () {
                            liveAria.innerText = '';
                        }, 1000);
                    });
                });
            }
            else {
                self.ap.close();
            }
            self.chartOptions.onInput(searchText, noSuggest ? { which: 13 } : event);
            noSuggest = false;
            clear.classed('tsi-shown', searchText.length);
        });
    };
    return ModelAutocomplete;
}(Component));

export default ModelAutocomplete;
