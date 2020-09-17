using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Azure.Devices;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Models
{
    public class HomeViewModel
    {
        [DisplayName("Select Device")]
        public string deviceId { get; set; }
        public IEnumerable<SelectListItem> deviceList { get; set; }
        public string newDeviceId { get; set; }
        public string newModelId { get; set; }
    }
}
