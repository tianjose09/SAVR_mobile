<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder {
    public function run(): void {
        $badges = [
            ['key'=>'first_food',      'name'=>'Food Angel',      'description'=>'Made your first food donation.',              'goal_type'=>'food_count',       'goal_value'=>1,     'icon'=>'fivedonation_badge'],
            ['key'=>'food_5',          'name'=>'Meal Maker',      'description'=>'Donated food 5 times.',                       'goal_type'=>'food_count',       'goal_value'=>5,     'icon'=>'fivedonation_badge'],
            ['key'=>'food_20',         'name'=>'Community Hero',  'description'=>'Donated food 20 times.',                      'goal_type'=>'food_count',       'goal_value'=>20,    'icon'=>'twentydonation_badge'],
            ['key'=>'financial_1000',  'name'=>'First Giver',     'description'=>'Donated ₱1,000 financially.',                 'goal_type'=>'financial_total',  'goal_value'=>1000,  'icon'=>'fivedonation_badge'],
            ['key'=>'financial_25000', 'name'=>'Legacy Builder',  'description'=>'Donated ₱25,000 financially.',                'goal_type'=>'financial_total',  'goal_value'=>25000, 'icon'=>'twentyfivek_badge'],
            ['key'=>'financial_50000', 'name'=>'Golden Giver',    'description'=>'Donated ₱50,000 financially.',                'goal_type'=>'financial_total',  'goal_value'=>50000, 'icon'=>'fiftyk_badge'],
            ['key'=>'service_1',       'name'=>'Helping Hand',    'description'=>'Completed your first service donation.',      'goal_type'=>'service_count',    'goal_value'=>1,     'icon'=>'fivedonation_badge'],
            ['key'=>'service_10',      'name'=>'Devoted Servant', 'description'=>'Completed 10 service donations.',             'goal_type'=>'service_count',    'goal_value'=>10,    'icon'=>'twentydonation_badge'],
        ];
        foreach ($badges as &$b) {
            $b['created_at'] = now();
            $b['updated_at'] = now();
        }
        DB::table('badges')->insertOrIgnore($badges);
    }
}