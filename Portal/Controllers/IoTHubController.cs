using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Permissions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Devices;
using Portal.Models;
using System.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Devices.Common.Exceptions;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Runtime.ConstrainedExecution;
using Portal.Helper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.Azure.Devices.Shared;

namespace Portal.Controllers
{
    public class IoTHubController : Controller
    {
        private readonly ILogger<IoTHubController> _logger;
        private readonly AppSettings _appSettings;
        private IIoTHubHelper _helper;

        public IoTHubController(IIoTHubHelper helper)
        {
            _helper = helper;
        }

        private IoTHubController(IIoTHubHelper helper, IOptions<AppSettings> optionsAccessor, ILogger<IoTHubController> logger)
        {
            _logger = logger;
            _appSettings = optionsAccessor.Value;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<ActionResult> GetDevice(string deviceId)
        {
            Device device = null;
            Twin twin = null;
            DEVICE_DATA deviceData = new DEVICE_DATA();

            try
            {
                device = await _helper.GetDevice(deviceId).ConfigureAwait(false);
                twin = await _helper.GetTwin(deviceId).ConfigureAwait(false);

                if (device == null)
                {
                    return BadRequest();
                }

                var jsonData = JsonConvert.SerializeObject(device);

                deviceData.deviceId = device.Id;
                deviceData.connectionState = device.ConnectionState.ToString();
                deviceData.status = device.Status.ToString();
                deviceData.authenticationType = device.Authentication.Type.ToString();
            
                if (device.Authentication.Type == AuthenticationType.Sas)
                {
                    deviceData.primaryKey = device.Authentication.SymmetricKey.PrimaryKey;
                    deviceData.secondaryKey = device.Authentication.SymmetricKey.SecondaryKey;
                }

                if (twin != null)
                {
                    JObject twinJson = (JObject)JsonConvert.DeserializeObject(twin.ToJson());

                    if (twinJson.ContainsKey("modelId"))
                    {
                        deviceData.modelId = twin.ModelId;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error {ex}");
            }

            return Json(deviceData);
        }

        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager?view=azure-dotnet
        [HttpPost]
        public async Task<bool> AddDevice(string deviceId)
        {

            return await _helper.AddDevice(deviceId);
        }

        [HttpPost]
        public async Task<Twin> SetModelId(string connectionString, string modelId)
        {
            return await _helper.SetModelId(connectionString, modelId);
        }

        [HttpPost]
        public async Task<ActionResult> ConnectDevice(string connectionString, string modelId)
        {
            Twin twin = await _helper.ConnectDevice(connectionString, modelId);
            return Json(twin.ToString());
        }

        [HttpPost]
        public async Task<ActionResult> SendTelemetry(string connectionString, string modelId)
        {
            
            Twin twin = await _helper.SendTelemetry(connectionString, modelId);
            return Json(twin.ToString());
        }

        [HttpGet]
        public async Task<ActionResult> GetTwin(string deviceId)
        {

            Twin twin = await _helper.GetTwin(deviceId);
            JObject twinJson = (JObject)JsonConvert.DeserializeObject(twin.ToJson());
            return Json(twinJson.ToString());
        }

        [HttpDelete]
        public async Task<bool> DeleteDevice(string deviceId)
        {
            return await _helper.DeleteDevice(deviceId);
        }
    }
}
