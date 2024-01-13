import { DeckDocument } from 'src/deck/deck.schema';
import { AuthGuardRequest } from './auth-guard.request';

export interface OwnDeckOrAdminRequest extends AuthGuardRequest {
  deck: DeckDocument;
}
