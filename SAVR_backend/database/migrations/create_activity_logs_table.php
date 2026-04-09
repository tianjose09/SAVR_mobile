<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'financial', 'food', 'service'
            $table->string('title');
            $table->text('description');
            $table->string('icon')->default('financialiconyellow'); // drawable name
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('activity_logs'); }
};