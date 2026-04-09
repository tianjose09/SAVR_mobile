<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('financial_donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->nullable(); // gcash, card, maya
            $table->string('paymongo_payment_id')->nullable();
            $table->string('paymongo_checkout_url')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('receipt_image_path')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['pending','paid','failed','cancelled'])->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('financial_donations'); }
};