import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { Language } from "src/deck/languages.enum";

@Injectable()
export class TranslatorService {
    private libreTranslateUrl: string;

    constructor(
        private readonly httpService: HttpService,
        configService: ConfigService
    ) {
        this.libreTranslateUrl = configService.get('LIBRE_TRANSLATE_URL');
    }

    async translate(word: string, fromLang: Language, toLang: Language) {
        return await lastValueFrom(this.httpService.post(`${ this.libreTranslateUrl }/translate`, `q=${ word }&source=${ fromLang }&target=${ toLang }`));
    }
}