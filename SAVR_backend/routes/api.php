<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DonationController;

// ── Auth (public) ────────────────────────────────────────────────────────────
Route::post('/register/donor',           [AuthController::class, 'registerDonor']);
Route::post('/register/organization',    [AuthController::class, 'registerOrganization']);
Route::post('/register/partner-kitchen', [AuthController::class, 'registerPartnerKitchen']);
Route::post('/login',                    [AuthController::class, 'login']);
Route::post('/verify/send',              [AuthController::class, 'sendVerificationEmail']);
Route::post('/verify/code',              [AuthController::class, 'verifyCode']);
Route::post('/verify/resend',            [AuthController::class, 'resendCode']);
Route::post('/password/forgot',          [AuthController::class, 'forgotPassword']);
Route::post('/password/verify-code',     [AuthController::class, 'verifyResetCode']);
Route::post('/password/reset',           [AuthController::class, 'resetPassword']);

// ── PayMongo Webhook (public — signed by PayMongo) ────────────────────────────
Route::post('/webhook/paymongo', [DonationController::class, 'paymongoWebhook']);

// ── PayMongo Redirects (Web Browser Fallbacks) ──────────────────────────────────
Route::get('/payment/success', function(\Illuminate\Http\Request $request) {
    // Development Local bypass for Webhooks. If they hit success, we fulfill the payment dynamically!
    if ($request->has('donation_id')) {
        $donation = \App\Models\FinancialDonation::find($request->donation_id);
        if ($donation && $donation->status !== 'paid') {
            $donation->status = 'paid';
            $donation->save();

            \App\Models\ActivityLog::create([
                'user_id'     => $donation->user_id,
                'type'        => 'financial',
                'title'       => 'Financial Donation Paid',
                'description' => '₱' . number_format($donation->amount, 2) . ' payment confirmed',
                'icon'        => 'financialiconyellow'
            ]);

            app(\App\Http\Controllers\Api\DonationController::class)
                ->recalculateBadges($donation->user_id);
        }
    }
    return response("<html><body style='background:#1E583A;color:white;text-align:center;font-family:sans-serif;padding-top:100px;'><h1>Payment Successful! 🎉</h1><p>Thank you for donating to SAVR FoodBank.</p><p><strong>You may now close this browser window and return to the app.</strong></p></body></html>");
});
Route::get('/payment/cancel', function() {
    return response("<html><body style='background:#f8f9fa;color:#333;text-align:center;font-family:sans-serif;padding-top:100px;'><h1>Payment Cancelled</h1><p><strong>You may close this browser window and return to the app.</strong></p></body></html>");
});

// ── Protected ────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile',   [AuthController::class, 'profile']);
    Route::put('/profile',   [DonationController::class, 'updateProfile']);
    Route::post('/profile/deactivate', [DonationController::class, 'deactivateAccount']);
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::get('/dashboard', [AuthController::class, 'dashboard']);

    // Donations
    Route::post('/donation/paymongo',   [DonationController::class, 'createPaymongoCheckout']);
    Route::get('/donation/status/{id}', [DonationController::class, 'checkPaymentStatus']);
    Route::post('/donation/food',       [DonationController::class, 'submitFood']);
    Route::post('/donation/schedule',   [DonationController::class, 'submitSchedule']);
    Route::post('/donation/service',    [DonationController::class, 'submitService']);
    Route::get('/donation/stats',       [DonationController::class, 'getDonationStats']);
    Route::get('/donation/upcoming',    [DonationController::class, 'getUpcomingPickups']);

    // Badges & Activities
    Route::get('/badges',     [DonationController::class, 'getBadges']);
    Route::get('/activities', [DonationController::class, 'getActivities']);
});