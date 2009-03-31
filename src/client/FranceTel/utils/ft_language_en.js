/*
    Document   : ft_language_en.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // Dash board screen

    // dashboard header
    m_dbHdApplication : 'Application',
    m_dbHdStatus : 'Status',
    m_dbHdCPU : 'CPU',
    m_dbMemory : 'Memory',
    m_dbDiskSpace : 'Disk Space',
    m_dbUpdateNeeded : 'Update Needed',
    m_dbTooltipUpdateNeed : 'Version to be updated - ',
    m_dbTooltipCancel : 'Reset selection',
    m_dbTooltipUpdate : 'Update selected VM(s)',
    m_dbUsed : "Used",
    m_dbTotal : "Total",
    m_dbFree : "Free",
    m_dbStatusUp : "Status is Up",
    m_dbStatusDown : "Status is Down",
    m_dbStatusUnknown : "Status is Unknown",

    ///////////////////////////////////////////////////////////////////
    // VM Update & History screen
    m_uhHdData : "Date",

    ///////////////////////////////////////////////////////////////////
    // VM Update Restore
	m_resUpdateVmName : "vm name",
	m_resUpdateCurVer: "Current version",
	m_resUpdatePrevVer: "Previous version",
	m_resUpdateFail: "Restore failed:",

    ///////////////////////////////////////////////////////////////////
    // VM Schedule Update
	m_schedUpdateSched: "Please schedule update for the following applications",
	m_schedUpdateNow: "Now",
	m_schedUpdateLater: "Later",
	m_schedUpdateNewVer: "new version",
	m_schedUpdateRangeChk: "you schedule six months ahead",
	m_schedUpdateDate: "Schedule date",
	m_schedUpdateHour: "Schedule hour",
	m_schedUpdateMinute: "Schedule minute",
	m_schedUpdateErrorOccur: "The following errors occur while we try to schedule an upgrade:",

    ///////////////////////////////////////////////////////////////////
    // VM Restart screen

    ///////////////////////////////////////////////////////////////////
    // Subscribe screen
    m_subscribePlease : "Please click on the following to install/remove an application",
	m_subscribeInstall: "Install a new Application",
	m_subscribeRemove: "Remove a new Application",

    ///////////////////////////////////////////////////////////////////
    // User List screen
    m_ulTooltipAddUser : 'Create new user account',
    m_ulDeleteHeader : 'Delete User Account',

    ///////////////////////////////////////////////////////////////////
    // User Right screen

    ///////////////////////////////////////////////////////////////////
    // User Add screen
    m_userUsername: "username",
	m_userSurname: "surname",
	m_userGivenName: "given name",
	m_userEmail: "email",

    ///////////////////////////////////////////////////////////////////
    // User Editor screen
    m_userResetPasswd: "Reset password",
    m_userResetPasswdConfirm: "Are you sure you want to reset password for this user?",
	m_userConfirmation: "confirmation",
	m_userResetPasswdSuccess: "Password reset successfully",
	m_userResetPasswdComplete: "Reset password completed",

    ///////////////////////////////////////////////////////////////////
    // Configuration Restore Description screen
    m_confRestorDescp : 'lorem ipsum onsectetuer....',

    ///////////////////////////////////////////////////////////////////
    // Hw monitor
    m_component : 'Component',


    ///////////////////////////////////////////////////////////////////
    // Common variables
    m_login: 'Login',
    m_name: 'Name',
    m_delete: 'Delete',
    m_email: 'Email',
    m_password :'Password',

    ///////////////////////////////////////////////////////////////////
    // Buttons & Images
    m_imageDir : 'images/',
	m_ok: 'ok',
	m_error: 'Error',
	m_info: 'Information',

    ///////////////////////////////////////////////////////////////////
    // Popup Message Dialog
    m_puSessionTimeout : 'Session Time Out',
    m_puSessionTimeoutMsg : 'For security reasons, your session is no longer active.<br>Please re-login again.',

    ///////////////////////////////////////////////////////////////////
    // Login Dialog
    m_loginPrompt : 'Please enter username and password to login.',
    m_loginError : 'Login error',
    m_loginUnableToLogin : 'Unable to login: ',
	m_loginContactCS : 'If you have no username and password, contact your Customer Service Center.',
	m_loginEnableJS: 'Warning: to connect to the Open Appliance program, your browser must accept pop-ups and cookies.',

    ///////////////////////////////////////////////////////////////////
    // Mainframe
	m_mainFrmGuest : "guest",
    m_mainFrmWelcome : "welcome",
	m_mainFrmConnected: "you are connected to the Open Appliance admin service",
	m_mainFrmSignIn: "please sign in to the Open Appliance admin service",

    ///////////////////////////////////////////////////////////////////
    // My Form
	m_formNoEmpty : "cannot be empty",
	m_formFixError: "Please fix the following errors:",
	m_formInvalid: "is invalid",
	m_formSave : "saved",
	m_formPassword: "password",

    ///////////////////////////////////////////////////////////////////
    // My Profile
	m_myprofLogin : "Login",
	m_myprofOldPasswd : "Old password",
	m_myprofNewPasswd : "New password",
	m_myprofConfirmPasswd : "Confirm password",
	m_myprofNPWnotCPW : "New password does not match confirm password",
	m_myprofPasswdRestSucessful: "Password reset successfully",
	m_myprofResetPasswdDone: "Reset password completed",

    ///////////////////////////////////////////////////////////////////
    // Backup configuration
	m_backupConfig : "Config.",
	m_backupData : "Data",
	m_backupApp : "Application",
	m_backupSelectOne: "Please select at least one application to backup",
	m_backupFail: "Backup failed",
	m_backupInProgress: "Backup is in progress.  You will receive an email notification when the operation is finshed",
	m_backupThereR: "There are",
	m_backupPlsDelete: "backups already stored on the Open Appliance.  Please delete the oldest and try again",
	m_backupMyPC: "My PC",

    ///////////////////////////////////////////////////////////////////
    // Restore configuration
    m_restoreHdContent : 'Content',
    m_restoreHdRestore : 'Restore',
    m_restoreHdDownload : 'Download',

    ///////////////////////////////////////////////////////////////////
    // Restore Desc. configuration
    m_resDescHdConf : 'Config.',
    m_resDescHdData : 'Data',

    ///////////////////////////////////////////////////////////////////
    // BLB configuration
	m_blbStandAloneOA : "Stand alone Open Appliance",
	m_blbAssociation : "BLB association",
	m_blbComplete : "BLB association has completed successfully",

    ///////////////////////////////////////////////////////////////////
    // BLB configuration
	m_blbStandAloneOA : "Stand alone Open Appliance",

    ///////////////////////////////////////////////////////////////////
    // Email Server configuration
	m_emailStmpAddr : "SMTP server address",
	m_emailLocalMachNam : "Local machine name",
	m_emailLocalEmail : "Local email address",
	m_emailAuthName : "Authorization name",
	m_emailAuthPasswd : "Authorization password",
	m_emailSrvConfig : "Email server configuration",

    ///////////////////////////////////////////////////////////////////
    // LDAP Server configuration
	m_ldapSrvLoc : "LDAP server location",
	m_ldapInOA : "In the Open Appliance",
	m_ldapInLan : "In the company LAN",
	m_ldapSrvAddr: "Server address",
	m_ldapUsrUpdateRt : "User (update rights)",
	m_ldapUsrReadRt: "User (read rights)",
	m_ldapPasswdUpdateRt: "Password (update rights)",
	m_ldapPasswdReadRt: "Password (read rights)",

    ///////////////////////////////////////////////////////////////////
    // Password Policy configuration
	m_passwdPolicyChangeAtLogin : "The user has to change his password at first login",
	m_passwdPolicyCanKeep : "The user can keep hsi default password",

    ///////////////////////////////////////////////////////////////////
    // NTP server configuration
	m_ntpSrvAddr : "NTP server address",
	m_ntpTimeSrvAddr : "Time server address",
	m_ntpTimeSrvConfig: "Time server configuration",

    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}