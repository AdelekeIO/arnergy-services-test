const OAuthClient = require("intuit-oauth");

const oauthClient = new OAuthClient({
  clientId: "ABTvKheMheA5A371dMZIqS5y6yIsq9quo5nHxxPEQljBWYDBZt",
  clientSecret: "F3cJ4yUE4HYHf0S2ilCErPbsGYo0Jf47f0Xw2lU0",
  environment: "sandbox" || "production",
  redirectUri: "https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl",
});

const authUri = oauthClient.authorizeUri({
  scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
  state: "testState",
}); // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}

console.log({ authUri });

oauthClient
  .createToken("https://appcenter.intuit.com/connect/oauth2")
  .then(function (authResponse) {
    console.log("The Token is  " + JSON.stringify(authResponse.getJson()));
  })
  .catch(function (e) {
    console.error("The error message is :" + e.originalMessage);
    console.error(e.intuit_tid);
  });

if (oauthClient.isAccessTokenValid()) {
  console.log("The access_token is valid");
}

if (!oauthClient.isAccessTokenValid()) {
  console.log("Heyyyyy");

  oauthClient
    .refresh()
    .then(function (authResponse) {
      console.log("Tokens refreshed : " + JSON.stringify(authResponse.json()));
    })
    .catch(function (e) {
      console.error("The error message is :" + e.originalMessage);
      console.error(e.intuit_tid);
    });
}

// const axios = require("axios");
// const oauth = require("axios-oauth-client");

// const connect = async () => {
//   const getAuthorizationCode = await oauth.client(axios.create(), {
//     url: "https://oauth.com/2.0/token",
//     grant_type: "authorization_code",
//     client_id: "ABTvKheMheA5A371dMZIqS5y6yIsq9quo5nHxxPEQljBWYDBZt",
//     client_secret: "F3cJ4yUE4HYHf0S2ilCErPbsGYo0Jf47f0Xw2lU0",
//     redirect_uri: "...",
//     code: "...",
//     scope: "baz",
//   });

//   const auth = await getAuthorizationCode();
//   // => { "access_token": "...", "expires_in": 900, ... }
//   console.log({ auth: JSON.stringify(auth) });
// };

// connect();
