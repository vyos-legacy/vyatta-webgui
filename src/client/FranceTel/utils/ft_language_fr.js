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

    ///////////////////////////////////////////////////////////////////
    // Subscribe screen
    m_subscribePlease : "S'il vous plaît cliquer sur le texte suivant pour installer / supprimer une application",
	m_subscribeInstall: "Installer une nouvelle application",
	m_subscribeRemove: "Supprimer une nouvelle application",

    ///////////////////////////////////////////////////////////////////
    // User List screen
    m_ulTooltipAddUser : 'Create new user account',
    m_ulDeleteHeader : 'Delete User Account',

    ///////////////////////////////////////////////////////////////////
    // User Right screen

    ///////////////////////////////////////////////////////////////////
    // User Add screen
    m_userUsername: "utilisateur",
	m_userSurname: "nom",
	m_userGivenName: "prénom",
	m_userEmail: "e-mail",

    ///////////////////////////////////////////////////////////////////
    // User Editor screen
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
    m_login: 'Login',
    m_name: 'Name',
    m_delete: 'Delete',
    m_email: 'Email',
    m_password :'Password',

    ///////////////////////////////////////////////////////////////////
    // Buttons & Images
    m_imageDir : 'images/',
	m_ok: 'ok',
	m_error: 'Erreur',
	m_info: 'Information',

    ///////////////////////////////////////////////////////////////////
    // Popup Message Dialog
    m_puSessionTimeout : 'in Fr Session Time Out',
    m_puSessionTimeoutMsg : 'For security reasons, your session is no longer active<br>Please re-login again.',

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
    m_restoreHdContent : 'Content',
    m_restoreHdRestore : 'Restore',
    m_restoreHdDownload : 'Download',
    m_restoreHdDelete : 'Delete',

    ///////////////////////////////////////////////////////////////////
    // Restore Desc. configuration
    m_resDescHdConf : 'Config.',
    m_resDescHdData : 'Data',

    ///////////////////////////////////////////////////////////////////
    // BLB configuration
	m_blbStandAloneOA : "Autonome Open Appliance",
	m_blbAssociation : "BLB association",		
	m_blbComplete : "BLB association a terminé avec succès",

    ///////////////////////////////////////////////////////////////////
    // Email Server configuration
	m_emailStmpAddr : "Adresse de serveur SMTP",
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