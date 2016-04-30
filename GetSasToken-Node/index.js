var azure = require('azure-storage');

module.exports = function(context, req) {
    
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.body.container && req.body.blob) {
        
        var connString = process.env.AzureWebJobsStorage;
        var blobService = azure.createBlobService(connString);

        // Provide read access to the container for the next hour
        var startDate = new Date();
        var expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 60);
        startDate.setMinutes(startDate.getMinutes() - 60);

        var sharedAccessPolicy = {
          AccessPolicy: {
            Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
            Start: startDate,
            Expiry: expiryDate
          }
        };
        
        var sasQueryUrl = 
            blobService.generateSharedAccessSignature(
                req.body.container, req.body.blob, sharedAccessPolicy);

        context.res = {
            token: sasQueryUrl
        }; 
    }
    else {
        context.res = {
            status: 400,
            body: "Specify a value for 'container' and 'blob'"
        };
    }
    
    context.done();
};