/*
    Document   : ft_language_en.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // General
    m_tableTooltip1 : 'Click here to perform sorting.',
    m_networkConfig : 'Network',

    m_mainLang : 'en',
	m_mainMap : 'map',
	m_mainOA : 'Open Appliance',
	m_mainEnglish : 'English',
	m_mainFrench : 'Fran�ais',
	m_mainLogin : 'OK',
	m_mainLogout: 'log off',
	m_mainUserName: 'user name',
	m_mainPassword: 'password',
	m_mainWarning: '<p>if you have no username and password, contact your Customer Service Center<br/>' +
                   'Warning : to connect to the Open Appliance program your browser must accept pop-ups and cookies</p>',
	m_mainBLBWarning: '<p>if you have no username and password, contact your Customer Service Center<br/>' +
                   'Warning: to connect to the Business Livebox configuration program your browser must accept pop-ups and cookies</p>',
	m_mainWelcome: 'welcome',
	m_mainPleaseSignIn: 'please sign in to the Open Appliance admin service',
	m_menuApp: 'applications',
	m_menuUsers: 'users',
	m_menuMonitor: 'monitoring',
	m_menuBackup: 'backup / restore',
	m_menuConfig: 'configuration',
	m_menuMyProfile: 'my Profile',
	m_menuDashboard: 'dashboard',
	m_menuUpdates: 'updates',
	m_menuUpdatePlan: 'updates planning and history',
	m_menuRestart: 'restart',
	m_menuRestartApp: 'restart application or Open Appliance',
	m_menuSubscribe: 'subscribe',
	m_menuSubcription: 'subscription',
	m_menuUserList: 'user list',
	m_menuUserRight: 'user rights',
	m_menuHardware : 'hardware',
	m_menuHardwareMonitor: 'hardware monitor',
	m_menuNetwork: 'network',
	m_menuNetworkMonitor: 'network monitor',
	m_menuConfigBackup: 'backup',
	m_menuConfigRestore: 'restore',
	m_menuEmailServer: 'email server',
	m_menuEmailServerConfig: 'email server configuration',
	m_menuTimeServer: 'NTP server',
	m_menuTimerServerConfig: 'NTP server configuration',
	m_menuUserDir: 'LDAP server',
	m_menuLDAPConfig: 'LDAP server configuration',
	m_menuBLBAssocication: 'BLB association',
	m_menuPasswordPolicy: 'password Policy',
	m_menuAddUser: 'add user',
	m_menuUpdateUser: 'update user',
	m_menuUpdate: 'update',
	m_menuRestore: 'restore',
	m_menuRestoreDesc: 'description of backup file',
	m_menuBLBCredCheck: 'BLB credentials check',
	m_menuContact: 'contact',
	m_menuSitemap: 'site map',
	m_menuCopyRight: 'copyright France Telecom',

	m_menu_des_App: 'applications',
	m_menu_des_Users: 'users',
	m_menu_des_Monitor: 'monitoring',
	m_menu_des_Backup: 'backup',
	m_menu_des_Config: 'configuration',
	m_menu_des_MyProfile: 'my profile',
	m_menu_des_Dashboard: 'dashboard',
	m_menu_des_Updates: 'updates',
	m_menu_des_UpdatePlan: 'updates planning and history',
	m_menu_des_Restart: 'restart',
	m_menu_des_RestartApp: 'restart application or Open Appliance',
	m_menu_des_Subscribe: 'subscribe',
	m_menu_des_Subcription: 'subscription',
	m_menu_des_UserList: 'user list',
	m_menu_des_UserRight: 'user rights',
	m_menu_des_Hardware : 'hardware',
	m_menu_des_HardwareMonitor: 'hardware monitor',
	m_menu_des_Network: 'network',
	m_menu_des_NetworkMonitor: 'network monitor',
	m_menu_des_ConfigBackup: 'configuration backup',
	m_menu_des_ConfigRestore: 'configuration restore',
	m_menu_des_EmailServer: 'email server',
	m_menu_des_EmailServerConfig: 'email server configuration',
	m_menu_des_TimeServer: 'NTP server',
	m_menu_des_TimerServerConfig: 'NTP server configuration',
	m_menu_des_UserDir: 'user directory',
	m_menu_des_LDAPConfig: 'LDAP server configuration',
	m_menu_des_BLBAssocication: 'BLB association',
	m_menu_des_PasswordPolicy: 'password policy',
	m_menu_des_AddUser: 'add user',
	m_menu_des_UpdateUser: 'update user',
	m_menu_des_Update: 'update',
	m_menu_des_Restore: 'restore',
	m_menu_des_RestoreDesc: 'configuration restore description',
	m_menu_des_BLBCredCheck: 'BLB credentials check',

    ///////////////////////////////////////////////////////////////////
    // tab name
    m_tnBLB : "Business Livebox",
    m_tnOA : "Open Appliance",
    m_tnUTM : "Security",
    m_tnPBX : "Telephony",

    ///////////////////////////////////////////////////////////////////
    // pagination
    m_pgFirst : "first",
    m_pgPrev : "previous",
    m_pgLast : "last",
    m_pgNext : "next",

    ///////////////////////////////////////////////////////////////////
    // Calendar
	m_calToday : 'today',
	m_calClear : 'Clear',
	m_calArrMonthNames : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    m_calArrWeekInits : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    m_calInvalidDateMsg : 'The entered date is invalid.\n',
    m_calOutOfRangeMsg : 'The entered date is out of range.',
    m_calDoesNotExistMsg : 'The entered date does not exist.',
    m_calInvalidAlert : ['Invalid date (', ') ignored.'],
    m_calDateDisablingError : ['Error ', ' is not a Date object.'],
    m_calRangeDisablingError : ['Error ', ' should consist of two elements.'],
    m_calDateDisplayFormat : 'mm-dd-yy',
    m_calDateOutputFormat : 'MM/DD/YYYY',
    //Set it to: 0 (Zero) for Sunday, 1 (One) for Monday etc..
    m_calWeekStart : 0,

    ///////////////////////////////////////////////////////////////////
    // Dash board screen

    // dashboard header
    m_dbHdApplication : 'application',
    m_dbHdStatus : 'status',
    m_dbHdCPU : 'CPU',
    m_dbMemory : 'memory',
    m_dbDiskSpace : 'disk space',
    m_dbUpdateNeeded : 'update needed',
    m_dbTooltipUpdateNeed : 'version to be updated - ',
    m_dbTooltipCancel : 'reset selection',
    m_dbTooltipUpdate : 'update selected applicationss',
    m_dbUsed : "used",
    m_dbTotal : "total",
    m_dbFree : "free",
    m_dbStatusUp : "status is up",
    m_dbStatusDown : "status is down",
    m_dbStatusUnknown : "status is unknown",
    m_dbErrorTitle : "dashboard non available",
    m_dbCriticalUpdate : "A critical update will be installed automatically for",

    ///////////////////////////////////////////////////////////////////
    // VM Update & History screen
    m_uhHdDate : "date",
    m_uhHdWho : 'backup by',
    m_uhErrorTitle : "update error",
    m_uhCancelTitle : 'cancel update schedule',

    ///////////////////////////////////////////////////////////////////
    // VM Update Restore
	m_resUpdateVmName : "application name",
	m_resUpdateCurVer: "current version",
	m_resUpdatePrevVer: "previous version",
	m_resUpdateFail: "restore failed:",

    ///////////////////////////////////////////////////////////////////
    // VM Schedule Update
	m_schedUpdateSched: "Please schedule update for the following applications",
	m_schedUpdateNow: "now",
	m_schedUpdateLater: "later",
	m_schedUpdateNewVer: "new version",
	m_schedUpdateRangeChk: "you schedule six months ahead",
	m_schedUpdateDate: "schedule date",
	m_schedUpdateHour: "schedule hour",
	m_schedUpdateMinute: "schedule minute",
	m_schedUpdateErrorOccur: "the following errors occur while we try to schedule an upgrade:",

    ///////////////////////////////////////////////////////////////////
    // VM Restart screen
    m_restartOA : 'Open Appliance',
    m_restartErrorTitle : 'VM Restart Error',
    m_restartTitle : 'restart VM',
    m_restartStopTitle : 'stop VM',
    m_restartConfirm : 'Are you sure you want to restart',
    m_restartStopConfirm : 'Are you sure you want to stop',

    ///////////////////////////////////////////////////////////////////
    // Subscribe screen
    m_subscribePlease : "Please click on the following links to install/remove an application",
	m_subscribeInstall: "install a new application",
	m_subscribeRemove: "remove an application",

    ///////////////////////////////////////////////////////////////////
    // User List screen
    m_ulErrorTitle : 'get user list error',
    m_ulTooltipAddUser : 'create new user account',
    m_ulDeleteHeader : 'delete user account',
    m_ulClick2Edit : 'click here to edit',
    m_ulSendEmail : 'send email to',
    m_ulDeleteUser : 'delete user',

    ///////////////////////////////////////////////////////////////////
    // User Right screen
    m_urErrorTitle : 'user right error',
    m_urConfirmTitle : 'change user right',
    m_urCommitChange : 'Are you sure you wish to commit the change?',
    m_urBtnApply : 'apply modifications',
    m_urBtnCancel : 'reset',

    ///////////////////////////////////////////////////////////////////
    // User Add screen
    m_userUsername: "username",
	m_userSurname: "last name",
	m_userGivenName: "first name",
	m_userEmail: "email",
    m_userUsernameInvalidCharacter: "User name can only contain alpha numeric characters",

    ///////////////////////////////////////////////////////////////////
    // User Editor screen
    m_userResetPasswdExit : "User already exist",
    m_userResetPasswdNotExit : "User does not exist",
    m_userResetPasswd: "reset password",
    m_userResetPasswdConfirm: "Are you sure you want to reset password for this user?",
	m_userConfirmation: "confirmation",
	m_userResetPasswdSuccess: "password reset successfully",
	m_userResetPasswdComplete: "reset password completed",

    ///////////////////////////////////////////////////////////////////
    // Configuration Restore Description screen
    m_confRestorDescp : 'lorem ipsum onsectetuer....',

    ///////////////////////////////////////////////////////////////////
    // Hw monitor
    m_component : 'component',


    ///////////////////////////////////////////////////////////////////
    // Common variables
    m_cancelConfirm : 'Are you sure you want to cancel',
    m_deleteConfirm : 'Are you sure you want to delete',
    m_login: 'login',
    m_name: 'name',
    m_delete: 'delete',
    m_email: 'email',
    m_password :'password',

    ///////////////////////////////////////////////////////////////////
    // Buttons & Images
    m_imageDir : 'images/en/',
	m_ok: 'ok',
	m_error: 'error',
	m_info: 'information',

    ///////////////////////////////////////////////////////////////////
    // Popup Message Dialog
    m_puSessionTimeout : 'session time out',
    m_puSessionTimeoutMsg : 'For security reasons, your session is no longer active.<br>Please re-login again.',

    ///////////////////////////////////////////////////////////////////
    // Login Dialog
    m_loginPrompt : 'Please enter username and password to login.',
    m_loginError : 'login error',
    m_loginUnableToLogin : 'unable to login: ',
	m_loginContactCS : 'If you have no username and password, contact your Customer Service Center.',
	m_loginEnableJS: 'Warning: to connect to the Open Appliance program, your browser must accept pop-ups and cookies.',

    ///////////////////////////////////////////////////////////////////
    // Mainframe
	m_mainFrmGuest : "guest",
    m_mainFrmWelcome : "welcome",
	m_mainFrmConnected: "You are connected to the Open Appliance admin service",
	m_mainFrmSignIn: "Please sign in to the Open Appliance admin service",

    ///////////////////////////////////////////////////////////////////
    // My Form
	m_formNoEmpty : "cannot be empty",
	m_formFixError: "Please fix the following errors:",
	m_formTooLong : "cannot have more than",
	m_formChar: "characters",
	m_formInvalid: "is invalid",
	m_formSave : "saved",
	m_formPassword: "password",

    ///////////////////////////////////////////////////////////////////
    // Password change dialog
	m_passwordChangePlease : "Please change your password to continue",
	m_passwordChangeSuccess: "The new password has been saved.",
	m_passwordChangeRelogin: "Please click ok button to log in again with the new password",

    ///////////////////////////////////////////////////////////////////
    // My Profile
	m_myprofLogin : "username",
	m_myprofOldPasswd : "old password",
	m_myprofNewPasswd : "new password",
	m_myprofConfirmPasswd : "confirm password",
	m_myprofNPWnotCPW : "New password does not match confirm password",
	m_myprofPasswdRestSucessful: "password reset successfully",
	m_myprofResetPasswdDone: "reset password completed",

    ///////////////////////////////////////////////////////////////////
    // Backup configuration
	m_backupConfig : "config.",
	m_backupData : "data",
	m_backupApp : "application",
	m_backupSelectOne: "Please select at least one application to backup",
	m_backupFail: "Backup failed",
	m_backupInProgress: "Backup is in progress.",
	m_backup2pcInProgress: "Backup is in progress.  It may take a while to finish.  A notification window will popup when the backup file is ready.",
	m_backupPlsDelete: "Maximum of backups stored on the Open Appliance is reached.  Please delete the oldest and try again",
	m_backupMyPC: "my PC",
    m_backupTooltipCancel : 'reset selection',
    m_backupTooltipBackup : 'backup selected applications',
	m_backupPlsWait: "Another backup request is currently being processed.  Please wait for a few minutes and try again.",


    ///////////////////////////////////////////////////////////////////
    // Restore configuration
    m_restoreErrorTitle : 'configuration restore error',
    m_restoreUploadTitle : 'upload restore file',
    m_resoteUploadErrFileType : 'file type is not supported.',
    m_restoreHdContent : 'content',
    m_restoreHdRestore : 'restore',
    m_restoreHdDownload : 'download',
    m_restoreClickRestore : 'click here to restore',
    m_restoreArchive : 'restore backup archive',
    m_restoreDelTitle : 'delete backup archive file',
    m_restoreDel : 'delete backup archive',
    m_restoreDlConfirm : 'Are you sure you want to download the following backup file',
    m_restoreDownload : "download backup archive",
    m_restoreRestorePC : "restore from my PC",
    m_restoreFromMyPCTip : "Click here to start restore from my PC",
    m_restoreInProgress : "restore is in progress.",
    m_resUploadCompleted: "upload files to server has completed.",

    ///////////////////////////////////////////////////////////////////
    // Restore Desc. configuration
    m_resDescErrorTitle : 'configuration restore description',
    m_resDescConfirm : 'Are you sure you want to restore the selection VM?',
    m_resDescHdConf : 'config.',
    m_resDescHdData : 'data',

    ///////////////////////////////////////////////////////////////////
    // BLB configuration
	m_blbStandAloneOA : "stand alone Open Appliance",
	m_blbAssociation : "BLB association",
	m_blbComplete : "BLB association has completed successfully",

    ///////////////////////////////////////////////////////////////////
    // Email Server configuration
	m_emailSmtpAddr : "SMTP server address",
	m_emailLocalMachName : "sender name",
	m_emailLocalEmail : "sender email address",
	m_emailAuthName : "authorization name",
	m_emailAuthPasswd : "authorization password",
	m_emailSrvConfig : "email server configuration",

    ///////////////////////////////////////////////////////////////////
    // LDAP Server configuration
	m_ldapSrvLoc : "LDAP server location",
	m_ldapInOA : "in the Open Appliance",
	m_ldapInLan : "in the company LAN",
	m_ldapSrvAddr: "server address",
	m_ldapSuffix: "Suffix",
	m_ldapUsrUpdateRt : "user (update rights)",
	m_ldapUsrReadRt: "user (read rights)",
	m_ldapPasswdUpdateRt: "password (update rights)",
	m_ldapPasswdReadRt: "password (read rights)",

    ///////////////////////////////////////////////////////////////////
    // Password Policy configuration
	m_passwdPolicyChangeAtLogin : "the user has to change his password at first login",
	m_passwdPolicyCanKeep : "the user can keep his default password",

    ///////////////////////////////////////////////////////////////////
    // NTP server configuration
	m_ntpSrvAddr : "NTP server address",
	m_ntpTimeSrvAddr : "time server address",
	m_ntpTimeSrvConfig: "time server configuration",

    ///////////////////////////////////////////////////////////////////
    // Tooltip
	m_tooltip_cancel : "reset current form",
	m_tooltip_apply: "apply changes",
	m_tooltip_add: "add a new row",
	m_tooltip_delete: "delete a row",
	m_tooltip_back: "go back to previous screen",
	m_tooltip_restore: "restore",
	m_tooltip_update: "update",

    ///////////////////////////////////////////////////////////////////
    // Contact page
	m_contact : "contact",
	m_contact_message: "For your questions, please contact your customer service and dial 3901.",

    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}