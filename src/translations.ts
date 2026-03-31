/* ============================================
   LogiCore AI – Translation Strings
   Supported languages: cs (Czech), en (English), de (German)
   Default: cs
   ============================================ */

export type Language = 'cs' | 'en' | 'de';

// Recursive type for nested translation objects
export interface TranslationMap {
    [key: string]: string | TranslationMap;
}

export interface Translations {
    cs: TranslationMap;
    en: TranslationMap;
    de: TranslationMap;
}

export const translations: Translations = {
    // ═══════════════════════════════════════════
    // CZECH (default)
    // ═══════════════════════════════════════════
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
            footerNote: 'LogiCore AI v0.4.0 • Data zpracována lokálně v prohlížeči',
        },

        // ── Agent Cards ─────────────────────────────
        agents: {
            comingSoon: 'Připravujeme',
            available: 'Dostupný',
            openAgent: 'Otevřít agenta',
            underConstruction: 'Agent ve vývoji',
            underConstructionDesc: 'Tento modul je momentálně ve fázi vývoje.',

            rewardCalculator: {
                name: 'Kalkulátor odměn',
                subtitle: 'Výpočet progresivních odměn kurýrů',
                description:
                    'Nahrajte jeden Excel soubor se sazebníkem a daty zásilek. Systém automaticky rozpozná listy, provede progresivní výpočet odměn a vygeneruje výstupní report.',
            },
            invoiceAuditor: {
                name: 'Auditor faktur',
                subtitle: 'Porovnání faktury dopravce s nabídkou',
                description:
                    'Nahrajte fakturu dopravce a původní cenovou nabídku. AI provede fuzzy párování k automatické detekci cenových odchylek, skrytých příplatků a nesrovnalostí v položkách.',
            },
            macroCreator: {
                name: 'Tvůrce maker',
                subtitle: 'Generátor VBA maker a Office Scripts',
                description:
                    'Popište co potřebujete a AI vygeneruje hotový VBA kód nebo Office Script. Zkopírujte kód přímo do Excelu.',
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

        // ── Reward Calculator ───────────────────────
        rewardCalculator: {
            title: 'Kalkulátor odměn',
            description:
                'Nahrajte Excel soubor se sazebníkem a daty zásilek. Systém automaticky rozpozná strukturu a vypočítá progresivní odměny.',
            dropzoneLabel: 'Sem přetáhněte Excel soubor',
            dropzoneSublabel: 'Jeden .xlsx soubor se sazebníkem a daty zásilek',
            dragAndDrop: 'Přetáhněte sem nebo klikněte • pouze .xlsx',
            processing: 'Zpracování…',
            parseFailed: 'Soubor se nepodařilo zpracovat',

            // Smart detection
            detectedTiers: 'Sazebník rozpoznán',
            detectedData: 'Data zásilek rozpoznána',
            detectionFailed: 'Automatická detekce selhala',
            confirmSelection: 'Potvrdit výběr',
            sheet: 'List',

            // Column detection errors
            errorNoTiersSheet: 'Nenašel jsem list se sazebníkem. Soubor musí obsahovat list s pásmy odměn (sloupce "Od", "Do", "Sazba").',
            errorNoDataSheet: 'Nenašel jsem list s daty zásilek. Soubor musí obsahovat list se jmény a počty zásilek.',
            errorNoLowerBound: 'Nenašel jsem sloupec se spodní hranicí pásma. Zkuste pojmenovat sloupec "Od", "Min", "From" nebo "Von".',
            errorNoRate: 'Nenašel jsem sloupec se sazbou. Zkuste pojmenovat sloupec "Sazba", "Cena", "Odměna", "Rate" nebo "Prämie".',
            errorNoName: 'Nenašel jsem sloupec se jménem kurýra. Zkuste pojmenovat sloupec "Jméno", "Kurýr", "Řidič", "Name" nebo "Driver".',
            errorNoCount: 'Nenašel jsem sloupec se zásilkami. Zkuste pojmenovat sloupec "Zásilek", "Počet", "Count" nebo "Sendungen".',
            errorNoTiers: 'Sazebník neobsahuje žádná platná pásma.',
            errorNoDrivers: 'Data zásilek neobsahují žádné řidiče.',

            // Manual mapping UI
            mappingBannerTitle: 'Systém potřebuje upřesnit sloupce',
            mappingBannerDesc: 'Systém potřebuje upřesnit sloupce – vyberte prosím správné listy a přiřaďte sloupce ručně.',
            columnMappingSection: 'Přiřazení sloupců',
            labelNameCol: 'Kde je jméno / kurýr?',
            labelCountCol: 'Kde je počet zásilek?',
            labelLowerBoundCol: 'Kde je spodní hranice (od)?',
            labelUpperBoundCol: 'Kde je horní hranice (do)?',
            labelRateCol: 'Kde je sazba?',
            labelRewardOutputCol: 'Kde je výstupní sloupec odměny?',
            hintTiersSheet: 'List se sazbami',
            hintDataSheet: 'List s kurýry / řidiči',
            selectTiersSheet: 'Vyberte list se sazbami',
            selectDataSheet: 'Vyberte list s daty zásilek',
            autoDetectOption: '— automaticky —',
            recalculate: 'Přepočítat',
            changeMapping: 'Změnit mapování',
            downloadSample: 'Stáhnout vzorový soubor',

            // Results
            resultTitle: 'Výsledky výpočtu',
            colName: 'Jméno',
            colShipments: 'Zásilek',
            colReward: 'Vypočítaná odměna',
            rowTotal: 'Celkem',
            currency: 'CZK',
            downloadButton: 'Stáhnout výsledky (.xlsx)',
            newCalculation: 'Nový výpočet',
            tiersUsed: 'Použitý sazebník',
            tierFrom: 'Od',
            tierTo: 'Do',
            tierRate: 'Sazba',
            tierInfinity: '∞',
            driversProcessed: 'řidičů zpracováno',
            totalReward: 'Celková odměna',
        },

        // ── Macro Creator ───────────────────────────
        macroCreator: {
            title: 'Tvůrce maker',
            description:
                'Popište co potřebujete a AI vygeneruje hotový VBA kód nebo Office Script pro Excel.',
            inputLabel: 'Popište požadované makro',
            placeholder: 'Např.: Vytvoř makro, které seřadí list podle sloupce A a zvýrazní duplicity červeně...',
            generateButton: 'Vygenerovat',
            loadingText: 'AI generuje kód…',
            copyButton: 'Kopírovat kód',
            copiedText: 'Zkopírováno!',
            regenerateButton: 'Vygenerovat znovu',
            generationFailed: 'Generování selhalo',
            selectTypeLabel: 'Typ skriptu',
            typeVBA: 'VBA Macro (Excel desktop – .xlsm)',
            typeOfficeScript: 'Office Script (Excel Online / Microsoft 365)',
            instructionsTitle: 'Jak vložit kód do Excelu',
            instructions: {
                vba: {
                    withDevTab: 'Mám záložku Vývojář',
                    withoutDevTab: 'Nemám záložku Vývojář',
                    withDevSteps:
                        'Záložka Vývojář → Visual Basic|Insert → Module|Vložte kód|`F5` pro spuštění nebo Vývojář → Makra → Spustit',
                    enableDevTab:
                        'Aktivace záložky Vývojář (jednorázově):|Soubor → Možnosti → Přizpůsobit pás karet|Zaškrtni "Vývojář" → OK|Pak postupujte podle návodu výše.',
                    altShortcut:
                        'Nebo přímo: `Alt+F11` → otevře Visual Basic editor',
                },
                officescript: {
                    steps:
                        'Otevřete soubor v Excel Online (office.com)|Klikněte na záložku Automatizovat (Automate)|Klikněte na „Nový skript" (New Script)|Smažte výchozí kód a vložte vygenerovaný|Klikněte na tlačítko „Spustit" (Run)',
                    note: 'Poznámka: Office Scripts funguje pouze v Excel Online / Microsoft 365. Soubor musí být uložen na OneDrive nebo SharePoint.',
                },
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

            totalQuote: 'Nabídka celkem',
            totalInvoice: 'Faktura celkem',
            netVariance: 'Čistá odchylka',
            riskAssessment: 'Hodnocení rizik',
            lineItems: 'položek',
            matched: 'spárováno',
            deviation: 'odchylka',
            unmatchedInvoiceItems: 'nespárované fakturační položky',

            filterAll: 'Vše',
            filterOverages: 'Přeplatky',
            filterUnderages: 'Nedoplatky',
            filterUnmatched: 'Nespárované',

            exportJson: 'Exportovat JSON',
            newAudit: 'Nový audit',

            thStatus: 'Stav',
            thQuoteItem: 'Položka nabídky',
            thInvoiceItem: 'Položka faktury',
            thQuoteAmount: 'Nabídka €',
            thInvoiceAmount: 'Faktura €',
            thVariance: 'Odchylka',
            thVariancePercent: 'Odch. %',
            thConfidence: 'Spolehlivost',
            thCategory: 'Kategorie',

            statusMatch: 'Shoda',
            statusOverage: 'Přeplatek',
            statusUnderage: 'Nedoplatek',
            statusQuoteOnly: 'Jen nabídka',
            statusInvoiceOnly: 'Jen faktura',

            riskLow: 'Nízké riziko',
            riskMedium: 'Střední riziko',
            riskHigh: 'Vysoké riziko',
            riskCritical: 'Kritické riziko',

            noItemsMatch: 'Žádné položky neodpovídají aktuálnímu filtru.',

            analysisPerformed: 'Analýza provedena',
            reportId: 'ID zprávy',
        },
    },

    // ═══════════════════════════════════════════
    // ENGLISH
    // ═══════════════════════════════════════════
    en: {
        // ── Login Screen ────────────────────────────
        login: {
            title: 'LogiCore AI',
            subtitle: 'Enterprise Logistics Operations',
            label: 'Security Code',
            placeholder: 'Enter access code...',
            button: 'Verify Identity',
            footer: 'Protected system. Authorized personnel only.',
            devWarning: '⚠ Development mode – set VITE_ACCESS_CODE in .env',
            errorTooMany: 'Too many failed attempts. Input locked for 5 minutes.',
            errorInvalid: 'Invalid access code',
            errorAttempts: 'attempts',
            retryIn: 'Retry in',
        },

        // ── Header ──────────────────────────────────
        header: {
            title: 'LogiCore AI',
            subtitle: 'Logistics Operations',
            backToDashboard: 'Dashboard',
            httpsEncrypted: 'HTTPS Encrypted',
        },

        // ── Dashboard ───────────────────────────────
        dashboard: {
            title: 'Operations Dashboard',
            subtitle:
                'AI-powered agents for freight operations. Select an agent below to start processing.',
            footerNote: 'LogiCore AI v0.4.0 • Data processed locally in browser',
        },

        // ── Agent Cards ─────────────────────────────
        agents: {
            comingSoon: 'Coming Soon',
            available: 'Available',
            openAgent: 'Open Agent',
            underConstruction: 'Agent Under Construction',
            underConstructionDesc: 'This module is currently in development.',

            rewardCalculator: {
                name: 'Reward Calculator',
                subtitle: 'Progressive courier reward calculation',
                description:
                    'Upload a single Excel file with rate tiers and shipment data. The system automatically detects sheets, calculates progressive rewards and generates an output report.',
            },
            invoiceAuditor: {
                name: 'Invoice Auditor',
                subtitle: 'Carrier Invoice vs. Quote Comparison',
                description:
                    'Upload a carrier invoice and the original cost estimate. AI performs fuzzy matching to automatically detect pricing variances, hidden surcharges, and line-item discrepancies.',
            },
            macroCreator: {
                name: 'Macro Creator',
                subtitle: 'VBA & Office Scripts generator',
                description:
                    'Describe what you need and AI generates ready-to-use VBA macros or Office Scripts. Copy the code directly into Excel.',
            },
            dataPrepper: {
                name: 'LBase Data Prepper',
                subtitle: 'TMS Integration Cleaner',
                description:
                    'Standardize unstructured order data for LBase/Lobster import. Auto-corrects country codes, ZIP formats, and field mappings according to your TMS schema.',
            },
            rateNormalizer: {
                name: 'Rate Sheet Normalizer',
                subtitle: 'Carrier Rate Unification',
                description:
                    'Unify rate sheets from multiple carriers into a single standardized comparison format. Handles varying units, surcharge structures, and validity periods.',
            },
            adHocAnalyst: {
                name: 'Ad-Hoc Analyst',
                subtitle: 'Natural Language Data Query',
                description:
                    'Chat with your Excel data using natural language. Ask questions like "Which shipments exceeded 2000kg last month?" and get instant structured answers.',
            },
        },

        // ── Reward Calculator ───────────────────────
        rewardCalculator: {
            title: 'Reward Calculator',
            description:
                'Upload an Excel file with rate tiers and shipment data. The system automatically detects the structure and calculates progressive rewards.',
            dropzoneLabel: 'Drop Excel file here',
            dropzoneSublabel: 'Single .xlsx file with rate tiers and shipment data',
            dragAndDrop: 'Drag & drop or click • .xlsx only',
            processing: 'Processing…',
            parseFailed: 'Failed to parse the file',

            detectedTiers: 'Rate tiers detected',
            detectedData: 'Shipment data detected',
            detectionFailed: 'Automatic detection failed',
            confirmSelection: 'Confirm selection',
            sheet: 'Sheet',

            errorNoTiersSheet: 'Could not find a rate tiers sheet. The file must contain a sheet with reward tiers (columns "From", "To", "Rate").',
            errorNoDataSheet: 'Could not find a shipment data sheet. The file must contain a sheet with names and shipment counts.',
            errorNoLowerBound: 'Could not find the lower bound column. Try naming the column "From", "Min", "Start" or "Von".',
            errorNoRate: 'Could not find the rate column. Try naming the column "Rate", "Price", "Reward" or "Prämie".',
            errorNoName: 'Could not find the driver name column. Try naming the column "Name", "Driver", "User" or "Fahrer".',
            errorNoCount: 'Could not find the shipment count column. Try naming the column "Count", "Shipments", "Amount" or "Sendungen".',
            errorNoTiers: 'The rate tiers sheet contains no valid tiers.',
            errorNoDrivers: 'The shipment data contains no drivers.',

            // Manual mapping UI
            mappingBannerTitle: 'Column mapping required',
            mappingBannerDesc: 'Column mapping required – please select sheets and map columns manually.',
            columnMappingSection: 'Column Mapping',
            labelNameCol: 'Which column contains the name?',
            labelCountCol: 'Which column contains shipment count?',
            labelLowerBoundCol: 'Lower bound column (from)?',
            labelUpperBoundCol: 'Upper bound column (to)?',
            labelRateCol: 'Which column contains the rate?',
            labelRewardOutputCol: 'Output column for reward?',
            hintTiersSheet: 'Rate tiers sheet',
            hintDataSheet: 'Shipment data sheet',
            selectTiersSheet: 'Select rate tiers sheet',
            selectDataSheet: 'Select shipment data sheet',
            autoDetectOption: '— auto detect —',
            recalculate: 'Recalculate',
            changeMapping: 'Change mapping',
            downloadSample: 'Download sample file',

            resultTitle: 'Calculation Results',
            colName: 'Name',
            colShipments: 'Shipments',
            colReward: 'Calculated Reward',
            rowTotal: 'Total',
            currency: 'CZK',
            downloadButton: 'Download results (.xlsx)',
            newCalculation: 'New Calculation',
            tiersUsed: 'Rate tiers used',
            tierFrom: 'From',
            tierTo: 'To',
            tierRate: 'Rate',
            tierInfinity: '∞',
            driversProcessed: 'drivers processed',
            totalReward: 'Total reward',
        },

        // ── Macro Creator ───────────────────────────
        macroCreator: {
            title: 'Macro Creator',
            description:
                'Describe what you need and AI generates ready-to-use VBA or Office Script code for Excel.',
            inputLabel: 'Describe the desired macro',
            placeholder: 'E.g.: Create a macro that sorts the sheet by column A and highlights duplicates in red...',
            generateButton: 'Generate',
            loadingText: 'AI is generating code…',
            copyButton: 'Copy Code',
            copiedText: 'Copied!',
            regenerateButton: 'Regenerate',
            generationFailed: 'Generation failed',
            selectTypeLabel: 'Script type',
            typeVBA: 'VBA Macro (Excel desktop – .xlsm)',
            typeOfficeScript: 'Office Script (Excel Online / Microsoft 365)',
            instructionsTitle: 'How to paste the code into Excel',
            instructions: {
                vba: {
                    withDevTab: 'I have the Developer tab',
                    withoutDevTab: 'I don\'t have the Developer tab',
                    withDevSteps:
                        'Developer tab → Visual Basic|Insert → Module|Paste the code|`F5` to run, or Developer → Macros → Run',
                    enableDevTab:
                        'Enable Developer tab (one-time):|File → Options → Customize Ribbon|Check "Developer" → OK|Then follow the instructions above.',
                    altShortcut:
                        'Or directly: `Alt+F11` → opens Visual Basic editor',
                },
                officescript: {
                    steps:
                        'Open the file in Excel Online (office.com)|Click the Automate tab|Click "New Script"|Clear the default code and paste the generated script|Click "Run"',
                    note: 'Note: Office Scripts only works in Excel Online / Microsoft 365. The file must be saved on OneDrive or SharePoint.',
                },
            },
        },

        // ── Invoice Auditor ─────────────────────────
        invoiceAuditor: {
            title: 'Invoice Auditor',
            description:
                'Upload a carrier invoice and the original cost estimate for automated line-item variance analysis.',
            quoteLabel: 'Cost Estimate (Quote)',
            quoteSublabel: 'Upload the original cost estimate',
            invoiceLabel: 'Carrier Invoice',
            invoiceSublabel: 'Upload the carrier\'s invoice',
            quotePrefix: 'Quote',
            invoicePrefix: 'Invoice',
            rows: 'rows',
            columns: 'columns',
            processing: 'Processing…',
            dragAndDrop: 'Drag & drop or click • .xlsx only',
            runAnalysis: 'Run Variance Analysis',
            reset: 'Reset',
            aiAnalysis: 'AI Analysis in Progress',
            analysisFailed: 'Analysis Failed',
            parseFailed: 'Failed to parse the file',

            totalQuote: 'Quote Total',
            totalInvoice: 'Invoice Total',
            netVariance: 'Net Variance',
            riskAssessment: 'Risk Assessment',
            lineItems: 'line items',
            matched: 'matched',
            deviation: 'deviation',
            unmatchedInvoiceItems: 'unmatched invoice items',

            filterAll: 'All',
            filterOverages: 'Overages',
            filterUnderages: 'Underages',
            filterUnmatched: 'Unmatched',

            exportJson: 'Export JSON',
            newAudit: 'New Audit',

            thStatus: 'Status',
            thQuoteItem: 'Quote Item',
            thInvoiceItem: 'Invoice Item',
            thQuoteAmount: 'Quote €',
            thInvoiceAmount: 'Invoice €',
            thVariance: 'Variance',
            thVariancePercent: 'Var. %',
            thConfidence: 'Confidence',
            thCategory: 'Category',

            statusMatch: 'Match',
            statusOverage: 'Overage',
            statusUnderage: 'Underage',
            statusQuoteOnly: 'Quote Only',
            statusInvoiceOnly: 'Invoice Only',

            riskLow: 'Low Risk',
            riskMedium: 'Medium Risk',
            riskHigh: 'High Risk',
            riskCritical: 'Critical Risk',

            noItemsMatch: 'No items match the current filter.',

            analysisPerformed: 'Analysis performed on',
            reportId: 'Report ID',
        },
    },

    // ═══════════════════════════════════════════
    // GERMAN
    // ═══════════════════════════════════════════
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
            footerNote: 'LogiCore AI v0.4.0 • Daten werden lokal im Browser verarbeitet',
        },

        // ── Agent Cards ─────────────────────────────
        agents: {
            comingSoon: 'Demnächst',
            available: 'Verfügbar',
            openAgent: 'Agent öffnen',
            underConstruction: 'Agent in Entwicklung',
            underConstructionDesc: 'Dieses Modul befindet sich derzeit in der Entwicklungsphase.',

            rewardCalculator: {
                name: 'Prämienrechner',
                subtitle: 'Progressive Kurier-Prämienberechnung',
                description:
                    'Laden Sie eine Excel-Datei mit Tarifstufen und Versanddaten hoch. Das System erkennt automatisch die Blätter, berechnet progressive Prämien und generiert einen Ausgabebericht.',
            },
            invoiceAuditor: {
                name: 'Rechnungsprüfer',
                subtitle: 'Frachtrechnung vs. Angebot Vergleich',
                description:
                    'Laden Sie eine Frachtrechnung und das ursprüngliche Kostenangebot hoch. KI führt Fuzzy-Matching durch, um Preisabweichungen, versteckte Zuschläge und Positionsunterschiede automatisch zu erkennen.',
            },
            macroCreator: {
                name: 'Makro-Ersteller',
                subtitle: 'VBA- & Office-Scripts-Generator',
                description:
                    'Beschreiben Sie, was Sie benötigen, und die KI generiert einsatzbereite VBA-Makros oder Office Scripts. Kopieren Sie den Code direkt in Excel.',
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

        // ── Reward Calculator ───────────────────────
        rewardCalculator: {
            title: 'Prämienrechner',
            description:
                'Laden Sie eine Excel-Datei mit Tarifstufen und Versanddaten hoch. Das System erkennt automatisch die Struktur und berechnet progressive Prämien.',
            dropzoneLabel: 'Excel hier ablegen',
            dropzoneSublabel: 'Eine .xlsx-Datei mit Tarifstufen und Versanddaten',
            dragAndDrop: 'Drag & Drop oder klicken • nur .xlsx',
            processing: 'Verarbeitung…',
            parseFailed: 'Datei konnte nicht verarbeitet werden',

            detectedTiers: 'Tarifstufen erkannt',
            detectedData: 'Versanddaten erkannt',
            detectionFailed: 'Automatische Erkennung fehlgeschlagen',
            confirmSelection: 'Auswahl bestätigen',
            sheet: 'Blatt',

            errorNoTiersSheet: 'Kein Tarifstufen-Blatt gefunden. Die Datei muss ein Blatt mit Prämienstufen enthalten (Spalten "Von", "Bis", "Satz").',
            errorNoDataSheet: 'Kein Versanddaten-Blatt gefunden. Die Datei muss ein Blatt mit Namen und Sendungsmengen enthalten.',
            errorNoLowerBound: 'Spalte für die Untergrenze nicht gefunden. Benennen Sie die Spalte "Von", "Ab", "Min" oder "From".',
            errorNoRate: 'Spalte für den Tarif nicht gefunden. Benennen Sie die Spalte "Satz", "Prämie", "Betrag", "Rate" oder "Price".',
            errorNoName: 'Spalte für den Fahrernamen nicht gefunden. Benennen Sie die Spalte "Name", "Fahrer", "Kurier" oder "Benutzer".',
            errorNoCount: 'Spalte für die Sendungsanzahl nicht gefunden. Benennen Sie die Spalte "Sendungen", "Anzahl", "Pakete" oder "Count".',
            errorNoTiers: 'Das Tarifstufen-Blatt enthält keine gültigen Stufen.',
            errorNoDrivers: 'Die Versanddaten enthalten keine Fahrer.',

            // Manual mapping UI
            mappingBannerTitle: 'Spaltenzuordnung erforderlich',
            mappingBannerDesc: 'Spaltenzuordnung erforderlich – bitte wählen Sie die Blätter und ordnen Sie die Spalten manuell zu.',
            columnMappingSection: 'Spaltenzuordnung',
            labelNameCol: 'Welche Spalte enthält den Namen?',
            labelCountCol: 'Welche Spalte enthält die Sendungsanzahl?',
            labelLowerBoundCol: 'Untergrenze-Spalte (von)?',
            labelUpperBoundCol: 'Obergrenze-Spalte (bis)?',
            labelRateCol: 'Welche Spalte enthält den Tarif?',
            labelRewardOutputCol: 'Ausgabespalte für die Prämie?',
            hintTiersSheet: 'Tarifblatt',
            hintDataSheet: 'Sendungsdatenblatt',
            selectTiersSheet: 'Tarifblatt auswählen',
            selectDataSheet: 'Sendungsdatenblatt auswählen',
            autoDetectOption: '— automatisch —',
            recalculate: 'Neu berechnen',
            changeMapping: 'Zuordnung ändern',
            downloadSample: 'Beispieldatei herunterladen',

            resultTitle: 'Berechnungsergebnisse',
            colName: 'Name',
            colShipments: 'Sendungen',
            colReward: 'Berechnete Prämie',
            rowTotal: 'Gesamt',
            currency: 'CZK',
            downloadButton: 'Ergebnisse herunterladen (.xlsx)',
            newCalculation: 'Neue Berechnung',
            tiersUsed: 'Verwendete Tarifstufen',
            tierFrom: 'Von',
            tierTo: 'Bis',
            tierRate: 'Satz',
            tierInfinity: '∞',
            driversProcessed: 'Fahrer verarbeitet',
            totalReward: 'Gesamtprämie',
        },

        // ── Macro Creator ───────────────────────────
        macroCreator: {
            title: 'Makro-Ersteller',
            description:
                'Beschreiben Sie, was Sie benötigen, und die KI generiert fertigen VBA- oder Office-Script-Code für Excel.',
            inputLabel: 'Beschreiben Sie das gewünschte Makro',
            placeholder: 'Z.B.: Erstelle ein Makro, das das Blatt nach Spalte A sortiert und Duplikate rot hervorhebt...',
            generateButton: 'Generieren',
            loadingText: 'KI generiert Code…',
            copyButton: 'Code kopieren',
            copiedText: 'Kopiert!',
            regenerateButton: 'Erneut generieren',
            generationFailed: 'Generierung fehlgeschlagen',
            selectTypeLabel: 'Skripttyp',
            typeVBA: 'VBA Makro (Excel Desktop – .xlsm)',
            typeOfficeScript: 'Office Script (Excel Online / Microsoft 365)',
            instructionsTitle: 'So fügen Sie den Code in Excel ein',
            instructions: {
                vba: {
                    withDevTab: 'Ich habe die Registerkarte Entwickler',
                    withoutDevTab: 'Ich habe keine Registerkarte Entwickler',
                    withDevSteps:
                        'Registerkarte Entwickler → Visual Basic|Einfügen → Modul|Code einfügen|`F5` oder Entwickler → Makros → Ausführen',
                    enableDevTab:
                        'Entwickler-Registerkarte aktivieren (einmalig):|Datei → Optionen → Menüband anpassen|„Entwicklertools" aktivieren → OK|Dann folgen Sie den Anweisungen oben.',
                    altShortcut:
                        'Oder direkt: `Alt+F11` → öffnet Visual Basic-Editor',
                },
                officescript: {
                    steps:
                        'Datei in Excel Online öffnen (office.com)|Registerkarte Automatisieren klicken|„Neues Skript" klicken|Standardcode löschen und generierten Code einfügen|„Ausführen" klicken',
                    note: 'Hinweis: Office Scripts funktioniert nur in Excel Online / Microsoft 365. Die Datei muss auf OneDrive oder SharePoint gespeichert sein.',
                },
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

            totalQuote: 'Angebot Gesamt',
            totalInvoice: 'Rechnung Gesamt',
            netVariance: 'Netto-Abweichung',
            riskAssessment: 'Risikobewertung',
            lineItems: 'Positionen',
            matched: 'zugeordnet',
            deviation: 'Abweichung',
            unmatchedInvoiceItems: 'nicht zugeordnete Rechnungspositionen',

            filterAll: 'Alle',
            filterOverages: 'Überpreise',
            filterUnderages: 'Unterpreise',
            filterUnmatched: 'Nicht zugeordnet',

            exportJson: 'JSON exportieren',
            newAudit: 'Neue Prüfung',

            thStatus: 'Status',
            thQuoteItem: 'Angebotsposition',
            thInvoiceItem: 'Rechnungsposition',
            thQuoteAmount: 'Angebot €',
            thInvoiceAmount: 'Rechnung €',
            thVariance: 'Abweichung',
            thVariancePercent: 'Abw. %',
            thConfidence: 'Konfidenz',
            thCategory: 'Kategorie',

            statusMatch: 'Übereinstimmung',
            statusOverage: 'Überpreis',
            statusUnderage: 'Unterpreis',
            statusQuoteOnly: 'Nur Angebot',
            statusInvoiceOnly: 'Nur Rechnung',

            riskLow: 'Niedriges Risiko',
            riskMedium: 'Mittleres Risiko',
            riskHigh: 'Hohes Risiko',
            riskCritical: 'Kritisches Risiko',

            noItemsMatch: 'Keine Elemente entsprechen dem aktuellen Filter.',

            analysisPerformed: 'Analyse durchgeführt am',
            reportId: 'Bericht-ID',
        },
    },
};
