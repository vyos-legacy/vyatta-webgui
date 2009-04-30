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

	m_mainOA : 'Open Appliance',
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
    m_confHeaderText : 'Lorem ipsum onsectetuer adipiscing elit, sed diam ' +
            'nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam ' +
            'erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci ' +
            'tation ullamcorper suscipit lobortis nisl ut aliquip ex ea ' +
            'commodo consequat.<br><br>',
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
	m_backupThereR: "Il ya",
	m_backupPlsDelete: "sauvegarde déjà stockées sur l'Open Appliance. S'il vous plaît supprimer le plus ancien et essayez à nouveau",
	m_backupMyPC: "Mon PC",	

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

    /////////////////////////////////////////
    // plesae do not edit beyound dummy
    dummy : ''
}
