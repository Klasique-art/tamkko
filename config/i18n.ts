import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGE_STORAGE_KEY = '@thefourthbook_language';
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
const i18n = createInstance();

const frTranslations: Record<string, string> = {
    'Profile': 'Profil',
    'Account': 'Compte',
    'App Settings': 'Parametres de l application',
    'Support': 'Assistance',
    'Account Details': 'Details du compte',
    'Notifications': 'Notifications',
    'Appearance': 'Apparence',
    'Security': 'Securite',
    'Language': 'Langue',
    'Help & Support': 'Aide et assistance',
    'About App': 'A propos de l application',
    'Log Out': 'Se deconnecter',
    'Change Password': 'Changer le mot de passe',
    'Select Language': 'Choisir la langue',
    'Use English': 'Utiliser l anglais',
    'Use French': 'Utiliser le francais',
    'Our Recent Winners': 'Nos gagnants recents',
    'Celebrating Our Winners': 'Nous celebrons nos gagnants',
    'Quick Stats': 'Statistiques rapides',
    'No notifications in this filter.': 'Aucune notification dans ce filtre.',
    'Mark All Read': 'Tout marquer comme lu',
    'Mark as Read': 'Marquer comme lu',
    'Delete': 'Supprimer',
    'Inbox': 'Boite de reception',
    'Need more help?': 'Besoin de plus d aide ?',
    'Contact via Email': 'Contacter par e-mail',
    'Frequently Asked Questions': 'Questions frequentes',
    'How It Works': 'Comment ca marche',
    'Trust and Transparency': 'Confiance et transparence',
    'The Fourth Book': 'The Fourth Book',
    'Payment Methods': 'Methodes de paiement',
    '+ Add New': '+ Ajouter',
    'Default': 'Par defaut',
    'No transactions yet': 'Aucune transaction pour le moment',
    'Transaction History': 'Historique des transactions',
    'Auto-Renewal': 'Renouvellement automatique',
    'Enabled': 'Active',
    'Disabled': 'Desactive',
    'Update Password': 'Mettre a jour le mot de passe',
    'Password requirements': 'Exigences du mot de passe',
    'Current Password': 'Mot de passe actuel',
    'New Password': 'Nouveau mot de passe',
    'Confirm New Password': 'Confirmer le nouveau mot de passe',
    'Close': 'Fermer',
    'Cancel': 'Annuler',
    'Confirm': 'Confirmer',
    'Confirm Action': 'Confirmer l action',
    'Are you sure you want to proceed?': 'Etes-vous sur de vouloir continuer ?',
    'Choose your preferred theme appearance.': 'Choisissez votre apparence de theme preferee.',
    'Dark Mode': 'Mode sombre',
    'Turn on dark mode for lower-light viewing.': 'Activez le mode sombre pour un meilleur confort visuel.',
    'Success toast is working': 'La notification de succes fonctionne',
    'Error toast is working': 'La notification d erreur fonctionne',
    'Info toast is working': 'La notification d information fonctionne',
    'Mark all notifications as read': 'Marquer toutes les notifications comme lues',
    'Show {{status}} notifications': 'Afficher les notifications {{status}}',
    'Mark notification as read': 'Marquer la notification comme lue',
    'Delete notification': 'Supprimer la notification',
    'Verified account': 'Compte verifie',
    'Close modal': 'Fermer la fenetre',
    'Dismiss toast': 'Fermer la notification',
    'Icon button': 'Bouton icone',
    'back': 'retour',
    'press to go back': 'appuyer pour revenir',
    'User profile picture': 'Photo de profil utilisateur',
    '{{label}} toggle': 'Interrupteur {{label}}',
    'Contact support via email at {{email}}': 'Contacter le support par e-mail a {{email}}',
    'Use {{language}}': 'Utiliser {{language}}',
    'English': 'Anglais',
    'French': 'Francais',
    'all': 'toutes',
    'read': 'lues',
    'unread': 'non lues',
    'ACTIVE': 'ACTIF',
    'UNREAD': 'NON LU',
    'Success': 'Succes',
    'We': 'Nous',
    'View All': 'Voir tout',
    'Quick Actions': 'Actions rapides',
    'Days': 'Jours',
    'Hours': 'Heures',
    'Mins': 'Min',
    'Secs': 'Sec',
    'Member Since': 'Membre depuis',
    'Email': 'E-mail',
    'Email Address': 'Adresse e-mail',
    'Phone': 'Telephone',
    'Phone Number': 'Numero de telephone',
    'First Name': 'Prenom',
    'Last Name': 'Nom',
    'Your Impact': 'Votre impact',
    'Your Contributions': 'Vos contributions',
    'Total Pool': 'Total du pool',
    'Total Winners': 'Total des gagnants',
    'Total Contributed': 'Total contribue',
    'Total Distributed': 'Total distribue',
    'Current Status': 'Statut actuel',
    'Draw Entries': 'Entrees au tirage',
    'Prize Amount': 'Montant du prix',
    'Latest Distribution': 'Derniere distribution',
    'Current Cycle Pool': 'Pool du cycle en cours',
    'Our Collective Prize Pool': 'Notre pool de prix collectif',
    'Our Community Growth': 'Croissance de notre communaute',
    'Our Next Draw Countdown': 'Compte a rebours du prochain tirage',
    'Members Strong & Growing': 'Membres forts et en croissance',
    'Friends Invited': 'Amis invites',
    'Recent Activity': 'Activite recente',
    'Recent Transactions': 'Transactions recentes',
    'Next Draw': 'Prochain tirage',
    'Next Selection In': 'Prochaine selection dans',
    'Auto-Contribute': 'Contribution automatique',
    'Auto-Renewal Enabled': 'Renouvellement automatique active',
    'Add Payment Method': 'Ajouter un mode de paiement',
    'Pay Now': 'Payer maintenant',
    'Processing...': 'Traitement...',
    'Please wait a moment': 'Veuillez patienter un instant',
    'Updating Password...': 'Mise a jour du mot de passe...',
    'Create a new password': 'Creez un nouveau mot de passe',
    'Re-enter your new password': 'Saisissez a nouveau votre nouveau mot de passe',
    'Enter your current password': 'Saisissez votre mot de passe actuel',
    '- At least 8 characters': '- Au moins 8 caracteres',
    '- At least one uppercase and one lowercase letter': '- Au moins une lettre majuscule et une lettre minuscule',
    '- At least one number': '- Au moins un chiffre',
    '- At least one special character': '- Au moins un caractere special',
    'Select an option': 'Selectionnez une option',
    'No contributions yet. Start your journey!': 'Aucune contribution pour le moment. Commencez votre parcours !',
    'No email app is available on this device.': 'Aucune application e-mail disponible sur cet appareil.',
    'Unable to open your email app right now.': 'Impossible d ouvrir votre application e-mail pour le moment.',
    'Reach out and we will get back to you as soon as possible.': 'Contactez-nous et nous vous repondrons des que possible.',
    'Find quick answers to common questions.': 'Trouvez rapidement des reponses aux questions courantes.',
    'Are you sure you want to log out of your account?': 'Etes-vous sur de vouloir vous deconnecter de votre compte ?',
    'All notifications are already read': 'Toutes les notifications sont deja lues',
    'Notification deleted': 'Notification supprimee',
    'Notification marked as read': 'Notification marquee comme lue',
    'Password changed successfully': 'Mot de passe modifie avec succes',
    'Transparency & Tools': 'Transparence et outils',
    'Changing 5 lives from our community': 'Changer 5 vies dans notre communaute',
    'Your contribution for this month has been received!': 'Votre contribution pour ce mois a bien ete recue !',
    'This would open a Paystack/Card entry modal.': 'Cela ouvrirait une fenetre d ajout Paystack/Carte.',
    'No winners yet, but that could change with the next draw. Will it be you?': 'Pas encore de gagnants, mais cela peut changer au prochain tirage. Serez-vous le prochain ?',
    '"There Is Power, Real Power In Numbers!"': '"Il y a du pouvoir, un vrai pouvoir, dans les nombres !"',
    '/ month': '/ mois',
    'The Fourth Book is a monthly participation-based platform designed for diaspora communities to contribute together, build a shared pool, and support financial impact through structured monthly cycles.': 'The Fourth Book est une plateforme de participation mensuelle concue pour les communautes de la diaspora afin de contribuer ensemble, construire un pool commun et soutenir un impact financier a travers des cycles mensuels structures.',
    'Members who successfully pay for the current month become eligible for that month&apos;s draw. At cycle end, eligible participants are randomly selected and the monthly pool is distributed equally among selected beneficiaries.': 'Les membres qui paient avec succes pour le mois en cours deviennent eligibles au tirage de ce mois. A la fin du cycle, les participants eligibles sont selectionnes au hasard et le pool mensuel est distribue egalement entre les beneficiaires selectionnes.',
    'The product direction emphasizes fairness, clear monthly summaries, anonymized result visibility, and auditable draw outcomes so members can track participation and payout progress with confidence.': 'L orientation du produit met l accent sur l equite, des resumes mensuels clairs, la visibilite anonymisee des resultats et des issues de tirage auditables afin que les membres puissent suivre leur participation et l avancement des paiements en toute confiance.',
    "We're almost there! Just {{membersNeeded}} more members until we activate monthly payouts together!": "Nous y sommes presque ! Plus que {{membersNeeded}} membres avant d activer ensemble les paiements mensuels !",
    'We did it! Our community unlocked monthly payouts! 🎉': 'Nous l avons fait ! Notre communaute a debloque les paiements mensuels ! 🎉',
    'Pending': 'En attente',
    "You're In!": 'Vous etes dedans !',
    'Due Soon': 'Bientot echeance',
    'Contribution received. Good luck!': 'Contribution recue. Bonne chance !',
    'Payment due by {{date}}': 'Paiement du avant le {{date}}',
    'Entry ID:': 'ID entree :',
    '{{month}} Contribution': 'Contribution de {{month}}',
    'Fairness': 'Equite',
    'Draw History': 'Historique des tirages',
    'My Status': 'Mon statut',
    'FairnessScreen': 'Ecran Equite',
    'DrawsHistoryScreen': 'Ecran Historique des tirages',
    'MySelectionStatusScreen': 'Ecran Mon statut de selection',
};

const normalizeLanguage = (language?: string): SupportedLanguage => {
    const value = (language || '').slice(0, 2).toLowerCase();
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(value) ? (value as SupportedLanguage) : 'en';
};

export const getDeviceLanguage = (): SupportedLanguage => {
    const locale = getLocales()[0];
    return normalizeLanguage(locale?.languageCode || locale?.languageTag);
};

export const setupI18n = async (): Promise<SupportedLanguage> => {
    let savedLanguage: string | null = null;
    try {
        savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
        console.log('Failed to read saved language:', error);
    }

    const initialLanguage = normalizeLanguage(savedLanguage || getDeviceLanguage());

    if (!i18n.isInitialized) {
        await i18n
            .use(initReactI18next)
            .init({
                compatibilityJSON: 'v4',
                lng: initialLanguage,
                fallbackLng: 'en',
                supportedLngs: [...SUPPORTED_LANGUAGES],
                interpolation: { escapeValue: false },
                resources: {
                    en: { translation: {} },
                    fr: { translation: frTranslations },
                },
                keySeparator: false,
                returnEmptyString: false,
            });
    } else if (i18n.language !== initialLanguage) {
        await i18n.changeLanguage(initialLanguage);
    }

    return initialLanguage;
};

export default i18n;
