var azure = require('azure-storage');

module.exports = function(context, req) {
    if (req.body.container) {
        context.res = generateSasToken(context, req.body.container, req.body.blobName, req.body.permissions);
    } else {
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
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    permissions = permissions || azure.BlobUtilities.SharedAccessPermissions.READ;

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: permissions,
            Start: startDate,
            Expiry: expiryDate
        }
    };
    
    return {
        token: blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy),
        uri: blobService.getUrl(container, blobName, sasToken, true)
    };
}
