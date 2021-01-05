import { a as __extends, b as Component } from './Utils-e5be3308.js';
import { event, select } from 'd3';
import 'moment-timezone';

var EllipsisMenu = /** @class */ (function (_super) {
    __extends(EllipsisMenu, _super);
    function EllipsisMenu(renderTarget) {
        return _super.call(this, renderTarget) || this;
    }
    EllipsisMenu.prototype.createIconPath = function (iconName, theme) {
        var supportedNames = ["flag", "grid", "download"];
        return (supportedNames.indexOf(iconName) != -1) ? iconName + "Icon" : "";
    };
    EllipsisMenu.prototype.setMenuVisibility = function (isVisible) {
        this.menuIsVisible = isVisible;
        this.containerElement.classed("tsi-ellipsisMenuShown", this.menuIsVisible);
    };
    EllipsisMenu.prototype.focusOnMenuItem = function (itemIndex) {
        if (itemIndex === void 0) { itemIndex = 0; }
        itemIndex = (itemIndex + this.menuItems.length) % this.menuItems.length;
        var menuItem = this.menuElement.selectAll(".tsi-ellipsisMenuItem").filter(function (d, i) {
            return (itemIndex === i);
        });
        menuItem.node().focus();
    };
    EllipsisMenu.prototype.menuItemKeyHandler = function (d, i) {
        switch (event.keyCode) {
            case 9: //tab
                this.focusOnMenuItem(i + 1);
                event.preventDefault();
                break;
            case 27: //escape
                this.setMenuVisibility(false);
                this.buttonElement.node().focus();
                event.preventDefault();
                break;
            case 38: // up arrow
                this.focusOnMenuItem(i - 1);
                event.preventDefault();
                break;
            case 40: // down arrow
                this.focusOnMenuItem(i + 1);
                event.preventDefault();
                break;
        }
    };
    EllipsisMenu.prototype.render = function (menuItems, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.menuIsVisible = false;
        this.chartOptions.setOptions(options);
        this.containerElement = select(this.renderTarget).classed("tsi-ellipsisMenuContainer", true);
        this.setMenuItems(menuItems);
        select(this.renderTarget).selectAll("*").remove();
        _super.prototype.themify.call(this, this.containerElement, this.chartOptions.theme);
        var self = this;
        this.buttonElement = select(this.renderTarget).insert("button")
            .attr("class", "tsi-ellipsisButton")
            .attr("aria-label", this.getString("Show ellipsis menu"))
            .attr("role", "menu")
            .attr("title", this.getString("Show ellipsis menu"))
            .attr("type", "button")
            .on("click", function () {
            select(this).attr("aria-label", !self.menuIsVisible ? self.getString("Show ellipsis menu") : self.getString("Hide ellipsis menu"))
                .attr("title", !self.menuIsVisible ? self.getString("Show ellipsis menu") : self.getString("Hide ellipsis menu"));
            self.setMenuVisibility(!self.menuIsVisible);
            if (self.menuIsVisible) {
                self.focusOnMenuItem(0);
            }
        });
        this.menuElement = select(this.renderTarget).insert("div")
            .attr("class", "tsi-ellipsisMenu");
        this.menuElement.selectAll(".tsi-ellipsisMenuItem").data(this.menuItems)
            .enter()
            .append("button")
            .classed("tsi-ellipsisMenuItem", true)
            .attr("aria-label", function (d) { return d.label; })
            .attr("type", "button")
            .attr("role", "menuitem")
            .on('keydown', function (d, i) { _this.menuItemKeyHandler(d, i); })
            .on("click", function (d) {
            d.action();
        })
            .each(function () {
            select(this)
                .append("div")
                .attr("class", function (d) { return "tsi-ellipsisMenuIcon " + self.createIconPath(d.iconClass, self.chartOptions.theme); });
            select(this)
                .append("div")
                .classed("tsi-ellipsisMenuLabel", true)
                .text(function (d) { return d.label; });
            select(this)
                .append("div")
                .classed("tsi-ellipsisMenuDescription", true)
                .style("display", "none");
        });
    };
    EllipsisMenu.prototype.setMenuItems = function (rawMenuItems) {
        this.menuItems = rawMenuItems.reduce(function (menuItems, currMenuItem) {
            menuItems.push({
                iconClass: currMenuItem.iconClass,
                label: currMenuItem.label,
                action: currMenuItem.action,
                description: currMenuItem.description
            });
            return menuItems;
        }, []);
    };
    return EllipsisMenu;
}(Component));

export default EllipsisMenu;
