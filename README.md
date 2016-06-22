# GetSasToken-function
Azure Function for getting a SAS token for a container

## Node.js version

    SharedAccessPermissions: {
        ADD: 'a',
        READ: 'r',
        WRITE: 'w',
        DELETE: 'd',
        LIST: 'l'
    }

## C# version

    public enum SharedAccessBlobPermissions
    {
        None = 0,
        Read = 1,
        Write = 2,
        Delete = 4,
        List = 8,
        Add = 16,
        Create = 32
    }    
    