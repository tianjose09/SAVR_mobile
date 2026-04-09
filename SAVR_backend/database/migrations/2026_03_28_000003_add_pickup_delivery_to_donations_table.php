<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPickupDeliveryToDonationsTable extends Migration
{
    public function up()
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->string('schedule_type')->nullable()->after('description'); // 'pickup' or 'delivery'
            $table->string('pickup_address')->nullable()->after('schedule_type');
            $table->date('preferred_date')->nullable()->after('pickup_address');
            $table->string('time_slot')->nullable()->after('preferred_date');
        });
    }

    public function down()
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['schedule_type', 'pickup_address', 'preferred_date', 'time_slot']);
        });
    }
}