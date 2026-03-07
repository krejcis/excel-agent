/* ============================================
   LogiCore AI – Translation Strings
   Supported languages: de (German), cs (Czech)
   ============================================ */

export type Language = 'cs' | 'de';

// Recursive type for nested translation objects
export interface TranslationMap {
    [key: string]: string | TranslationMap;
}

export interface Translations {
    de: TranslationMap;
    cs: TranslationMap;
}

export const translations: Translations = {
    de: {
        // ── Login Screen ────────────────────────────
        login: {
            title: 'LogiCore AI',
            subtitle: 'Enterprise Logistics Operations',
            label: 'Sicherheitscode',
            placeholder: 'Zugangscode eingeben...',
            button: 'Identität prüfen',
            footer: 'Geschütztes System. Nur autorisiertes Personal.',
            devWarning: '⚠ Entwicklungsmodus – VITE_ACCESS_CODE in .env setzen',
            errorTooMany: 'Zu viele Fehlversuche. Eingabe für 5 Minuten gesperrt.',
            errorInvalid: 'Ungültiger Zugangscode',
            errorAttempts: 'Versuche',
            retryIn: 'Erneut versuchen in',
        },

        // ── Header ──────────────────────────────────
        header: {
            title: 'LogiCore AI',
            subtitle: 'Logistik-Operationen',
            backToDashboard: 'Dashboard',
            httpsEncrypted: 'HTTPS Verschlüsselt',
        },

        // ── Dashboard ───────────────────────────────
        dashboard: {
            title: 'Operations-Dashboard',
            subtitle:
                'KI-gesteuerte Agenten für Speditionsoperationen. Wählen Sie einen Agenten aus, um die Verarbeitung zu starten.',
            footerNote: 'LogiCore AI v0.2.0-beta • Daten werden zur Verarbeitung an KI-Endpunkte gesendet',
        },

        // ── Agent Cards ─────────────────────────────
        agents: {
            comingSoon: 'Demnächst',
            available: 'Verfügbar',
            openAgent: 'Agent öffnen',
            underConstruction: 'Agent in Entwicklung',
            underConstructionDesc: 'Dieses Modul befindet sich derzeit in der Entwicklungsphase.',

            invoiceAuditor: {
                name: 'Rechnungsprüfer',
                subtitle: 'Frachtrechnung vs. Angebot Vergleich',
                description:
                    'Laden Sie eine Frachtrechnung und das ursprüngliche Kostenangebot hoch. KI führt Fuzzy-Matching durch, um Preisabweichungen, versteckte Zuschläge und Positionsunterschiede automatisch zu erkennen.',
            },
            dataPrepper: {
                name: 'LBase Datenaufbereiter',
                subtitle: 'TMS-Integrations-Bereiniger',
                description:
                    'Standardisierung unstrukturierter Auftragsdaten für LBase/Lobster-Import. Automatische Korrektur von Ländercodes, PLZ-Formaten und Feldzuordnungen gemäß Ihrem TMS-Schema.',
            },
            rateNormalizer: {
                name: 'Tarif-Normalisierer',
                subtitle: 'Carrier-Tarif-Vereinheitlichung',
                description:
                    'Vereinheitlichen Sie Tarifblätter mehrerer Carrier in ein standardisiertes Vergleichsformat. Verarbeitet unterschiedliche Einheiten, Zuschlagsstrukturen und Gültigkeitszeiträume.',
            },
            adHocAnalyst: {
                name: 'Ad-Hoc Analyst',
                subtitle: 'Datenabfrage in natürlicher Sprache',
                description:
                    'Kommunizieren Sie mit Ihren Excel-Daten in natürlicher Sprache. Stellen Sie Fragen wie „Welche Sendungen haben letzten Monat 2000 kg überschritten?" und erhalten Sie sofort strukturierte Antworten.',
            },
        },

        // ── Invoice Auditor ─────────────────────────
        invoiceAuditor: {
            title: 'Rechnungsprüfer',
            description:
                'Laden Sie eine Frachtrechnung und das ursprüngliche Kostenangebot für die automatische Positionsabweichungsanalyse hoch.',
            quoteLabel: 'Kostenangebot (Offerte)',
            quoteSublabel: 'Laden Sie das ursprüngliche Angebot hoch',
            invoiceLabel: 'Frachtrechnung',
            invoiceSublabel: 'Laden Sie die vom Carrier erhaltene Rechnung hoch',
            quotePrefix: 'Angebot',
            invoicePrefix: 'Rechnung',
            rows: 'Zeilen',
            columns: 'Spalten',
            processing: 'Verarbeitung…',
            dragAndDrop: 'Drag & Drop oder klicken • nur .xlsx',
            runAnalysis: 'Abweichungsanalyse starten',
            reset: 'Zurücksetzen',
            aiAnalysis: 'KI-Analyse läuft',
            analysisFailed: 'Analyse fehlgeschlagen',
            parseFailed: 'Datei konnte nicht geparst werden',

            // ── Report ──────────────────────────────
            totalQuote: 'Angebot Gesamt',
            totalInvoice: 'Rechnung Gesamt',
            netVariance: 'Netto-Abweichung',
            riskAssessment: 'Risikobewertung',
            lineItems: 'Positionen',
            matched: 'zugeordnet',
            deviation: 'Abweichung',
            unmatchedInvoiceItems: 'nicht zugeordnete Rechnungspositionen',

            // ── Filter Tabs ─────────────────────────
            filterAll: 'Alle',
            filterOverages: 'Überpreise',
            filterUnderages: 'Unterpreise',
            filterUnmatched: 'Nicht zugeordnet',

            // ── Export & Actions ─────────────────────
            exportJson: 'JSON exportieren',
            newAudit: 'Neue Prüfung',

            // ── Table Headers ───────────────────────
            thStatus: 'Status',
            thQuoteItem: 'Angebotsposition',
            thInvoiceItem: 'Rechnungsposition',
            thQuoteAmount: 'Angebot €',
            thInvoiceAmount: 'Rechnung €',
            thVariance: 'Abweichung',
            thVariancePercent: 'Abw. %',
            thConfidence: 'Konfidenz',
            thCategory: 'Kategorie',

            // ── Status Labels ───────────────────────
            statusMatch: 'Übereinstimmung',
            statusOverage: 'Überpreis',
            statusUnderage: 'Unterpreis',
            statusQuoteOnly: 'Nur Angebot',
            statusInvoiceOnly: 'Nur Rechnung',

            // ── Risk Levels ─────────────────────────
            riskLow: 'Niedriges Risiko',
            riskMedium: 'Mittleres Risiko',
            riskHigh: 'Hohes Risiko',
            riskCritical: 'Kritisches Risiko',

            // ── Empty State ─────────────────────────
            noItemsMatch: 'Keine Elemente entsprechen dem aktuellen Filter.',

            // ── Report Footer ───────────────────────
            analysisPerformed: 'Analyse durchgeführt am',
            reportId: 'Bericht-ID',
        },
    },

    cs: {
        // ── Login Screen ────────────────────────────
        login: {
            title: 'LogiCore AI',
            subtitle: 'Podnikové logistické operace',
            label: 'Bezpečnostní kód',
            placeholder: 'Zadejte přístupový kód...',
            button: 'Ověřit identitu',
            footer: 'Chráněný systém. Pouze oprávněný personál.',
            devWarning: '⚠ Vývojový režim – nastavte VITE_ACCESS_CODE v .env',
            errorTooMany: 'Příliš mnoho neúspěšných pokusů. Vstup zablokován na 5 minut.',
            errorInvalid: 'Neplatný přístupový kód',
            errorAttempts: 'pokusů',
            retryIn: 'Znovu za',
        },

        // ── Header ──────────────────────────────────
        header: {
            title: 'LogiCore AI',
            subtitle: 'Logistické operace',
            backToDashboard: 'Dashboard',
            httpsEncrypted: 'HTTPS Šifrováno',
        },

        // ── Dashboard ───────────────────────────────
        dashboard: {
            title: 'Operační Dashboard',
            subtitle:
                'AI agenti pro spediční operace. Vyberte agenta níže pro zahájení zpracování.',
            footerNote: 'LogiCore AI v0.2.0-beta • Data jsou odesílána na AI endpointy ke zpracování',
        },

        // ── Agent Cards ─────────────────────────────
        agents: {
            comingSoon: 'Připravujeme',
            available: 'Dostupný',
            openAgent: 'Otevřít agenta',
            underConstruction: 'Agent ve vývoji',
            underConstructionDesc: 'Tento modul je momentálně ve fázi vývoje.',

            invoiceAuditor: {
                name: 'Auditor faktur',
                subtitle: 'Porovnání faktury dopravce s nabídkou',
                description:
                    'Nahrajte fakturu dopravce a původní cenovou nabídku. AI provede fuzzy párování k automatické detekci cenových odchylek, skrytých příplatků a nesrovnalostí v položkách.',
            },
            dataPrepper: {
                name: 'LBase Čistič dat',
                subtitle: 'Čistič TMS integrace',
                description:
                    'Standardizace nestrukturovaných objednávkových dat pro import LBase/Lobster. Automatická oprava kódů zemí, formátů PSČ a mapování polí dle vašeho TMS schématu.',
            },
            rateNormalizer: {
                name: 'Normalizér sazeb',
                subtitle: 'Sjednocení sazeb dopravců',
                description:
                    'Sjednoťte sazebníky od více dopravců do jednotného srovnávacího formátu. Zpracuje různé jednotky, struktury příplatků a období platnosti.',
            },
            adHocAnalyst: {
                name: 'Ad-Hoc Analytik',
                subtitle: 'Dotazy na data přirozeným jazykem',
                description:
                    'Komunikujte se svými Excel daty přirozeným jazykem. Ptejte se například „Které zásilky překročily 2000 kg minulý měsíc?" a získejte okamžité strukturované odpovědi.',
            },
        },

        // ── Invoice Auditor ─────────────────────────
        invoiceAuditor: {
            title: 'Auditor faktur',
            description:
                'Nahrajte fakturu dopravce a původní cenovou nabídku pro automatizovanou analýzu odchylek v položkách.',
            quoteLabel: 'Cenová nabídka (Kalkulace)',
            quoteSublabel: 'Nahrajte původní cenovou nabídku',
            invoiceLabel: 'Faktura dopravce',
            invoiceSublabel: 'Nahrajte fakturu od dopravce',
            quotePrefix: 'Nabídka',
            invoicePrefix: 'Faktura',
            rows: 'řádků',
            columns: 'sloupců',
            processing: 'Zpracování…',
            dragAndDrop: 'Přetáhněte sem nebo klikněte • pouze .xlsx',
            runAnalysis: 'Spustit analýzu odchylek',
            reset: 'Obnovit',
            aiAnalysis: 'AI analýza probíhá',
            analysisFailed: 'Analýza selhala',
            parseFailed: 'Soubor se nepodařilo zpracovat',

            // ── Report ──────────────────────────────
            totalQuote: 'Nabídka celkem',
            totalInvoice: 'Faktura celkem',
            netVariance: 'Čistá odchylka',
            riskAssessment: 'Hodnocení rizik',
            lineItems: 'položek',
            matched: 'spárováno',
            deviation: 'odchylka',
            unmatchedInvoiceItems: 'nespárované fakturační položky',

            // ── Filter Tabs ─────────────────────────
            filterAll: 'Vše',
            filterOverages: 'Přeplatky',
            filterUnderages: 'Nedoplatky',
            filterUnmatched: 'Nespárované',

            // ── Export & Actions ─────────────────────
            exportJson: 'Exportovat JSON',
            newAudit: 'Nový audit',

            // ── Table Headers ───────────────────────
            thStatus: 'Stav',
            thQuoteItem: 'Položka nabídky',
            thInvoiceItem: 'Položka faktury',
            thQuoteAmount: 'Nabídka €',
            thInvoiceAmount: 'Faktura €',
            thVariance: 'Odchylka',
            thVariancePercent: 'Odch. %',
            thConfidence: 'Spolehlivost',
            thCategory: 'Kategorie',

            // ── Status Labels ───────────────────────
            statusMatch: 'Shoda',
            statusOverage: 'Přeplatek',
            statusUnderage: 'Nedoplatek',
            statusQuoteOnly: 'Jen nabídka',
            statusInvoiceOnly: 'Jen faktura',

            // ── Risk Levels ─────────────────────────
            riskLow: 'Nízké riziko',
            riskMedium: 'Střední riziko',
            riskHigh: 'Vysoké riziko',
            riskCritical: 'Kritické riziko',

            // ── Empty State ─────────────────────────
            noItemsMatch: 'Žádné položky neodpovídají aktuálnímu filtru.',

            // ── Report Footer ───────────────────────
            analysisPerformed: 'Analýza provedena',
            reportId: 'ID zprávy',
        },
    },
};
