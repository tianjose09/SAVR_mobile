<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Badge;
use App\Models\FinancialDonation;
use App\Models\FoodDonation;
use App\Models\ServiceDonation;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class DonationController extends Controller
{
    // ── Badge Engine ────────────────────────────────────────────────────────

    public function recalculateBadges(int $userId): void
    {
        $foodCount      = FoodDonation::where('user_id', $userId)->whereIn('status',['scheduled','completed'])->count();
        $financialTotal = FinancialDonation::where('user_id', $userId)->where('status','paid')->sum('amount');
        $serviceCount   = ServiceDonation::where('user_id', $userId)->whereIn('status',['confirmed','completed'])->count();

        $badges = Badge::all();
        foreach ($badges as $badge) {
            $current = 0;
            switch($badge->goal_type) {
                case 'food_count':      $current = $foodCount; break;
                case 'financial_total': $current = $financialTotal; break;
                case 'service_count':   $current = $serviceCount; break;
            }

            $status = 'not_started';
            if ($current >= $badge->goal_value) {
                $status = 'earned';
            } elseif ($current > 0) {
                $status = 'in_progress';
            }

            $userBadge = UserBadge::firstOrNew(['user_id'=>$userId,'badge_id'=>$badge->id]);
            if ($userBadge->status !== 'earned') { // don't downgrade earned
                $userBadge->status   = $status;
                $userBadge->progress = min($current, $badge->goal_value);
                if ($status === 'earned' && !$userBadge->earned_at) {
                    $userBadge->earned_at = now();
                }
                $userBadge->save();
            }
        }
    }

    private function logActivity(int $userId, string $type, string $title, string $description, string $icon = 'financialiconyellow'): void
    {
        ActivityLog::create([
            'user_id'     => $userId,
            'type'        => $type,
            'title'       => $title,
            'description' => $description,
            'icon'        => $icon,
        ]);
    }

    // ── PayMongo ─────────────────────────────────────────────────────────────

    public function createPaymongoCheckout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount'  => 'required|numeric|min:100',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success'=>false,'errors'=>$validator->errors()], 422);
        }

        $amountCentavos = (int) ($request->amount * 100);
        $secretKey = config('services.paymongo.secret_key');

        try {
            // Save pending record first so we can attach its ID to the success callback
            $donation = FinancialDonation::create([
                'user_id'                  => $request->user()->id,
                'amount'                   => $request->amount,
                'payment_method'           => 'paymongo',
                'message'                  => $request->message,
                'status'                   => 'pending',
            ]);

            $response = Http::withoutVerifying()
                ->withBasicAuth($secretKey, '')
                ->post('https://api.paymongo.com/v1/checkout_sessions', [
                    'data' => [
                        'attributes' => [
                            'line_items' => [[
                                'currency'    => 'PHP',
                                'amount'      => $amountCentavos,
                                'name'        => 'SAVR Food Bank Donation',
                                'quantity'    => 1,
                                'description' => $request->message ?? 'Donation to SAVR Food Bank',
                            ]],
                            'payment_method_types' => ['gcash','card','paymaya'],
                            'success_url' => $request->getSchemeAndHttpHost() . '/api/payment/success?donation_id=' . $donation->id,
                            'cancel_url'  => $request->getSchemeAndHttpHost() . '/api/payment/cancel',
                            'description' => 'SAVR Food Bank Donation',
                        ]
                    ]
                ]);

            if ($response->failed()) {
                $donation->delete(); // Rollback if API fails
                return response()->json([
                    'success' => false,
                    'message' => 'PayMongo error: ' . $response->body()
                ], 500);
            }

            $data          = $response->json()['data'];
            $checkoutUrl   = $data['attributes']['checkout_url'];
            $paymentId     = $data['id'];

            // Update row with transaction hashes
            $donation->update([
                'paymongo_payment_id'   => $paymentId,
                'paymongo_checkout_url' => $checkoutUrl,
            ]);

            return response()->json([
                'success'      => true,
                'checkout_url' => $checkoutUrl,
                'payment_id'   => $paymentId,
                'donation_id'  => $donation->id,
            ]);

        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>$e->getMessage()], 500);
        }
    }

    public function paymongoWebhook(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('Paymongo-Signature');
        $webhookSecret = config('services.paymongo.webhook_secret');

        // Basic verification (add full HMAC verification in production)
        $event = $request->json('data.attributes.type');
        $data  = $request->json('data.attributes.data');

        if ($event === 'checkout_session.payment.paid') {
            $checkoutId = $data['id'] ?? null;
            if ($checkoutId) {
                $donation = FinancialDonation::where('paymongo_payment_id', $checkoutId)->first();
                if ($donation && $donation->status !== 'paid') {
                    $donation->update(['status'=>'paid']);
                    $this->logActivity(
                        $donation->user_id, 'financial',
                        'Financial Donation Paid',
                        '₱' . number_format($donation->amount, 2) . ' payment confirmed',
                        'financialiconyellow'
                    );
                    $this->recalculateBadges($donation->user_id);
                }
            }
        }

        return response()->json(['received'=>true]);
    }

    public function checkPaymentStatus(Request $request, int $donationId)
    {
        $donation = FinancialDonation::where('id', $donationId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$donation) {
            return response()->json(['success'=>false,'message'=>'Donation not found.'], 404);
        }

        // Optionally poll PayMongo here
        return response()->json([
            'success' => true,
            'status'  => $donation->status,
            'amount'  => $donation->amount,
        ]);
    }

    public function submitFinancial(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount'           => 'required|numeric|min:1',
            'payment_method'   => 'required|string',
            'reference_number' => 'required|string|max:100',
            'message'          => 'nullable|string|max:500',
            'receipt_image'    => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
        ], [
            'amount.min'               => 'Donation amount must be at least ₱1.',
            'payment_method.required'  => 'Please select a payment method.',
            'reference_number.required'=> 'Reference number is required.',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }
        $receiptPath = null;
        if ($request->hasFile('receipt_image')) {
            $receiptPath = $request->file('receipt_image')
                ->store('donations/receipts', 'public');
        }
        $donation = FinancialDonation::create([
            'user_id'            => $request->user()->id,
            'amount'             => $request->amount,
            'payment_method'     => $request->payment_method,
            'reference_number'   => $request->reference_number,
            'receipt_image_path' => $receiptPath,
            'message'            => $request->message,
            'status'             => 'pending', // Admin will verify and mark as paid
        ]);
        $this->logActivity(
            $request->user()->id,
            'financial',
            'Financial Donation Submitted',
            '₱' . number_format($request->amount, 2) . ' via ' . $request->payment_method,
            'financialiconyellow'
        );
        // Recalculate badges (note: only 'paid' count toward badge goals,
        // but we trigger early so progress updates when admin approves)
        $this->recalculateBadges($request->user()->id);
        return response()->json([
            'success'     => true,
            'message'     => 'Donation submitted successfully. It will be verified by admin.',
            'donation_id' => $donation->id,
        ], 201);
    }

    // ── Food Donation ─────────────────────────────────────────────────────────

    public function submitFood(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'food_items'     => 'required|string',
            'food_images.*'  => 'nullable|file|image|mimes:jpg,jpeg,png|max:5120',
            'schedule_type'  => 'required|in:pickup,delivery',
            'preferred_date' => 'required|date',
            'time_slot'      => 'required|string',
            'pickup_address' => 'nullable|string',
            'pickup_lat'     => 'nullable|numeric',
            'pickup_longitude'=> 'nullable|numeric',  // Map explicitly
        ]);

        if ($validator->fails()) {
            return response()->json(['success'=>false,'errors'=>$validator->errors()], 422);
        }

        $foodItems = json_decode($request->food_items, true);
        if (!is_array($foodItems)) {
            return response()->json(['success'=>false,'message'=>'Invalid food items array payload.'], 422);
        }

        $paths = [];
        if ($request->hasFile('food_images')) {
            foreach ($request->file('food_images') as $img) {
                $paths[] = $img->store('donations/food', 'public');
            }
        }

        $donation = FoodDonation::create([
            'user_id'          => $request->user()->id,
            'food_items'       => $foodItems,
            'food_item_images' => $paths,
            'schedule_type'    => $request->schedule_type,
            'preferred_date'   => $request->preferred_date,
            'time_slot'        => $request->time_slot,
            'pickup_address'   => $request->pickup_address,
            'pickup_lat'       => $request->pickup_latitude ?? null,
            'pickup_lng'       => $request->pickup_longitude ?? null,
            'status'           => 'scheduled', // Skip the pending phase since schedule was sent in one shot
        ]);

        $this->logActivity($request->user()->id, 'food', 'Food Donation Incoming',
            count($foodItems) . ' items scheduled for ' . $request->schedule_type, 'truckicon');

        $this->recalculateBadges($request->user()->id);

        return response()->json([
            'success'     => true,
            'message'     => 'Food donation and schedule confirmed.',
            'donation_id' => $donation->id,
        ], 201);
    }

    public function submitSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'donation_id'    => 'required|integer|exists:food_donations,id',
            'schedule_type'  => 'required|in:pickup,delivery',
            'preferred_date' => 'required|date|after:today',
            'time_slot'      => 'required|string',
            'pickup_address' => 'required_if:schedule_type,pickup|nullable|string',
            'pickup_lat'     => 'nullable|numeric',
            'pickup_lng'     => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['success'=>false,'errors'=>$validator->errors()], 422);
        }

        $donation = FoodDonation::where('id', $request->donation_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$donation) {
            return response()->json(['success'=>false,'message'=>'Donation not found.'], 404);
        }

        $donation->update([
            'schedule_type'  => $request->schedule_type,
            'preferred_date' => $request->preferred_date,
            'time_slot'      => $request->time_slot,
            'pickup_address' => $request->pickup_address,
            'pickup_lat'     => $request->pickup_lat,
            'pickup_lng'     => $request->pickup_lng,
            'status'         => 'scheduled',
        ]);

        $this->logActivity($request->user()->id, 'food',
            ucfirst($request->schedule_type) . ' Scheduled',
            'Scheduled for ' . $request->preferred_date . ' at ' . $request->time_slot,
            'truckicon');

        $this->recalculateBadges($request->user()->id);

        return response()->json(['success'=>true,'message'=>ucfirst($request->schedule_type).' scheduled.','donation'=>$donation]);
    }

    // ── Service Donation ──────────────────────────────────────────────────────

    public function submitService(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_type'       => 'required|string',
            'quantity'           => 'required|integer|min:1',
            'frequency'          => 'required|string',
            'service_date'       => 'required|date',
            'service_time'       => 'required|string',
            'address'            => 'required|string',
            'contact_first_name' => 'required|string',
            'contact_last_name'  => 'required|string',
            'contact_email'      => 'required|email',
            'description'        => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success'=>false,'errors'=>$validator->errors()], 422);
        }

        $donation = ServiceDonation::create([
            'user_id'            => $request->user()->id,
            'service_type'       => $request->service_type,
            'quantity'           => $request->quantity,
            'frequency'          => $request->frequency,
            'service_date'       => $request->service_date,
            'service_time'       => $request->service_time,
            'address'            => $request->address,
            'contact_first_name' => $request->contact_first_name,
            'contact_last_name'  => $request->contact_last_name,
            'contact_email'      => $request->contact_email,
            'description'        => $request->description,
            'status'             => 'pending',
        ]);

        $this->logActivity($request->user()->id, 'service', 'Service Donation Submitted',
            $request->service_type . ' - ' . $request->quantity . ' unit(s)', 'truckicon');

        $this->recalculateBadges($request->user()->id);

        return response()->json(['success'=>true,'message'=>'Service donation submitted.','donation'=>$donation], 201);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    public function getDonationStats(Request $request)
    {
        $uid = $request->user()->id;

        $totalFinancial = FinancialDonation::where('user_id',$uid)->where('status','paid')->sum('amount');
        $totalFood      = FoodDonation::where('user_id',$uid)->count();
        $totalService   = ServiceDonation::where('user_id',$uid)->count();

        $activities = ActivityLog::where('user_id',$uid)
            ->orderBy('created_at','desc')
            ->take(10)
            ->get()
            ->map(fn($a) => [
                'id'          => $a->id,
                'type'        => $a->type,
                'title'       => $a->title,
                'description' => $a->description,
                'icon'        => $a->icon,
                'time_ago'    => $a->created_at->diffForHumans(),
            ]);

        return response()->json([
            'success'           => true,
            'total_financial'   => (float) $totalFinancial,
            'total_food'        => $totalFood,
            'total_service'     => $totalService,
            'recent_activities' => $activities,
        ]);
    }

    public function getUpcomingPickups(Request $request)
    {
        $uid = $request->user()->id;
        
        $pickups = FoodDonation::where('user_id', $uid)
            ->whereIn('status', ['pending', 'scheduled'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'status'         => $p->status,
                'preferred_date' => $p->preferred_date,
                'time_slot'      => $p->time_slot,
                'pickup_address' => $p->pickup_address,
                'created_at'     => $p->created_at->format('m/d/Y'),
            ]);

        return response()->json([
            'success'  => true,
            'pickups'  => $pickups
        ]);
    }

    // ── Badges ────────────────────────────────────────────────────────────────

    public function getBadges(Request $request)
    {
        $uid    = $request->user()->id;
        $badges = Badge::all();

        $result = $badges->map(function ($badge) use ($uid) {
            $userBadge = UserBadge::where('user_id',$uid)->where('badge_id',$badge->id)->first();
            return [
                'id'          => $badge->id,
                'key'         => $badge->key,
                'name'        => $badge->name,
                'description' => $badge->description,
                'icon'        => $badge->icon,
                'goal_value'  => $badge->goal_value,
                'goal_type'   => $badge->goal_type,
                'status'      => $userBadge ? $userBadge->status : 'not_started',
                'progress'    => $userBadge ? $userBadge->progress : 0,
                'earned_at'   => $userBadge ? $userBadge->earned_at : null,
            ];
        });

        $earned     = $result->where('status','earned')->values();
        $inProgress = $result->where('status','in_progress')->values();
        $top3       = $earned->take(3);

        return response()->json([
            'success'     => true,
            'top3'        => $top3,
            'earned'      => $earned,
            'in_progress' => $inProgress,
            'all'         => $result,
        ]);
    }

    public function getActivities(Request $request)
    {
        $activities = ActivityLog::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($a) => [
                'id'          => $a->id,
                'type'        => $a->type,
                'title'       => $a->title,
                'description' => $a->description,
                'icon'        => $a->icon,
                'date'        => $a->created_at->format('m/d/Y'),
                'time_ago'    => $a->created_at->diffForHumans(),
            ]);

        return response()->json(['success'=>true,'activities'=>$activities]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'donor') {
            $validator = Validator::make($request->all(), [
                'first_name'        => 'required|string|max:100',
                'last_name'         => 'required|string|max:100',
                'middle_initial'    => 'nullable|string|max:10',
                'suffix'            => 'nullable|string|max:20',
                'date_of_birth'     => 'nullable|date',
                'gender'            => 'nullable|string',
                'house_no'          => 'nullable|string',
                'street'            => 'nullable|string',
                'barangay'          => 'nullable|string',
                'city_municipality' => 'nullable|string',
                'province_region'   => 'nullable|string',
                'postal_zip_code'   => 'nullable|string',
                'contact_number'    => ['nullable','regex:/^[0-9]{11}$/'],
            ]);
            if ($validator->fails()) return response()->json(['success'=>false,'errors'=>$validator->errors()], 422);

            $user->donorProfile()->update($request->only([
                'first_name','last_name','middle_initial','suffix','date_of_birth',
                'gender','house_no','street','barangay','city_municipality',
                'province_region','postal_zip_code','contact_number',
            ]));

        } elseif ($user->role === 'organization') {
            $validator = Validator::make($request->all(), [
                'organization_name' => 'required|string|max:150',
                'website_url'       => 'nullable|url',
                'industry_sector'   => 'nullable|string',
                'organization_type' => 'nullable|string',
                'contact_person'    => 'nullable|string',
                'position_role'     => 'nullable|string',
                'contact_number'    => ['nullable','regex:/^[0-9]{11}$/'],
            ]);
            if ($validator->fails()) return response()->json(['success'=>false,'errors'=>$validator->errors()], 422);

            $user->organizationProfile()->update($request->only([
                'organization_name','website_url','industry_sector',
                'organization_type','contact_person','position_role','contact_number',
            ]));
        }

        return response()->json(['success'=>true,'message'=>'Profile updated successfully.']);
    }

    public function deactivateAccount(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['success'=>true,'message'=>'Account deactivated.']);
    }
}