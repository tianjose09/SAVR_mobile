<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['not_started','in_progress','earned'])->default('not_started');
            $table->decimal('progress', 12, 2)->default(0);
            $table->timestamp('earned_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id','badge_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('user_badges'); }
};