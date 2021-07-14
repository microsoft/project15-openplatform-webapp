using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Client;
using Microsoft.Azure.Devices.Common.Exceptions;
using Microsoft.Azure.Devices.Provisioning.Service;
using Microsoft.Azure.Devices.Shared;
using Microsoft.Azure.DigitalTwins.Parser;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Rest;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenPlatform_WebPortal.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace OpenPlatform_WebPortal.Helper
{
    public interface IIoTHubDpsHelper
    {
        Task<IEnumerable<SelectListItem>> GetIoTHubDevices();
        Task<Device> GetIoTHubDevice(string deviceId);
        Task<bool> AddIoTHubDevice(string deviceId);
        Task<bool> DeleteIoTHubDevice(string deviceId);
        Task<Twin> GetDeviceTwin(string deviceId);
        Task<EnrollmentGroup> GetDpsGroupEnrollment(string enrollmentGroupId);
        Task<IEnumerable<SelectListItem>> GetDpsGroupEnrollments();
        Task<IEnumerable<SelectListItem>> GetDpsEnrollments();
        Task<IEnumerable<SelectListItem>> GetDpsIndividualEnrollments();
        Task<IndividualEnrollment> GetDpsIndividualEnrollment(string registrationId);
        Task<AttestationMechanism> GetDpsAttestationMechanism(string registrationId, bool isGroup);
        Task<bool> AddDpsEnrollment(string newRegistrationId, bool isGroup);
        Task<bool> DeleteDpsEnrollment(string registrationId, bool isGroup);
        Task<CloudToDeviceMethodResult> SendMethod(string deviceId, string command, string payload);
        string GetIoTHubName(string deviceConnectionString);
    }
    public class IoTHubDpsHelper : IIoTHubDpsHelper
    {
        private readonly RegistryManager _registryManager;
        private readonly ILogger<IoTHubDpsHelper> _logger;
        private readonly AppSettings _appSettings;
        private DeviceClient _deviceClient;
        private bool _isConnected;
        private readonly ServiceClient _serviceClient;
        private readonly DigitalTwinClient _digitalTwinClient;
        private readonly ProvisioningServiceClient _provisioningServiceClient;
        private readonly string _dps_webhookUrl;
        private readonly string _privateModelRepoUrl;
        private readonly string _privateModelToken;
        private static DeviceModelResolver _resolver = null;
        public IoTHubDpsHelper(IOptions<AppSettings> config, ILogger<IoTHubDpsHelper> logger)
        {
            _logger = logger;
            _appSettings = config.Value;
            _registryManager = RegistryManager.CreateFromConnectionString(_appSettings.IoTHub.ConnectionString);
            _serviceClient = ServiceClient.CreateFromConnectionString(_appSettings.IoTHub.ConnectionString);
            _digitalTwinClient = DigitalTwinClient.CreateFromConnectionString(_appSettings.IoTHub.ConnectionString);
            _provisioningServiceClient = ProvisioningServiceClient.CreateFromConnectionString(_appSettings.Dps.ConnectionString);
            _dps_webhookUrl = _appSettings.Dps.WebHookUrl;
            _deviceClient = null;
            _isConnected = false;
            _privateModelRepoUrl = _appSettings.ModelRepository.repoUrl;
            _privateModelToken = _appSettings.GitHub.token;
        }

        #region IOTHUB
        /**********************************************************************************
         * Get list of devices from IoT Hub
         *********************************************************************************/
        public async Task<IEnumerable<SelectListItem>> GetIoTHubDevices()
        {
            List<SelectListItem> deviceList = new List<SelectListItem>();
            // add empty one
            deviceList.Add(new SelectListItem { Value = "", Text = "" });

            try
            {
                IQuery query = _registryManager.CreateQuery("select * from devices");

                while (query.HasMoreResults)
                {
                    var twins = await query.GetNextAsTwinAsync().ConfigureAwait(false);
                    foreach (var twin in twins)
                    {
                        _logger.LogInformation($"Found a device : {twin.DeviceId}");
                        deviceList.Add(new SelectListItem { Value = twin.DeviceId, Text = twin.DeviceId });
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetIoTHubDevices() : {e.Message}");
            }

            return deviceList;
        }

        /**********************************************************************************
         * Retrieves the specified Device object.
         *********************************************************************************/
        public async Task<Device> GetIoTHubDevice(string deviceId)
        {
            Device device = null;
            try
            {
                device = await _registryManager.GetDeviceAsync(deviceId);
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetIoTHubDevice() : {e.Message}");
            }
            return device;
        }

        /**********************************************************************************
         * Register a new device with IoT Hub
         *********************************************************************************/
        public async Task<bool> AddIoTHubDevice(string deviceId)
        {
            Device device = null;
            bool bCreated = false;

            device = await _registryManager.GetDeviceAsync(deviceId.ToString());

            if (device == null)
            {
                _logger.LogDebug($"Creating a new device : '{deviceId}'");
                device = await _registryManager.AddDeviceAsync(new Device(deviceId.ToString()));

                if (device != null)
                {
                    bCreated = true;
                }
                else
                {
                    throw new IotHubException($"Failed to create {deviceId} in IoT Hub");
                }
            }
            else
            {
                _logger.LogWarning($"Device already exist : '{deviceId}'");
                throw new DeviceAlreadyExistsException(deviceId);
            }

            return bCreated;
        }

        /**********************************************************************************
         * Deletes a previously registered device from IoT Hub
         *********************************************************************************/
        public async Task<bool> DeleteIoTHubDevice(string deviceId)
        {
            try
            {
                _logger.LogDebug($"Removing {deviceId}");
                await _registryManager.RemoveDeviceAsync(deviceId.ToString());
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in DeleteIoTHubDevice() : {e.Message}");
                throw new DeviceNotFoundException(deviceId, e);
            }
            return true;
        }

        /**********************************************************************************
         * Gets Twin from IoT Hub
         *********************************************************************************/
        public async Task<Twin> GetDeviceTwin(string deviceId)
        {
            Twin twin = null;

            try
            {
                _logger.LogDebug($"Retrieving Twin for {deviceId}");
                twin = await _registryManager.GetTwinAsync(deviceId);
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDeviceTwin() : {e.Message}");
                throw e;
            }
            return twin;
        }

        #endregion // IOTHUB

        #region DPS

        /**********************************************************************************
         * Get a group entrollments from DPS
         *********************************************************************************/
        public async Task<EnrollmentGroup> GetDpsGroupEnrollment(string enrollmentGroupId)
        {
            EnrollmentGroup enrollmentGroup = null;

            try
            {
                QuerySpecification querySpecification = new QuerySpecification("SELECT * FROM enrollments");
                using (Query query = _provisioningServiceClient.CreateEnrollmentGroupQuery(querySpecification))
                {
                    while (query.HasNext())
                    {
                        QueryResult queryResult = await query.NextAsync().ConfigureAwait(false);
                        foreach (EnrollmentGroup enrollment in queryResult.Items)
                        {
                            if (enrollment.EnrollmentGroupId.Equals(enrollmentGroupId))
                            {
                                enrollmentGroup = enrollment;
                                break;
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsGroupEnrollment() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to retrieve group enrollments", e);
            }

            return enrollmentGroup;
        }

        /**********************************************************************************
         * Get list of entrollments from DPS
         *********************************************************************************/

        public async Task<IEnumerable<SelectListItem>> GetDpsGroupEnrollments()
        {
            List<SelectListItem> enrollmentList = new List<SelectListItem>();
            enrollmentList.Add(new SelectListItem { Value = "", Text = "" });

            try
            {
                QuerySpecification querySpecification = new QuerySpecification("SELECT * FROM enrollments");
                using (Query query = _provisioningServiceClient.CreateEnrollmentGroupQuery(querySpecification))
                {
                    while (query.HasNext())
                    {
                        QueryResult queryResult = await query.NextAsync().ConfigureAwait(false);
                        foreach (EnrollmentGroup enrollment in queryResult.Items)
                        {
                            // we only support symmetric key for now
                            if (enrollment.Attestation.GetType().Name.Equals("SymmetricKeyAttestation"))
                            {
                                enrollmentList.Add(new SelectListItem { Value = enrollment.EnrollmentGroupId, Text = enrollment.EnrollmentGroupId });
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsEnrollments() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to retrieve enrollments", e);
            }

            return enrollmentList;
        }

        public async Task<IEnumerable<SelectListItem>> GetDpsEnrollments()
        {
            List<SelectListItem> enrollmentList = new List<SelectListItem>();
            enrollmentList.Add(new SelectListItem { Value = "", Text = "" });

            try
            {
                QuerySpecification querySpecification = new QuerySpecification("SELECT * FROM enrollments");
                using (Query query = _provisioningServiceClient.CreateIndividualEnrollmentQuery(querySpecification))
                {
                    while (query.HasNext())
                    {
                        QueryResult queryResult = await query.NextAsync().ConfigureAwait(false);
                        foreach (IndividualEnrollment enrollment in queryResult.Items)
                        {
                            // we only support symmetric key for now
                            if (enrollment.Attestation.GetType().Name.Equals("SymmetricKeyAttestation"))
                            {
                                enrollmentList.Add(new SelectListItem { Value = enrollment.RegistrationId, Text = enrollment.RegistrationId });
                            }
                        }
                    }
                }

                querySpecification = new QuerySpecification("SELECT * FROM enrollments");
                using (Query query = _provisioningServiceClient.CreateEnrollmentGroupQuery(querySpecification))
                {
                    while (query.HasNext())
                    {
                        QueryResult queryResult = await query.NextAsync().ConfigureAwait(false);
                        foreach (EnrollmentGroup enrollment in queryResult.Items)
                        {
                            // we only support symmetric key for now
                            if (enrollment.Attestation.GetType().Name.Equals("SymmetricKeyAttestation"))
                            {
                                enrollmentList.Add(new SelectListItem { Value = enrollment.EnrollmentGroupId, Text = enrollment.EnrollmentGroupId });
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsEnrollments() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to retrieve enrollments", e);
            }

            return enrollmentList;
        }
        public async Task<IEnumerable<SelectListItem>> GetDpsIndividualEnrollments()
        {
            List<SelectListItem> enrollmentList = new List<SelectListItem>();
            // add empty one
            enrollmentList.Add(new SelectListItem { Value = "", Text = "" });

            try
            {
                QuerySpecification querySpecification = new QuerySpecification("SELECT * FROM enrollments");
                using (Query query = _provisioningServiceClient.CreateIndividualEnrollmentQuery(querySpecification))
                {
                    while (query.HasNext())
                    {
                        QueryResult queryResult = await query.NextAsync().ConfigureAwait(false);
                        foreach (IndividualEnrollment enrollment in queryResult.Items)
                        {
                            // we only support symmetric key for now
                            if (enrollment.Attestation.GetType().Name.Equals("SymmetricKeyAttestation"))
                            {
                                enrollmentList.Add(new SelectListItem { Value = enrollment.RegistrationId, Text = enrollment.RegistrationId });
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsIndividualEnrollments() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to retrieve individual enrollments", e);
            }

            return enrollmentList;
        }

        /**********************************************************************************
         * Retrive Individual Enrollment from DPS
         *********************************************************************************/
        public async Task<IndividualEnrollment> GetDpsIndividualEnrollment(string registrationId)
        {
            IndividualEnrollment enrollment = null;

            try
            {
                QuerySpecification querySpecification = new QuerySpecification("SELECT * FROM enrollments");

                using (Query query = _provisioningServiceClient.CreateIndividualEnrollmentQuery(querySpecification))
                {
                    while (query.HasNext() && enrollment == null)
                    {
                        QueryResult queryResults = await query.NextAsync().ConfigureAwait(false);

                        foreach (IndividualEnrollment item in queryResults.Items)
                        {
                            _logger.LogInformation($"GetDpsIndividualEnrollment found enrollment : {item}");

                            if (item.RegistrationId.Equals(registrationId))
                            {
                                enrollment = item;
                                break;
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsIndividualEnrollment() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to retrieve individual enrollment {registrationId}", e);
            }

            return enrollment;
        }

        /**********************************************************************************
         * Retrieve attestation from DPS
         *********************************************************************************/
        public async Task<AttestationMechanism> GetDpsAttestationMechanism(string registrationId, bool isGroup)
        {
            AttestationMechanism attestation = null;

            try
            {
                if (isGroup)
                {
                    attestation = await _provisioningServiceClient.GetEnrollmentGroupAttestationAsync(registrationId).ConfigureAwait(false);
                }
                else
                {
                    attestation = await _provisioningServiceClient.GetIndividualEnrollmentAttestationAsync(registrationId).ConfigureAwait(false);
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsAttestationMechanism() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to retrieve attestation mechanism for {registrationId}", e);
            }

            return attestation;
        }

        /**********************************************************************************
         * Add a new enrollment
         *********************************************************************************/
        public async Task<bool> AddDpsEnrollment(string newRegistrationId, bool isGroup)
        {
            bool bCreated = false;
            string primaryKey = "";
            string secondaryKey = "";

            try
            {
                Attestation attestation = new SymmetricKeyAttestation(primaryKey, secondaryKey);

                if (isGroup)
                {
                    EnrollmentGroup groupEnrollment = new EnrollmentGroup(newRegistrationId, attestation);

                    if (!string.IsNullOrEmpty(_dps_webhookUrl))
                    {
                        groupEnrollment.CustomAllocationDefinition = new CustomAllocationDefinition() { WebhookUrl = _dps_webhookUrl, ApiVersion = "2019-03-31" };
                        groupEnrollment.AllocationPolicy = AllocationPolicy.Custom;
                    }
                    var newEnrollment = await _provisioningServiceClient.CreateOrUpdateEnrollmentGroupAsync(groupEnrollment).ConfigureAwait(false);

                    if (newEnrollment != null)
                    {
                        bCreated = true;
                    }
                }
                else
                {
                    IndividualEnrollment individualEnrollment = new IndividualEnrollment(newRegistrationId, attestation);
                    individualEnrollment.DeviceId = newRegistrationId;
                    if (!string.IsNullOrEmpty(_dps_webhookUrl))
                    {
                        individualEnrollment.CustomAllocationDefinition = new CustomAllocationDefinition() { WebhookUrl = _dps_webhookUrl, ApiVersion = "2019-03-31" };
                        individualEnrollment.AllocationPolicy = AllocationPolicy.Custom;
                    }
                    var newEnrollment = await _provisioningServiceClient.CreateOrUpdateIndividualEnrollmentAsync(individualEnrollment).ConfigureAwait(false);
                    if (newEnrollment != null)
                    {
                        bCreated = true;
                    }
                }
            }
            //catch (DeviceAlreadyExistsException)
            //{
            //}
            catch (Exception e)
            {
                _logger.LogError($"Exception in GetDpsIndividualEnrollment() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to create enrollment {newRegistrationId}", e);
            }
            return bCreated;
        }

        /**********************************************************************************
         * Deletes enrollment from DPS
         *********************************************************************************/
        public async Task<bool> DeleteDpsEnrollment(string registrationId, bool isGroup)
        {
            bool bDeleted = false;
            try
            {
                _logger.LogDebug($"Removing enrollment {registrationId}");
                if (isGroup)
                {
                    await _provisioningServiceClient.DeleteEnrollmentGroupAsync(registrationId).ConfigureAwait(false);
                }
                else {
                    await _provisioningServiceClient.DeleteIndividualEnrollmentAsync(registrationId).ConfigureAwait(false);
                }
                bDeleted = true;
            }
            catch (Exception e)
            {
                _logger.LogError($"Exception in DeleteDpsEnrollment() : {e.Message}");
                throw new ProvisioningServiceClientHttpException($"Failed to delete enrollment {registrationId}", e);
            }
            return bDeleted;
        }

        #endregion

        public async Task<Twin> SetModelId(string deviceConnectionString, string deviceModelId)
        {
            Twin twin = null;
            int retry = 10;

            var options = new ClientOptions
            {
                ModelId = deviceModelId,
            };

            if (_deviceClient == null)
            {
                _deviceClient = DeviceClient.CreateFromConnectionString(deviceConnectionString, Microsoft.Azure.Devices.Client.TransportType.Mqtt, options);
                _deviceClient.SetConnectionStatusChangesHandler(ConnectionStatusChangedHandler);
                await _deviceClient.OpenAsync();

                while (_isConnected == false && retry > 0)
                {
                    await Task.Delay(1000);
                    retry--;
                }

                twin = await _deviceClient.GetTwinAsync();
            }
            else
            {
                twin = await _deviceClient.GetTwinAsync();
                await _deviceClient.CloseAsync();
                _deviceClient.Dispose();
                _deviceClient = null;
            }

            return twin;
        }

        /**********************************************************************************
         * Get a name of IoT Hub from Connection String
         *********************************************************************************/
        public string GetIoTHubName(string deviceConnectionString)
        {
            return deviceConnectionString.Split(';')[0].Split('=')[1];
        }

        /**********************************************************************************
         * Connection Status Change Notification for Web Client simulator
         *********************************************************************************/
        private void ConnectionStatusChangedHandler(
                    ConnectionStatus status,
                    ConnectionStatusChangeReason reason)
        {
            _logger.LogInformation(
                "Client connection state changed. Status: {status}, Reason: {reason}",
                status,
                reason);

            if (status == ConnectionStatus.Connected)
            {
                _isConnected = true;
            }
            else
            {
                _isConnected = false;
            }
        }

        private int ProcessCmdRequest(string name, JObject payload, DTEntityKind dtKind, JObject jObjectReq, CloudToDeviceMethod methodInvocation)
        {
            int ret = 200;
            switch (dtKind)
            {
                case DTEntityKind.String:
                    jObjectReq.Add(name, payload[name].ToString());
                    break;
                case DTEntityKind.Integer:
                case DTEntityKind.Long:
                    if (payload[name].Type == JTokenType.String)
                    {
                        var value = payload[name].ToString();

                        // convert to integer
                        Regex rx = new Regex(@"^[0-9]+$");

                        if (!rx.IsMatch(value))
                        {
                            ret = 400;
                        }
                        else
                        {
                            if (dtKind == DTEntityKind.Long)
                            {
                                if (methodInvocation != null)
                                {
                                    methodInvocation.SetPayloadJson(Int64.Parse(value).ToString());
                                }
                                else if (jObjectReq != null)
                                {
                                    jObjectReq.Add(name, Int64.Parse(value));
                                }
                            }
                            else
                            {
                                jObjectReq.Add(name, Int32.Parse(value));
                            }
                        }
                    }

                    break;
                case DTEntityKind.Double:
                case DTEntityKind.Float:
                    if (payload[name].Type == JTokenType.String)
                    {
                        var value = payload[name].ToString();

                        // convert to integer
                        Regex rx = new Regex(@"^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

                        if (!rx.IsMatch(value))
                        {
                            ret = 400;
                        }
                        else
                        {
                            if (methodInvocation != null)
                            {
                                methodInvocation.SetPayloadJson(Int64.Parse(value).ToString());
                            }
                            else if (jObjectReq != null)
                            {
                                jObjectReq.Add(name, Double.Parse(value));
                            }
                        }
                    }
                    break;

                case DTEntityKind.Enum:
                    {
                        var value = payload[name].ToString();
                        if (methodInvocation != null)
                        {
                            methodInvocation.SetPayloadJson(value);
                        }
                        else if (jObjectReq != null)
                        {
                            jObjectReq.Add(name, value);
                        }
                    }
                    break;
                case DTEntityKind.Boolean:
                    {
                        var value = payload[name].ToString();
                        Boolean boolValue = false;

                        if (value.GetTypeCode() == TypeCode.String)
                        {
                            if (value.Equals("true") || value.Contains("1"))
                            {
                                boolValue = true;
                            }
                        }

                        if (methodInvocation != null)
                        {
                            methodInvocation.SetPayloadJson(boolValue.ToString());
                        }
                        else if (jObjectReq != null)
                        {
                            jObjectReq.Add(name, boolValue);
                        }

                    }
                    break;
                case DTEntityKind.Date:
                case DTEntityKind.Duration:
                case DTEntityKind.Time:
                    ret = 501;
                    break;

                default:
                    ret = 501;
                    break;

            }
            return ret;
        }
        public async Task<CloudToDeviceMethodResult> SendMethod(string deviceId, string command, string payload)
        {
            JObject cmdPayload = JObject.Parse(payload);

            if (_serviceClient != null)
            {
                var methodInvocation = new CloudToDeviceMethod(command)
                {
                    ResponseTimeout = TimeSpan.FromSeconds(30)
                };

                Twin deviceTwin = await GetDeviceTwin(deviceId);

                if (!string.IsNullOrEmpty(deviceTwin.ModelId))
                {
                    try
                    {
                        if (_resolver == null)
                        {
                            _resolver = new DeviceModelResolver(_privateModelRepoUrl, _privateModelToken, _logger);
                        }

                        var modelData = await _resolver.ParseModelAsync(deviceTwin.ModelId);

                        var interfaces = modelData.Where(r => r.Value.EntityKind == DTEntityKind.Command).ToList();
                        string commandName;
                        if (command.Contains("*"))
                        {
                            commandName = command.Split('*')[1];
                        }
                        else
                        {
                            commandName = command;
                        }

                        //var commands = interfaces.Select(r => r.Value as DTCommandInfo).Where(x => x.Name == command).ToList();
                        var dtCmds = interfaces.Select(r => r.Value as DTCommandInfo).Single(x => x.Name == commandName);
                        int status = 200;

                        if (dtCmds != null)
                        {
                            JObject jObjectRequest = new JObject();
                            switch (dtCmds.Request.Schema.EntityKind)
                            {
                                case DTEntityKind.Object:
                                    DTObjectInfo dtObj = dtCmds.Request.Schema as DTObjectInfo;
                                    foreach (var field in dtObj.Fields)
                                    {
                                        ProcessCmdRequest(field.Name, cmdPayload, field.Schema.EntityKind, jObjectRequest, null);
                                    }

                                    if (status == 200)
                                    {
                                        methodInvocation.SetPayloadJson(jObjectRequest.ToString());
                                    }
                                    break;

                                default:

                                    if (cmdPayload.ContainsKey(dtCmds.Request.Name))
                                    {
                                        status = ProcessCmdRequest(dtCmds.Request.Name, cmdPayload, dtCmds.Request.Schema.EntityKind, null, methodInvocation);
                                    }
                                    else
                                    {
                                        status = 400;
                                    }
                                    break;
                            }

                            if (status != 200)
                            {
                                throw new ArgumentException($"Error Processing Command Requests. Status {status}");
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        _logger.LogError($"Error Processing Command Requests: {e.Message}");
                        throw new ArgumentException("Error Processing Command Requests", e);
                        
                    }
                }

                try
                {
                    var response = await _serviceClient.InvokeDeviceMethodAsync(deviceId, methodInvocation);
                    Console.WriteLine("Response status: {0}, payload:", response.Status);
                    Console.WriteLine(response.GetPayloadAsJson());
                    return response;
                }
                catch (Exception e)
                {
                    _logger.LogError($"Exception in InvokeDeviceMethodAsync() : {e.Message}");
                    throw new ArgumentException("Failed to send command", e);
                }
            }
            return null;
        }
    }
}
