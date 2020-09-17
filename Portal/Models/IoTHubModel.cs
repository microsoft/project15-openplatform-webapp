using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class DEVICE_DATA
    {
        public string deviceId { get; set; }
        public string connectionState { get; set; }
        public string status { get; set; }
        public string authenticationType { get; set; }
        public string primaryKey { get; set; }
        public string secondaryKey { get; set; }
        public string connectionString { get; set; }
        public string modelId { get; set; }
    }
}
