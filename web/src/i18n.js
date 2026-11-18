// Extra screen text, English and Hindi. Same pattern as strings.js (T) and more.js (M).
// Hindi wording here needs a Hindi reader's check before real use.
import rules from '../../data/rules.json'
import questions from '../../data/questions.json'

export const X = {
  en: {
    startVisit: 'Start a visit', whoFor: 'Who is the visit for?',
    motherSub: 'Danger signs in a mother', newbornSub: 'Danger signs in a baby',
    langLabel: 'Language',
    lookupTitle: 'Seen before? Look up by patient code', codePh: '4-letter code', lookup: 'Look up',
    noServer: 'Could not reach the server.', noneFound: (c) => `No visits found for ${c}.`,
    today: 'Today', dAgo: (n) => `${n} d ago`, noSigns: 'no signs', startFor: 'Start a visit for this patient',
    docReceived: '✓ Doctor received', couldNotGo: 'Could not go', notYet: 'Not yet', reachedBtn: 'Reached',
    famLink: 'Family records', offlineNote: 'No signal. Visits are saved on this phone and sent when signal returns.',
    // settings
    back: '← Back', settings: 'Settings', ashaName: 'ASHA name', enterName: 'Enter your name', village: 'Village', enterVillage: 'Enter village name',
    darkMode: 'Dark mode', system: 'System', light: 'Light', dark: 'Dark',
    // describe
    micQuiet: 'Did not hear anything. Tap the mic and speak closer.', voiceProblem: 'Voice problem: ', noCatch: 'Did not catch that. Please try again or type.',
    noServerType: 'Could not reach the server. Please type instead.', micBlocked: 'Microphone is blocked. Allow it in the browser site settings, or type instead.',
    noMic: 'No microphone found. Please type instead.', voiceFail: 'Voice did not work on this browser. Please type instead.', voiceStart: 'Voice could not start. Please type instead.',
    noVoice: 'Voice is not available in this browser (apps like WhatsApp or Instagram block the microphone). Open this link in Chrome or Safari, or type below.',
    recording: 'Recording... tap the mic again when you finish.', transcribing: 'Turning your voice into text...',
    // confirm
    soundsA: 'This sounds like a ', soundsB: ', but you started a ', soundsC: ' visit.', switchTo: (w) => `Switch to ${w} visit`,
    // steps saved by the app
    stepSaved: 'Saved the visit record', stepSavedPhone: 'Saved the visit on this phone (will send when signal returns)',
    stepSent: 'Referral sent', stepWait: 'Referral waiting for signal. It will send automatically.',
    feedNot: 'Not feeding', feedOk: 'Feeding, no concern reported',
    // result trace
    trSafety: (kept, sug) => `Safety floor kept ${kept} (assistant suggested ${sug})`, trSuggested: (l) => `Suggested ${l}`,
    trDraft: { write_note: 'Prepared referral note (draft, not saved)', fill_record: 'Pre-filled visit record (draft, not saved)', send_referral: 'Prepared referral (draft, not sent)' },
    trFollow: (d) => `Planned a check-back in ${d === 1 ? '1 day' : '2 days'}`,
    trFallback: 'Assistant unavailable: used fixed rules', trHistory: (names, when) => `Checked history: ${names} on last visit (${when})`,
    trFinal: { AMBER: 'Danger level Amber', UNSURE: 'Could not rule out danger: Unsure', GREEN: 'Checklist finished, nothing found: Green' },
    whenToday: 'today', whenDay: (d) => (d === 1 ? '1 day ago' : `${d} days ago`),
    // rules
    link: 'link', srcNote: '',
    // measured
    mTitle: 'How we measured', mCases: (n) => `${n} test cases`,
    mRows: ['RED cases caught', 'RED cases missed', 'Level accuracy', 'Missed danger (false negatives)', 'False alarms (over-referral)', 'Unsure rate', 'Average steps'],
    mPrinted: 'Printed checklist', mOurs: 'Asha Sethu', mOf: (a, b) => `${a} of ${b}`, mByLang: 'By language', mLang: 'Language', mCasesCol: 'Cases', mChecklist: 'Checklist',
    mFloor: 'Floor tests', mF1: '1. Final level is never below the rules floor', mF2: '2. Never GREEN when unclear or checklist unfinished',
    mNote1: 'The floor test checks that the code works. It does not prove the clinical rules are correct.',
    mNote2: 'The cases were written by the builder, not collected from real visits, so scores will look better than real use. The baseline is a printed-checklist stand-in with English keywords only. Clinical review: levels reviewed by one gynaecologist; not clinically validated.',
    mode: { 'offline, no AI model': 'offline, no AI model' },
    langName: { en: 'English', hi: 'Hindi', hinglish: 'Hinglish' },
    // demo
    demoTag: 'DEMO DATA', demoTop: 'Made-up cases. Anything saved while a scenario runs is tagged demo.', demoReset: 'Reset demo on this device',
    flip: 'Tap to flip', expected: 'Expected', runIn: 'Run in the app', flipBack: 'Flip back', scen: (n, t) => `Scenario ${n}: ${t}. Flip for the answer`,
    rtTitle: 'Try to break it', rtSub: 'Five tricky phrases, run live against the real rules.', rtBusy: 'Checking...', rtErr: 'Server not reachable.',
    rtFound: 'Found', rtNothing: 'nothing', rtAbsent: 'Not present', rtOk: 'as expected', rtExp: (l) => `expected ${l}`,
    rtWhy: ['Negation: fever is ignored, feeding problem is found', 'Hinglish negation: no fever found, still not Green', 'Misspellings', 'Hindi', 'Vague: never turned into Green'],
    sc: [
      { tag: 'Danger', title: 'Hot baby, a fit', story: 'Day 6. The mother says the baby had a fit this morning and feels very hot.', how: 'Red at once. A Red sign needs no more questions: the app shows the alert first.' },
      { tag: 'Watch', title: 'Baby will not feed', story: 'Day 4. The baby has refused the breast since last night.', how: 'Answer No to every question the agent asks. Amber, with a referral prepared.' },
      { tag: 'Well', title: 'Nothing wrong', story: 'Day 10. The baby looks well and you checked everything on the list.', how: 'Tick "I checked everything" and add no signs. Green appears only because the list was finished.' },
      { tag: 'Tricky', title: 'Feeding well, no fever', story: 'The mother says "feeding well, no fever". The word fever is in the sentence, but the fever is not present.', how: 'The fever is NOT added (negation). Not Red. Unsure until you tick "I checked everything", never Green by itself.' },
      { tag: 'Vague', title: 'Baby seems off', story: 'The mother only says the baby "seems off". No clear sign.', how: 'Unsure. The agent may suggest a sign; you accept or dismiss it. It cannot call this Green.' }
    ],
    // family records
    famHeader: 'Family records', famLabel: 'Kept on this phone. Nothing is uploaded.',
    famEmpty: 'No records yet', famEmptyHint: 'Records appear here after you save a visit.',
    famExport: 'Export file', famImport: 'Import file', famExportOne: 'Save family copy', famDelete: 'Delete', famDeleteAsk: 'Delete this record from this phone?', famYes: 'Yes, delete', famCancel: 'Cancel',
    famDemo: 'DEMO', famImported: 'Imported', famCode: 'Code', famSigns: 'Signs', famAdvice: 'Advice', famAge: 'Age', famWhen: 'Saved',
    famNoSigns: 'none', famDays: (n) => `${n} days`,
    famNone: 'There is nothing to export.', famExported: (n) => `Saved a file with ${n} record${n === 1 ? '' : 's'}.`,
    famPrivacy: 'The file holds no names. Only a patient code, the signs, the level and the date. Keep it safe.',
    famImportOk: (a, d) => `Imported ${a} record${a === 1 ? '' : 's'}${d ? `, skipped ${d} already here` : ''}.`,
    famChecksumBad: 'This file was changed after it was saved. It was not imported.',
    famErr: { notJson: 'This is not a valid file.', wrongFormat: 'This file is not an Asha Sethu record file.', newer: 'This file was made by a newer version of the app. Update the app first.', empty: 'The file has no records.', tooMany: 'The file has too many records.', badRecord: (i, why) => `Record ${i + 1} is not valid (${why}).`, tooBig: 'The file is too large.' },
    famFloorNote: 'Level raised to match the current rules.',
    famLevelWhy: { sign: 'unknown sign', level: 'unknown level', patient: 'unknown patient', answer: 'unknown answer', id: 'missing id', date: 'bad date', age: 'bad age', text: 'bad text' },
    famShared: 'Shared.',
    // ticket
    qrBtn: 'Doctor ticket (QR)', qrTitle: 'Doctor ticket', qrHint: 'Show this to the doctor. Any phone camera or QR app can read it. It works with no signal.', qrClose: 'Close',
    qrLang: 'The ticket is in English.', qrTooLong: 'This note is too long for a QR code. Use Share instead.'
  },
  hi: {
    startVisit: 'विज़िट शुरू करें', whoFor: 'विज़िट किसके लिए है?',
    motherSub: 'माँ में ख़तरे के लक्षण', newbornSub: 'शिशु में ख़तरे के लक्षण',
    langLabel: 'भाषा',
    lookupTitle: 'पहले देखा है? रोगी कोड से खोजें', codePh: '4 अक्षर का कोड', lookup: 'खोजें',
    noServer: 'सर्वर से संपर्क नहीं हो पाया।', noneFound: (c) => `${c} के लिए कोई विज़िट नहीं मिली।`,
    today: 'आज', dAgo: (n) => `${n} दिन पहले`, noSigns: 'कोई लक्षण नहीं', startFor: 'इस रोगी की विज़िट शुरू करें',
    docReceived: '✓ डॉक्टर को मिल गया', couldNotGo: 'जा नहीं पाए', notYet: 'अभी नहीं', reachedBtn: 'पहुँचा',
    famLink: 'परिवार के रिकॉर्ड', offlineNote: 'सिग्नल नहीं है। विज़िट इस फ़ोन में सहेजी जाएँगी और सिग्नल आने पर भेजी जाएँगी।',
    back: '← वापस', settings: 'सेटिंग्स', ashaName: 'आशा का नाम', enterName: 'अपना नाम लिखें', village: 'गाँव', enterVillage: 'गाँव का नाम लिखें',
    darkMode: 'डार्क मोड', system: 'सिस्टम', light: 'हल्का', dark: 'गहरा',
    micQuiet: 'कुछ सुनाई नहीं दिया। माइक दबाएँ और पास से बोलें।', voiceProblem: 'आवाज़ में दिक़्क़त: ', noCatch: 'समझ नहीं आया। फिर से कोशिश करें या लिखें।',
    noServerType: 'सर्वर से संपर्क नहीं हो पाया। कृपया लिखें।', micBlocked: 'माइक्रोफ़ोन बंद है। ब्राउज़र की साइट सेटिंग में उसे चालू करें, या लिखें।',
    noMic: 'माइक्रोफ़ोन नहीं मिला। कृपया लिखें।', voiceFail: 'इस ब्राउज़र में आवाज़ काम नहीं की। कृपया लिखें।', voiceStart: 'आवाज़ शुरू नहीं हो पाई। कृपया लिखें।',
    noVoice: 'इस ब्राउज़र में आवाज़ उपलब्ध नहीं है (WhatsApp या Instagram जैसे ऐप माइक्रोफ़ोन रोक देते हैं)। यह लिंक Chrome या Safari में खोलें, या नीचे लिखें।',
    recording: 'रिकॉर्ड हो रहा है... बोलना ख़त्म होने पर माइक फिर दबाएँ।', transcribing: 'आपकी आवाज़ को लिखावट में बदला जा रहा है...',
    soundsA: 'यह ', soundsB: ' जैसा लग रहा है, लेकिन आपने ', soundsC: ' की विज़िट शुरू की थी।', switchTo: (w) => `${w} की विज़िट पर जाएँ`,
    stepSaved: 'विज़िट का रिकॉर्ड सहेजा गया', stepSavedPhone: 'विज़िट इस फ़ोन में सहेजी गई (सिग्नल आने पर भेजी जाएगी)',
    stepSent: 'रेफ़रल भेजा गया', stepWait: 'रेफ़रल सिग्नल का इंतज़ार कर रहा है। अपने आप भेज दिया जाएगा।',
    feedNot: 'दूध नहीं पी रहा', feedOk: 'दूध पी रहा है, कोई चिंता नहीं बताई गई',
    trSafety: (kept, sug) => `सुरक्षा नियम ने ${kept} बनाए रखा (सहायक ने ${sug} सुझाया था)`, trSuggested: (l) => `सुझाया: ${l}`,
    trDraft: { write_note: 'रेफ़रल नोट तैयार किया (मसौदा, सहेजा नहीं)', fill_record: 'विज़िट रिकॉर्ड पहले से भरा (मसौदा, सहेजा नहीं)', send_referral: 'रेफ़रल तैयार किया (मसौदा, भेजा नहीं)' },
    trFollow: (d) => `${d === 1 ? '1 दिन' : '2 दिन'} बाद दोबारा जाँचने की योजना बनाई`,
    trFallback: 'सहायक उपलब्ध नहीं था: तय नियम इस्तेमाल किए', trHistory: (names, when) => `पुराना इतिहास देखा: पिछली विज़िट पर ${names} (${when})`,
    trFinal: { AMBER: 'ख़तरे का स्तर पीला', UNSURE: 'ख़तरे से इनकार नहीं कर सके: अनिश्चित', GREEN: 'सूची पूरी, कुछ नहीं मिला: हरा' },
    whenToday: 'आज', whenDay: (d) => (d === 1 ? '1 दिन पहले' : `${d} दिन पहले`),
    link: 'लिंक', srcNote: 'स्रोतों के नाम मूल अंग्रेज़ी दस्तावेज़ों के अनुसार लिखे हैं।',
    mTitle: 'हमने कैसे मापा', mCases: (n) => `${n} परीक्षण मामले`,
    mRows: ['पकड़े गए लाल मामले', 'छूटे लाल मामले', 'स्तर की सटीकता', 'छूटा ख़तरा (झूठे नकारात्मक)', 'झूठे अलार्म (ज़रूरत से ज़्यादा रेफ़रल)', 'अनिश्चित की दर', 'औसत क़दम'],
    mPrinted: 'छपी हुई सूची', mOurs: 'Asha Sethu', mOf: (a, b) => `${b} में से ${a}`, mByLang: 'भाषा के अनुसार', mLang: 'भाषा', mCasesCol: 'मामले', mChecklist: 'सूची',
    mFloor: 'न्यूनतम-स्तर परीक्षण', mF1: '1. अंतिम स्तर नियमों के न्यूनतम स्तर से कभी नीचे नहीं', mF2: '2. साफ़ न होने या सूची अधूरी होने पर कभी हरा नहीं',
    mNote1: 'न्यूनतम-स्तर परीक्षण सिर्फ़ यह जाँचता है कि कोड सही चल रहा है। यह साबित नहीं करता कि चिकित्सा नियम सही हैं।',
    mNote2: 'ये मामले बनाने वाले ने लिखे हैं, असली विज़िट से इकट्ठा नहीं किए गए, इसलिए अंक असली इस्तेमाल से बेहतर दिखेंगे। तुलना की सूची छपी सूची का एक नमूना है, जिसमें सिर्फ़ अंग्रेज़ी शब्द हैं। चिकित्सा समीक्षा: स्तर एक स्त्री रोग विशेषज्ञ ने देखे हैं; चिकित्सकीय रूप से प्रमाणित नहीं।',
    mode: { 'offline, no AI model': 'ऑफ़लाइन, कोई AI मॉडल नहीं' },
    langName: { en: 'अंग्रेज़ी', hi: 'हिंदी', hinglish: 'हिंग्लिश' },
    demoTag: 'डेमो डेटा', demoTop: 'गढ़े हुए मामले। परिदृश्य चलाते समय जो सहेजा जाए, उस पर डेमो का निशान लगता है।', demoReset: 'इस फ़ोन पर डेमो रीसेट करें',
    flip: 'पलटने के लिए छुएँ', expected: 'अपेक्षित', runIn: 'ऐप में चलाएँ', flipBack: 'वापस पलटें', scen: (n, t) => `परिदृश्य ${n}: ${t}। जवाब देखने के लिए पलटें`,
    rtTitle: 'इसे तोड़कर दिखाइए', rtSub: 'पाँच पेचीदा वाक्य, असली नियमों के सामने सीधे चलाए गए।', rtBusy: 'जाँच रही है...', rtErr: 'सर्वर तक पहुँच नहीं हुई।',
    rtFound: 'मिला', rtNothing: 'कुछ नहीं', rtAbsent: 'मौजूद नहीं', rtOk: 'अपेक्षा के अनुसार', rtExp: (l) => `अपेक्षित ${l}`,
    rtWhy: ['नकार: बुखार छोड़ा गया, दूध न पीना मिला', 'हिंग्लिश नकार: बुखार नहीं मिला, फिर भी हरा नहीं', 'वर्तनी की ग़लतियाँ', 'हिंदी', 'अस्पष्ट: कभी हरा नहीं बनता'],
    sc: [
      { tag: 'ख़तरा', title: 'तेज़ बुखार और दौरा', story: 'छठा दिन। माँ कहती है कि सुबह बच्चे को दौरा पड़ा और शरीर बहुत गर्म है।', how: 'तुरंत लाल। लाल लक्षण के बाद और सवाल नहीं पूछे जाते: ऐप पहले चेतावनी दिखाता है।' },
      { tag: 'ध्यान दें', title: 'बच्चा दूध नहीं पी रहा', story: 'चौथा दिन। कल रात से बच्चा स्तन नहीं पकड़ रहा।', how: 'ऐप जो भी सवाल पूछे, हर बार "नहीं" दबाइए। नतीजा पीला, और रेफ़रल तैयार।' },
      { tag: 'ठीक', title: 'सब ठीक है', story: 'दसवाँ दिन। बच्चा ठीक दिख रहा है और आपने सूची में सब कुछ देख लिया।', how: '"मैंने पूरी सूची देख ली" पर टिक करें और कोई लक्षण न जोड़ें। हरा तभी आता है जब सूची पूरी हुई हो।' },
      { tag: 'पेचीदा', title: 'दूध ठीक पी रहा है, बुखार नहीं', story: 'माँ कहती है "दूध ठीक पी रहा है, बुखार नहीं"। वाक्य में "बुखार" शब्द है, पर बुखार है नहीं।', how: 'बुखार जोड़ा नहीं जाता (नकार पहचाना गया)। लाल नहीं। जब तक आप "मैंने पूरी सूची देख ली" पर टिक न करें, नतीजा अनिश्चित रहता है; अपने आप कभी हरा नहीं।' },
      { tag: 'अस्पष्ट', title: 'बच्चा कुछ ठीक नहीं लग रहा', story: 'माँ बस इतना कहती है कि बच्चा "कुछ ठीक नहीं लग रहा"। कोई साफ़ लक्षण नहीं।', how: 'अनिश्चित। ऐप कोई लक्षण सुझा सकता है; आप उसे मान या हटा सकते हैं। वह इसे हरा नहीं कर सकता।' }
    ],
    famHeader: 'परिवार के रिकॉर्ड', famLabel: 'इस फ़ोन में रखे हैं। कुछ भी अपलोड नहीं होता।',
    famEmpty: 'अभी कोई रिकॉर्ड नहीं', famEmptyHint: 'विज़िट सहेजने के बाद रिकॉर्ड यहाँ दिखेंगे।',
    famExport: 'फ़ाइल निकालें', famImport: 'फ़ाइल जोड़ें', famExportOne: 'परिवार की कॉपी सहेजें', famDelete: 'हटाएँ', famDeleteAsk: 'इस फ़ोन से यह रिकॉर्ड हटाएँ?', famYes: 'हाँ, हटाएँ', famCancel: 'रद्द करें',
    famDemo: 'डेमो', famImported: 'जोड़ा गया', famCode: 'कोड', famSigns: 'लक्षण', famAdvice: 'सलाह', famAge: 'उम्र', famWhen: 'सहेजा',
    famNoSigns: 'कोई नहीं', famDays: (n) => `${n} दिन`,
    famNone: 'निकालने के लिए कुछ नहीं है।', famExported: (n) => `${n} रिकॉर्ड की फ़ाइल सहेजी गई।`,
    famPrivacy: 'फ़ाइल में कोई नाम नहीं है। सिर्फ़ रोगी कोड, लक्षण, स्तर और तारीख़। इसे सँभालकर रखें।',
    famImportOk: (a, d) => `${a} रिकॉर्ड जोड़े गए${d ? `, ${d} पहले से यहाँ थे, छोड़ दिए` : ''}।`,
    famChecksumBad: 'सहेजने के बाद इस फ़ाइल में बदलाव हुआ है। इसे जोड़ा नहीं गया।',
    famErr: { notJson: 'यह सही फ़ाइल नहीं है।', wrongFormat: 'यह Asha Sethu की रिकॉर्ड फ़ाइल नहीं है।', newer: 'यह फ़ाइल ऐप के नए संस्करण से बनी है। पहले ऐप अपडेट करें।', empty: 'फ़ाइल में कोई रिकॉर्ड नहीं है।', tooMany: 'फ़ाइल में बहुत ज़्यादा रिकॉर्ड हैं।', badRecord: (i, why) => `रिकॉर्ड ${i + 1} सही नहीं है (${why})।`, tooBig: 'फ़ाइल बहुत बड़ी है।' },
    famFloorNote: 'मौजूदा नियमों के अनुसार स्तर बढ़ाया गया।',
    famLevelWhy: { sign: 'अज्ञात लक्षण', level: 'अज्ञात स्तर', patient: 'अज्ञात रोगी', answer: 'अज्ञात जवाब', id: 'पहचान नहीं', date: 'ग़लत तारीख़', age: 'ग़लत उम्र', text: 'ग़लत पाठ' },
    famShared: 'साझा किया गया।',
    qrBtn: 'डॉक्टर के लिए टिकट (QR)', qrTitle: 'डॉक्टर के लिए टिकट', qrHint: 'यह डॉक्टर को दिखाइए। किसी भी फ़ोन का कैमरा या QR ऐप इसे पढ़ सकता है। बिना सिग्नल के भी चलता है।', qrClose: 'बंद करें',
    qrLang: 'टिकट अंग्रेज़ी में है।', qrTooLong: 'यह नोट QR के लिए बहुत लंबा है। इसके बजाय साझा करें।'
  }
}

// Server-made step lines are English. Rebuild the known ones in Hindi from the data we already hold.
const NAME_EN2HI = Object.fromEntries(rules.signs.map((s) => [s.name_en, s.name_hi]))
const QTEXT = Object.fromEntries(questions.questions.map((q) => [q.id, q]))
const LV = { en: { RED: 'Red', AMBER: 'Amber', GREEN: 'Green', UNSURE: 'Unsure' }, hi: { RED: 'लाल', AMBER: 'पीला', GREEN: 'हरा', UNSURE: 'अनिश्चित' } }
const ANS = { en: { yes: 'Yes', no: 'No', unsure: 'Not sure' }, hi: { yes: 'हाँ', no: 'नहीं', unsure: 'पता नहीं' } }

// Returns the Hindi text for a trace line, or the original text when it is not a known fixed line.
export function traceText(x, lang) {
  if (lang !== 'hi') return x.text
  const h = X.hi
  const k = x.key || ''
  let m
  if (k === 'escalated') return 'लाल स्तर पर भेजा'
  if (k === 'early') return 'सभी प्रश्नों से पहले परिणाम दिखाया'
  if (k === 'fallback') return h.trFallback
  if (k === 'final') { const lv = Object.keys(X.en.trFinal).find((l) => X.en.trFinal[l] === x.text); return lv ? h.trFinal[lv] : x.text }
  if (k.startsWith('draft:')) {
    const n = k.slice(6)
    if (h.trDraft[n]) return h.trDraft[n]
    if (n === 'schedule_followup') return h.trFollow(x.text.includes('1 day') ? 1 : 2)
    return x.text
  }
  if ((m = k.match(/^blocked:(RED|AMBER|GREEN|UNSURE):(RED|AMBER|GREEN|UNSURE)$/))) return h.trSafety(LV.hi[m[2]], LV.hi[m[1]])
  if ((m = k.match(/^sug:(RED|AMBER|GREEN|UNSURE)$/))) {
    // the reason is free text from the AI model and stays as written
    const reason = x.text.replace(/^Suggested \w+:\s*/, '')
    return `${h.trSuggested(LV.hi[m[1]])}: ${reason}`
  }
  if (k === 'heard') { const n = parseInt((x.text.match(/Heard (\d+)/) || [])[1], 10); return n ? `${n} लक्षण मिले` : x.text }
  if (k.startsWith('a:')) {
    const q = QTEXT[k.slice(2)]
    const a = (x.text.match(/\?\s*(Yes|No|Not sure)$/) || [])[1]
    const key = a === 'Yes' ? 'yes' : a === 'No' ? 'no' : a === 'Not sure' ? 'unsure' : null
    return q && key ? `पूछा: ${q.text_hi} ${ANS.hi[key]}` : x.text
  }
  if (k === 'history') {
    const mm = x.text.match(/^Checked history: (.+) on last visit \((.+)\)$/)
    if (!mm) return x.text
    const names = mm[1].split(', ').map((n) => NAME_EN2HI[n] || n).join(', ')
    const w = mm[2] === 'today' ? h.whenToday : h.whenDay(parseInt(mm[2], 10) || 0)
    return h.trHistory(names, w)
  }
  return x.text
}

export const feedingText = (v, lang) => {
  if (lang !== 'hi') return v
  if (v === X.en.feedNot) return X.hi.feedNot
  if (v === X.en.feedOk) return X.hi.feedOk
  return v
}

export const levelWord = (l, lang) => LV[lang][l] || l
