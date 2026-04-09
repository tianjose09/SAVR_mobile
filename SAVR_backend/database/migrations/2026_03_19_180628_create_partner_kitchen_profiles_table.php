<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePartnerKitchenProfilesTable extends Migration
{
    public function up()
    {
        Schema::create('partner_kitchen_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->string('kitchen_name');
            $table->string('website_url')->nullable();
            $table->string('contact_person');
            $table->string('position_role');
            $table->string('contact_number');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('partner_kitchen_profiles');
    }
}