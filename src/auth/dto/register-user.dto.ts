import { IsNotEmpty, IsString, MinLength, Validate } from "class-validator";
import { PasswordStrengthConstraint } from "../validator/password-strength-constraint.validator";
import { MatchConstraint } from "../validator/match-constraint.validator";
  
export class RegisterUserDto {
    @IsString()
    @MinLength(4)
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @Validate(PasswordStrengthConstraint, ['password'])
    password: string;
      
    @IsString()
    @IsNotEmpty()
    @Validate(MatchConstraint, ['password'])
    passwordConfirmation: string;
}
