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
using QRCoder;
using System.Drawing;
using System.Security.Cryptography;

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

        public void ProcessDTObject(DEVICE_DATA deviceData, DTObjectInfo objectInfo, string objectName)
        {
            TELEMETRY_DATA data = null;

            foreach (var field in objectInfo.Fields)
            {
                switch (field.Schema.EntityKind)
                {
                    case DTEntityKind.String:
                        break;
                    case DTEntityKind.Object:
                        ProcessDTObject(deviceData, field.Schema as DTObjectInfo, $"{objectName}.{field.Name}");
                        break;
                    case DTEntityKind.Integer:
                    case DTEntityKind.Long:
                        // for TSI in WebUI
                        data = new TELEMETRY_DATA();
                        data.dataType = "Long";
                        break;
                    case DTEntityKind.Double:
                    case DTEntityKind.Float:
                        // for TSI in WebUI
                        data = new TELEMETRY_DATA();
                        data.dataType = "Double";
                        break;
                    default:
                        break;
                }

                if (data != null)
                {
                    if (field.DisplayName.Count > 0)
                    {
                        data.TelemetryDisplayName = $"{objectName}.{field.DisplayName["en"]}";
                    }
                    else 
                    {
                        data.TelemetryDisplayName = $"{objectName}.{field.Name}";
                    }

                    data.TelemetryName = $"{objectName}.{field.Name}";
                    deviceData.telemetry.Add(data);
                    data = null;
                }
            }
        }

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

            if (device == null)
            {
                return StatusCode(500, new { message = $"Could not find Device ID : {deviceId}" });
            }

            // Retrieve Deivce Twin for the device
            twin = await _helper.GetDeviceTwin(deviceId).ConfigureAwait(false);

            if (twin == null)
            {
                return StatusCode(500, new { message = $"Could not find Twin for Device ID : {deviceId}" });
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

                DeviceModelResolver resolver = new DeviceModelResolver(_modelRepoUrl, _gitToken, _logger);
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
                                    else if (telemetryInfo.Schema.Id.Versionless.Equals("dtmi:iotcentral:schema:geopoint"))
                                    {
                                        data.TelemetryType = telemetryInfo.Schema.Id.Versionless;
                                        break;
                                    }
                                    else
                                    {
                                        DTObjectInfo objectInfo = telemetryInfo.Schema as DTObjectInfo;
                                        ProcessDTObject(deviceData, objectInfo, telemetryInfo.Name);
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
                        return StatusCode(500, new { message = $"Exception in ParseAsync() : {e.Message}" });
                    }
                }
            }
            return Json(deviceData);
        }

        // Register a new device with IoT Hub
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.adddeviceasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_AddDeviceAsync_Microsoft_Azure_Devices_Device_
        [HttpPost]
        public async Task<ActionResult> AddIoTHubDevice(string deviceId)
        {
            try
            {
                if (deviceId != null)
                {
                    bool bCreated = await _helper.AddIoTHubDevice(deviceId);
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in AddIoTHubDevice() : {e.Message}");
                return StatusCode(400, new { message = e.Message });
            }
            return Ok();
        }

        // Deletes a previously registered device from IoT Hub
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.removedeviceasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_RemoveDeviceAsync_Microsoft_Azure_Devices_Device_System_Threading_CancellationToken_
        [HttpDelete]
        public async Task<ActionResult> DeleteIoTHubDevice(string deviceId)
        {
            bool bDeleted = false;
            try
            {
                bDeleted = await _helper.DeleteIoTHubDevice(deviceId);
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in DeleteIoTHubDevice() : {e.InnerException.Message}");
                return StatusCode(400, new { message = e.Message });
            }

            if (bDeleted)
            {
                return Ok();
            }
            else
            {
                return StatusCode(400, new { message = $"Failed to delete {deviceId}" });
            }
        }

        // Gets Twin from IotHub
        // https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.devices.registrymanager.gettwinasync?view=azure-dotnet#Microsoft_Azure_Devices_RegistryManager_GetTwinAsync_System_String_
        [HttpGet]
        public async Task<ActionResult> GetDeviceTwin(string deviceId)
        {
            Twin twin = await _helper.GetDeviceTwin(deviceId);

            if (twin != null)
            {
                JObject twinJson = (JObject)JsonConvert.DeserializeObject(twin.ToJson());
                return Json(twinJson.ToString());
            }
            else
            {
                return StatusCode(400, new { message = $"Failed to get twin for {deviceId}" });
            }
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
            IndividualEnrollment individualEnrollment = null;
            EnrollmentGroup groupEnrollment = null;
            bool isGroup = false;

            DPS_ENROLLMENT_DATA enrollmentData = new DPS_ENROLLMENT_DATA();

            try
            {
                // retrieve the enrollment
                individualEnrollment = await _helper.GetDpsIndividualEnrollment(registrationId).ConfigureAwait(false);

                if (individualEnrollment == null)
                {
                    _logger.LogWarning($"Individual enrollment {registrationId} not found");
                    groupEnrollment = await _helper.GetDpsGroupEnrollment(registrationId).ConfigureAwait(false);

                    if (groupEnrollment != null)
                    {
                        isGroup = true;
                    }
                }
                else
                {
                    isGroup = false;
                }

                if (individualEnrollment == null && groupEnrollment == null)
                {
                    return Json(new { Success = false, Message = "Failed to create Group Enrollment" });
                }
                else
                {
                    AttestationMechanism attestationMechanism = await _helper.GetDpsAttestationMechanism(registrationId, isGroup).ConfigureAwait(false);

                    if (attestationMechanism == null)
                    {
                        _logger.LogWarning($"Attestation Mechanism for {registrationId} not found");
                        return BadRequest();
                    }

                    if (attestationMechanism.Type.Equals(AttestationMechanismType.SymmetricKey))
                    {
                        SymmetricKeyAttestation attestation = (SymmetricKeyAttestation)attestationMechanism.GetAttestation();

                        if (individualEnrollment != null)
                        {
                            enrollmentData.registrationId = individualEnrollment.RegistrationId;
                            enrollmentData.status = individualEnrollment.ProvisioningStatus.ToString();
                        }
                        else
                        {
                            enrollmentData.registrationId = groupEnrollment.EnrollmentGroupId;
                            enrollmentData.status = groupEnrollment.ProvisioningStatus.ToString();
                        }
                        enrollmentData.isGroup = isGroup;
                        enrollmentData.primaryKey = attestation.PrimaryKey;
                        enrollmentData.secondaryKey = attestation.SecondaryKey;
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetEnrollment() : {e.Message}");
                return StatusCode(400, new { message = $"Failed to get enrollment {registrationId}. {e.Message}" });
            }

            return Json(enrollmentData);
        }

        // Add a new individual enrollment
        // https://docs.microsoft.com/en-us/rest/api/iot-dps/createorupdateindividualenrollment
        [HttpPost]
        public async Task<ActionResult> AddDpsEnrollment(string newRegistrationId, bool isGroup)
        {
            bool bCreated = false;

            try
            {
                bCreated = await _helper.AddDpsEnrollment(newRegistrationId, isGroup);
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in AddDpsEnrollment() : {e.InnerException.Message}");
                return StatusCode(400, new { message = e.Message });
            }
            return Ok();

        }

        // Delete a device enrollment record
        // https://docs.microsoft.com/en-us/rest/api/iot-dps/deleteindividualenrollment/deleteindividualenrollment
        [HttpDelete]
        public async Task<ActionResult> DeleteDpsEnrollment(string enrollmentId, bool isGroup)
        {
            bool bDeleted = false;

            try
            {
                bDeleted = await _helper.DeleteDpsEnrollment(enrollmentId, isGroup);
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in AddDpsEnrollment() : {e.InnerException.Message}");
                return StatusCode(400, new { message = e.Message });
            }

            return Ok();
        }
        #endregion // DPS

        private static Byte[] BitmapToBytes(Bitmap img)
        {
            using (MemoryStream stream = new MemoryStream())
            {
                img.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                return stream.ToArray();
            }
        }

        private static string GenerateSymmetricKey(string deviceId, string key)
        {
            using (var hmac = new HMACSHA256(Convert.FromBase64String(key)))
            {
                return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(deviceId)));
            }
        }

        [HttpPost]
        public async Task<ActionResult> GenerateQrCode(string registrationId, string enrollmentId)
        {
            var groupKey = string.Empty;
            var groupEnrollmentName = string.Empty;
            if (string.IsNullOrEmpty(enrollmentId))
            {
                groupEnrollmentName = "SAS-IoT-Devices";
            }
            else
            {
                groupEnrollmentName = enrollmentId;
            }
            QR_CODE_DATA qrCodeData = new QR_CODE_DATA()
            {
                deviceId = registrationId,
                groupId = groupEnrollmentName
            };

            var groupEnrollment = await _helper.GetDpsGroupEnrollment(qrCodeData.groupId);

            if (groupEnrollment == null)
            {
                bool isCreated = await _helper.AddDpsEnrollment(qrCodeData.groupId, true);

                if (isCreated != true)
                {
                    return StatusCode(500, new { message = "Could not create Group Enrollment"});
                }
            }

            AttestationMechanism attestationMechanism = await _helper.GetDpsAttestationMechanism(qrCodeData.groupId, true).ConfigureAwait(false);

            if (attestationMechanism == null)
            {
                _logger.LogWarning($"Attestation Mechanism for {registrationId} not found");
                return Json(new { Success = false, Message = "Failed to retrieve attestation mechanism" });
            }

            if (attestationMechanism.Type.Equals(AttestationMechanismType.SymmetricKey))
            {
                SymmetricKeyAttestation attestation = (SymmetricKeyAttestation)attestationMechanism.GetAttestation();
                groupKey = attestation.PrimaryKey;
            }

            var token = GenerateSymmetricKey(registrationId, groupKey);
            var qrString = String.Format("{{\"deviceId\":\"{0}\",\"scopeId\":\"{1}\",\"deviceKey\":\"{2}\"}}", registrationId, _appSettings.Dps.IdScope, token);
            var qrStringBytes = System.Text.Encoding.UTF8.GetBytes(qrString);
            var base64qrString = Convert.ToBase64String(qrStringBytes);

            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrData = qrGenerator.CreateQrCode(base64qrString, QRCodeGenerator.ECCLevel.Q);

            QRCode qrCode = new QRCode(qrData);

            Bitmap qrCodeImage = qrCode.GetGraphic(20);
            var qrcode = BitmapToBytes(qrCodeImage);
            var base64qrcode = Convert.ToBase64String(qrcode);
            qrCodeData.imageData = String.Format("data:image/png;base64,{0}", base64qrcode);

            return Json(qrCodeData);
        }

        private string FindComponentName(IEnumerable<KeyValuePair<Dtmi, DTEntityInfo>> components, DTCommandInfo commandInfo)
        {
            foreach (var component in components)
            {
                if ((component.Value as DTComponentInfo).Schema.Id == commandInfo.DefinedIn) 
                {
                    return (component.Value as DTComponentInfo).Name;
                }
            }

            return string.Empty;
        }

        #region directmethod
        [HttpGet]
        public async Task<ActionResult> GetCommand(string modelid)
        {
            List<COMMAND_DATA> commandData = new List<COMMAND_DATA>();

            try
            {

                DeviceModelResolver resolver = new DeviceModelResolver(_modelRepoUrl, _gitToken, _logger);
                var modelData = await resolver.ParseModelAsync(modelid);

                if (modelData != null)
                {
                    var components = modelData.Where(r => r.Value.EntityKind == DTEntityKind.Component).ToList();
                    var commands = modelData.Where(r => r.Value.EntityKind == DTEntityKind.Command).ToList();

                    foreach (var command in commands)
                    {
                        COMMAND_DATA data = new COMMAND_DATA();
                        DTCommandInfo commandInfo = command.Value as DTCommandInfo;

                        if (commandInfo.DisplayName.Count > 0)
                        {
                            data.CommandDisplayName = commandInfo.DisplayName["en"];
                        }

                        if (commandInfo.Description.Count > 0)
                        {
                            data.CommandDescription = commandInfo.Description["en"];
                        }
                        var componentName = string.Empty;
                        componentName = FindComponentName(components, commandInfo);

                        if (string.IsNullOrEmpty(componentName))
                        {
                            data.CommandName = commandInfo.Name;
                        }
                        else
                        {
                            data.CommandName = $"{componentName}*{commandInfo.Name}";
                        }

                        if (commandInfo.Request != null)
                        {
                            if (data.request == null)
                            {
                                data.request = new List<COMMAND_REQUEST>();
                            }

                            if (commandInfo.Request.Schema.EntityKind != DTEntityKind.Object)
                            {
                                COMMAND_REQUEST request = new COMMAND_REQUEST();
                                request.requestName = commandInfo.Request.Name;
                                request.requestKind = commandInfo.Request.Schema.EntityKind.ToString();
                                request.requestDescription = commandInfo.Request.Description["en"];
                                request.requestisplayName = commandInfo.Request.DisplayName["en"];
                                data.request.Add(request);
                            }
                            else if (commandInfo.Request.Schema.EntityKind == DTEntityKind.Object)
                            {
                                var requests = commandInfo.Request.Schema as DTObjectInfo;
                                foreach (var req in requests.Fields)
                                {
                                    COMMAND_REQUEST request = new COMMAND_REQUEST();
                                    request.requestName = req.Name;
                                    request.requestKind = req.Schema.EntityKind.ToString();

                                    if (req.Description.Count > 0)
                                    {
                                        request.requestDescription = req.Description["en"];
                                    }

                                    if (req.DisplayName.Count > 0)
                                    {
                                        request.requestisplayName = req.DisplayName["en"];
                                    }

                                    if (req.Schema.EntityKind == DTEntityKind.Enum)
                                    {
                                        DTEnumInfo enumInfo = req.Schema as DTEnumInfo;
                                        request.enumValues = new List<String>();

                                        foreach (var enumValue in enumInfo.EnumValues)
                                        {
                                            request.enumValues.Add(enumValue.EnumValue.ToString());
                                        }
                                    }
                                    
                                    data.request.Add(request);
                                }
                            }
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
        public async Task<ActionResult> SendCommand(string deviceid, string command, string payload)
        {
            try
            {
                var response = await _helper.SendMethod(deviceid, command, payload);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error {ex}");
                if (ex.InnerException != null)
                {
                    return StatusCode(400, new { message = ex.InnerException.Message.Replace(@"\", "") });
                }
                else
                {
                    return StatusCode(400, new { message = ex.Message });
                }
            }

            return Ok();
        }
        #endregion
    }
}
