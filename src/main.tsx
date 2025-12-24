import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./i18n";

// Set initial document language and keep it in sync with i18n
if (typeof document !== 'undefined') {
	document.documentElement.lang = i18n.language || 'ka';
	i18n.on('languageChanged', (lng) => {
		document.documentElement.lang = lng;
	});
}

createRoot(document.getElementById("root")!).render(<App />);
