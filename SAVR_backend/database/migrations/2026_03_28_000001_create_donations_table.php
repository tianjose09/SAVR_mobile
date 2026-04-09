<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDonationsTable extends Migration
{
    public function up()
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'financial', 'food', 'service'
            $table->string('status')->default('pending');

            // Financial fields
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('receipt_path')->nullable();
            $table->text('message')->nullable();

            // Food fields - stored as JSON array of items
            // Each item: {name, qty, unit, type, expiration_date, special_notes}
            $table->json('food_items')->nullable();

            // Service fields
            $table->string('service_type')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('frequency')->nullable();
            $table->date('service_date')->nullable();
            $table->time('service_time')->nullable();
            $table->string('address')->nullable();
            $table->string('contact_first_name')->nullable();
            $table->string('contact_last_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('donations');
    }
}