<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('service_donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('service_type');
            $table->integer('quantity');
            $table->string('frequency');
            $table->date('service_date');
            $table->string('service_time');
            $table->text('address');
            $table->string('contact_first_name');
            $table->string('contact_last_name');
            $table->string('contact_email');
            $table->text('description')->nullable();
            $table->enum('status', ['pending','confirmed','completed','cancelled'])->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('service_donations'); }
};