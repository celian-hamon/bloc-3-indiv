import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            // Navbar
            "nav.catalog": "Catalog",
            "nav.about": "About",
            "nav.list_item": "+ List Item",
            "nav.admin": "Admin",
            "nav.logout": "Log out",
            "nav.signin": "Sign in",
            "nav.signup": "Sign up",

            // Home Page
            "home.title": "Discover Unique Items",
            "home.subtitle": "A curated marketplace for extraordinary things.",
            "home.search_placeholder": "Search items...",
            "home.all_categories": "All Categories",
            "home.load_more": "Load More",
            "home.no_items": "No items found",
            "home.explore_more": "Explore More",

            // Item Card
            "item.shipping": "Shipping",
            "item.free_shipping": "Free Shipping",

            // Article Page
            "article.back": "← Back to Catalog",
            "article.pending": "⏳ Pending Approval",
            "article.approved": "✓ Approved",
            "article.shipping": "Shipping",
            "article.total": "Total",
            "article.chat_buy": "Chat & Buy",
            "article.edit_item": "Edit Item",
            "article.description": "Description",
            "article.seller": "Seller",
            "article.item_id": "Item ID",

            // General
            "general.loading": "Loading...",
            "general.error": "Error occurred",
        },
    },
    fr: {
        translation: {
            // Navbar
            "nav.catalog": "Catalogue",
            "nav.about": "À propos",
            "nav.list_item": "+ Vendre",
            "nav.admin": "Admin",
            "nav.logout": "Déconnexion",
            "nav.signin": "Connexion",
            "nav.signup": "S'inscrire",

            // Home Page
            "home.title": "Découvrez des Objets Uniques",
            "home.subtitle":
                "Une marketplace sélective pour des choses extraordinaires.",
            "home.search_placeholder": "Rechercher des objets...",
            "home.all_categories": "Toutes les catégories",
            "home.load_more": "Voir Plus",
            "home.no_items": "Aucun objet trouvé",
            "home.explore_more": "Explorer Davantage",

            // Item Card
            "item.shipping": "Livraison",
            "item.free_shipping": "Livraison gratuite",

            // Article Page
            "article.back": "← Retour au Catalogue",
            "article.pending": "⏳ En Attente",
            "article.approved": "✓ Approuvé",
            "article.shipping": "Livraison",
            "article.total": "Total",
            "article.chat_buy": "Discuter & Acheter",
            "article.edit_item": "Modifier l'Annonce",
            "article.description": "Description",
            "article.seller": "Vendeur",
            "article.item_id": "ID de l'Objet",

            // General
            "general.loading": "Chargement...",
            "general.error": "Une erreur est survenue",
        },
    },
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
