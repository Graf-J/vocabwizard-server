import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";

@Injectable()
export class LexicalInfoService {
    private dictionaryApiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        configService: ConfigService    
    ) {
        this.dictionaryApiUrl = configService.get('DICTIONARY_API_URL');
    }

    async getInfo(word: string) {
        return await lastValueFrom(this.httpService.get(`${ this.dictionaryApiUrl }/api/v2/entries/en/${ word }`))
    }
}