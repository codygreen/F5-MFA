#
# Google Authenticator iRulesLX RPC.
#

when HTTP_REQUEST {
    set ilx_handle [ILX::init "f5_mfa_plugin" "f5_mfa_extension"] 
    if {[HTTP::uri] starts_with "/generateQRCode" && 
        [ACCESS::session data get session.custom.is_enrolled] == 0} {
        # set username
        set user [ACCESS::session data get session.logon.last.username] 
        # create a random secret
        if {[catch {set secret [ILX::call $ilx_handle "generateSecret" $user]} result]} {
            log local0.error "Client - [IP::client_addr], ILX failure: $result"
            return
        }   
        # ensure user and secret are defined before we create the QR code
        if {[info exists user] && [info exists secret]} {
            #save secret
            ACCESS::session data set session.custom.secret $secret
            # generate QR code
            if {[catch {set qr_code [ILX::call $ilx_handle "generateQRCode" $user $secret]} result]} {
                log local0.error "Client - [IP::client_addr], ILX failure: $result"
                return
            }
        } else {
            log local0.error "user or secret not defined, cannot create QR code"
            return
        }
        # ensure a QR code was returned
        if {[info exists qr_code]} {
            HTTP::respond 200 content $qr_code Content-Type "image/svg+xml"  Connection "close"
        } else {
            log local0.error "no QR code generated"
        }
    }
}

when ACCESS_POLICY_AGENT_EVENT {
    switch [ACCESS::policy agent_id] {
        "is_enrolled" {
            set user [ACCESS::session data get session.logon.last.username]
            set secret [class match -value $user equals token_keys] 
            if {$secret != ""} {
                ACCESS::session data set session.custom.is_enrolled 1
                ACCESS::session data set session.custom.secret $secret
                log local0. "STORE SECRET $secret"
            } else {
                ACCESS::session data set session.custom.is_enrolled 0
                log local0.error "Cannot access secret for $user"
            }
        }
        "verify_token" {
            set ilx_handle [ILX::init "google_auth_plugin" "google_auth_extension"] 
            set token [ACCESS::session data get session.logon.last.token]
            # if this is a Yubikey user we'll need to set the secret
            if {([string length $token] > 6) && ([ACCESS::session data get session.custom.is_enrolled] == 0) } {                
                set secret [string range $token 0 end-32]
log local0. "new yubickey $secret , token: $token"
                ACCESS::session data set session.custom.secret $secret
            } else {
                set secret [ACCESS::session data get session.custom.secret]
            }


            
            

            if {$secret eq "" || $token eq ""} {
                log local0.error "cannot verify token, either secret or token is null"
log local0. "secret: $secret , token: $token"
                return
            }
            if {[catch {set result [ILX::call $ilx_handle "verifyToken" $secret $token] } result]} {
                log local0.error "verify_token: Client - [IP::client_addr], ILX failure: $result"
                return
            }
            if {$result == 1} {
                ACCESS::session data set session.custom.verified 1
                # if they're a new user add them to the DG
                if {[ACCESS::session data get session.custom.is_enrolled] == 0} {
                    set user [ACCESS::session data get session.logon.last.username]
                    if {[catch {set result [ILX::call $ilx_handle "addUser" $user $secret]} result]} {
                        log local0.error "Client - [IP::client_addr], ILX failure: $result"
                        return
                    }
                    ACCESS::session data set session.custom.is_enrolled 1
                }
            } else {
                ACCESS::session data set session.custom.verified 0
                log local0.error "unable to verify token: $result"
            }
        }
    }
}






