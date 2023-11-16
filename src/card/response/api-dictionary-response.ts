interface License {
    name: string;
    url: string;
}

interface Phonetic {
    audio: string;
    text: string;
    sourceUrl: string;
    license: License;
}

interface Definition {
    definition: string;
    synonyms: string[];
    antonyms: string[];
    example?: string;
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
    synonyms: string[];
    antonyms: string[];
}

export default interface ApiDictionaryResponse {
    word: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    license: License;
    sourceUrls: string[];
}