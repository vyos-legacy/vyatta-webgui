/*
    Document   : ft_language_fr.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

//Label;English;English corrected;French;Comments

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // General
    m_tableTooltip1 : "Cliquer ici pour effectuer un tri.",
    m_networkConfig : "réseau",
    m_mainLang : 'fr',    
	m_mainMap : 'plan',
	m_mainOA : 'Open Appliance',
	m_mainEnglish : 'English',
	m_mainFrench : "Français",
	m_mainLogin : "entrer",
	m_mainLogout : "déconnecter", 
	m_mainUserName : "utilisateur", 
	m_mainPassword : "mot de passe",
	m_mainWarning : "<p>si vous n'avez pas de login et mot de passe, veuillez contacter votre centre support clients.<br/>" +  
                    "Attention : pour vous connecter, votre navigateur doit accepter les pop-ups et les cookies.</p>",
	m_mainBLBWarning : "<p>si vous n'avez pas de login et mot de passe, veuillez contacter votre centre support clients.<br/>" + 
                     "Attention : pour vous connecter, votre navigateur doit accepter les pop-ups et les cookies.</p>",
	m_mainWelcome : "bienvenue",
	m_mainPleaseSignIn : "veuillez vous authentifier pour accéder au web d'administration de l'Open Appliance",
	m_menuApp : "applications",
	m_menuUsers : "utilisateurs",
	m_menuMonitor : "supervision",
	m_menuBackup : "sauvegarde / restauration",
	m_menuConfig : "configuration",
	m_menuMyProfile : "mon profil",
	m_menuDashboard : "tableau de bord",
	m_menuUpdates : "mises à jour", 
	m_menuUpdatePlan : "historique et planification des mises à jour", 
	m_menuRestart : "redémarrage",
	m_menuRestartApp : "redémarrage d'application(s) ou de l'Open Appliance",
	m_menuSubscribe : "souscrire", 
	m_menuSubcription : "souscription",
	m_menuUserList: "liste des utilisateurs",
	m_menuUserRight : "droits des utilisateurs",
	m_menuHardware : "hardware", 
	m_menuHardwareMonitor : "supervision hardware",
	m_menuNetwork : "réseau",
	m_menuNetworkMonitor : "supervision réseau",
	m_menuConfigBackup : "sauvegarde",
	m_menuConfigRestore : "restauration", 
	m_menuEmailServer : "serveur mails",
	m_menuEmailServerConfig : "paramétrage du serveur mails",
	m_menuTimeServer : "serveur NTP",
	m_menuTimerServerConfig : "paramétrage du serveur NTP",
	m_menuUserDir : "serveur LDAP",
	m_menuLDAPConfig : "paramétrage serveur LDAP",
	m_menuBLBAssocication : "association BLB", 
	m_menuPasswordPolicy : "politique mots de passe", 
	m_menuAddUser : "ajouter un utilisateur",
	m_menuUpdateUser : "modifier un utilisateur",
	m_menuUpdate : "mettre à jour",
	m_menuRestore : "restaurer", 
	m_menuRestoreDesc : "description du fichier de sauvegarde",
	m_menuBLBCredCheck : "vérification des identifiants de la BLB",
	m_menuContact : "contact",
	m_menuSitemap : "plan du site",
	m_menuCopyRight : "copyright France Telecom",

	m_menu_des_App : "applications",
	m_menu_des_Users : "utilisateurs",
	m_menu_des_Monitor : "supervision",
	m_menu_des_Backup : "sauvegarde / restauration",
	m_menu_des_Config : "configuration",
	m_menu_des_MyProfile : "mon profil",
	m_menu_des_Dashboard : "tableau de bord",
	m_menu_des_Updates : "mises à jour",
	m_menu_des_UpdatePlan : "historique et planification des mises à jour",
	m_menu_des_Restart : "redémarrage",
	m_menu_des_RestartApp : "redémarrage d'application(s) ou de l'Open Appliance",
	m_menu_des_Subscribe : "souscrire",
	m_menu_des_Subcription : "souscription", 
	m_menu_des_UserList : "liste des utilisateurs",
	m_menu_des_UserRight : "droits des utilisateurs",
	m_menu_des_Hardware : "hardware",
	m_menu_des_HardwareMonitor : "supervision hardware",
	m_menu_des_Network : "réseau", 
	m_menu_des_NetworkMonitor : "supervision réseau",
	m_menu_des_ConfigBackup : "sauvegarde",
	m_menu_des_ConfigRestore : "restauration",
	m_menu_des_EmailServer : "serveur mails",
	m_menu_des_EmailServerConfig : "paramétrage du serveur mails",
	m_menu_des_TimeServer : "serveur NTP",
	m_menu_des_TimerServerConfig : "paramétrage du serveur NTP",
	m_menu_des_UserDir : "serveur LDAP", 
	m_menu_des_LDAPConfig : "paramétrage serveur LDAP",
	m_menu_des_BLBAssocication : "association BLB",
	m_menu_des_PasswordPolicy : "politique mots de passe",
	m_menu_des_AddUser : "ajouter un utilisateur", 
	m_menu_des_UpdateUser : "modifier un utilisateur",
	m_menu_des_Update : "mettre à jour",
	m_menu_des_Restore : "restaurer",
	m_menu_des_RestoreDesc : "description du fichier de sauvegarde",
	m_menu_des_BLBCredCheck : "vérification des identifiants de la BLB", 

    ///////////////////////////////////////////////////////////////////
    // pagination
    m_pgFirst : "first",
    m_pgPrev : "previous",
    m_pgLast : "last",
    m_pgNext : "next",

    ///////////////////////////////////////////////////////////////////;;;
    // Calendar;;;
	m_calToday : "aujourd'hui",
	m_calClear : "Clear",
	m_calArrMonthNames : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'],
    m_calArrWeekInits : ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    m_calInvalidDateMsg : "la date entrée est invalide",
    m_calOutOfRangeMsg : "la date entrée est invalide",
    m_calDoesNotExistMsg : "la date entrée est invalide",
    m_calInvalidAlert : ["date invalide(", ") ignorée."],
    m_calDateDisablingError : ["Erreur ", " n'est pas un objet date."],
    m_calRangeDisablingError : ["Erreur ", "doit contenir 2 éléments."],
    m_calDateDisplayFormat : 'dd-mm-yy',
    m_calDateOutputFormat : 'DD/MM/YYYY', 
    //Set it to;; 0 (Zero) for Sunday, 1 (One) for Monday etc..; 1 (Zero) for Dimanche, 1 (One) for Lundi etc..
    m_calWeekStart : 1,

    ///////////////////////////////////////////////////////////////////;;;
    // Dash board screen;;;

    // dashboard header;;;
    m_dbHdApplication : "application",
    m_dbHdStatus : "état", 
    m_dbHdCPU : "CPU", 
    m_dbMemory : "mémoire", 
    m_dbDiskSpace : "espace disque",
    m_dbUpdateNeeded : "mise à jour nécessaire",
    m_dbTooltipUpdateNeed : "version à mettre à jour - ", 
    m_dbTooltipCancel : "annuler la sélection", 
    m_dbTooltipUpdate : "mettre à jour les applications sélectionnées", 
    m_dbUsed : "utilisé", 
    m_dbTotal : "total", 
    m_dbFree : "libre",
    m_dbStatusUp : "état : actif", 
    m_dbStatusDown : "état : inactif", 
    m_dbStatusUnknown : "état inconnu", 
    m_dbErrorTitle : "tableau de bord non disponible", 
    m_dbCriticalUpdate : "Une mise à jour critique vient d'être installée", 

    ///////////////////////////////////////////////////////////////////;;;
    // VM Update & History screen;;;
    m_uhHdDate : "Date", 
    m_uhHdWho : "sauvegarder par",
    m_uhErrorTitle : "erreur de mise à jour",  
    m_uhCancelTitle : "annuler la planification de mise(s) à jour",

    ///////////////////////////////////////////////////////////////////;;;
    // VM Update Restore;;;
	m_resUpdateVmName : "nom de l'application",
	m_resUpdateCurVer : "version courante",
	m_resUpdatePrevVer : "version précédente", 
	m_resUpdateFail : "échec de la restauration",
    m_resUploadCompleted : "le téléchargement de fichiers est effectué",

    ///////////////////////////////////////////////////////////////////;;;
    // VM Schedule Update;;;
	m_schedUpdateSched : "Veuillez planifier une mise à jour pour les applications suivantes",
	m_schedUpdateNow : "maintenant",
	m_schedUpdateLater : "plus tard", 
	m_schedUpdateNewVer : "nouvelle version",
	m_schedUpdateRangeChk : "vous planifiez à six mois",
	m_schedUpdateDate : "date de planification",
	m_schedUpdateHour : "heure de planification", 
	m_schedUpdateMinute : "minute de planification",
	m_schedUpdateErrorOccur : "les erreurs suivantes sont survenues alors qu'une planification de mise(s) à jour était en cours",

    ///////////////////////////////////////////////////////////////////;;;
    // VM Restart screen;;;
    m_restartOA : "Open Appliance",
    m_restartErrorTitle : "erreur de redémarrage",
    m_restartTitle : "redémarrer une application", 
    m_restartStopTitle : "stopper une application", 
    m_restartConfirm : "Etes-vous sûr de vouloir redémarrer",
    m_restartStopConfirm : "Etes-vous sûr de vouloir stopper",

    ///////////////////////////////////////////////////////////////////;;;
    // Subscribe screen;;;
    m_subscribePlease : "Veuillez cliquer sur les liens suivants pour ajouter ou supprimer une application",
	m_subscribeInstall: "installer une nouvelle application",
	m_subscribeRemove : "supprimer une nouvelle application",

    ///////////////////////////////////////////////////////////////////;;;
    // User List screen;;;
    m_ulErrorTitle : "erreur de chargement de la liste utilisateurs", 
    m_ulTooltipAddUser : "créer un nouveau compte utilisateur", 
    m_ulDeleteHeader : "supprimer un compte utilisateur", 
    m_ulClick2Edit : "cliquer ici pour éditer cet utilisateur",
    m_ulSendEmail : "envoyer un email à cet utilisateur", 
    m_ulDeleteUser : "supprimer un compte utilisateur", 

    ///////////////////////////////////////////////////////////////////;;;
    // User Right screen;;;
    m_urErrorTitle : "erreur sur la gestion des droits utilisateurs",
    m_urConfirmTitle : "modifier les droits utilisateurs", 
    m_urCommitChange : "Etes-vous sûr de vouloir changer ces droits ?", 
    m_urBtnApply : "modifier les droits", 
    m_urBtnCancel : "annuler les modifications",

    ///////////////////////////////////////////////////////////////////;;;
    // User Add screen;;;
    m_userUsername : "nom d'utilisateur",
	m_userSurname : "nom", 
	m_userGivenName : "prénom", 
	m_userEmail : "email",
    m_userUsernameInvalidCharacter : "nom d'utilisateur", 

    ///////////////////////////////////////////////////////////////////;;;
    // User Editor screen;;;
    m_userResetPasswdExit : "l'utilisateur existe déjà", 
    m_userResetPasswdNotExit : "l'utilisateur n'existe pas", 
    m_userResetPasswd : "réinitialiser le mot de passe", 
    m_userResetPasswdConfirm : "Etes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?", 
	m_userConfirmation : "confirmation", 
	m_userResetPasswdSuccess : "changement de mot de passe effectué",
	m_userResetPasswdComplete : "changement de mot de passe", 

    ///////////////////////////////////////////////////////////////////;;;
    // Configuration Restore Description screen;;;
    m_confRestorDescp : "lorem ipsum onsectetuer....", 

    ///////////////////////////////////////////////////////////////////;;;
    // Hw monitor;;;
    m_component : "composant", 


    ///////////////////////////////////////////////////////////////////;;;
    // Common variables;;;
    m_cancelConfirm : "Etes-vous sûr de vouloir annuler", 
    m_deleteConfirm : "Etes-vous sûr de vouloir supprimer", 
    m_login : "login", 
    m_name : "nom", 
    m_delete : "supprimer", 
    m_email : "email",
    m_password : "mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // Buttons & Images;;;
    m_imageDir : "images/fr/",
	m_ok : "ok",
	m_error : "erreur", 
	m_info : "information",

    ///////////////////////////////////////////////////////////////////;;;
    // Popup Message Dialog;;;
    m_puSessionTimeout : "session expirée",
    m_puSessionTimeoutMsg : "Pour des raisons de sécurité, votre session n'est plus active.<br>Veuillez vous ré-authentifier.",

    ///////////////////////////////////////////////////////////////////;;;
    // Login Dialog;;;
    m_loginPrompt : "Veuillez entrer vos identifiants.", 
    m_loginError : "erreur de login", 
    m_loginUnableToLogin : "impossible de se connecter",
	m_loginContactCS : "Si vous n'avez pas de login et mot de passe, veuillez contacter votre centre support clients.",
	m_loginEnableJS : "Attention : pour vous connecter, votre navigateur doit accepter les pop-ups et les cookies.",

    ///////////////////////////////////////////////////////////////////;;;
    // Mainframe;;;
	m_mainFrmGuest : "invité",
    m_mainFrmWelcome : "bienvenue",
	m_mainFrmConnected : "Vous êtes connecté au module d'administration de l'Open Appliance",
	m_mainFrmSignIn : "Veuillez vous authentifier", 

    ///////////////////////////////////////////////////////////////////;;;
    // My Form;;;
	m_formNoEmpty : "ne peut être vide",
	m_formFixError : "veuillez corriger les erreurs suivantes", 
	m_formInvalid : "est invalide",
	m_formTooLong : "cannot have more than",
	m_formChar: "characters",	
	m_formSave : "sauvegardé",
	m_formPassword : "mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // Password change dialog;;;
	m_passwordChangePlease : "Veuillez changer votre mot de passe pour continuer",
	m_passwordChangeSuccess : "Votre nouveau mot de passe a été enregistré.", 
	m_passwordChangeRelogin : "Veuillez cliquer sur le bouton entrer pour vous loguer avec votre nouveau mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // My Profile;;;
	m_myprofLogin : "utilisateur",
	m_myprofOldPasswd : "ancien mot de passe", 
	m_myprofNewPasswd : "nouveau mot de passe",
	m_myprofConfirmPasswd : "confirmation mot de passe", 
	m_myprofNPWnotCPW : " Les mots de passe rentrés dans les champs 'nouveau' et 'confirmation' ne sont pas identiques", 
	m_myprofPasswdRestSucessful : "changement de mot de passe effectué", 
	m_myprofResetPasswdDone : "changement de mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // Backup configuration;;;
	m_backupConfig : "config.", 
	m_backupData : "données", 
	m_backupApp : "application",
	m_backupSelectOne : "Veuillez sélectionner au moins une application à sauvegarder",
	m_backupFail : "échec de sauvegarde", 
	m_backupInProgress : "Sauvegarde en cours.",
	m_backup2pcInProgress : "sauvegarde en cours. Veuillez patienter un moment. Une fenêtre vous avertira lorsque la sauvegarde sera effectuée",
	m_backupPlsDelete : "Le nombre maximum de sauvegardes stockées sur l'Open Appliance est atteint. Veuillez supprimer la plus vieille et réessayez",
	m_backupMyPC : "mon PC", 
    m_backupTooltipCancel : "annuler les modifications", 
    m_backupTooltipBackup : "sauvegarder les applications sélectionnées",

    ///===================================================================================================================
	m_backupPlsWait: "Une autre demande de sauvegarde est actuellement en cours de traitement. S'il vous plaît attendez quelques minutes et essayez à nouveau",


    ///////////////////////////////////////////////////////////////////;;;
    // Restore configuration;;;
    m_restoreErrorTitle : "erreur de restauration", 
    m_restoreUploadTitle : "télécharger un fichier de restauration",
    m_resoteUploadErrFileType : "type de fichier non compatible.",
    m_restoreHdContent : "contenu",
    m_restoreHdRestore : "restaurer", 
    m_restoreHdDownload : "télécharger",
    m_restoreClickRestore : "cliquer ici pour restaurer", 
    m_restoreArchive : "restaurer la sauvegarde", 
    m_restoreDelTitle : "supprimer la sauvegarde", 
    m_restoreDel : "supprimer la sauvegarde", 
    m_restoreDlConfirm : "Etes-vous sûr de vouloir télécharger le fichier suivant", 
    m_restoreDownload : "télécharger la sauvegarde", 
    m_restoreRestorePC : "restaurer un fichier de mon PC", 
    m_restoreFromMyPCTip : "Cliquer ici pour démarrer la restauration d'un fichier de mon PC",

    ///////////////////////////////////////////////////////////////////;;;
    // Restore Desc. configuration;;;
    m_resDescErrorTitle : "description de la configuration à restaurer", 
    m_resDescConfirm : "Etes-vous sur de vouloir restaurer les éléments sélectionnés ?", 
    m_resDescHdConf : "config.", 
    m_resDescHdData : "données", 

    ///////////////////////////////////////////////////////////////////;;;
    // BLB configuration;;;
	m_blbStandAloneOA : "Open Appliance seule", 
	m_blbAssociation : "BLB associée", 
	m_blbComplete : "L'association à la BLB a réussi", 

    ///////////////////////////////////////////////////////////////////;;;
    // Email Server configuration;;;
	m_emailSmtpAddr : "adresse serveur SMTP", 
	m_emailLocalMachName : "nom d'expéditeur", 
	m_emailLocalEmail : "adresse email expéditeur", 
	m_emailAuthName : "nom utilisateur",
	m_emailAuthPasswd : "mot de passe utilisateur",
	m_emailSrvConfig : "paramétrage du serveur serveur mail",

    ///////////////////////////////////////////////////////////////////;;;
    // LDAP Server configuration;;;
	m_ldapSrvLoc : "localisation du serveur LDAP",
	m_ldapInOA : "dans l'Open Appliance", 
	m_ldapInLan : "sur le LAN Entreprise", 
	m_ldapSrvAddr : "adresse du serveur", 
	m_ldapSuffix : "Suffixe", 
	m_ldapUsrUpdateRt : "utilisateur (droits d'écriture)", 
	m_ldapUsrReadRt : "utilisateur (droits de lecture)",
	m_ldapPasswdUpdateRt : "mot de passe (droits d'écriture)", 
	m_ldapPasswdReadRt : "mot de passe (droits de lecture)", 

    ///////////////////////////////////////////////////////////////////;;;
    // Password Policy configuration;;;
	m_passwdPolicyChangeAtLogin : "l'utilisateur doit changer son mot de passe à la première connexion", 
	m_passwdPolicyCanKeep : "l'utilisateur peut conserver son mot de passe par défaut", 

    ///////////////////////////////////////////////////////////////////;;;
    // NTP server configuration;;;
	m_ntpSrvAddr : "adresse serveur NTP", 
	m_ntpTimeSrvAddr : "adresse serveur de temps", 
	m_ntpTimeSrvConfig : "configuration serveur de temps", 

    ///////////////////////////////////////////////////////////////////;;;
    // Tooltip;;;
	m_tooltip_cancel : "supprimer les modifications", 
	m_tooltip_apply : "sauvegarder les modifications",
	m_tooltip_add : "ajouter une nouvelle ligne", 
	m_tooltip_delete : "supprimer une ligne", 
	m_tooltip_back : "revenir à l'écran précédent", 
	m_tooltip_restore : "restaurer", 
	m_tooltip_update : "mettre à jour", 

    ///////////////////////////////////////////////////////////////////;;;
    // Contact page;;;
	m_contact : "contact",
	m_contact_message : "Pour toute question, veuillez contacter votre service clients en appelant le 3901",

    /////////////////////////////////////////;;;
    // plesae do not edit beyound dummy;;;
    dummy : ''
}
