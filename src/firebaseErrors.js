const firebaseErrorCodes = {
  "auth/invalid-email":
    "The email address is invalid. Please check and try again.",
  "auth/user-disabled": "This account has been disabled by an administrator.",
  "auth/user-not-found": "No user corresponding to the given email was found.",
  "auth/wrong-password":
    "Wrong password. Please try again or use 'Forgot password' to reset it.",
  "auth/too-many-requests":
    "Too many unsuccessful login attempts. Please try again later.",
  "auth/email-already-in-use":
    "An account with this email already exists. Try to log in.",
  "auth/operation-not-allowed":
    "Email/password accounts are not enabled. Contact support.",
  "auth/weak-password":
    "The password is too weak. Please use a stronger password.",
  "auth/account-exists-with-different-credential":
    "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
  "auth/auth-domain-config-required":
    "Authentication domain configuration is required. Please contact technical support.",
  "auth/credential-already-in-use":
    "This credential is already associated with a different user account.",
  "auth/operation-not-supported-in-this-environment":
    "This operation is not supported in the environment this application is running on. 'location.protocol' must be http, https or chrome-extension and web storage must be enabled.",
  "auth/timeout":
    "The request to the authentication server timed out. Please try again.",
  "auth/missing-android-pkg-name":
    "An Android package name must be provided if the Android app is required to be installed.",
  "auth/missing-continue-uri":
    "A continue URL must be provided in the request.",
  "auth/missing-ios-bundle-id":
    "An iOS Bundle ID must be provided if an App Store ID is provided.",
  "auth/invalid-continue-uri":
    "The continue URL provided in the request is invalid.",
  "auth/unauthorized-continue-uri":
    "The domain of the continue URL is not whitelisted. Please whitelist the domain in the Firebase console.",
  "auth/login-blocked":
    "Your login attempt has been blocked. Please try again later.",
  "auth/requires-recent-login":
    "This operation is sensitive and requires recent authentication. Log in again before retrying this request.",
  "auth/email-change-needs-verification":
    "Email changes require verification. Please check your email and verify your address before you can log in.",
  "auth/invalid-user-token":
    "Your user session has expired. Please sign in again.",
  "auth/user-token-expired": "Your session has expired. Please log in again.",
  "auth/null-user": "No user data available. Session might have expired.",
  "auth/app-not-authorized":
    "This app is not authorized to use Firebase Authentication. Please verify that the correct package name and signing certificate are configured in the Firebase Console.",
  "auth/invalid-api-key":
    "Your API key is invalid. Please check that you have copied it correctly from the Firebase console.",
  "auth/network-request-failed":
    "A network error has occurred (such as timeout, interrupted connection, or unreachable host). Please check your network connection and try again.",
  "auth/rejected-credential":
    "The request has been rejected due to invalid credentials. Please review your credentials and try again.",
  "auth/web-storage-unsupported":
    "This browser does not support web storage or cookies have been disabled. Enable cookies or switch to a supported browser.",
  "auth/invalid-verification-code":
    "The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and use the verification code provided by the user.",
  "auth/invalid-verification-id":
    "The verification ID used to create the phone auth credential is invalid.",
  "auth/invalid-credential": "Invalid email/password. Try again."
};

export function getFirebaseErrorMessage(code) {
  return (
    firebaseErrorCodes[code] ||
    "An unexpected error occurred. Please try again."
  );
}
