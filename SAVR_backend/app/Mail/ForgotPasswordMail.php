<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public string $userName;

    public function __construct(string $code, string $userName = 'User')
    {
        $this->code     = $code;
        $this->userName = $userName;
    }

    public function build(): self
    {
        return $this->from(config('mail.from.address') ?? 'khristianjosedp@gmail.com', 'SAVR FoodBank')
            ->subject('SAVR — Password Reset Code')
            ->html($this->buildHtml());
    }

    private function buildHtml(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <body style="font-family: \'Helvetica Neue\', Arial, sans-serif; background: #F3EFE6; padding: 40px 20px; margin: 0;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-top: 6px solid #D4AA3A;">
                
                <h1 style="color: #226E45; margin-bottom: 5px; font-weight: 900; font-size: 28px; letter-spacing: -0.5px;">SAVR</h1>
                <p style="color: #D4AA3A; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; margin-top: 0; margin-bottom: 30px;">FoodBank Platform</p>
                
                <h2 style="color: #333; font-size: 22px; margin-bottom: 10px;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                    Hello <strong>' . htmlspecialchars($this->userName) . '</strong>,<br><br>
                    We received a request to reset the password associated with your SAVR account. Please use the secure code below to proceed.
                </p>
                
                <div style="background: #F9FBF9; border: 2px solid #D4AA3A; color: #226E45; font-size: 40px; font-weight: 800; letter-spacing: 16px; padding: 24px 10px 24px 26px; border-radius: 16px; display: inline-block; margin-bottom: 30px;">
                    ' . $this->code . '
                </div>
                
                <p style="color: #888; font-size: 14px; margin-bottom: 0;">
                    This reset code will securely expire in <strong>10 minutes</strong>.
                </p>
                <p style="color: #bbb; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                    If you did not request a password reset, you can safely ignore this email. Your password will not be changed.
                </p>
            </div>
        </body>
        </html>';
    }
}