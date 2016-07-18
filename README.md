# F5 Multi-factor Authentication
This iRules LX project provides multi-factor authentication and self enrollment for Google Authenticator and Yubico OTP via a Yubikey.

### Installation 
You'll need to create a iRules LX workspace and plugin - details can be found in the DevCentral [Getting Started with iRules LX series] (https://devcentral.f5.com/articles/sid/6964)

Note: If you want to keep things simple then using the following naming convention:

* Workspace: f5_mfa
* Plugin: f5_mfa_plugin
* Extension: f5_mfa_extension

1. Update the iRule ILX::init with the name of your plugin and your extension (if you didn't follow the naming convention)

   ```set ilx_handle [ILX::init "plugin_name" "extension_name"]```
1. You'll need to update the YubiCloud ClientID and SecretKey in index.js if you're using the YubiCloud verification server.

   ```
// Change clientID and secret to your YubiCloud information
var clientID = ""
var secretKey = ""
   ```
1. SSH into your BIG-IP and nstall the node modules
   ```
cd /var/ilx/workspaces/Common/f5_mfa/extensions/f5_mfa_extension/
npm install node-rest-client qr-image speakeasy yub --save
```
5. Add the iRule to you APM Virtual Server


### ToDo:
  * add documentation on APM profile creation

