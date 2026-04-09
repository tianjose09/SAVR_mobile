<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrganizationProfilesTable extends Migration
{
    public function up()
    {
        Schema::create('organization_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->string('organization_name');
            $table->string('website_url')->nullable();
            $table->string('industry_sector');
            $table->string('organization_type');
            $table->string('contact_person');
            $table->string('position_role');
            $table->string('contact_number');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_profiles');
    }
}