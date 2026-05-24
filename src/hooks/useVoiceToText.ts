import { useState, useEffect, useRef } from 'react';

export interface VoiceParsingResult {
  amount: number;
  remarks: string;
}

// Convert common Hindi/English spoken numbers to digits
const SPOKEN_NUMBERS: Record<string, number> = {
  one: 1, ek: 1,
  two: 2, do: 2,
  three: 3, teen: 3,
  four: 4, chaar: 4, char: 4,
  five: 5, paanch: 5, panch: 5,
  six: 6, chhe: 6, che: 6,
  seven: 7, saat: 7,
  eight: 8, aath: 8,
  nine: 9, nau: 9, no: 9,
  ten: 10, das: 10,
  twenty: 20, bees: 20,
  thirty: 30, tees: 30,
  forty: 40, chalis: 40,
  fifty: 50, pachaas: 50, pachas: 50,
  sixty: 60, saath: 60,
  seventy: 70, sattar: 70,
  eighty: 80, assi: 80,
  ninety: 90, nabbe: 90, nabe: 90,
  hundred: 100, sau: 100,
  thousand: 1000, hazaar: 1000, hazar: 1000,
};

export function parseVoiceTranscript(transcript: string): VoiceParsingResult {
  const words = transcript.toLowerCase().replace(/[,₹]/g, '').split(/\s+/);
  let amount = 0;
  let remarksWords: string[] = [];
  
  // Try to find raw digits first (e.g. "500", "1200")
  const digitRegex = /\b\d+\b/;
  const digitMatch = transcript.match(digitRegex);
  
  if (digitMatch) {
    amount = parseInt(digitMatch[0], 10);
    // Filter out the amount digits and currency terms like "rupees", "rupee", "rs", "rupaye", "rupya"
    remarksWords = words.filter(word => {
      return word !== digitMatch[0] && 
             !['rupees', 'rupee', 'rs', 'rupaye', 'rupya', 'spent', 'kharch', 'kiya'].includes(word);
    });
  } else {
    // Try to parse text numbers e.g. "five hundred", "paanch sau"
    let runningSum = 0;
    let currentVal = 0;
    let numberDetected = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (SPOKEN_NUMBERS[word] !== undefined) {
        numberDetected = true;
        const val = SPOKEN_NUMBERS[word];
        if (val === 100 || val === 1000) {
          currentVal = (currentVal || 1) * val;
          runningSum += currentVal;
          currentVal = 0;
        } else {
          currentVal += val;
        }
      } else if (['rupees', 'rupee', 'rs', 'rupaye', 'rupya'].includes(word)) {
        // Just a currency word, skip
      } else {
        remarksWords.push(word);
      }
    }
    runningSum += currentVal;
    if (numberDetected && runningSum > 0) {
      amount = runningSum;
    }
  }

  // Filter out empty spaces and connecting words to clean up remarks
  const cleanedRemarks = remarksWords
    .filter(w => !['spent', 'on', 'for', 'ko', 'diya', 'liye', 'se'].includes(w))
    .join(' ');

  return {
    amount,
    remarks: cleanedRemarks || transcript // fallback to full transcript if no remarks could be extracted
  };
}

interface VoiceToTextOptions {
  continuous?: boolean;
}

export function useVoiceToText(options: VoiceToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = false;
      
      // Setup Indian languages + Hinglish parsing (en-IN captures Indian English and Hindi words effectively)
      recognition.lang = 'en-IN'; 

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const latestResult = event.results[event.results.length - 1];
        const text = latestResult[0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied.');
        } else {
          setError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [options.continuous]);

  const startListening = () => {
    if (!supported || !recognitionRef.current) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    setTranscript('');
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);
      recognitionRef.current.stop();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    error,
    supported,
    startListening,
    stopListening,
    parseVoiceTranscript,
    parseHinglishDate,
    parseHandsFreeCommand
  };
}

export function parseHinglishDate(text: string): string {
  const normalized = text.toLowerCase().trim();
  const today = new Date();
  
  // 1. Check relative dates
  if (normalized.includes('today') || normalized.includes('aaj')) {
    return today.toISOString().split('T')[0];
  }
  if (normalized.includes('yesterday') || normalized.includes('kal')) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // 2. Month-based parsing (e.g., "25 april" or "5 may")
  const months = [
    { names: ['january', 'jan', 'janvari'], index: 0 },
    { names: ['february', 'feb', 'farvari'], index: 1 },
    { names: ['march', 'mar'], index: 2 },
    { names: ['april', 'apr'], index: 3 },
    { names: ['may', 'mei'], index: 4 },
    { names: ['june', 'jun'], index: 5 },
    { names: ['july', 'jul'], index: 6 },
    { names: ['august', 'aug'], index: 7 },
    { names: ['september', 'sep'], index: 8 },
    { names: ['october', 'oct'], index: 9 },
    { names: ['november', 'nov'], index: 10 },
    { names: ['december', 'dec'], index: 11 }
  ];

  const words = normalized.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const monthMatch = months.find(m => m.names.includes(word));
    if (monthMatch) {
      let day = 0;
      
      // Look left (e.g., "25 april")
      if (i > 0) {
        const prevWord = words[i - 1].replace(/(?:st|nd|rd|th)$/, '');
        const val = parseInt(prevWord, 10);
        if (!isNaN(val) && val >= 1 && val <= 31) {
          day = val;
        }
      }
      
      // Look right (e.g., "april 25")
      if (day === 0 && i < words.length - 1) {
        const nextWord = words[i + 1].replace(/(?:st|nd|rd|th)$/, '');
        const val = parseInt(nextWord, 10);
        if (!isNaN(val) && val >= 1 && val <= 31) {
          day = val;
        }
      }

      if (day > 0) {
        const year = today.getFullYear();
        const targetDate = new Date(year, monthMatch.index, day);
        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
  }

  // Fallback to today
  return today.toISOString().split('T')[0];
}

export function parseHandsFreeCommand(transcript: string): { 
  amount: number; 
  remarks: string; 
  date: string; 
  success: boolean;
} {
  const normalized = transcript.toLowerCase().trim();
  
  // Extract amount
  let amount = 0;
  const digitRegex = /\b\d+\b/;
  const digitMatch = normalized.match(digitRegex);
  
  if (digitMatch) {
    amount = parseInt(digitMatch[0], 10);
  } else {
    // Try spoken numbers
    let runningSum = 0;
    let currentVal = 0;
    let numberDetected = false;
    const words = normalized.split(/\s+/);
    
    for (const word of words) {
      if (SPOKEN_NUMBERS[word] !== undefined) {
        numberDetected = true;
        const val = SPOKEN_NUMBERS[word];
        if (val === 100 || val === 1000) {
          currentVal = (currentVal || 1) * val;
          runningSum += currentVal;
          currentVal = 0;
        } else {
          currentVal += val;
        }
      }
    }
    runningSum += currentVal;
    if (numberDetected && runningSum > 0) {
      amount = runningSum;
    }
  }

  if (amount <= 0) {
    return { amount: 0, remarks: '', date: '', success: false };
  }

  // Parse Date
  const date = parseHinglishDate(normalized);

  // Extract Remarks
  const words = normalized.split(/\s+/);
  const ignoreTerms = [
    String(amount), 
    // Currency indicators
    'rupees', 'rupee', 'rs', 'rupaye', 'rupya', 'rupiya', 'rupiah', 'rs.', 'rupess',
    // Command action indicators
    'add', 'kro', 'karo', 'karein', 'karen', 'kar', 'kr', 'dalo', 'daalo', 'kardo', 'kar-do', 'spent', 'kharch', 'kharcha', 'kiya',
    // Connective words / Prepositions (Hinglish + English)
    'me', 'mein', 'main', 'men', 'mai', 'ko', 'par', 'per', 'in', 'to', 'for', 'on', 'se', 'ke', 'ki', 'liye', 'le', 'lia', 'liya', 'diya', 'de',
    // Relative dates
    'aaj', 'today', 'yesterday', 'kal',
    // English Month names
    'january', 'jan', 'february', 'feb', 'march', 'mar', 'april', 'apr', 'may', 'june', 'jun', 
    'july', 'jul', 'august', 'aug', 'september', 'sep', 'october', 'oct', 'november', 'nov', 'december', 'dec'
  ];
  
  const cleanWords = words.filter(word => {
    const cleanWord = word.replace(/(?:st|nd|rd|th)$/, '');
    return !ignoreTerms.includes(word) && !ignoreTerms.includes(cleanWord);
  });

  const remarks = cleanWords.join(' ').trim();

  return {
    amount,
    remarks: remarks || 'Expense Log',
    date,
    success: amount > 0 && remarks.length > 0
  };
}
