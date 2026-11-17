export const M = {
  en: {
    recent: 'Recent visits', noVisits: 'No visits yet', noVisitsHint: 'Start a visit above. It will show up here.',
    followups: (n) => `${n} follow-up${n === 1 ? '' : 's'}`, overdueN: (n) => `${n} overdue`, allGood: 'No follow-ups due',
    reached: 'Mark reached', reachedDone: 'Reached', referralSent: 'Referral sent', onPhone: 'On this phone', code: 'Code',
    checkBy: 'Check by', patient: { mother: 'Mother', newborn: 'Newborn' },
    whyLabel: 'Why this level', whyUnsure: 'Not enough information to rule out danger.', whyGreen: 'Checklist finished, nothing found.',
    whyRaised: 'Raised by the assistant or a sign combination.', copyAlert: 'Copy hospital message',
    rulesHeader: 'Rules and sources', rulesLabel: 'Every sign, its level and where it comes from', source: 'Source',
    reviewed: 'Reviewed by one doctor', pending: 'Review pending', version: 'Rules version', rulesLink: 'Rules and sources',
    measureLink: 'How we measured', homeAsha: 'ASHA name and village', demoLink: 'Try the demo', demoHeader: 'Demo', playLink: 'Play guided demo',
    alertTpl: (p, signs) => `URGENT referral: ${p} with danger signs: ${signs}. Danger level: Red. Please be ready to receive. Sent from Asha Sethu (an alert aid, not a diagnosis).`
  },
  hi: {
    recent: 'हाल की विज़िट', noVisits: 'अभी कोई विज़िट नहीं', noVisitsHint: 'ऊपर से विज़िट शुरू करें। यहाँ दिखेगी।',
    followups: (n) => `${n} फ़ॉलो-अप`, overdueN: (n) => `${n} देर से`, allGood: 'कोई फ़ॉलो-अप बाकी नहीं',
    reached: 'पहुँचा, चिह्नित करें', reachedDone: 'पहुँच गया', referralSent: 'रेफ़रल भेजा गया', onPhone: 'इस फ़ोन में', code: 'कोड',
    checkBy: 'जाँच की तारीख़', patient: { mother: 'माँ', newborn: 'नवजात' },
    whyLabel: 'यह स्तर क्यों', whyUnsure: 'ख़तरे से इनकार करने के लिए जानकारी कम है।', whyGreen: 'सूची पूरी, कुछ नहीं मिला।',
    whyRaised: 'सहायक या लक्षणों के मेल से बढ़ाया गया।', copyAlert: 'अस्पताल का संदेश कॉपी करें',
    rulesHeader: 'नियम और स्रोत', rulesLabel: 'हर लक्षण, उसका स्तर और स्रोत', source: 'स्रोत',
    reviewed: 'एक डॉक्टर ने जाँचा', pending: 'समीक्षा बाकी', version: 'नियमों का संस्करण', rulesLink: 'नियम और स्रोत',
    measureLink: 'हमने कैसे मापा', homeAsha: 'आशा का नाम और गाँव', demoLink: 'डेमो आज़माएँ', demoHeader: 'डेमो', playLink: 'गाइडेड डेमो चलाएँ',
    alertTpl: (p, signs) => `अति आवश्यक रेफ़रल: ${p}, ख़तरे के लक्षण: ${signs}. ख़तरे का स्तर: लाल। कृपया तैयार रहें। Asha Sethu से भेजा गया (चेतावनी सहायक, निदान नहीं)।`
  }
}
