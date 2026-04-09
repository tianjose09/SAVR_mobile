<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('food_donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('food_items');
            $table->json('food_item_images')->nullable();
            $table->enum('schedule_type', ['pickup','delivery'])->nullable();
            $table->text('pickup_address')->nullable();
            $table->double('pickup_lat')->nullable();
            $table->double('pickup_lng')->nullable();
            $table->date('preferred_date')->nullable();
            $table->string('time_slot')->nullable();
            $table->enum('status', ['pending','scheduled','completed','cancelled','rejected'])->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('food_donations'); }
};