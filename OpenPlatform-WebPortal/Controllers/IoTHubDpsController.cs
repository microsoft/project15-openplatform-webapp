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
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Text;

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

        public IoTHubDpsController(IIoTHubDpsHelper helper, IOptions<AppSettings> optionsAccessor, ILogger<IoTHubDpsController> logger)
        {
            _helper = helper;
            _appSettings = optionsAccessor.Value;
            _gitToken = _appSettings.GitHub.token;
            _modelRepoUrl = _appSettings.ModelRepository.repoUrl;
            _logger = logger;
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
                DTDLModelResolver resolver = new DTDLModelResolver(_modelRepoUrl, _gitToken, _logger);

                var modelData = await resolver.ParseModelAsync(deviceData.deviceModelId);

                if (modelData != null)
                { 
                    try
                    {
                        /*
                         * Pick up telemetry
                         * */
                        var interfaces = modelData.Where(r => r.Value.EntityKind == DTEntityKind.Telemetry).ToList();
                        foreach (var dt in interfaces)
                        {
                            TELEMETRY_DATA data = new TELEMETRY_DATA();
                            DTTelemetryInfo telemetryInfo = dt.Value as DTTelemetryInfo;

                            switch (telemetryInfo.Schema.EntityKind)
                            {
                                case DTEntityKind.Integer:
                                case DTEntityKind.Long:
                                    // for TSI in WebUI
                                    data.dataType = "Long";
                                    break;
                                case DTEntityKind.Double:
                                case DTEntityKind.Float:
                                    // for TSI in WebUI
                                    data.dataType = "Double";
                                    break;
                                case DTEntityKind.Object:
                                    // for now we support point object for location

                                    if (telemetryInfo.Schema.Id.Versionless.Equals("dtmi:standard:schema:geospatial:point"))
                                    {
                                        data.TelemetryType = telemetryInfo.Schema.Id.Versionless;
                                        break;
                                    }
                                    continue;

                                default:
                                    continue;
                            }

                            if (telemetryInfo.SupplementalTypes.Count > 0)
                            {
                                foreach (var supplementalType in telemetryInfo.SupplementalTypes)
                                {
                                    data.TelemetryType = supplementalType.Versionless;
                                }
                            }

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
                            else
                            {
                                // No Unit
                                if (deviceData.deviceModelId.StartsWith("dtmi:seeedkk:wioterminal:wioterminal_co2checker"))
                                {
                                    if (telemetryInfo.Name.Equals("co2"))
                                    {
                                        data.unit = "PPM";
                                    }
                                    else if (telemetryInfo.Name.Equals("humi"))
                                    {
                                        data.unit = "%";
                                    }
                                    else if (telemetryInfo.Name.Equals("wbgt"))
                                    {
                                        data.unit = "°C";
                                    }
                                }
                            }

                            data.TelemetryName = telemetryInfo.Name;
                            deviceData.telemetry.Add(data);
                        }
                    }
                    catch (Exception e)
                    {
                        _logger.LogError($"Exception in ParseAsync() : {e.Message}");
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

        [HttpGet]
        public async Task<ActionResult> GetCommand(string modelid)
        {
            List<COMMAND_DATA> commandData = new List<COMMAND_DATA>();

            try
            {
                DTDLModelResolver resolver = new DTDLModelResolver(_modelRepoUrl, _gitToken, _logger);

                var modelData = await resolver.ParseModelAsync(modelid);

                var interfaces = modelData.Where(r => r.Value.EntityKind == DTEntityKind.Command).ToList();

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
                        if (data.request == null)
                        {
                            data.request = new List<COMMAND_REQUEST>();
                        }
                        COMMAND_REQUEST request = new COMMAND_REQUEST();
                        request.requestName = commandInfo.Request.Name;
                        request.requestKind = commandInfo.Request.Schema.EntityKind.ToString();
                        request.requestDescription = commandInfo.Request.Description["en"];
                        request.requestisplayName = commandInfo.Request.DisplayName["en"];
                        data.request.Add(request);
                }

                    commandData.Add(data);
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
    }
}
