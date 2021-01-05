using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OpenPlatform_WebPortal.Models
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
        public string TilesetId { get; set; }
        public string StatesetId { get; set; }
    };

    public class TimeSeriesInsights
    {
        public string clientId { get; set; }
        public string tenantId { get; set; }
        public string tsiUri { get; set; }
        public string tsiSecret { get; set; }
    };

    public class ModelRepositorySetting
    {
        public string repoUrl { get; set; }
    }

    public class GitHubSetting
    {
        public string token { get; set; }
    }

    public class DpsSetting
    {
        public string IdScope { get; set; }
        public string ConnectionString { get; set; }
    }

    public class AppSettings
    {
        public SignalrSetting SignalR { get; set; }
        public IotHubSetting IoTHub { get; set; }
        public DpsSetting Dps { get; set; }
        public AzureMap AzureMap { get; set; }
        public TimeSeriesInsights TimeSeriesInsights { get; set; }
        public ModelRepositorySetting ModelRepository { get; set; }
        public GitHubSetting GitHub { get; set; }
    }
}

