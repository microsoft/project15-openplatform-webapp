using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using OpenPlatform_WebPortal.Models;

namespace OpenPlatform_WebPortal.Controllers
{
    public class TsiController : Controller
    {
        private readonly ILogger<TsiController> _logger;
        private readonly AppSettings _appSettings;

        public TsiController(IOptions<AppSettings> optionsAccessor, ILogger<TsiController> logger)
        {
            _logger = logger;
            _appSettings = optionsAccessor.Value;
        }

        [HttpGet]
        public async Task<IActionResult> GetTsiToken()
        {
            try
            {
                var authContext = new AuthenticationContext($"https://login.microsoftonline.com/{_appSettings.TimeSeriesInsights.tenantId}");
                AuthenticationResult result = await authContext.AcquireTokenAsync("https://api.timeseries.azure.com/",
                    new ClientCredential(_appSettings.TimeSeriesInsights.clientId, _appSettings.TimeSeriesInsights.tsiSecret));

                return Ok(result.AccessToken);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}
