import React, { useEffect } from 'react';

const GoogleSignInTest = () => {

    useEffect(() => {
        loadGoogleScript(() => {
            (window.google.accounts.id as any).initialize({
                client_id: '239924498555-ttk9cn2eg5j31kh85jdgidu1gm1qbhpo.apps.googleusercontent.com',
                callback: handleCredentialResponse
              });
            window.google.accounts.id.prompt();
        });
    }, []);

    const loadGoogleScript = (callback: ((this: GlobalEventHandlers, ev: Event) => any) | null) => {
        const script = document.createElement("script");
        script.defer = true
        script.referrerPolicy = "same-origin-allow-popups"
        script.src = "https://accounts.google.com/gsi/client";
        
        script.onload = callback;
        document.body.appendChild(script);
    };

    const handleCredentialResponse = (response: any) => {
        console.log(response);
        // Here you handle the response from Google. Typically, you'll send this 
        // response to your server to verify it and authenticate the user.
    };

    return (
        <div>
            <div id="gSignInWrapper">
                <span className="label">Sign in with:</span>
                <div id="customBtn" className="customGPlusSignIn">
                    <span className="icon"></span>
                    <span className="buttonText">Google</span>
                </div>
            </div>
       

 {/* use redirect if everything else fails -- see console crossorigin warning --Leah  */}
<div id="g_id_onload"
     data-client_id="239924498555-ttk9cn2eg5j31kh85jdgidu1gm1qbhpo.apps.googleusercontent.com"
     data-context="signup"
     data-ux_mode="popup"  
     data-login_uri="http://192.168.1.80:5053/sign-in-google"
     data-nonce=""
     data-auto_select="true"
     data-itp_support="true">
</div>

<div className="g_id_signin"
     data-type="standard"
     data-shape="rectangular"
     data-theme="filled_black"
     data-text="signup_with"
     data-size="large"
     data-logo_alignment="left">
</div>
        </div>
        
    );
};

export default GoogleSignInTest;
