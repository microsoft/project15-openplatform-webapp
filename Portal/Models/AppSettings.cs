using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{

    public class IotHubSetting
    {
        public string ConnectionString { get; set; }
    }
    public class SignalrSetting
    {
        public string ConnectionString { get; set; }
    }

    public class AzureMap
    {
        public string MapKey { get; set; }
    };

    public class TimeSeriesInsights
    {
        public string clientId { get; set; }
        public string tenantId { get; set; }
        public string tsiUri { get; set; }
        public string tsiSecret { get; set; }

        // to do : Convert to IoT Plug and Play
        public string temperatureName { get; set; }
        public string humidityName { get; set; }
    };

    public class AppSettings
    {
        public SignalrSetting SignalR { get; set; }
        public IotHubSetting IoTHub { get; set; }
        public AzureMap AzureMap { get; set; }
        public TimeSeriesInsights TimeSeriesInsights { get; set; }
    }

    //public class AzureSetting
    //{
    //    public SignalrSetting SignalR { get; set; }
    //    public IotHubSetting IoTHub { get; set; }
    //}

    //public class AppSettings
    //{
    //    public AzureSetting Azure { get; set;}
    //}
}

