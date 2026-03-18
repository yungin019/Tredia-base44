/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIInsights from './pages/AIInsights';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Onboarding from './pages/Onboarding';
import PaperTrading from './pages/PaperTrading';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import SplashScreen from './pages/SplashScreen';
import Trade from './pages/Trade';
import Upgrade from './pages/Upgrade';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIInsights": AIInsights,
    "Dashboard": Dashboard,
    "Markets": Markets,
    "Onboarding": Onboarding,
    "PaperTrading": PaperTrading,
    "Portfolio": Portfolio,
    "Settings": Settings,
    "SignIn": SignIn,
    "SplashScreen": SplashScreen,
    "Trade": Trade,
    "Upgrade": Upgrade,
}

export const pagesConfig = {
    mainPage: "SplashScreen",
    Pages: PAGES,
    Layout: __Layout,
};