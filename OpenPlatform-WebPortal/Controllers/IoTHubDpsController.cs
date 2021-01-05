using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Provisioning.Service;
using Microsoft.Azure.Devices.Shared;
using Microsoft.Azure.DigitalTwins.Parser;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenPlatform_WebPortal.Helper;
using OpenPlatform_WebPortal.Models;
using static OpenPlatform_WebPortal.Models.IoTHubDPS;

namespace OpenPlatform_WebPortal.Controllers
{
    public class IoTHubDpsController : Controller
    {
        private const string _repositoryEndpoint = "https://devicemodels.azure.com";
        private readonly ILogger<IoTHubDpsController> _logger;
        private readonly AppSettings _appSettings;
        private string _gitToken;
        private string _modelRepoUrl;
        private IIoTHubDpsHelper _helper;

        public IoTHubDpsController(IIoTHubDpsHelper helper, IOptions<AppSettings> optionsAccessor)
        {
            _helper = helper;
            _appSettings = optionsAccessor.Value;
            _gitToken = _appSettings.GitHub.token;
            _modelRepoUrl = _appSettings.ModelRepository.repoUrl;
        }

        private IoTHubDpsController(IIoTHubDpsHelper helper, IOptions<AppSettings> optionsAccessor, ILogger<IoTHubDpsController> logger)
        {
            _logger = logger;
            _appSettings = optionsAccessor.Value;
        }

        public IActionResult Index()
        {
            return View();
        }

        /*************************************************************
        * IoT Hub
        *************************************************************/
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager?view=azure-dotnet
        #region IoTHub

        // Retrieve the specified Device object.
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.getdeviceasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_GetDeviceAsync_System_String
        //
        [HttpGet]
        public async Task<ActionResult> GetIoTHubDevice(string deviceId)
        {
            Device device = null;
            Twin twin = null;
            DEVICE_DATA deviceData = new DEVICE_DATA();
            deviceData.telemetry = new List<TELEMETRY_DATA>();

            // Retrieve device
            device = await _helper.GetIoTHubDevice(deviceId).ConfigureAwait(false);

            // Retrieve Deivce Twin for the device
            twin = await _helper.GetDeviceTwin(deviceId).ConfigureAwait(false);

            if (device == null || twin == null)
            {
                return BadRequest();
            }

            deviceData.deviceId = device.Id;
            deviceData.connectionState = device.ConnectionState.ToString();
            deviceData.status = device.Status.ToString();
            deviceData.authenticationType = device.Authentication.Type.ToString();

            if (device.Authentication.Type == AuthenticationType.Sas)
            {
                deviceData.primaryKey = device.Authentication.SymmetricKey.PrimaryKey;
                deviceData.secondaryKey = device.Authentication.SymmetricKey.SecondaryKey;
            }

            JObject twinJson = (JObject)JsonConvert.DeserializeObject(twin.ToJson());

            // Check if this is IoT Plug and Play device or not
            if (twinJson.ContainsKey("modelId"))
            {
                deviceData.deviceModelId = twin.ModelId;

                // Resolve Device Model
                var dtmiContent = string.Empty;
                try
                {
                    dtmiContent = await Resolve(deviceData.deviceModelId);
                }
                catch
                {
                    return Json(deviceData);
                }

                if (!string.IsNullOrEmpty(dtmiContent))
                {
                    /*
                     * Initialize Model Parser
                     */
                    ModelParser parser = new ModelParser();
                    parser.DtmiResolver = DtmiResolver;

                    /*
                     * Resolve IoT Plug and Play Model
                     */
                    var parsedDtmis = await parser.ParseAsync(new List<string> { dtmiContent });

                    /*
                     * Pick up telemetry
                     * */
                    var interfaces = parsedDtmis.Where(r => r.Value.EntityKind == DTEntityKind.Telemetry).ToList();
                    foreach (var dt in interfaces)
                    {
                        TELEMETRY_DATA data = new TELEMETRY_DATA();
                        DTTelemetryInfo telemetryInfo = dt.Value as DTTelemetryInfo;
                        if (telemetryInfo.DisplayName.Count > 0)
                        {
                            data.TelemetryDisplayName = telemetryInfo.DisplayName["en"];
                        }

                        if (telemetryInfo.SupplementalProperties.Count > 0)
                        {
                            if (telemetryInfo.SupplementalProperties.ContainsKey("unit"))
                            {
                                DTUnitInfo unitInfo = telemetryInfo.SupplementalProperties["unit"] as DTUnitInfo;
                                data.unit = unitInfo.Symbol;
                            }
                        }

                        data.dataType = telemetryInfo.Schema.EntityKind == DTEntityKind.Integer ? "Long" : "Double";
                        data.TelemetryName = telemetryInfo.Name;
                        //data.TelemetryType = telemetryInfo.Schema;
                        deviceData.telemetry.Add(data);
                    }
                }
            }
            return Json(deviceData);
        }

        // Register a new device with IoT Hub
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.adddeviceasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_AddDeviceAsync_Microsoft_Azure_Devices_Device_
        [HttpPost]
        public async Task<bool> AddIoTHubDevice(string deviceId)
        {
            return await _helper.AddIoTHubDevice(deviceId);
        }

        // Deletes a previously registered device from IoT Hub
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.removedeviceasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_RemoveDeviceAsync_Microsoft_Azure_Devices_Device_System_Threading_CancellationToken_
        [HttpDelete]
        public async Task<bool> DeleteIoTHubDevice(string deviceId)
        {
            return await _helper.DeleteIoTHubDevice(deviceId);
        }

        // Gets Twin from IotHub
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.gettwinasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_GetTwinAsync_System_String_
        [HttpGet]
        public async Task<ActionResult> GetDeviceTwin(string deviceId)
        {
            Twin twin = await _helper.GetDeviceTwin(deviceId);
            JObject twinJson = (JObject)JsonConvert.DeserializeObject(twin.ToJson());
            return Json(twinJson.ToString());
        }
        #endregion

        /*************************************************************
        * Device Provisioning Service (DPS)
        *************************************************************/
        #region DPS
        //
        // Retrieves individual entrollment info.
        // Supports Symmetric Key only.
        // To do : Add X.509 support
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.provisioning.service.provisioningserviceclient.createindividualenrollmentquery?view=azure-dotnet
        [HttpGet]
        public async Task<ActionResult> GetDpsEnrollment(string registrationId)
        {
            IndividualEnrollment enrollment;
            DPS_ENROLLMENT_DATA enrollmentData = new DPS_ENROLLMENT_DATA();

            try
            {
                // retrieve the enrollment
                enrollment = await _helper.GetDpsEnrollment(registrationId).ConfigureAwait(false);

                if (enrollment == null)
                {
                    _logger.LogWarning($"Individual enrollment {registrationId} not found");
                    return BadRequest();
                }

                AttestationMechanism attestationMechanism = await _helper.GetDpsAttestationMechanism(registrationId).ConfigureAwait(false);

                if (attestationMechanism == null)
                {
                    _logger.LogWarning($"Attestation Mechanism for {registrationId} not found");
                    return BadRequest();
                }

                if (attestationMechanism.Type.Equals(AttestationMechanismType.SymmetricKey))
                {
                    SymmetricKeyAttestation attestation = (SymmetricKeyAttestation)attestationMechanism.GetAttestation();
                    enrollmentData.registrationId = enrollment.RegistrationId;
                    enrollmentData.primaryKey = attestation.PrimaryKey;
                    enrollmentData.secondaryKey = attestation.SecondaryKey;
                    enrollmentData.status = enrollment.ProvisioningStatus.ToString();
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetEnrollment() : {e.Message}");
            }

            return Json(enrollmentData);
        }

        // Add a new individual enrollment
        // https://docs.microsoft.com/en-us/rest/api/iot-dps/createorupdateindividualenrollment
        [HttpPost]
        public async Task<bool> AddDpsEnrollment(string newRegistrationId)
        {
            return await _helper.AddDpsEnrollment(newRegistrationId);
        }

        // Delete a device enrollment record
        // https://docs.microsoft.com/en-us/rest/api/iot-dps/deleteindividualenrollment/deleteindividualenrollment
        [HttpDelete]
        public async Task<bool> DeleteDpsEnrollment(string registrationId)
        {
            return await _helper.DeleteDpsEnrollment(registrationId);
        }
        #endregion // DPS
        /*************************************************************
        * DTDL model resolution
        *************************************************************/
        #region DTDL
        private async Task<string> Resolve(string dtmi)
        {
            if (string.IsNullOrEmpty(dtmi))
            {
                return string.Empty;
            }

            // Apply model repository convention
            string dtmiPath = DtmiToPath(dtmi.ToString());

            if (string.IsNullOrEmpty(dtmiPath))
            {
                _logger.LogWarning($"Invalid DTMI: {dtmi}");
                return await Task.FromResult<string>(string.Empty);
            }

            string modelContent = string.Empty;

            // if private repo is provided, resolve model with private repo first.
            if (!string.IsNullOrEmpty(_modelRepoUrl))
            {
                modelContent = getModelContent(_modelRepoUrl, dtmiPath, _gitToken);
            }

            if (string.IsNullOrEmpty(modelContent))
            {
                modelContent = getModelContent("https://devicemodels.azure.com", dtmiPath, string.Empty);
            }

            return modelContent;
        }

        public async Task<IEnumerable<string>> DtmiResolver(IReadOnlyCollection<Dtmi> dtmis)
        {
            List<String> jsonLds = new List<string>();
            var wc = new WebClient();

            foreach (var dtmi in dtmis)
            {
                Console.WriteLine("Resolver looking for. " + dtmi);
                string model = dtmi.OriginalString.Replace(":", "/");
                model = (model.Replace(";", "-")).ToLower();
                if (!String.IsNullOrWhiteSpace(model))
                {
                    var dtmiContent = await Resolve(dtmi.OriginalString);
                    jsonLds.Add(dtmiContent);
                }
            }
            return jsonLds;
        }

        private string getModelContent(string repoUrl, string dtmiPath, string gitToken)
        {
            string modelContent = string.Empty;
            WebClient wc = new WebClient();
            Uri modelRepoUrl = new Uri(repoUrl);
            Uri fullPath = new Uri($"{modelRepoUrl}{dtmiPath}");
            string fullyQualifiedPath = fullPath.ToString();

            if (!string.IsNullOrEmpty(gitToken))
            {
                var token = $"token {gitToken}";
                wc.Headers.Add("Authorization", token);
            }

            try
            {
                modelContent = wc.DownloadString(fullyQualifiedPath);
            }
            catch (System.Net.WebException e)
            {
                _logger.LogError($"Exception in getModelContent() : {e.Message}");
            }

            return modelContent;
        }

        private static bool IsValidDtmi(string dtmi)
        {
            // Regex defined at https://github.com/Azure/digital-twin-model-identifier#validation-regular-expressions
            Regex rx = new Regex(@"^dtmi:[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?)*;[1-9][0-9]{0,8}$");
            return rx.IsMatch(dtmi);
        }

        private static string DtmiToPath(string dtmi)
        {
            if (!IsValidDtmi(dtmi))
            {
                return null;
            }
            // dtmi:com:example:Thermostat;1 -> dtmi/com/example/thermostat-1.json
            return $"/{dtmi.ToLowerInvariant().Replace(":", "/").Replace(";", "-")}.json";
        }

        [HttpGet]
        public async Task<ActionResult> GetCommand(string modelid)
        {
            List<COMMAND_DATA> commandData = new List<COMMAND_DATA>();

            try
            {
                var dtmiContent = await Resolve(modelid);

                if (!string.IsNullOrEmpty(dtmiContent))
                {
                    ModelParser parser = new ModelParser();
                    parser.DtmiResolver = DtmiResolver;
                    var parsedDtmis = await parser.ParseAsync(new List<string> { dtmiContent });

                    var interfaces = parsedDtmis.Where(r => r.Value.EntityKind == DTEntityKind.Command).ToList();

                    foreach (var dt in interfaces)
                    {
                        COMMAND_DATA data = new COMMAND_DATA();

                        DTCommandInfo commandInfo = dt.Value as DTCommandInfo;

                        if (commandInfo.DisplayName.Count > 0)
                        {
                            data.CommandDisplayName = commandInfo.DisplayName["en"];
                        }

                        if (commandInfo.Description.Count > 0)
                        {
                            data.CommandDescription = commandInfo.Description["en"];
                        }

                        data.CommandName = commandInfo.Name;

                        if (commandInfo.Request != null)
                        {
                            data.requestName = commandInfo.Request.Name;
                            data.requestKind = commandInfo.Request.Schema.EntityKind.ToString();
                        }

                        commandData.Add(data);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error {ex}");
            }

            return Json(commandData);
        }
        // Calls method
        [HttpPost]
        public async Task<bool> SendCommand(string deviceid, string command, string payload)
        {
            try
            {
                var response = await _helper.SendMethod(deviceid, command, payload);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error {ex}");
            }

            return true;
        }
        #endregion
    }
}
