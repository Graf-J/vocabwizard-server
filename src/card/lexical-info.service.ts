import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { catchError, lastValueFrom, map } from "rxjs";
import ApiDictionaryResponse from "./response/api-dictionary-response";
import ApiResponse from "./response/api-response";

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
        // return await lastValueFrom(this.httpService.get<ApiDictionaryResponse>(`${ this.dictionaryApiUrl }/api/v2/entries/en/${ word }`));
        const url = `${ this.dictionaryApiUrl }/api/v2/entries/en/${ word }`;
        const response = await lastValueFrom(this.httpService.get<ApiDictionaryResponse[]>(url)
            .pipe(
                map(res => new ApiResponse<ApiDictionaryResponse[]>(false, res.data)),
                catchError(error => {
                    Logger.error(`External Request to ${ url } failed`, error);
                    return [new ApiResponse<ApiDictionaryResponse[]>(true)];
                })
            ));

        return response;
    }
}