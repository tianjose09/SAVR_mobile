<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDonorProfilesTable extends Migration
{
    public function up()
    {
        Schema::create('donor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_initial')->nullable();
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->string('gender');
            $table->string('house_no');
            $table->string('street');
            $table->string('barangay');
            $table->string('city_municipality');
            $table->string('province_region');
            $table->string('postal_zip_code');
            $table->string('contact_number');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('donor_profiles');
    }
}