using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Azure.Devices;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Portal.Helper;
using Portal.Models;

namespace Portal.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppSettings _appSettings;
        private readonly IIoTHubHelper _helper;

        public HomeController(IOptions<AppSettings> optionsAccessor, ILogger<HomeController> logger, IIoTHubHelper helper)
        {
            _logger = logger;
            _appSettings = optionsAccessor.Value;
            _helper = helper;
            _logger.LogInformation("HomeController");
//            ViewData["IoTHubName"] = _helper.GetIoTHubName(_appSettings.IoTHub.ConnectionString);
        }

        public async Task<IActionResult> Index()
        {
            HomeViewModel homeView = new HomeViewModel();
            homeView.deviceList = await _helper.GetDevices();
            ViewData["IoTHubName"] = _helper.GetIoTHubName(_appSettings.IoTHub.ConnectionString);
            ViewData["mapKey"] = _appSettings.AzureMap.MapKey.ToString();
            ViewData["TsiClientId"] = _appSettings.TimeSeriesInsights.clientId.ToString();
            ViewData["TsiTenantId"] = _appSettings.TimeSeriesInsights.tenantId.ToString();
            ViewData["TsiUri"] = _appSettings.TimeSeriesInsights.tsiUri.ToString();
            ViewData["TsiSecret"] = _appSettings.TimeSeriesInsights.tsiSecret.ToString();
            ViewData["temperature"] = _appSettings.TimeSeriesInsights.temperatureName.ToString();
            ViewData["humidity"] = _appSettings.TimeSeriesInsights.humidityName.ToString();
            return View(homeView);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
