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
	m_mainOA : 'Open Appliance',
	m_mainLogin : 'Login',
	m_mainLogout: 'log out',
	m_mainUserName: 'User name',
	m_mainPassword: 'Password',
	m_mainWarning: 'If you have no username and password, contact your Customer Service Center.' +
                   'Warning: to connect to the Open Appliance program your browser must accept pop-ups and cookies.',
	m_mainWelcome: 'Welcome',
	m_mainPleaseSignIn: 'please sign in to the Open Appliance admin service',
	m_menuApp: 'Applications',
	m_menuUsers: 'Users',
	m_menuMonitor: 'Monitoring',
	m_menuBackup: 'Backup',
	m_menuConfig: 'Configuration',
	m_menuMyProfile: 'My Profile',
	m_menuDashboard: 'Dashboard',
	m_menuUpdates: 'Updates',
	m_menuUpdatePlan: 'Updates planning and history',
	m_menuRestart: 'Restart',
	m_menuRestartApp: 'Restart application or Open Appliance',
	m_menuSubscribe: 'Subscribe',
	m_menuSubcription: 'Subscription',
	m_menuUserList: 'User List',
	m_menuUserRight: 'User rights',
	m_menuHardware : 'Hardware',
	m_menuHardwareMonitor: 'Hardware monitor',
	m_menuNetwork: 'Network',
	m_menuNetworkMonitor: 'Network monitor',
	m_menuConfigBackup: 'Configuration backup',
	m_menuConfigRestore: 'Configuration restore',
	m_menuEmailServer: 'Email server',
	m_menuEmailServerConfig: 'Email server configuration',
	m_menuTimeServer: 'Time server',
	m_menuTimerServerConfig: 'Time server configuration',
	m_menuUserDir: 'User directory',
	m_menuLDAPConfig: 'LDAP server configuration',
	m_menuBLBAssocication: 'BLB association',
	m_menuPasswordPolicy: 'Password Policy',
	m_menuAddUser: 'Add user',
	m_menuUpdateUser: 'Update user',
	m_menuUpdate: 'Update',
	m_menuRestore: 'Restore',
	m_menuRestoreDesc: 'Configuration restore description',
	m_menuBLBCredCheck: 'BLB credentials check',
	m_menuContact: 'contact',
	m_menuSitemap: 'site map',
	m_menuCopyRight: 'Copyright France Telecom',

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
    m_dbErrorTitle : 'VM Dashboard Error',

    ///////////////////////////////////////////////////////////////////
    // VM Update & History screen
    m_uhHdData : "Date",
    m_uhErrorTitle : "VM Update Error",
    m_uhCancelTitle : 'Cancel Update Schedule',

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
    m_restartOA : 'Open Appliance',
    m_restartErrorTitle : 'VM Restart Error',
    m_restartTitle : 'Restart VM',
    m_restartStopTitle : 'Stop VM',
    m_restartConfirm : 'Are you sure you want to restart',
    m_restartStopConfirm : 'Are you sure you want to stop',

    ///////////////////////////////////////////////////////////////////
    // Subscribe screen
    m_subscribePlease : "Please click on the following to install/remove an application",
	m_subscribeInstall: "Install a new Application",
	m_subscribeRemove: "Remove a new Application",

    ///////////////////////////////////////////////////////////////////
    // User List screen
    m_ulErrorTitle : 'Get User List Error',
    m_ulTooltipAddUser : 'Create new user account',
    m_ulDeleteHeader : 'Delete User Account',
    m_ulClick2Edit : 'Click here to edit',
    m_ulSendEmail : 'Send email to',
    m_ulDeleteUser : 'Delete user',

    ///////////////////////////////////////////////////////////////////
    // User Right screen
    m_urErrorTitle : 'User Right Error',
    m_urConfirmTitle : 'Change User Right',
    m_urCommitChange : 'Are you sure you wish to commit the change?',
    m_urBtnApply : 'Set selection',
    m_urBtnCancel : 'Reset selection',

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
    m_confHeaderText : 'Lorem ipsum onsectetuer adipiscing elit, sed diam ' +
            'nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam ' +
            'erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci ' +
            'tation ullamcorper suscipit lobortis nisl ut aliquip ex ea ' +
            'commodo consequat.<br><br>',
    m_cancelConfirm : 'Are you sure you want to cancel',
    m_deleteConfirm : 'Are you sure you want to delete',
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
    m_restoreErrorTitle : 'Configuration Restore Error',
    m_restoreHdContent : 'Content',
    m_restoreHdRestore : 'Restore',
    m_restoreHdDownload : 'Download',
    m_restoreClickRestore : 'Click here to restore',
    m_restoreArchive : 'Restore backup archive',
    m_restoreDelTitle : 'Delete Backup Archive File',
    m_restoreDel : 'Delete backup archive',
    m_restoreDlConfirm : 'Are you sure you want to download',
    m_restoreDownload : 'Download backup archive',


    ///////////////////////////////////////////////////////////////////
    // Restore Desc. configuration
    m_resDescErrorTitle : 'Configuration Restore Description',
    m_resDescConfirm : 'Are you sure you want to restore the selection VM?',
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
	m_emailSmtpAddr : "SMTP server address",
	m_emailLocalMachName : "Local machine name",
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