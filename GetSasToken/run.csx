#r "Newtonsoft.Json"

using System; 
using System.Net; 
using Newtonsoft.Json;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Azure.Mobile.Server.Files;
using Microsoft.Azure.Mobile.Server.Files.Controllers;
using Microsoft.Azure;

public static async Task<object> Run(HttpRequestMessage req, TraceWriter log)
{ 
    string jsonContent = await req.Content.ReadAsStringAsync();
    dynamic data = JsonConvert.DeserializeObject(jsonContent);

    if (data.container == null) {
        return req.CreateResponse(HttpStatusCode.BadRequest, new {
            error = "Specify value for 'container' and 'permissions'"
        });
    }

    var token = await GetStorageTokenAsync((string) data.container, (StoragePermissions) data.permissions);

    return req.CreateResponse(HttpStatusCode.OK, new {
        token = token.RawToken
    });
}

private static Task<StorageToken> GetStorageTokenAsync(string containerName, StoragePermissions permissions)
{
    const string dummyBlobName = "blob";
    
    var controller = new MyStorageController();
    var resolver = new Resolver(containerName, dummyBlobName);
    var request = new StorageTokenRequest() {
        Permissions = permissions,
        TargetFile = new MobileServiceFile() { Id = containerName, ParentId = containerName }
    };

    return controller.GetStorageTokenAsync(containerName, request, resolver);
}

// create subclass because StorageController is abstract
public class MyStorageController : StorageController<string>
{
    public MyStorageController() : base(new CustomAzureStorageProvider()) { }
}

public class CustomAzureStorageProvider : AzureStorageProvider
{
    public CustomAzureStorageProvider() : base(GetConnectionString())
    { }
 
    internal static string GetConnectionString(string appSettingName = "AzureWebJobsStorage")
    {
        if (appSettingName == null) {
            throw new ArgumentNullException("appSettingName");
        }

        var connectionString = CloudConfigurationManager.GetSetting("AzureWebJobsStorage");

        if (connectionString == null) {
            throw new ArgumentException($"App Setting is missing: {appSettingName}");
        }

        return connectionString;
    }
}

public class Resolver : IContainerNameResolver
{
    private string containerName;
    private string blobName;

    public Resolver(string containerName, string blobName)
    {
        this.containerName = containerName;
        this.blobName = blobName;
    }

    public Task<string> GetFileContainerNameAsync(string tableName, string recordId, string fileName)
    {
        return Task.FromResult(containerName);
    }

    public Task<IEnumerable<string>> GetRecordContainerNames(string tableName, string recordId)
    {
        IEnumerable<string> result = new[] { $"{containerName}/{blobName}" };
        return Task.FromResult(result);
    }
} 

