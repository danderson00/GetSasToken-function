var azure = require('azure-storage');

module.exports = function(context, req) {
    
    if (req.body.container) {
       generateSasToken(context, req.body.container, req.body.blobName, req.body.permissions);
    }
    else {
        context.res = {
            status: 400,
            body: "Specify a value for 'container'"
        };
    }
    
    context.done();
};

function generateSasToken(context, container, blobName, permissions) {
    var connString = process.env.AzureWebJobsStorage;
    var blobService = azure.createBlobService(connString);

    // Create a SAS token that expires in an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);
    startDate.setMinutes(startDate.getMinutes() - 5);

    permissions = !permissions ? azure.BlobUtilities.SharedAccessPermissions.READ : permissions; 

    var sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: permissions,
        Start: startDate,
        Expiry: expiryDate
      }
    };
    
    var sasToken = 
        blobService.generateSharedAccessSignature(
            container, blobName, sharedAccessPolicy);
    var sasUrl = blobService.getUrl(container, blobName, sasToken, true);        

    context.res = {
        token: sasToken,
        uri: sasUrl
    };     
    
}