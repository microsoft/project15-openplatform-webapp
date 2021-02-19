using Microsoft.Azure.DigitalTwins.Parser;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace OpenPlatform_WebPortal.Helper
{
    public class DTDLModelResolver
    {
        #region ModelResolver
        private const string _publicRepository = "https://devicemodels.azure.com";
        private static string _privateRepository = string.Empty;
        private static string _githubToken = string.Empty;
        private static HttpClient _httpClient = new HttpClient();
        private static ILogger _logger = null;

        public DTDLModelResolver(string repositoryUri, string githubToken, ILogger logger)
        {
            _privateRepository = repositoryUri;
            _githubToken = githubToken;
            _logger = logger;
        }
        private bool IsValidDtmi(string dtmi)
        {
            // Regex defined at https://github.com/Azure/digital-twin-model-identifier#validation-regular-expressions
            Regex rx = new Regex(@"^dtmi:[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?(?::[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z0-9])?)*;[1-9][0-9]{0,8}$");
            return rx.IsMatch(dtmi);
        }

        public string DtmiToPath(string dtmi)
        {
            if (IsValidDtmi(dtmi))
            {
                return $"/{dtmi.ToLowerInvariant().Replace(":", "/").Replace(";", "-")}.json";
            }
            return string.Empty;
        }
        public async Task<string> GetModelContentAsync(string dtmiPath)
        {
            return await this.GetModelContentAsync(dtmiPath, false);
        }

        public async Task<string> GetModelContentAsync(string dtmiPath, bool bPublicRepo)
        {
            var jsonModel = string.Empty;
            try
            {
                var fullPath = new Uri($"{(bPublicRepo == true ? _publicRepository : _privateRepository)}{dtmiPath}");
                if (!string.IsNullOrEmpty(_githubToken))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", _githubToken);
                }
                jsonModel = await _httpClient.GetStringAsync(fullPath);
            }
            catch (Exception e)
            {
                _logger.LogError($"Error GetModelContentAsync(): {e.Message}");
            }
            return jsonModel;
        }

        public async Task<IReadOnlyDictionary<Dtmi, DTEntityInfo>> ParseModelAsync(string dtmi)
        {
            string modelContent = string.Empty;
            IReadOnlyDictionary<Dtmi, DTEntityInfo> parseResult = null;
            List<string> listModelJson = new List<string>();

            string dtmiPath = DtmiToPath(dtmi);

            if (!string.IsNullOrEmpty(dtmiPath))
            {
                modelContent = await GetModelContentAsync(dtmiPath, false);

                if (string.IsNullOrEmpty(modelContent))
                {
                    // try public repo
                    modelContent = await GetModelContentAsync(dtmiPath);
                }

                if (!string.IsNullOrEmpty(modelContent))
                {
                    listModelJson.Add(modelContent);
                }

                try
                {
                    ModelParser parser = new ModelParser();
                    //parser.DtmiResolver = (IReadOnlyCollection<Dtmi> dtmis) =>
                    //{
                    //    foreach (Dtmi d in dtmis)
                    //    {
                    //        _logger.LogInformation($"-------------  {d}");
                    //    }
                    //    return null;
                    //};
                    parseResult = await parser.ParseAsync(listModelJson);
                }
                catch (Exception e)
                {
                    _logger.LogError($"Error ParseModelAsync(): {e.Message}");
                }
            }
            return parseResult;
        }
        #endregion // resolver
    }
}
