<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Mail\ForgotPasswordMail;
use App\Models\Donation;
use App\Models\DonorProfile;
use App\Models\EmailVerification;
use App\Models\OrganizationProfile;
use App\Models\PartnerKitchenProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;

class AuthController extends Controller
{
    // ─── Helpers ────────────────────────────────────────────────────────────

    private function normalizeNullableFields(Request $request, array $fields): void
    {
        foreach ($fields as $field) {
            if ($request->has($field) && trim((string) $request->$field) === '') {
                $request->merge([$field => null]);
            }
        }
    }

    private function normalizeEmail(Request $request): void
    {
        if ($request->has('email')) {
            $request->merge([
                'email' => strtolower(trim($request->email))
            ]);
        }
    }

    private function getDisplayName(User $user): string
    {
        switch ($user->role) {
            case 'donor':
                $profile = DonorProfile::where('user_id', $user->id)->first();
                if ($profile) return $profile->first_name . ' ' . $profile->last_name;
                break;
            case 'organization':
                $profile = OrganizationProfile::where('user_id', $user->id)->first();
                if ($profile) return $profile->organization_name;
                break;
            case 'partner_kitchen':
                $profile = PartnerKitchenProfile::where('user_id', $user->id)->first();
                if ($profile) return $profile->kitchen_name;
                break;
        }
        return $user->email;
    }

    private function sendVerificationCode(string $email, string $name = 'User'): void
    {
        EmailVerification::where('email', $email)->delete();
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        EmailVerification::create([
            'email'      => $email,
            'code'       => $code,
            'expires_at' => now()->addMinutes(10),
            'used'       => false,
        ]);
        Mail::to($email)->send(new VerificationCodeMail($code, $name));
    }

    private function sendPasswordResetCode(string $email, string $name = 'User'): void
    {
        EmailVerification::where('email', $email)->delete();
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        EmailVerification::create([
            'email'      => $email,
            'code'       => $code,
            'expires_at' => now()->addMinutes(10),
            'used'       => false,
        ]);
        Mail::to($email)->send(new ForgotPasswordMail($code, $name));
    }

    // ─── Verify Email Code ──────────────────────────────────────────────────

    public function sendVerificationEmail(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address.',
                'errors'  => $validator->errors()
            ], 422);
        }

        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This email is already registered.'
            ], 409);
        }

        try {
            $this->sendVerificationCode($request->email);
            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to ' . $request->email
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function verifyCode(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $verification = EmailVerification::where('email', $request->email)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'No verification code found. Please request a new one.'
            ], 404);
        }

        if ($verification->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.'
            ], 410);
        }

        if ($verification->code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code. Please try again.'
            ], 422);
        }

        $verification->update(['used' => true]);

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->update(['is_verified' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully.'
        ], 200);
    }

    public function resendCode(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'name'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $this->sendVerificationCode($request->email, $request->name ?? 'User');
            return response()->json([
                'success' => true,
                'message' => 'New verification code sent.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend code. Please try again.'
            ], 500);
        }
    }

    // ─── Forgot Password ────────────────────────────────────────────────────

    public function forgotPassword(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => true,
                'message' => 'If this email is registered, a reset code has been sent.'
            ], 200);
        }

        try {
            $name = $this->getDisplayName($user);
            $this->sendPasswordResetCode($request->email, $name);
            return response()->json([
                'success' => true,
                'message' => 'Password reset code sent to ' . $request->email
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset email. Please try again.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function verifyResetCode(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $verification = EmailVerification::where('email', $request->email)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'No reset code found. Please request a new one.'
            ], 404);
        }

        if ($verification->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Reset code has expired. Please request a new one.'
            ], 410);
        }

        if ($verification->code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset code. Please try again.'
            ], 422);
        }

        $verification->update(['used' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Code verified. You may now reset your password.'
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email'    => 'required|email|exists:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            ],
        ], [
            'email.exists'       => 'No account found with this email.',
            'password.min'       => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Passwords do not match.',
            'password.regex'     => 'Password must contain uppercase, lowercase, a number, and a special character.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $wasVerified = EmailVerification::where('email', $request->email)
            ->where('used', true)
            ->exists();

        if (!$wasVerified) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your reset code first.'
            ], 403);
        }

        try {
            $user = User::where('email', $request->email)->first();
            $user->update(['password' => Hash::make($request->password)]);
            EmailVerification::where('email', $request->email)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. Please log in.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // ─── Registration ───────────────────────────────────────────────────────

    public function registerDonor(Request $request)
    {
        $this->normalizeNullableFields($request, ['middle_initial', 'suffix']);
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'middle_initial'    => 'nullable|string|max:10',
            'suffix'            => 'nullable|string|max:20',
            // Strictly before today — today's date is NOT a valid birth date
            'date_of_birth'     => 'required|date|before:today',
            'gender'            => 'required|string|in:Male,Female,Other',
            // Numbers only
            'house_no'          => ['required', 'regex:/^[0-9]+$/'],
            'street'            => 'required|string|max:100',
            'barangay'          => 'required|string|max:100',
            'city_municipality' => 'required|string|max:100',
            'province_region'   => 'required|string|max:100',
            'postal_zip_code'   => 'required|string|max:20',
            'email'             => 'required|email|max:255|unique:users,email',
            // Exactly 11 digits, numbers only
            'contact_number'    => ['required', 'regex:/^[0-9]{11}$/'],
            // Uppercase + lowercase + digit + special char (including _)
            'password'          => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            ],
        ], [
            'first_name.required'     => 'First name is required.',
            'last_name.required'      => 'Last name is required.',
            'date_of_birth.required'  => 'Date of birth is required.',
            'date_of_birth.before'    => 'Date of birth must be strictly before today.',
            'gender.in'               => 'Gender must be Male, Female, or Other.',
            'house_no.required'       => 'House number is required.',
            'house_no.regex'          => 'House number must contain numbers only.',
            'email.unique'            => 'This email is already registered.',
            'contact_number.required' => 'Contact number is required.',
            'contact_number.regex'    => 'Contact number must be exactly 11 digits (numbers only).',
            'password.min'            => 'Password must be at least 8 characters.',
            'password.confirmed'      => 'Passwords do not match.',
            'password.regex'          => 'Password must contain uppercase, lowercase, a number, and a special character (e.g. @, #, _, !).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $verified = EmailVerification::where('email', $request->email)
            ->where('used', true)
            ->exists();

        if (!$verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email not verified. Please verify your email first.'
            ], 403);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'role'        => 'donor',
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'is_verified' => true,
            ]);

            DonorProfile::create([
                'user_id'           => $user->id,
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'middle_initial'    => $request->middle_initial,
                'suffix'            => $request->suffix,
                'date_of_birth'     => $request->date_of_birth,
                'gender'            => $request->gender,
                'house_no'          => $request->house_no,
                'street'            => $request->street,
                'barangay'          => $request->barangay,
                'city_municipality' => $request->city_municipality,
                'province_region'   => $request->province_region,
                'postal_zip_code'   => $request->postal_zip_code,
                'contact_number'    => $request->contact_number,
            ]);

            $token = $user->createToken('savr_mobile_token')->plainTextToken;
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Donor registered successfully.',
                'token'   => $token,
                'user'    => [
                    'id'           => $user->id,
                    'email'        => $user->email,
                    'role'         => $user->role,
                    'is_verified'  => $user->is_verified,
                    'display_name' => $request->first_name . ' ' . $request->last_name,
                ]
            ], 201);

        } catch (QueryException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Database error during registration.',
                'error'   => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function registerOrganization(Request $request)
    {
        $this->normalizeNullableFields($request, ['website_url']);
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'organization_name' => 'required|string|max:150',
            'website_url'       => 'nullable|url|max:255',
            'industry_sector'   => 'required|string|max:100',
            'organization_type' => 'required|string|max:100',
            'contact_person'    => 'required|string|max:100',
            'position_role'     => 'required|string|max:100',
            'email'             => 'required|email|max:255|unique:users,email',
            // Exactly 11 digits, numbers only
            'contact_number'    => ['required', 'regex:/^[0-9]{11}$/'],
            // Uppercase + lowercase + digit + special char (including _)
            'password'          => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            ],
        ], [
            'organization_name.required' => 'Organization name is required.',
            'industry_sector.required'   => 'Industry/sector is required.',
            'organization_type.required' => 'Organization type is required.',
            'contact_person.required'    => 'Contact person is required.',
            'position_role.required'     => 'Position/role is required.',
            'email.unique'               => 'This email is already registered.',
            'contact_number.required'    => 'Contact number is required.',
            'contact_number.regex'       => 'Contact number must be exactly 11 digits (numbers only).',
            'password.min'               => 'Password must be at least 8 characters.',
            'password.confirmed'         => 'Passwords do not match.',
            'password.regex'             => 'Password must contain uppercase, lowercase, a number, and a special character (e.g. @, #, _, !).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $verified = EmailVerification::where('email', $request->email)
            ->where('used', true)
            ->exists();

        if (!$verified) {
            return response()->json([
                'success' => false,
                'message' => 'Email not verified. Please verify your email first.'
            ], 403);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'role'        => 'organization',
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'is_verified' => true,
            ]);

            OrganizationProfile::create([
                'user_id'           => $user->id,
                'organization_name' => $request->organization_name,
                'website_url'       => $request->website_url,
                'industry_sector'   => $request->industry_sector,
                'organization_type' => $request->organization_type,
                'contact_person'    => $request->contact_person,
                'position_role'     => $request->position_role,
                'contact_number'    => $request->contact_number,
            ]);

            $token = $user->createToken('savr_mobile_token')->plainTextToken;
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Organization registered successfully.',
                'token'   => $token,
                'user'    => [
                    'id'           => $user->id,
                    'email'        => $user->email,
                    'role'         => $user->role,
                    'is_verified'  => $user->is_verified,
                    'display_name' => $request->organization_name,
                ]
            ], 201);

        } catch (QueryException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Database error during registration.',
                'error'   => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function registerPartnerKitchen(Request $request)
    {
        $this->normalizeNullableFields($request, ['website_url']);
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'kitchen_name'   => 'required|string|max:150',
            'website_url'    => 'nullable|url|max:255',
            'contact_person' => 'required|string|max:100',
            'position_role'  => 'required|string|max:100',
            'email'          => 'required|email|max:255|unique:users,email',
            'contact_number' => ['required', 'regex:/^[0-9]{11}$/'],
            'password'       => [
                'required', 'string', 'min:8', 'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            ],
        ], [
            'contact_number.regex' => 'Contact number must be exactly 11 digits (numbers only).',
            'password.regex'       => 'Password must contain uppercase, lowercase, a number, and a special character.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'role'        => 'partner_kitchen',
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'is_verified' => false,
            ]);

            PartnerKitchenProfile::create([
                'user_id'        => $user->id,
                'kitchen_name'   => $request->kitchen_name,
                'website_url'    => $request->website_url,
                'contact_person' => $request->contact_person,
                'position_role'  => $request->position_role,
                'contact_number' => $request->contact_number,
            ]);

            $token = $user->createToken('savr_mobile_token')->plainTextToken;
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Partner Kitchen registered successfully.',
                'token'   => $token,
                'user'    => [
                    'id'           => $user->id,
                    'email'        => $user->email,
                    'role'         => $user->role,
                    'is_verified'  => $user->is_verified,
                    'display_name' => $request->kitchen_name,
                ]
            ], 201);

        } catch (QueryException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Database error.', 'error' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Registration failed.', 'error' => $e->getMessage()], 500);
        }
    }

    // ─── Login ──────────────────────────────────────────────────────────────

    public function login(Request $request)
    {
        $this->normalizeEmail($request);

        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string|min:8'
        ], [
            'email.required'    => 'Email is required.',
            'email.email'       => 'Please enter a valid email address.',
            'password.required' => 'Password is required.',
            'password.min'      => 'Password must be at least 8 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $displayName = $this->getDisplayName($user);
        $token = $user->createToken('savr_mobile_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => [
                'id'           => $user->id,
                'email'        => $user->email,
                'role'         => $user->role,
                'is_verified'  => $user->is_verified,
                'display_name' => $displayName,
            ]
        ], 200);
    }

// ─── Dashboard ──────────────────────────────────────────────────────────────
// FIXED: Was using old `Donation` model. Now uses FinancialDonation + ActivityLog.
public function dashboard(Request $request)
{
    $user        = $request->user();
    $displayName = $this->getDisplayName($user);
    // ✅ Use separate financial_donations table (not old donations table)
    $totalFinancial = \App\Models\FinancialDonation::where('user_id', $user->id)
        ->where('status', 'paid')
        ->sum('amount');
    $totalFood = \App\Models\FoodDonation::where('user_id', $user->id)->count();

    // ✅ Use activity_logs table (written by DonationController on each submission)
    $recentActivities = \App\Models\ActivityLog::where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get()
        ->map(function ($a) {
            return [
                'id'          => $a->id,
                'type'        => $a->type,
                'title'       => $a->title,
                'description' => $a->description,
                'icon'        => $a->icon,
                'time_ago'    => $a->created_at->diffForHumans(),
            ];
        });
    return response()->json([
        'success'           => true,
        'display_name'      => $displayName,
        'role'              => $user->role,
        'total_donations'   => (float) $totalFinancial,
        'total_food'        => $totalFood,
        'recent_activities' => $recentActivities,
    ], 200);
}

    // ─── Profile ────────────────────────────────────────────────────────────────

    public function profile(Request $request)
    {
        $user        = $request->user();
        $displayName = $this->getDisplayName($user);
        $userData = [
            'id'          => $user->id,
            'email'       => $user->email,
            'role'        => $user->role,
            'is_verified' => $user->is_verified,
        ];
        if ($user->role === 'donor') {
            $profile = DonorProfile::where('user_id', $user->id)->first();
            if ($profile) {
                $userData = array_merge($userData, [
                    'first_name'        => $profile->first_name,
                    'last_name'         => $profile->last_name,
                    'middle_initial'    => $profile->middle_initial,
                    'suffix'            => $profile->suffix,
                    'date_of_birth'     => $profile->date_of_birth,
                    'gender'            => $profile->gender,
                    'house_no'          => $profile->house_no,
                    'street'            => $profile->street,
                    'barangay'          => $profile->barangay,
                    'city_municipality' => $profile->city_municipality,
                    'province_region'   => $profile->province_region,
                    'postal_zip_code'   => $profile->postal_zip_code,
                    'contact_number'    => $profile->contact_number,
                ]);
            }
        } elseif ($user->role === 'organization') {
            $profile = OrganizationProfile::where('user_id', $user->id)->first();
            if ($profile) {
                $userData = array_merge($userData, [
                    'organization_name' => $profile->organization_name,
                    'website_url'       => $profile->website_url,
                    'industry_sector'   => $profile->industry_sector,
                    'organization_type' => $profile->organization_type,
                    'contact_person'    => $profile->contact_person,
                    'position_role'     => $profile->position_role,
                    'contact_number'    => $profile->contact_number,
                ]);
            }
        } elseif ($user->role === 'partner_kitchen') {
            $profile = PartnerKitchenProfile::where('user_id', $user->id)->first();
            if ($profile) {
                $userData = array_merge($userData, [
                    'kitchen_name'   => $profile->kitchen_name,
                    'website_url'    => $profile->website_url,
                    'contact_person' => $profile->contact_person,
                    'position_role'  => $profile->position_role,
                    'contact_number' => $profile->contact_number,
                ]);
            }
        }
        return response()->json([
            'success'      => true,
            'display_name' => $displayName,
            'user'         => $userData,
        ], 200);
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }
}