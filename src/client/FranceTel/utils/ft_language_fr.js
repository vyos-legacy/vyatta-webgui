/*
    Document   : ft_language_fr.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // General	
	m_tableTooltip1 : "Cliquez ici pour faire le tri",
    m_networkConfig : 'Network',
	
	m_mainLang : 'fr',
    m_mainMap : 'map',	
	m_mainOA : 'Open Appliance',
	m_mainEnglish : 'English',
	m_mainFrench : 'Français',	
	m_mainLogin : 'Login',
	m_mainLogout: 'log out',
	m_mainUserName: 'User name',
	m_mainPassword: 'Password',
	m_mainWarning: "<p>Si vous ne possédez pas de login et/ou de mot de passe, contacter votre Centre Service Client<br/>" +
                   "Attention ! Pour pouvoir vous connecter au programme de configuration de l'Open Appliance, votre navigateur doit accepter les pop-up et cookies</p>",
	m_mainBLBWarning: "<p>Si vous ne possédez pas de login et/ou de mot de passe, contacter votre Centre Service Client<br/>" +
                   "Attention ! Pour pouvoir vous connecter au programme de configuration de la Business Livebox, votre navigateur doit accepter les pop-up et cookies</p>",				   
	m_mainWelcome: 'Welcome',
	m_mainPleaseSignIn: 'please sign in to the Open Appliance admin service',
	m_menuApp: 'applications',
	m_menuUsers: 'users',
	m_menuMonitor: 'monitoring',
	m_menuBackup: 'backup',
	m_menuConfig: 'configuration',
	m_menuMyProfile: 'my profile',
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
	m_menuConfigBackup: 'configuration backup',
	m_menuConfigRestore: 'configuration restore',
	m_menuEmailServer: 'email server',
	m_menuEmailServerConfig: 'email server configuration',
	m_menuTimeServer: 'time server',
	m_menuTimerServerConfig: 'time server configuration',
	m_menuUserDir: 'user directory',
	m_menuLDAPConfig: 'LDAP server configuration',
	m_menuBLBAssocication: 'BLB association',
	m_menuPasswordPolicy: 'password policy',
	m_menuAddUser: 'add user',
	m_menuUpdateUser: 'update user',
	m_menuUpdate: 'update',
	m_menuRestore: 'restore',
	m_menuRestoreDesc: 'configuration restore description',
	m_menuBLBCredCheck: 'BLB credentials check',
	m_menuContact: 'contact',
	m_menuSitemap: 'site map',
	m_menuCopyRight: 'Copyright France Telecom',
	
	m_menu_des_App: 'Applications',
	m_menu_des_Users: 'Users',
	m_menu_des_Monitor: 'Monitoring',
	m_menu_des_Backup: 'Backup',
	m_menu_des_Config: 'Configuration',
	m_menu_des_MyProfile: 'My Profile',
	m_menu_des_Dashboard: 'Dashboard',
	m_menu_des_Updates: 'Updates',
	m_menu_des_UpdatePlan: 'Updates planning and history',
	m_menu_des_Restart: 'Restart',
	m_menu_des_RestartApp: 'Restart application or Open Appliance',
	m_menu_des_Subscribe: 'Subscribe',
	m_menu_des_Subcription: 'Subscription',
	m_menu_des_UserList: 'User List',
	m_menu_des_UserRight: 'User rights',
	m_menu_des_Hardware : 'Hardware',
	m_menu_des_HardwareMonitor: 'Hardware monitor',
	m_menu_des_Network: 'Network',
	m_menu_des_NetworkMonitor: 'Network monitor',
	m_menu_des_ConfigBackup: 'Configuration backup',
	m_menu_des_ConfigRestore: 'Configuration restore',
	m_menu_des_EmailServer: 'Email server',
	m_menu_des_EmailServerConfig: 'Email server configuration',
	m_menu_des_TimeServer: 'Time server',
	m_menu_des_TimerServerConfig: 'Time server configuration',
	m_menu_des_UserDir: 'User directory',
	m_menu_des_LDAPConfig: 'LDAP server configuration',
	m_menu_des_BLBAssocication: 'BLB association',
	m_menu_des_PasswordPolicy: 'Password Policy',
	m_menu_des_AddUser: 'Add user',
	m_menu_des_UpdateUser: 'Update user',
	m_menu_des_Update: 'Update',
	m_menu_des_Restore: 'Restore',
	m_menu_des_RestoreDesc: 'Configuration restore description',
	m_menu_des_BLBCredCheck: 'BLB credentials check',

    ///////////////////////////////////////////////////////////////////
    // Calendar
	m_calToday : "aujourd'hui",
	m_calClear : 'Clear',
	m_calArrMonthNames : ['janv.', 'fevr.', 'mars', 'avril', 'mai', 'juin', 'juil', 'août', 'sept.', 'oct.', 'nov.', 'dec.'],
    m_calArrWeekInits : ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    m_calInvalidDateMsg : "La date d'entrée n'est pas valide.\n",
    m_calOutOfRangeMsg : "La date d'entrée est hors de portée.",
    m_calDoesNotExistMsg : "La date d'entrée n'existe pas.",
    m_calInvalidAlert : ["Date incorrecte (", ") ignoré."],
    m_calDateDisablingError : ["Erreur ", " la date n'est pas un objet."],
    m_calRangeDisablingError : ["Erreur ", " devrait être composé de deux éléments."],
    m_calDateDisplayFormat : 'dd-mm-yy',
    m_calDateOutputFormat : 'DD/MM/YYYY',
    //Set it to: 0 (Zero) for Sunday, 1 (One) for Monday etc..	
    m_calWeekStart : 1,		
	
    ///////////////////////////////////////////////////////////////////
    // Dash board screen

    // dashboard header
    m_dbHdApplication : "Application",
    m_dbHdStatus : "Status",
    m_dbHdCPU : "CPU",
    m_dbMemory : "Memory",
    m_dbDiskSpace : "Disk Space",
    m_dbUpdateNeeded : "Update Needed",
    m_dbTooltipUpdateNeed : "Version to be updated - ",
    m_dbTooltipCancel : "Reset selection",
    m_dbTooltipUpdate : "Update selected VM(s)",
    m_dbUsed : "Used",
    m_dbTotal : "Total",
    m_dbFree : "Free",
    m_dbStatusUp : "Status is Up",
    m_dbStatusDown : "Status is Down",
    m_dbStatusUnknown : "Status is Unknown",
    m_dbErrorTitle : 'VM Dashboard Error',
    m_dbCriticalUpdate : "Une mise à jour critique sera installé automatiquement pour",

    ///////////////////////////////////////////////////////////////////
    // VM Update & History screen
    m_uhHdDate : "Date",
    m_uhHdWho : "Sauvegarde En",
    m_uhErrorTitle : "Erreur de mise à jour de VM",
    m_uhCancelTitle : "Annuler la mise à jour de l'annexe",

    ///////////////////////////////////////////////////////////////////
    // VM Update Restore
	m_resUpdateVmName : "vm nom",		
	m_resUpdateCurVer: "Version actuelle",
	m_resUpdatePrevVer: "version précédente",
	m_resUpdateFail: "Restore a échoué:",
	m_resUploadCompleted: "Upload files has completed.",

    ///////////////////////////////////////////////////////////////////
    // VM Schedule Update
	m_schedUpdateSched: "S'il vous plaît le calendrier de mise à jour pour les applications suivantes",		
	m_schedUpdateNow: "Now",
	m_schedUpdateLater: "Ultérieure",
	m_schedUpdateNewVer: "nouvelle version",
	m_schedUpdateRangeChk: "vous planifiez six mois à venir",
	m_schedUpdateDate: "Tableau date",
	m_schedUpdateHour: "Tableau heure",
	m_schedUpdateMinute: "Tableau minute",
	m_schedUpdateErrorOccur: "Les erreurs suivantes se produisent lorsque nous tentons de prévoir une mise à jour:",


    ///////////////////////////////////////////////////////////////////
    // VM Restart screen
    m_restartOA : 'Open Appliance',
    m_restartErrorTitle : 'VM Restart Error',
    m_restartTitle : 'Restart VM',
    m_restartStopTitle : 'Stop VM',
    m_restartConfirm : "Êtes-vous sûr de vouloir redémarrer",
    m_restartStopConfirm : "Êtes-vous sûr de vouloir arrêter",

    ///////////////////////////////////////////////////////////////////
    // Subscribe screen
    m_subscribePlease : "S'il vous plaît cliquer sur le texte suivant pour installer / supprimer une application",
	m_subscribeInstall: "Installer une nouvelle application",
	m_subscribeRemove: "Supprimer une nouvelle application",

    ///////////////////////////////////////////////////////////////////
    // User List screen
    m_ulErrorTitle : "Get User List erreur",
    m_ulTooltipAddUser : "Créer un nouveau compte utilisateur",
    m_ulDeleteHeader : "Supprimer des comptes utilisateur",
    m_ulClick2Edit : "Cliquez ici pour modifier",
    m_ulSendEmail : "Envoyer un e-mail à",
    m_ulDeleteUser : "Supprimer l'utilisateur",

    ///////////////////////////////////////////////////////////////////
    // User Right screen
    nm_urErrorTitle : "Erreur de droit de l'utilisateur",
    m_urConfirmTitle : "changement droit de l'utilisateur",
    m_urCommitChange : "Êtes-vous sûr de vouloir engager le changement?",
    m_urBtnApply : "de sélection fixés",
    m_urBtnCancel : "Réinitialiser la sélection",

    ///////////////////////////////////////////////////////////////////
    // User Add screen
    m_userUsername: "utilisateur",
	m_userSurname: "nom",
	m_userGivenName: "prénom",
	m_userEmail: "e-mail",
    m_userUsernameInvalidCharacter: "User name can only alpha numeric characters",

    ///////////////////////////////////////////////////////////////////
    // User Editor screen
    m_userResetPasswdExit : "L'utilisateur existe déjà",
    m_userResetPasswdNotExit : "L'utilisateur n'existe pas",
    m_userResetPasswd: "Réinitialiser le mot de passe",
    m_userResetPasswdConfirm: "Êtes-vous sûr de vouloir réinitialiser le mot de passe pour cet utilisateur?",
	m_userConfirmation: "confirmation",
	m_userResetPasswdSuccess: "Mot de passe réinitialisé avec succès",
	m_userResetPasswdComplete: "Réinitialiser le mot de passe achevé",

    ///////////////////////////////////////////////////////////////////
    // Configuration Restore Description screen
    m_confRestorDescp : 'lorem ipsum onsectetuer....',

    ///////////////////////////////////////////////////////////////////
    // Common variables
    m_cancelConfirm : 'Êtes-vous sûr de vouloir annuler',
    m_deleteConfirm : 'Êtes-vous sûr de vouloir supprimer',
    m_login: 'Login',
    m_name: 'Nom',
    m_delete: "Supprimer",
    m_email: 'Email',
    m_password :'Password',

    ///////////////////////////////////////////////////////////////////
    // Buttons & Images
    m_imageDir : 'images/fr/',
	m_ok: 'ok',
	m_error: 'Erreur',
	m_info: 'Information',

    ///////////////////////////////////////////////////////////////////
    // Popup Message Dialog
    m_puSessionTimeout : "Session Time Out",
    m_puSessionTimeoutMsg : "Pour des raisons de sécurité, votre session n'est plus active<br>S'il vous plaît ré-ouvrir une nouvelle session.",

    ///////////////////////////////////////////////////////////////////
    // Login Dialog
    m_loginPrompt : "S'il vous plaît entrer le nom d'utilisateur et mot de passe pour vous connecter.",
    m_loginError : "Erreur d'identification",
    m_loginUnableToLogin : "Impossible de se connecter: ",
	m_loginContactCS : "Si vous n'avez pas de nom d'utilisateur et votre mot de passe, contactez votre Centre de Service à la clientèle.",
	m_loginEnableJS: "Attention: pour se connecter à l'Open Appliance programme, votre navigateur doit accepter les pop-ups et les cookies.",

    ///////////////////////////////////////////////////////////////////
    // Mainframe
	m_mainFrmGuest : "visiteur",
    m_mainFrmWelcome : "salut",	
	m_mainFrmConnected: "vous êtes connecté à l'Open Appliance service admin",
	m_mainFrmSignIn: "s'il vous plaît vous connecter à l'Open Appliance service admin",

    ///////////////////////////////////////////////////////////////////
    // My Form
	m_formNoEmpty : "ne peut pas être vide",		
	m_formFixError: "S'il vous plaît corriger les erreurs suivantes:",
	m_formInvalid: "est invalide",
	m_formSave : "sauvé",

     //////////////////////////////////////////////////////////
    // Password change dialog
      m_passwordChangePlease : "S'il vous plaît changer votre mot de passe pour continuer",
      m_passwordChangeSuccess: "Le nouveau mot de passe a été enregistré.",
      m_passwordChangeRelogin: "S'il vous plaît cliquez sur OK pour une reconnexion avec le nouveau mot de passe",

    ///////////////////////////////////////////////////////////////////
    // My Profile
	m_myprofLogin : "Login",
	m_myprofOldPasswd : "Ancien mot de passe",		
	m_myprofNewPasswd : "Nouveau mot de passe",
	m_myprofConfirmPasswd : "Confirmer le mot de passe",	
	m_myprofNPWnotCPW : "Nouveau mot de passe ne correspond pas à confirmer le mot de passe",
	m_myprofPasswdRestSucessful: "Réinitialisation de mot de passe avec succès",	
	m_myprofResetPasswdDone: "Réinitialiser le mot de passe achevé",


    ///////////////////////////////////////////////////////////////////
    // Backup configuration
	m_backupConfig : "Config.",
	m_backupData : "Data",	
	m_backupApp : "Application",	
	m_backupSelectOne: "S'il vous plaît choisir au moins une application de sauvegarde",		
	m_backupFail: "Pas de sauvegarde",
	m_backupInProgress: "Sauvegarde est en cours. Vous recevrez une notification par email lors de l'opération est finshed",
	m_backup2pcInProgress: "Backup is in progress.  It may take a while to finish.  A notification window will popup when the backup file is ready.",		
	m_backupPlsDelete: "Vous avez atteint le nombre maximum de sauvegardes stockées sur l'Open Appliance. S'il vous plaît supprimer des archives de sauvegarde et essayez à nouveau",
	m_backupMyPC: "Mon PC",	
    m_backupTooltipCancel : "Réinitialiser la sélection",
    m_backupTooltipBackup : "Certaines applications de sauvegarde",	
	m_backupPlsWait: "Another backup request is currently being processed.  Please wait for a few minutes and try again.",
	

    ///////////////////////////////////////////////////////////////////
    // Restore configuration
    m_restoreErrorTitle : "Rétablir la configuration d'erreur",
    m_restoreUploadTitle : "Envoyer dossier de restauration",
    m_resoteUploadErrFileType : "Type de fichier n'est pas pris en charge.",
    m_restoreHdContent : "Contenu",
    m_restoreHdRestore : "Sestaurer",
    m_restoreHdDownload : "Télécharger",
    m_restoreClickRestore : "Cliquez ici pour rétablir la",
    m_restoreArchive : "Restaurer la sauvegarde des archives",
    m_restoreDelTitle : "Supprimer le fichier d'archive de sauvegarde",
    m_restoreDel : "Supprimer la sauvegarde des archives",
    m_restoreDlConfirm : "Etes-vous sûr que vous voulez télécharger",
    m_restoreDownload : "Télécharger archive de sauvegarde",
    m_restoreRestorePC : "Restaurer à partir de mon PC",
    m_restoreFromMyPCTip : "Cliquez ici pour commencer la restauration de mon PC",

    ///////////////////////////////////////////////////////////////////
    // Restore Desc. configuration
    m_resDescErrorTitle : "Configuration Restore Description",
    m_resDescConfirm : "Etes-vous sûr que vous voulez restaurer la sélection VM?",
    m_resDescHdConf : "Config.",
    m_resDescHdData : "Data",

    ///////////////////////////////////////////////////////////////////
    // BLB configuration
	m_blbStandAloneOA : "Autonome Open Appliance",
	m_blbAssociation : "BLB association",		
	m_blbComplete : "BLB association a terminé avec succès",

    ///////////////////////////////////////////////////////////////////
    // Email Server configuration
	m_emailSmtpAddr : "Adresse de serveur SMTP",
	m_emailLocalMachName : "Nom de la machine locale",
	m_emailLocalEmail : "Local e-mail",
	m_emailAuthName : "Autorisation de nom",
	m_emailAuthPasswd : "Autorisation de mot de passe",
	m_emailSrvConfig : "Envoi de la configuration du serveur",

    ///////////////////////////////////////////////////////////////////
    // LDAP Server configuration
	m_ldapSrvLoc : "Serveur LDAP",	
	m_ldapInOA : "Dans l'Open Appliance",
	m_ldapInLan : "Dans la compagnie LAN",
	m_ldapSrvAddr: "Adresse du serveur",
	m_ldapSuffix: "Suffix",		
	m_ldapUsrUpdateRt : "Utilisateur (mise à jour des droits)",
	m_ldapUsrReadRt: "Utilisateur (lire droits)",
	m_ldapPasswdUpdateRt: "Mot de passe (mise à jour des droits)",
	m_ldapPasswdReadRt: "Mot de passe (lecture des droits)",

    ///////////////////////////////////////////////////////////////////
    // Password Policy configuration
	m_passwdPolicyChangeAtLogin : "L'utilisateur doit changer son mot de passe lors de la première connexion",	
	m_passwdPolicyCanKeep : "L'utilisateur peut conserver hsi mot de passe par défaut",	

    ///////////////////////////////////////////////////////////////////
    // NTP server configuration
	m_ntpSrvAddr : "Adresse de serveur NTP",
	m_ntpTimeSrvAddr : "Adresse du serveur de temps",
	m_ntpTimeSrvConfig: "Le temps de configuration du serveur",

    ///////////////////////////////////////////////////////////////////
    // Tooltip
	m_tooltip_cancel : "Reset current form",
	m_tooltip_apply: "Apply changes",
	m_tooltip_add: "Add a new row",
	m_tooltip_delete: "Delete a row",
	m_tooltip_back: "Go back to previous screen",	
	m_tooltip_restore: "Restore",
	m_tooltip_update: "Update",	
		
    ///////////////////////////////////////////////////////////////////
    // Contact page
	m_contact : "Contact",
	m_contact_message: "For your questions, please contact your customer service and dial 3901.",	
	
    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}
